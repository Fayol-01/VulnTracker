from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_swagger_ui import get_swaggerui_blueprint
from datetime import datetime, timedelta, timezone
import structlog
import os
from werkzeug.security import generate_password_hash, check_password_hash

# Configure structured logging
logger = structlog.get_logger()
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ]
)

from schemas import (
    VendorSchema, SoftwareSchema, VulnerabilitySchema,
    PatchSchema, ThreatSchema, ThreatTypeSchema, VulnerabilityThreatSchema
)

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer()
    ]
)
logger = structlog.get_logger()

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')  # Change in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize extensions
jwt = JWTManager(app)
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"]
)

CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize Supabase clients
try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")  # Anon key for authenticated requests
    supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")  # Service role key for public reads
    
    if not supabase_url or not supabase_key or not supabase_service_key:
        raise ValueError("SUPABASE_URL, SUPABASE_KEY, and SUPABASE_SERVICE_KEY must be set in .env file")
        
    # Client for authenticated requests
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Client for public reads with service role key
    supabase_service: Client = create_client(supabase_url, supabase_service_key)
except Exception as e:
    logger.error("supabase_init_error", error=str(e))
    raise

# Setup Swagger UI
SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': "VulnTracker API"}
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# Error handlers
@app.errorhandler(Exception)
def handle_error(error):
    logger.error("unhandled_error", 
                error=str(error),
                type=error.__class__.__name__)
    return jsonify({
        "error": str(error),
        "type": error.__class__.__name__,
        "status": "error",
        "timestamp": datetime.utcnow().isoformat()
    }), 500

def validate_supabase_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, ("No valid authentication token provided", 401)
        
    try:
        token = auth_header.split(' ')[1]
        # Verify token with Supabase
        response = supabase.auth.get_user(token)
        if not response.user:
            return None, ("Invalid authentication token", 401)
        return response.user, None
    except Exception as e:
        logger.error("auth_error", error=str(e))
        return None, ("Invalid authentication token", 401)

@app.before_request
def before_request():
    logger.info("request_started",
                path=request.path,
                method=request.method,
                ip=get_remote_address())
    
    # Skip auth for non-API routes and OPTIONS requests
    if not request.path.startswith('/api/') or request.method == 'OPTIONS':
        return
    
    # Skip auth for login/register routes
    if request.path in ['/api/auth/login', '/api/auth/register']:
        return
        
    # Skip auth for GET requests to main data endpoints
    if request.method == 'GET' and request.path in [
        '/api/vendors', '/api/software', '/api/vulnerabilities',
        '/api/threats', '/api/threat-types', '/api/patches'
    ]:
        return
    
    # Require auth for all POST, PUT, DELETE requests
    user, error = validate_supabase_token()
    if error:
        return jsonify({"error": error[0]}), error[1]
    
    # Store validated user in request context
    request.user = user

# Authentication routes
@app.route("/api/auth/register", methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Check if user already exists
        existing_user = supabase.table('users').select("*").eq('email', email).execute()
        if existing_user.data:
            return jsonify({"error": "User already exists"}), 409
            
        # Create new user
        password_hash = generate_password_hash(password)
        new_user = supabase.table('users').insert({
            "email": email,
            "password_hash": password_hash
        }).execute()
        
        # Generate token
        access_token = create_access_token(identity=email)
        return jsonify({
            "token": access_token,
            "user": {"email": email}
        }), 201
        
    except Exception as e:
        logger.error("registration_error", error=str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/login", methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Find user
        user_result = supabase.table('users').select("*").eq('email', email).execute()
        if not user_result.data:
            return jsonify({"error": "Invalid credentials"}), 401
            
        user = user_result.data[0]
        
        # Verify password
        if not check_password_hash(user['password_hash'], password):
            return jsonify({"error": "Invalid credentials"}), 401
            
        # Generate token
        access_token = create_access_token(identity=email)
        return jsonify({
            "token": access_token,
            "user": {"email": email}
        })
        
    except Exception as e:
        logger.error("login_error", error=str(e))
        return jsonify({"error": str(e)}), 500

# Protected routes
@app.route("/api/vendors", methods=['GET', 'POST'])
def handle_vendors():
    if request.method == 'GET':
        try:
            response = supabase_service.table('vendors').select("*").order('created_at', desc=True).execute()
            if not response.data:
                return jsonify([])
            return jsonify(response.data)
        except Exception as e:
            logger.error("vendor_fetch_error", error=str(e))
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        try:
            data = request.get_json()
            if not data or not data.get('name'):
                return jsonify({"error": "Name is required"}), 400
                
            response = supabase.table('vendors').insert({
                "name": data['name'],
                "website": data.get('website'),
                "user_id": request.user.id
            }).execute()
            
            if not response.data:
                return jsonify({"error": "Failed to create vendor"}), 500
                
            return jsonify(response.data[0]), 201
        except Exception as e:
            logger.error("vendor_create_error", error=str(e))
            return jsonify({"error": str(e)}), 500

@app.route("/api/software", methods=['GET', 'POST'])
def handle_software():
    if request.method == 'GET':
        try:
            # Fetch software with vendor relationship
            software_res = supabase_service.table("software").select("*,vendors(id,name,website)").execute()

            # Fetch vulnerabilities for counting
            vuln_res = supabase_service.table("vulnerabilities").select("id,software_id").execute()

            # Build vulnerability count map
            vuln_count_map = {}
            for v in vuln_res.data or []:
                sid = v.get("software_id")
                if sid:
                    vuln_count_map[sid] = vuln_count_map.get(sid, 0) + 1

            # Build final response
            result = []
            for item in software_res.data or []:
                result.append({
                    **item,
                    "vendor_name": item["vendors"]["name"] if item.get("vendors") else None,
                    "vulnerability_count": vuln_count_map.get(item["id"], 0),
                    "updated_at": item.get("updated_at")  # Will return if column exists
                })

            return jsonify(result)

        except Exception as e:
            print(f"Error fetching software: {str(e)}")
            return jsonify({"error": str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.json
            response = supabase.table("software").insert(data).execute()
            return jsonify(response.data), 201
        except Exception as e:
            print(f"Error adding software: {str(e)}")
            return jsonify({"error": str(e)}), 500
        
@app.route("/api/vulnerabilities", methods=['GET', 'POST'])
def handle_vulnerabilities():
    if request.method == "GET":
        try:
            vuln_res = supabase_service.table("vulnerabilities").select("*").order("published", desc=True).execute()
            software_res = supabase_service.table("software").select("*").execute()
            vendor_res = supabase_service.table("vendors").select("*").execute()

            software_map = {s["id"]: s for s in (software_res.data or [])}
            vendor_map = {v["id"]: v for v in (vendor_res.data or [])}

            vulnerabilities = []
            for vuln in vuln_res.data or []:
                software = software_map.get(vuln.get("software_id"), {})
                vendor = vendor_map.get(software.get("vendor_id")) if software else {}

                vulnerabilities.append({
                    **vuln,
                    "software": {
                        **software,
                        "vendor": vendor
                    } if software else None
                })

            return jsonify(vulnerabilities)

        except Exception as e:
            print(f"Error fetching vulnerabilities: {str(e)}")
            return jsonify({"error": str(e)}), 500

    elif request.method == "POST":
        try:
            data = request.json
            logger.info("received_vulnerability_data", data=data)
            
            # Required fields validation
            if not data.get('software_id'):
                return jsonify({"error": "software_id is required"}), 400
            if not data.get('cve_id'):
                return jsonify({"error": "cve_id is required"}), 400
            
            # Transform data to match Supabase schema
            vulnerability_data = {
                "software_id": data.get('software_id'),
                "cve_id": data.get('cve_id'),
                "summary": data.get('summary'),
                "severity": data.get('severity'),
                "cvss_score": data.get('cvss_score'),
                "published": datetime.now(timezone.utc).isoformat()
            }
            
            response = supabase.table("vulnerabilities").insert(vulnerability_data).execute()
            if not response.data:
                logger.error("vulnerability_creation_failed", error="No data returned from Supabase")
                return jsonify({"error": "Failed to create vulnerability"}), 500
                
            created_vuln = response.data[0]
            logger.info("vulnerability_created", vuln_id=created_vuln.get('id'))
            return jsonify(created_vuln), 201

        except Exception as e:
            print(f"Error creating vulnerability: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route("/api/vulnerabilities/<int:vuln_id>", methods=['DELETE'])
@jwt_required()
def delete_vulnerability(vuln_id):
    try:
        response = supabase.table("vulnerabilities").delete().eq("id", vuln_id).execute()
        if not response.data:
            return jsonify({"error": "Vulnerability not found"}), 404
        return jsonify({"message": "Vulnerability deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting vulnerability: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/threats/<int:vuln_id>", methods=['DELETE'])
@jwt_required()
def delete_threat(vuln_id):
    try:
        response = supabase.table("threats").delete().eq("id", vuln_id).execute()
        if not response.data:
            return jsonify({"error": "Vulnerability not found"}), 404
        return jsonify({"message": "Vulnerability deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting vulnerability: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/patches/<int:vuln_id>", methods=['DELETE'])
@jwt_required()
def delete_patch(vuln_id):
    try:
        response = supabase.table("patches").delete().eq("id", vuln_id).execute()
        if not response.data:
            return jsonify({"error": "Vulnerability not found"}), 404
        return jsonify({"message": "Vulnerability deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting vulnerability: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/software/<int:vuln_id>", methods=['DELETE'])
@jwt_required()
def delete_software(vuln_id):
    try:
        response = supabase.table("software").delete().eq("id", vuln_id).execute()
        if not response.data:
            return jsonify({"error": "Vulnerability not found"}), 404
        return jsonify({"message": "Vulnerability deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting vulnerability: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/threats", methods=['GET', 'POST'])

def handle_threats():
    if request.method == "GET":
        try:
            threat_res = supabase_service.table("threats").select("*").order("created_at", desc=True).execute()
            threat_type_res = supabase_service.table("threat_types").select("*").execute()
            vuln_threat_res = supabase_service.table("vulnerability_threats").select("*").execute()
            vuln_res = supabase_service.table("vulnerabilities").select("*").execute()
            software_res = supabase_service.table("software").select("*").execute()
            vendor_res = supabase_service.table("vendors").select("*").execute()

            # Create mapping dictionaries
            threat_type_map = {tt["id"]: tt for tt in (threat_type_res.data or [])}
            vuln_map = {v["id"]: v for v in (vuln_res.data or [])}
            software_map = {s["id"]: s for s in (software_res.data or [])}
            vendor_map = {v["id"]: v for v in (vendor_res.data or [])}

            # Map vulnerabilities to threats
            threat_vuln_map = {}
            for vt in vuln_threat_res.data or []:
                threat_id = vt.get("threat_id")
                vuln_id = vt.get("vulnerability_id")
                if threat_id not in threat_vuln_map:
                    threat_vuln_map[threat_id] = []
                threat_vuln_map[threat_id].append(vuln_map.get(vuln_id))

            threats = []
            for threat in threat_res.data or []:
                threat_type = threat_type_map.get(threat.get("threat_type_id"), {})
                vulnerabilities = []
                for vuln in threat_vuln_map.get(threat["id"], []):
                    if not vuln:
                        continue
                    software = software_map.get(vuln.get("software_id"), {})
                    vendor = vendor_map.get(software.get("vendor_id")) if software else {}
                    vulnerabilities.append({
                        "id": vuln.get("id"),
                        "cve_id": vuln.get("cve_id"),
                        "summary": vuln.get("summary"),
                        "severity": vuln.get("severity"),
                        "cvss_score": vuln.get("cvss_score"),
                        "software": {
                            "id": software.get("id"),
                            "name": software.get("name"),
                            "version": software.get("version"),
                            "vendor": {
                                "id": vendor.get("id"),
                                "name": vendor.get("name"),
                                "website": vendor.get("website")
                            } if vendor else None
                        }
                    })

                threats.append({
                    "id": threat.get("id"),
                    "name": threat.get("name"),
                    "description": threat.get("description"),
                    "threat_type_name": threat_type.get("name", "Unknown Type"),
                    "threat_type_description": threat_type.get("description", ""),
                    "vulnerabilities": vulnerabilities
                })

            return jsonify(threats)
        except Exception as e:
            print(f"Error fetching threats: {str(e)}")
            return jsonify({"error": str(e)}), 500

    elif request.method == "POST":
        try:
            data = request.get_json()
            response = supabase.table("threats").insert({
                "name": data['name'],
                "description": data.get('description'),
                "threat_type_id": data.get('threat_type_id')
            }).execute()
            return jsonify(response.data[0]), 201
        except Exception as e:
            print(f"Error creating threat: {str(e)}")
            return jsonify({"error": str(e)}), 500
@app.route("/api/threat-types", methods=['GET', 'POST'])
def handle_threat_types():
    if request.method == 'GET':
        try:
            response = supabase_service.table('threat_types').select("*").execute()
            return jsonify(response.data)
        except Exception as e:
            print(f"Error fetching threat types: {str(e)}")
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        try:
            data = request.get_json()
            response = supabase.table('threat_types').insert({
                "name": data['name'],
                "description": data.get('description')
            }).execute()
            return jsonify(response.data[0]), 201
        except Exception as e:
            print(f"Error creating threat type: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route("/api/patches", methods=['GET', 'POST'])
def handle_patches():
    if request.method == 'GET':
        try:
            # Fetch all relevant data
            patches_res = supabase_service.table("patches").select("*").execute()
            vuln_res = supabase_service.table("vulnerabilities").select("*").execute()
            software_res = supabase_service.table("software").select("*").execute()
            vendor_res = supabase_service.table("vendors").select("*").execute()
            vuln_threat_res = supabase_service.table("vulnerability_threats").select("*").execute()
            threats_res = supabase_service.table("threats").select("*").execute()
            threat_types_res = supabase_service.table("threat_types").select("*").execute()

            # Create mapping dictionaries
            vuln_map = {v["id"]: v for v in (vuln_res.data or [])}
            software_map = {s["id"]: s for s in (software_res.data or [])}
            vendor_map = {v["id"]: v for v in (vendor_res.data or [])}
            threat_map = {t["id"]: t for t in (threats_res.data or [])}
            threat_type_map = {tt["id"]: tt for tt in (threat_types_res.data or [])}

            # Build vuln → threats mapping (many-to-many)
            vuln_threat_map = {}
            for vt in vuln_threat_res.data or []:
                vuln_id = vt.get("vulnerability_id")
                threat_id = vt.get("threat_id")
                if vuln_id not in vuln_threat_map:
                    vuln_threat_map[vuln_id] = []
                threat = threat_map.get(threat_id)
                if threat:
                    # attach threat_type
                    threat_type = threat_type_map.get(threat.get("threat_type_id"))
                    threat_obj = {
                        "id": threat["id"],
                        "name": threat["name"],
                        "description": threat["description"],
                        "threat_type": threat_type if threat_type else None
                    }
                    vuln_threat_map[vuln_id].append(threat_obj)

            # Construct final response
            patches = []
            for patch in patches_res.data or []:
                vuln = vuln_map.get(patch.get("vulnerability_id"))
                software = software_map.get(vuln["software_id"]) if vuln else None
                vendor = vendor_map.get(software["vendor_id"]) if software else None

                transformed_patch = {
                    "id": patch["id"],
                    "url": patch.get("url"),
                    "released": patch.get("released"),
                    "vulnerability": {
                        "id": vuln.get("id") if vuln else None,
                        "cve_id": vuln.get("cve_id") if vuln else None,
                        "summary": vuln.get("summary") if vuln else None,
                        "severity": vuln.get("severity") if vuln else None,
                        "cvss_score": vuln.get("cvss_score") if vuln else None,
                        "published": vuln.get("published") if vuln else None,
                        "threats": vuln_threat_map.get(vuln["id"], []) if vuln else [],
                        "software": {
                            "id": software.get("id") if software else None,
                            "name": software.get("name") if software else None,
                            "version": software.get("version") if software else None,
                            "vendor": {
                                "id": vendor.get("id") if vendor else None,
                                "name": vendor.get("name") if vendor else None,
                                "website": vendor.get("website") if vendor else None
                            } if vendor else None
                        } if software else None
                    } if vuln else None
                }
                patches.append(transformed_patch)

            return jsonify(patches)
        except Exception as e:
            print(f"Error fetching patches: {str(e)}")
            return jsonify({"error": str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()
            response = supabase.table('patches').insert({
                "vulnerability_id": data['vulnerability_id'],
                "url": data['url'],
                "released": data.get('released')
            }).execute()

            patch = response.data[0]

            # Fetch nested vulnerability + software + vendor + threats
            vuln = supabase.table("vulnerabilities").select("*").eq("id", patch["vulnerability_id"]).single().execute().data
            software = supabase.table("software").select("*").eq("id", vuln["software_id"]).single().execute().data if vuln else None
            vendor = supabase.table("vendors").select("*").eq("id", software["vendor_id"]).single().execute().data if software else None

            vuln_threat_res = supabase.table("vulnerability_threats").select("*").eq("vulnerability_id", vuln["id"]).execute()
            threats = []
            for vt in vuln_threat_res.data or []:
                threat = supabase.table("threats").select("*").eq("id", vt["threat_id"]).single().execute().data
                if threat:
                    threat_type = supabase.table("threat_types").select("*").eq("id", threat["threat_type_id"]).single().execute().data
                    threats.append({
                        "id": threat["id"],
                        "name": threat["name"],
                        "description": threat["description"],
                        "threat_type": threat_type
                    })

            transformed_patch = {
                "id": patch["id"],
                "url": patch.get("url"),
                "released": patch.get("released"),
                "vulnerability": {
                    "id": vuln.get("id") if vuln else None,
                    "cve_id": vuln.get("cve_id") if vuln else None,
                    "summary": vuln.get("summary") if vuln else None,
                    "severity": vuln.get("severity") if vuln else None,
                    "cvss_score": vuln.get("cvss_score") if vuln else None,
                    "published": vuln.get("published") if vuln else None,
                    "threats": threats,
                    "software": {
                        "id": software.get("id") if software else None,
                        "name": software.get("name") if software else None,
                        "version": software.get("version") if software else None,
                        "vendor": {
                            "id": vendor.get("id") if vendor else None,
                            "name": vendor.get("name") if vendor else None,
                            "website": vendor.get("website") if vendor else None
                        } if vendor else None
                    } if software else None
                } if vuln else None
            }

            return jsonify(transformed_patch), 201
        except Exception as e:
            print(f"Error creating patch: {str(e)}")
            return jsonify({"error": str(e)}), 500
        
@app.route("/api/vulnerabilities/<int:vuln_id>/threats", methods=['POST'])
def link_vulnerability_threat(vuln_id):
    try:
        data = request.get_json()
        response = supabase.table('vulnerability_threats').insert({
            "vulnerability_id": vuln_id,
            "threat_id": data['threat_id']
        }).execute()
        return jsonify(response.data[0]), 201
    except Exception as e:
        print(f"Error linking vulnerability to threat: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/health")
def health():
    try:
        # Test Supabase connection by fetching a single row from vendors
        supabase.table('vendors').select("*").limit(1).execute()
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        return {"status": "error", "details": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)