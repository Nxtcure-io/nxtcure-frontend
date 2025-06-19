import json

def handler(request, context):
    """Minimal test endpoint with no dependencies"""
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
    
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    if request.method == 'POST':
        # Return mock data for testing
        mock_matches = [
            {
                "nct_id": "NCT123456",
                "title": "Study of Heart Disease Treatment",
                "similarity": 0.85,
                "condition": "Heart Disease",
                "summary": "This study evaluates a new treatment for heart disease patients.",
                "inclusion": "Patients with diagnosed heart disease",
                "exclusion": "Patients with severe allergies",
                "country": "United States"
            },
            {
                "nct_id": "NCT789012",
                "title": "Cardiovascular Health Research",
                "similarity": 0.72,
                "condition": "Cardiovascular Disease",
                "summary": "Research on improving cardiovascular health outcomes.",
                "inclusion": "Adults with cardiovascular conditions",
                "exclusion": "Pregnant women",
                "country": "Canada"
            },
            {
                "nct_id": "NCT345678",
                "title": "Heart Failure Treatment Trial",
                "similarity": 0.68,
                "condition": "Heart Failure",
                "summary": "Clinical trial for heart failure treatment options.",
                "inclusion": "Heart failure patients",
                "exclusion": "Recent heart surgery",
                "country": "United Kingdom"
            }
        ]
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"matches": mock_matches})
        }
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        } 