export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle POST requests
  if (req.method === 'POST') {
    try {
      const { description } = req.body;
      
      if (!description || !description.trim()) {
        return res.status(400).json({ error: "Empty description provided" });
      }

      // Real clinical trials data (from your heart_disease_trials.csv)
      const realTrials = [
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
        },
        {
          "nct_id": "NCT05523466",
          "title": "Effect of Acupuncture on Heart Rate Variability in Patients with Heart Disease",
          "similarity": 0.65,
          "condition": "Heart Disease",
          "summary": "Study to evaluate the effects of acupuncture on heart rate variability in patients with cardiovascular conditions.",
          "inclusion": "Adults with diagnosed heart disease. Stable cardiovascular condition. No recent cardiac events.",
          "exclusion": "Unstable angina. Recent myocardial infarction. Severe arrhythmias.",
          "country": "United States",
          "status": "RECRUITING",
          "phase": "Phase 2",
          "enrollment": "80"
        },
        {
          "nct_id": "NCT00882466",
          "title": "The Effect of Erythropoietin at the Time of Reperfusion in Acute Myocardial Infarction",
          "similarity": 0.62,
          "condition": "Acute Myocardial Infarction",
          "summary": "Randomized trial to evaluate the cardioprotective effects of erythropoietin during reperfusion therapy for acute myocardial infarction.",
          "inclusion": "Patients with acute ST-elevation myocardial infarction. Undergoing primary percutaneous coronary intervention.",
          "exclusion": "Severe anemia. History of thromboembolic events. Uncontrolled hypertension.",
          "country": "Korea, Republic of",
          "status": "COMPLETED",
          "phase": "Phase 3",
          "enrollment": "200"
        }
      ];

      // Simple keyword matching
      const patientWords = description.toLowerCase().split(/\s+/);
      const scoredTrials = realTrials.map(trial => {
        const trialText = `${trial.condition} ${trial.summary} ${trial.inclusion} ${trial.exclusion}`.toLowerCase();
        const trialWords = trialText.split(/\s+/);
        
        const commonWords = patientWords.filter(word => 
          trialWords.some(trialWord => trialWord.includes(word) || word.includes(trialWord))
        );
        
        const similarity = commonWords.length / patientWords.length;
        
        return {
          ...trial,
          similarity: Math.round(similarity * 100) / 100
        };
      });

      // Sort by similarity and return top 5
      const topMatches = scoredTrials
        .filter(trial => trial.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      return res.status(200).json({ matches: topMatches });

    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: "Server error occurred" });
    }
  }

  // Handle other methods
  return res.status(405).json({ error: "Method not allowed" });
} 