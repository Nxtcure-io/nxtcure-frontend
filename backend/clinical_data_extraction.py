import requests
import pandas as pd
import json
import re

def parse_eligibility_criteria(criteria_text):
    """Parse eligibility criteria text to separate inclusion and exclusion criteria"""
    if not criteria_text or criteria_text == 'N/A':
        return 'N/A', 'N/A'
    

    criteria_text = str(criteria_text)
    
    # Initialize variables
    inclusion_criteria = 'N/A'
    exclusion_criteria = 'N/A'
    
    try:
        inclusion_match = re.search(r'inclusion\s+criteria:?\s*(.*?)(?=exclusion\s+criteria:?|$)', 
                                   criteria_text, re.IGNORECASE | re.DOTALL)
        exclusion_match = re.search(r'exclusion\s+criteria:?\s*(.*?)(?=inclusion\s+criteria:?|$)', 
                                   criteria_text, re.IGNORECASE | re.DOTALL)
        
        if inclusion_match:
            inclusion_criteria = inclusion_match.group(1).strip()
            inclusion_criteria = re.sub(r'\n\s*\n', '\n', inclusion_criteria)  # Remove extra newlines
            inclusion_criteria = inclusion_criteria.replace('\n', ' ').strip()
            
        if exclusion_match:
            exclusion_criteria = exclusion_match.group(1).strip()
            exclusion_criteria = re.sub(r'\n\s*\n', '\n', exclusion_criteria)  # Remove extra newlines
            exclusion_criteria = exclusion_criteria.replace('\n', ' ').strip()
        
        if inclusion_criteria == 'N/A' and exclusion_criteria == 'N/A':
            lines = criteria_text.split('\n')
            inclusion_section = False
            exclusion_section = False
            inclusion_lines = []
            exclusion_lines = []
            
            for line in lines:
                line = line.strip()
                if re.match(r'inclusion\s+criteria:?', line, re.IGNORECASE):
                    inclusion_section = True
                    exclusion_section = False
                    continue
                elif re.match(r'exclusion\s+criteria:?', line, re.IGNORECASE):
                    exclusion_section = True
                    inclusion_section = False
                    continue
                
                if inclusion_section and line:
                    inclusion_lines.append(line)
                elif exclusion_section and line:
                    exclusion_lines.append(line)
            
            if inclusion_lines:
                inclusion_criteria = ' '.join(inclusion_lines)
            if exclusion_lines:
                exclusion_criteria = ' '.join(exclusion_lines)
        
        if not inclusion_criteria or inclusion_criteria.strip() == '':
            inclusion_criteria = 'N/A'
        if not exclusion_criteria or exclusion_criteria.strip() == '':
            exclusion_criteria = 'N/A'
            
    except Exception as e:
        print(f"Error parsing criteria: {e}")
        inclusion_criteria = criteria_text[:500] + '...' if len(criteria_text) > 500 else criteria_text
        exclusion_criteria = 'N/A'
    
    return inclusion_criteria, exclusion_criteria

def get_clinical_trials_data():
    """Fetch clinical trials data for heart disease using ClinicalTrials.gov API v2"""
    
    base_url = "https://clinicaltrials.gov/api/v2/studies"
    
    params = {
        'query.cond': 'heart disease',
        'pageSize': 500,  
        'format': 'json'
    }
    
    print(f"Fetching data from ClinicalTrials.gov API v2...")
    print(f"URL: {base_url}")
    print(f"Parameters: {params}")
    
    try:
        response = requests.get(base_url, params=params, timeout=30)
        response.raise_for_status()  
        

        if not response.text.strip():
            print("Error: Empty response from API")
            return None
            
        data = response.json()
        
        print(f"Response keys: {list(data.keys())}")
        
        if 'studies' not in data:
            print("Error: No 'studies' key in response")
            return None
            
        studies = data['studies']
        
        if not studies:
            print("No studies found for the given criteria")
            return None
            
        print(f"Found {len(studies)} studies")
        print("Parsing eligibility criteria...")
        
        processed_studies = []
        
        for i, study in enumerate(studies):
            if (i + 1) % 20 == 0:
                print(f"Processing study {i + 1}/{len(studies)}...")
                
            study_info = {}
            
            # Basic identification
            study_info['NCTId'] = study.get('protocolSection', {}).get('identificationModule', {}).get('nctId', 'N/A')
            study_info['BriefTitle'] = study.get('protocolSection', {}).get('identificationModule', {}).get('briefTitle', 'N/A')
            study_info['OfficialTitle'] = study.get('protocolSection', {}).get('identificationModule', {}).get('officialTitle', 'N/A')
            
            # Status information
            status_module = study.get('protocolSection', {}).get('statusModule', {})
            study_info['OverallStatus'] = status_module.get('overallStatus', 'N/A')
            study_info['StartDate'] = status_module.get('startDateStruct', {}).get('date', 'N/A')
            study_info['CompletionDate'] = status_module.get('completionDateStruct', {}).get('date', 'N/A')
            
            # Design information
            design_module = study.get('protocolSection', {}).get('designModule', {})
            study_info['StudyType'] = design_module.get('studyType', 'N/A')
            study_info['Phase'] = '; '.join(design_module.get('phases', [])) if design_module.get('phases') else 'N/A'
            
            # Conditions
            conditions_module = study.get('protocolSection', {}).get('conditionsModule', {})
            study_info['Condition'] = '; '.join(conditions_module.get('conditions', [])) if conditions_module.get('conditions') else 'N/A'
            
            # Interventions
            interventions_module = study.get('protocolSection', {}).get('armsInterventionsModule', {})
            interventions = interventions_module.get('interventions', [])
            intervention_names = [interv.get('name', 'N/A') for interv in interventions]
            study_info['InterventionName'] = '; '.join(intervention_names) if intervention_names else 'N/A'
            
            # Outcomes
            outcomes_module = study.get('protocolSection', {}).get('outcomesModule', {})
            primary_outcomes = outcomes_module.get('primaryOutcomes', [])
            primary_measures = [outcome.get('measure', 'N/A') for outcome in primary_outcomes]
            study_info['PrimaryOutcomeMeasure'] = '; '.join(primary_measures) if primary_measures else 'N/A'
            
            # Description
            description_module = study.get('protocolSection', {}).get('descriptionModule', {})
            study_info['BriefSummary'] = description_module.get('briefSummary', 'N/A')
            
            # Eligibility and enrollment information
            eligibility_module = study.get('protocolSection', {}).get('eligibilityModule', {})
            design_module = study.get('protocolSection', {}).get('designModule', {})
            
            study_info['EnrollmentCount'] = design_module.get('enrollmentInfo', {}).get('count', 'N/A')
            
            # Extract and parse eligibility criteria
            raw_criteria = eligibility_module.get('eligibilityCriteria', 'N/A')
            inclusion_criteria, exclusion_criteria = parse_eligibility_criteria(raw_criteria)
            
            study_info['InclusionCriteria'] = inclusion_criteria
            study_info['ExclusionCriteria'] = exclusion_criteria
            study_info['HealthyVolunteers'] = eligibility_module.get('healthyVolunteers', 'N/A')
            study_info['Gender'] = eligibility_module.get('sex', 'N/A')
            study_info['MinimumAge'] = eligibility_module.get('minimumAge', 'N/A')
            study_info['MaximumAge'] = eligibility_module.get('maximumAge', 'N/A')
            study_info['StdAges'] = '; '.join(eligibility_module.get('stdAges', [])) if eligibility_module.get('stdAges') else 'N/A'
            
            # Location information
            contacts_locations_module = study.get('protocolSection', {}).get('contactsLocationsModule', {})
            locations = contacts_locations_module.get('locations', [])
            countries = list(set([loc.get('country', 'N/A') for loc in locations]))
            study_info['LocationCountry'] = '; '.join(countries) if countries else 'N/A'
            
            processed_studies.append(study_info)
        
        # Convert to DataFrame
        df = pd.DataFrame(processed_studies)
        
        return df
        
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Response text: {response.text[:500]}...")  # Print first 500 chars
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Main function to execute the data extraction"""
    print("Starting clinical trials data extraction for heart disease...")
    
    df = get_clinical_trials_data()
    
    if df is not None and not df.empty:
        print(f"\nSuccessfully retrieved {len(df)} studies!")
        print(f"DataFrame shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        print("\nFirst few rows of the data:")
        print(df.head())
        
        # Save to CSV
        output_file = "heart_disease_trials.csv"
        df.to_csv(output_file, index=False)
        print(f"\nData saved to {output_file}")
        
        # Display some summary statistics
        print(f"\nSummary:")
        print(f"- Total studies: {len(df)}")
        print(f"- Studies with known status: {len(df[df['OverallStatus'] != 'N/A'])}")
        print(f"- Studies with interventions: {len(df[df['InterventionName'] != 'N/A'])}")
        print(f"- Studies with inclusion criteria: {len(df[df['InclusionCriteria'] != 'N/A'])}")
        print(f"- Studies with exclusion criteria: {len(df[df['ExclusionCriteria'] != 'N/A'])}")
        
        # Show status distribution
        print(f"\nStudy status distribution:")
        print(df['OverallStatus'].value_counts())
        
        # Show gender distribution
        print(f"\nGender eligibility distribution:")
        print(df['Gender'].value_counts())
        
        # Show age group distribution
        print(f"\nAge group distribution:")
        print(df['StdAges'].value_counts().head(10))
        
        # Show sample criteria
        print(f"\n=== SAMPLE INCLUSION/EXCLUSION CRITERIA ===")
        for i in range(2):
            if i < len(df):
                print(f"\nStudy {i+1}: {df.iloc[i]['BriefTitle'][:70]}...")
                print(f"NCT ID: {df.iloc[i]['NCTId']}")
                print(f"INCLUSION: {df.iloc[i]['InclusionCriteria'][:200]}{'...' if len(str(df.iloc[i]['InclusionCriteria'])) > 200 else ''}")
                print(f"EXCLUSION: {df.iloc[i]['ExclusionCriteria'][:200]}{'...' if len(str(df.iloc[i]['ExclusionCriteria'])) > 200 else ''}")
                print("-" * 80)
        
    else:
        print("Failed to retrieve data or no data available")

if __name__ == "__main__":
    main()
