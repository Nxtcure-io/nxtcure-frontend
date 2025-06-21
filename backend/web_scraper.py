import requests
from bs4 import BeautifulSoup
import time
import re
from typing import Dict, Optional

def scrape_clinical_trial_contacts(nct_id: str) -> Optional[Dict]:
    """
    Scrape contact information from ClinicalTrials.gov web page
    """
    try:
        url = f"https://clinicaltrials.gov/ct2/show/{nct_id}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        contact_info = {
            'ContactName': 'N/A',
            'ContactRole': 'N/A',
            'ContactPhone': 'N/A',
            'ContactEmail': 'N/A'
        }
        
        # Look for contact information in various sections
        contact_sections = soup.find_all(['div', 'section'], class_=re.compile(r'contact|principal|investigator', re.I))
        
        for section in contact_sections:
            text = section.get_text().lower()
            
            # Look for email patterns
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, section.get_text())
            if emails and contact_info['ContactEmail'] == 'N/A':
                contact_info['ContactEmail'] = emails[0]
            
            # Look for phone patterns
            phone_pattern = r'(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
            phones = re.findall(phone_pattern, section.get_text())
            if phones and contact_info['ContactPhone'] == 'N/A':
                contact_info['ContactPhone'] = ''.join(phones[0])
            
            # Look for names (Dr., Principal Investigator, etc.)
            name_patterns = [
                r'Dr\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
                r'Principal Investigator[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
                r'Contact[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
            ]
            
            for pattern in name_patterns:
                names = re.findall(pattern, section.get_text(), re.IGNORECASE)
                if names and contact_info['ContactName'] == 'N/A':
                    contact_info['ContactName'] = names[0].strip()
                    break
        
        # If we found any contact info, return it
        if any(v != 'N/A' for v in contact_info.values()):
            return contact_info
        
        return None
        
    except Exception as e:
        print(f"Error scraping {nct_id}: {e}")
        return None

def enhance_trials_with_scraping(csv_file: str, output_file: str = None):
    """
    Enhance existing CSV with scraped contact information
    """
    import pandas as pd
    
    if output_file is None:
        output_file = csv_file
    
    # Read existing CSV
    df = pd.read_csv(csv_file)
    
    print(f"Enhancing {len(df)} trials with web scraping...")
    
    enhanced_count = 0
    
    for index, row in df.iterrows():
        # Only scrape if contact info is missing
        if (row['ContactName'] == 'N/A' or row['ContactEmail'] == 'N/A') and row['NCTId'] != 'N/A':
            print(f"Scraping contact info for {row['NCTId']} ({index + 1}/{len(df)})...")
            
            scraped_info = scrape_clinical_trial_contacts(row['NCTId'])
            
            if scraped_info:
                # Update only if we found new information
                for field in ['ContactName', 'ContactRole', 'ContactPhone', 'ContactEmail']:
                    if row[field] == 'N/A' and scraped_info[field] != 'N/A':
                        df.at[index, field] = scraped_info[field]
                        enhanced_count += 1
            
            time.sleep(1)  # Be respectful to the server
    
    # Save enhanced CSV
    df.to_csv(output_file, index=False)
    
    print(f"Enhanced {enhanced_count} contact fields")
    print(f"Final contact statistics:")
    print(f"- Studies with contact names: {len(df[df['ContactName'] != 'N/A'])}")
    print(f"- Studies with contact phones: {len(df[df['ContactPhone'] != 'N/A'])}")
    print(f"- Studies with contact emails: {len(df[df['ContactEmail'] != 'N/A'])}")
    
    return df

if __name__ == "__main__":
    # Test scraping for a specific trial
    test_nct = "NCT03261440"
    print(f"Testing web scraping for {test_nct}...")
    result = scrape_clinical_trial_contacts(test_nct)
    print(f"Result: {result}")
    
    # Uncomment to enhance existing CSV
    # enhance_trials_with_scraping("heart_disease_trials.csv") 