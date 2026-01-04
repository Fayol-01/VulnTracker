from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import google.generativeai as genai
import os
from dotenv import load_dotenv
import structlog
from supabase import create_client

# Load environment variables
load_dotenv()

# Configure logger
logger = structlog.get_logger()

chat_bp = Blueprint('chat', __name__)

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

genai.configure(api_key=GOOGLE_API_KEY)

try:
    # Initialize the model with specific parameters
    model = genai.GenerativeModel(
        model_name='gemini-2.5-pro',  # Updated model name
        generation_config={
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
    )
    logger.info("Gemini model initialized successfully")
except Exception as e:
    logger.error("Failed to initialize Gemini model", error=str(e))
    raise

# Chat context to provide domain-specific context
SYSTEM_CONTEXT = """You are a cybersecurity assistant in the VulnTracker application. Your role is to help users with:
1. Understanding software vulnerabilities
2. Interpreting vulnerability data
3. Suggesting security best practices
4. Explaining patches and mitigation strategies
5. Providing insights about security threats

Keep your responses focused on cybersecurity topics and professional in tone."""

@chat_bp.route('/chat', methods=['POST'])
def chat_with_gemini():
    try:
        # Get auth token from request headers
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.error("chat_unauthorized", error="Invalid or missing token")
            return jsonify({'error': 'Authentication required'}), 401
            
        # Extract token and validate with Supabase
        token = auth_header.split(' ')[1]
        try:
            # Create Supabase client and verify token
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for auth
            supabase = create_client(supabase_url, supabase_key)
            
            # Verify the JWT token
            try:
                user = supabase.auth.get_user(token)
                current_user = user.user.id
            except Exception as e:
                logger.error("chat_token_verification_error", error=str(e))
                return jsonify({'error': 'Invalid token'}), 401
        except Exception as auth_error:
            logger.error("chat_auth_error", error=str(auth_error))
            return jsonify({'error': 'Invalid authentication token'}), 401
            
        logger.info("chat_request_received", user=current_user)

        # Validate request
        data = request.get_json()
        if not data or 'message' not in data:
            logger.error("chat_invalid_request", error="Message is required")
            return jsonify({'error': 'Message is required'}), 400

        # Add system context to the user's message
        prompt = f"{SYSTEM_CONTEXT}\n\nUser: {data['message']}"
        
        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ]
            
            try:
                response = model.generate_content(
                    contents=prompt,
                    safety_settings=safety_settings,
                    stream=False  # Disable streaming for more reliable timeout handling
                )
                
                if not response.text:
                    raise Exception("Empty response from Gemini API")
                    
            except Exception as api_error:
                logger.error("Gemini API error", 
                           error=str(api_error),
                           error_type=type(api_error).__name__)
                raise Exception(f"Gemini API error: {str(api_error)}")
            
            # Log success
            logger.info("chat_response_success", user=current_user)
            
            # Extract and return the text response
            return jsonify({'response': response.text})
            
        except Exception as ai_error:
            logger.error("chat_ai_error", 
                        error=str(ai_error), 
                        user=current_user)
            return jsonify({
                'error': 'An error occurred while processing your request. Please try again.'
            }), 500
        
    except Exception as e:
        logger.error("chat_unexpected_error", 
                    error=str(e),
                    error_type=type(e).__name__)
        return jsonify({
            'error': 'An unexpected error occurred. Please try again later.'
        }), 500
