from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "status": "working",
            "message": "Simple API is working!"
        }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "status": "working",
            "message": "POST request received!",
            "matches": [
                {
                    "nct_id": "NCT123456",
                    "title": "Test Clinical Trial",
                    "similarity": 0.85
                }
            ]
        }
        
        self.wfile.write(json.dumps(response).encode()) 