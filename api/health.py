import json

def handler(request, context):
    """Vercel serverless function handler for health check"""
    # Set CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    if request.method == 'GET':
        response = {
            "message": "Clinical Trials Matching API is running!",
            "status": "healthy"
        }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response)
        }
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        }

# Legacy handler for compatibility
from http.server import BaseHTTPRequestHandler

class LegacyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = {
            "message": "Clinical Trials Matching API is running!",
            "status": "healthy"
        }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers() 