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
        response = supabase.table('vendors').select("*").execute()
        return jsonify(response.data)
    elif request.method == 'POST':
        data = request.get_json()
        response = supabase.table('vendors').insert({"name": data['name']}).execute()
        return jsonify(response.data[0]), 201

@app.route("/api/software", methods=['GET', 'POST'])
def handle_software():
    if request.method == 'GET':
        response = supabase.table('software').select(
            "*,vendors(name)"
        ).execute()
        return jsonify([{
            **item,
            "vendor_name": item["vendors"]["name"]
        } for item in response.data])
    elif request.method == 'POST':
        data = request.get_json()
        response = supabase.table('software').insert({
            "name": data['name'],
            "vendor_id": data['vendor_id']
        }).execute()
        return jsonify(response.data[0]), 201

@app.route("/api/vulnerabilities", methods=['GET', 'POST'])
def handle_vulnerabilities():
    if request.method == 'GET':
        try:
            print("Attempting to fetch vulnerabilities...")
            response = supabase.table('vulnerabilities').select(
                "*,software(name,vendors(name)),vulnerability_threats(threats(*)),vulnerability_patches(patches(*))"
            ).execute()
            
            print(f"Response data: {response.data}")
            
            if not response.data:
                return jsonify([])  # Return empty array if no data
                
            result = []
            for vuln in response.data:
                try:
                    vuln_data = {
                        "id": vuln.get("id"),
                        "name": vuln.get("name"),
                        "description": vuln.get("description"),
                        "software_id": vuln.get("software_id"),
                        "software_name": vuln.get("software", {}).get("name", "Unknown"),
                        "vendor_name": vuln.get("software", {}).get("vendors", {}).get("name", "Unknown"),
                        "threats": [
                            {"id": vt.get("threats", {}).get("id"), "name": vt.get("threats", {}).get("name")}
                            for vt in vuln.get("vulnerability_threats", [])
                        ],
                        "patches": [
                            {"id": vp.get("patches", {}).get("id"), "name": vp.get("patches", {}).get("name"), "url": vp.get("patches", {}).get("url")}
                            for vp in vuln.get("vulnerability_patches", [])
                        ]
                    }
                    result.append(vuln_data)
                except Exception as e:
                    print(f"Error processing vulnerability {vuln.get('id')}: {str(e)}")
                    continue
            
            return jsonify(result)
            
        except Exception as e:
            import traceback
            print(f"Error fetching vulnerabilities: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return jsonify({"error": str(e)}), 500
    elif request.method == 'POST':
        data = request.get_json()
        response = supabase.table('vulnerabilities').insert({
            "name": data['name'],
            "description": data['description'],
            "software_id": data['software_id']
        }).execute()
        return jsonify(response.data[0]), 201

@app.route("/api/threats", methods=['GET', 'POST'])
def handle_threats():
    if request.method == 'GET':
        response = supabase.table('threats').select("*").execute()
        return jsonify(response.data)
    elif request.method == 'POST':
        data = request.get_json()
        response = supabase.table('threats').insert({
            "name": data['name'],
            "description": data['description']
        }).execute()
        return jsonify(response.data[0]), 201

@app.route("/api/patches", methods=['GET', 'POST'])
def handle_patches():
    if request.method == 'GET':
        response = supabase.table('patches').select("*").execute()
        return jsonify(response.data)
    elif request.method == 'POST':
        data = request.get_json()
        response = supabase.table('patches').insert({
            "name": data['name'],
            "url": data['url']
        }).execute()
        return jsonify(response.data[0]), 201

@app.route("/api/vulnerabilities/<int:vuln_id>/threats", methods=['POST'])
def link_vulnerability_threat(vuln_id):
    data = request.get_json()
    response = supabase.table('vulnerability_threats').insert({
        "vulnerability_id": vuln_id,
        "threat_id": data['threat_id']
    }).execute()
    return jsonify(response.data[0]), 201

@app.route("/api/vulnerabilities/<int:vuln_id>/patches", methods=['POST'])
def link_vulnerability_patch(vuln_id):
    data = request.get_json()
    response = supabase.table('vulnerability_patches').insert({
        "vulnerability_id": vuln_id,
        "patch_id": data['patch_id']
    }).execute()
    return jsonify(response.data[0]), 201

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