import json

def handler(request, context):
    """Minimal test endpoint with real trial data (no pandas)"""
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
        # Return real trial data (hardcoded for testing)
        real_matches = [
            {
                "nct_id": "NCT05279066",
                "title": "Validation of Ejection Fraction and Cardiac Output Using Biostrap Wristband",
                "similarity": 0.85,
                "condition": "Heart Disease",
                "summary": "This study evaluates the accuracy of Biostrap wristband in measuring ejection fraction and cardiac output compared to standard cardiac ultrasound.",
                "inclusion": "≥ 18 years of age. Subjects who are undergoing elective cardiac ultrasound as an outpatient for group 1 or are scheduled for/completed a pulmonary arterial catheterization for group 2.",
                "exclusion": "Subject is unable or unwilling to wear the wristband for the required duration.",
                "country": "United States",
                "status": "RECRUITING",
                "phase": "N/A",
                "enrollment": "100"
            },
            {
                "nct_id": "NCT05371366",
                "title": "The Puncturable Atrial Septal Defect Occluder Trial (the PASSER Trial)",
                "similarity": 0.72,
                "condition": "Atrial Septal Defect",
                "summary": "A clinical trial to evaluate the safety and efficacy of puncturable atrial septal defect occluder in patients with secundum atrial septal defect.",
                "inclusion": "aged 18-70 years; with congenital secundum atrial septal defect; the maximal ASD diameter was ≤38 mm; with atrial-level left-to-right shunt.",
                "exclusion": "ostium primordium ASD and sinus venosus ASD. infective endocarditis and hemorrhagic disorders. active thrombosis.",
                "country": "China",
                "status": "RECRUITING",
                "phase": "N/A",
                "enrollment": "120"
            },
            {
                "nct_id": "NCT05789966",
                "title": "Fullscale_Intervention Study: Genetic Risk Communication for Heart Disease",
                "similarity": 0.68,
                "condition": "Cardiovascular Disease",
                "summary": "This study investigates the impact of genetic risk communication on heart disease prevention behaviors.",
                "inclusion": "Adults aged 18-65 with family history of heart disease. No prior genetic testing for cardiovascular conditions.",
                "exclusion": "Previous genetic testing for cardiovascular conditions. Unable to provide informed consent.",
                "country": "United States",
                "status": "NOT_YET_RECRUITING",
                "phase": "N/A",
                "enrollment": "500"
            }
        ]
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({"matches": real_matches})
        }
    else:
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'})
        } 