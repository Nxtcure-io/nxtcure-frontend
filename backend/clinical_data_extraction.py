import requests
import pandas as pd
import json
import time
from typing import Dict, Optional

def parse_eligibility_criteria(criteria_text):
    if not criteria_text or criteria_text == 'N/A':
        return 'N/A', 'N/A'

    inclusion_criteria = []
    exclusion_criteria = []
    current = None

    for line in criteria_text.splitlines():
        line = line.strip()
        if not line:
            continue
        if 'inclusion' in line.lower():
            current = 'inclusion'
        elif 'exclusion' in line.lower():
            current = 'exclusion'
        elif line.startswith('-') or line.startswith('*'):
            if current == 'inclusion':
                inclusion_criteria.append(line)
            elif current == 'exclusion':
                exclusion_criteria.append(line)

    inclusion = ' '.join(inclusion_criteria) if inclusion_criteria else 'N/A'
    exclusion = ' '.join(exclusion_criteria) if exclusion_criteria else 'N/A'
    return inclusion, exclusion

def get_study_details(nct_id: str) -> Optional[Dict]:
    try:
        url = f"https://clinicaltrials.gov/api/v2/studies/{nct_id}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        section = data.get('protocolSection', {})
        contacts = section.get('contactsLocationsModule', {}).get('centralContacts', [])
        contact = contacts[0] if contacts else {}
        sponsor = section.get('sponsorCollaboratorsModule', {}).get('leadSponsor', {})

        return {
            'ContactName': contact.get('name', 'N/A'),
            'ContactRole': contact.get('role', 'N/A'),
            'ContactPhone': contact.get('phone', 'N/A'),
            'ContactEmail': contact.get('email', 'N/A'),
            'LeadSponsor': sponsor.get('name', 'N/A'),
            'SponsorType': sponsor.get('class', 'N/A')
        }
    except Exception as e:
        print(f"Error fetching details for {nct_id}: {e}")
        return None

def get_clinical_trials_data():
    url = "https://clinicaltrials.gov/api/v2/studies"
    params = {
        'pageSize': 1000,
        'format': 'json'
    }

    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()

        if 'studies' not in data:
            print("No studies key in response.")
            return None

        studies = data['studies']
        print(f"Fetched {len(studies)} studies.")
        results = []

        for study in studies:
            section = study.get('protocolSection', {})
            ident = section.get('identificationModule', {})
            status = section.get('statusModule', {})
            design = section.get('designModule', {})
            conditions = section.get('conditionsModule', {})
            interventions = section.get('armsInterventionsModule', {}).get('interventions', [])
            outcomes = section.get('outcomesModule', {}).get('primaryOutcomes', [])
            desc = section.get('descriptionModule', {})
            eligibility = section.get('eligibilityModule', {})
            contacts = section.get('contactsLocationsModule', {})
            sponsor = section.get('sponsorCollaboratorsModule', {}).get('leadSponsor', {})

            inclusion, exclusion = parse_eligibility_criteria(eligibility.get('eligibilityCriteria', 'N/A'))

            study_data = {
                'NCTId': ident.get('nctId', 'N/A'),
                'BriefTitle': ident.get('briefTitle', 'N/A'),
                'OfficialTitle': ident.get('officialTitle', 'N/A'),
                'OverallStatus': status.get('overallStatus', 'N/A'),
                'StartDate': status.get('startDateStruct', {}).get('date', 'N/A'),
                'CompletionDate': status.get('completionDateStruct', {}).get('date', 'N/A'),
                'StudyType': design.get('studyType', 'N/A'),
                'Phase': '; '.join(design.get('phases', [])) if design.get('phases') else 'N/A',
                'Condition': '; '.join(conditions.get('conditions', [])) if conditions.get('conditions') else 'N/A',
                'InterventionName': '; '.join([i.get('name', 'N/A') for i in interventions]) if interventions else 'N/A',
                'PrimaryOutcomeMeasure': '; '.join([o.get('measure', 'N/A') for o in outcomes]) if outcomes else 'N/A',
                'BriefSummary': desc.get('briefSummary', 'N/A'),
                'EnrollmentCount': design.get('enrollmentInfo', {}).get('count', 'N/A'),
                'InclusionCriteria': inclusion,
                'ExclusionCriteria': exclusion,
                'HealthyVolunteers': eligibility.get('healthyVolunteers', 'N/A'),
                'Gender': eligibility.get('sex', 'N/A'),
                'MinimumAge': eligibility.get('minimumAge', 'N/A'),
                'MaximumAge': eligibility.get('maximumAge', 'N/A'),
                'StdAges': '; '.join(eligibility.get('stdAges', [])) if eligibility.get('stdAges') else 'N/A',
                'LocationCountry': '; '.join(
                    list(set([loc.get('country', 'N/A') for loc in contacts.get('locations', [])]))
                ) if contacts.get('locations') else 'N/A',
                'ContactName': 'N/A',
                'ContactRole': 'N/A',
                'ContactPhone': 'N/A',
                'ContactEmail': 'N/A',
                'LeadSponsor': sponsor.get('name', 'N/A'),
                'SponsorType': sponsor.get('type', 'N/A')
            }

            # Fill contact info from central contacts or fallback
            central = contacts.get('centralContacts', [])
            if central:
                study_data.update({
                    'ContactName': central[0].get('name', 'N/A'),
                    'ContactRole': central[0].get('role', 'N/A'),
                    'ContactPhone': central[0].get('phone', 'N/A'),
                    'ContactEmail': central[0].get('email', 'N/A'),
                })
            elif study_data['NCTId'] != 'N/A':
                print(f"Fetching extra details for {study_data['NCTId']}...")
                detail = get_study_details(study_data['NCTId'])
                if detail:
                    study_data.update(detail)
                time.sleep(0.1)

            results.append(study_data)

        return pd.DataFrame(results)

    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print("Starting clinical trial data extraction for all conditions...")
    df = get_clinical_trials_data()

    if df is not None and not df.empty:
        df.to_csv("all_conditions_trials.csv", index=False)
        print(f"✅ Saved {len(df)} studies to all_conditions_trials.csv")
        print(df.head(3))
    else:
        print("❌ Failed to fetch clinical trial data.")

if __name__ == "__main__":
    main() 