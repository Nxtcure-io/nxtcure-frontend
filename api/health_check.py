import json

def handler(request, context):
    """Simple health check endpoint"""
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    response = {
        "status": "healthy",
        "message": "API is working!",
        "timestamp": "2024-01-01T00:00:00Z",
        "endpoint": "health_check"
    }
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(response)
    } 