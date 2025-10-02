from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize Supabase client
try:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        
    supabase: Client = create_client(supabase_url, supabase_key)
except Exception as e:
    print(f"Error initializing Supabase client: {str(e)}")
    raise

# Routes
@app.route("/api/vendors", methods=['GET', 'POST'])
def handle_vendors():
    if request.method == 'GET':
        try:
            response = supabase.table('vendors').select("*").order('created_at.desc').execute()
            return jsonify(response.data)
        except Exception as e:
            print(f"Error fetching vendors: {str(e)}")
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        try:
            data = request.get_json()
            response = supabase.table('vendors').insert({
                "name": data['name'],
                "website": data.get('website')
            }).execute()
            return jsonify(response.data[0]), 201
        except Exception as e:
            print(f"Error creating vendor: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route("/api/software", methods=['GET', 'POST'])
def handle_software():
    if request.method == 'GET':
        try:
            response = supabase.table('software').select(
                "*,vendors(id,name,website)"
            ).execute()
            return jsonify([{
                **item,
                "vendor_name": item["vendors"]["name"] if item.get("vendors") else None
            } for item in response.data])
        except Exception as e:
            print(f"Error fetching software: {str(e)}")
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        try:
            data = request.get_json()
            response = supabase.table('software').insert({
                "name": data['name'],
                "vendor_id": data['vendor_id'],
                "version": data.get('version')
            }).execute()
            return jsonify(response.data[0]), 201
        except Exception as e:
            print(f"Error creating software: {str(e)}")
            return jsonify({"error": str(e)}), 500

#@app.route("/api/vulnerabilities", methods=['GET', 'POST'])
@app.route("/api/vulnerabilities", methods=["GET", "POST", "DELETE"])
def handle_vulnerabilities():
    if request.method == "GET":
        vuln_res = supabase.table("vulnerabilities").select("*").order("published", desc=True).execute()
        software_res = supabase.table("software").select("*").execute()
        vendor_res = supabase.table("vendors").select("*").execute()

        software_map = {s["id"]: s for s in (software_res.data or [])}
        vendor_map = {v["id"]: v for v in (vendor_res.data or [])}

        vulnerabilities = []
        for vuln in vuln_res.data or []:
            software = software_map.get(vuln.get("software_id"), {})
            vendor = vendor_map.get(software.get("vendor_id")) if software else {}

            vulnerabilities.append({
                "id": vuln.get("id"),
                "cve_id": vuln.get("cve_id"),
                "cvss_score": vuln.get("cvss_score"),
                "summary": vuln.get("summary"),
                "severity": vuln.get("severity"),
                "published": vuln.get("published"),
                "software": {
                    "id": software.get("id"),
                    "name": software.get("name"),
                    "version": software.get("version"),
                    "vendor": {
                        "id": vendor.get("id"),
                        "name": vendor.get("name"),
                        "website": vendor.get("website"),
                    } if vendor else None
                }
            })

        return jsonify(vulnerabilities)
      #  except Exception as e:
        #    print(f"Error fetching vulnerabilities: {str(e)}")
       #     return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        try:
            data = request.get_json()
            response = supabase.table('vulnerabilities').insert({
                "software_id": data['software_id'],
                "cve_id": data['cve_id'],
                "cvss_score": data.get('cvss_score'),
                "summary": data.get('summary'),
                "severity": data.get('severity'),
                "published": data.get('published')
            }).execute()
            return jsonify(response.data[0]), 201
        except Exception as e:
            print(f"Error creating vulnerability: {str(e)}")
            return jsonify({"error": str(e)}), 500

@app.route("/api/threats", methods=['GET', 'POST'])
def handle_threats():
    if request.method == 'GET':
        try:
            response = supabase.table('threats').select(
                """
                *,
                threat_type:threat_type_id(*),
                vulnerabilities:vulnerability_threats(
                    vulnerability:vulnerability_id(
                        *,
                        software:software_id(
                            *,
                            vendor:vendor_id(*)
                        )
                    )
                )
                """
            ).order('created_at.desc').execute()
            
            print("Raw threats response:", response.data)  # Debug print
            
            threats = []
            for threat in response.data:
                threat_type = threat.get("threat_type", {}) or {}
                vulnerabilities = []
                
                for vt in threat.get("vulnerabilities", []):
                    vuln = vt.get("vulnerability", {}) or {}
                    software = vuln.get("software", {}) or {}
                    vendor = software.get("vendor", {}) or {}
                    
                    vulnerabilities.append({
                        "id": vuln.get("id"),
                        "cve_id": vuln.get("cve_id", "Unknown CVE"),
                        "severity": vuln.get("severity", "Unknown"),
                        "cvss_score": vuln.get("cvss_score", 0.0),
                        "software_name": software.get("name", "Unknown Software"),
                        "software_version": software.get("version", "Unknown Version"),
                        "vendor_name": vendor.get("name", "Unknown Vendor")
                    })
                
                transformed_threat = {
                    "id": threat["id"],
                    "name": threat["name"],
                    "description": threat["description"] or "",
                    "threat_type_name": threat_type.get("name", "Unknown Type"),
                    "threat_type_description": threat_type.get("description", ""),
                    "vulnerabilities": vulnerabilities
                }
                print("Transformed threat:", transformed_threat)  # Debug print
                threats.append(transformed_threat)
            
            return jsonify(threats)
        except Exception as e:
            print(f"Error fetching threats: {str(e)}")
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        try:
            data = request.get_json()
            response = supabase.table('threats').insert({
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
            response = supabase.table('threat_types').select("*").execute()
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
            response = supabase.table('patches').select(
                """
                *,
                vulnerability:vulnerability_id(
                    *,
                    software:software_id(
                        *,
                        vendor:vendor_id(*)
                    )
                )
                """
            ).order('released.desc').execute()
            
            print("Raw patches response:", response.data)  # Debug print
            
            patches = []
            for patch in response.data:
                vulnerability = patch.get("vulnerability", {}) or {}
                software = vulnerability.get("software", {}) or {}
                vendor = software.get("vendor", {}) or {}
                
                transformed_patch = {
                    "id": patch["id"],
                    "url": patch["url"],
                    "released": patch["released"],
                    "vulnerability_id": patch["vulnerability_id"],
                    "cve_id": vulnerability.get("cve_id", "Unknown CVE"),
                    "severity": vulnerability.get("severity", "Unknown"),
                    "cvss_score": vulnerability.get("cvss_score", 0.0),
                    "software_name": software.get("name", "Unknown Software"),
                    "software_version": software.get("version", "Unknown Version"),
                    "vendor_name": vendor.get("name", "Unknown Vendor")
                }
                print("Transformed patch:", transformed_patch)  # Debug print
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
            return jsonify(response.data[0]), 201
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