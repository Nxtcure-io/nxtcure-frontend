import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DISEASES = [
  'breast cancer', 'solid tumor', 'solid tumors', 'stroke', 'heart disease', 'prostate cancer',
  'non-small cell lung cancer', 'nsclc', 'type 2 diabetes', 'obesity', 'asthma', 'hiv', 'aids',
  'covid', 'covid-19', 'hepatitis b', 'hepatitis c', 'respiratory syncytial virus', 'rsv',
  'malaria', 'tuberculosis', 'copd', 'chronic obstructive pulmonary disease', 'lymphoma',
  'multiple myeloma', 'ovarian cancer', 'acute myeloid leukemia', 'aml', 'myelodysplastic syndrome',
  'mds', 'non-hodgkin lymphoma', 'nhl', 'hepatocellular carcinoma', 'hcc', 'renal cell carcinoma',
  'rcc', 'acute lymphoblastic leukemia', 'all', 'glioblastoma', 'esophageal carcinoma',
  'cystic fibrosis', 'chronic myeloid leukemia', 'cml', 'glial tumor', 'glial tumors',
  'biliary cancer', 'small cell lung cancer', 'sclc', 'systemic lupus erythematosus', 'sle',
  'systemic sclerosis', 'uveitis', 'sickle cell disease', 'idiopathic pulmonary fibrosis', 'ipf',
  'juvenile arthritis'
];

function parseEligibilityCriteria(criteriaText) {
  if (!criteriaText || criteriaText === 'N/A') return { inclusion: 'N/A', exclusion: 'N/A' };
  let inclusion = 'N/A', exclusion = 'N/A';
  try {
    const lines = criteriaText.split('\n');
    let current = null, inc = [], exc = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      if (/inclusion/i.test(line)) { current = 'inclusion'; continue; }
      if (/exclusion/i.test(line)) { current = 'exclusion'; continue; }
      if (line.startsWith('*') || line.startsWith('-')) {
        if (current === 'inclusion') inc.push(line);
        if (current === 'exclusion') exc.push(line);
      }
    }
    if (inc.length) inclusion = inc.join(' ');
    if (exc.length) exclusion = exc.join(' ');
    if (!inclusion.trim()) inclusion = 'N/A';
    if (!exclusion.trim()) exclusion = 'N/A';
  } catch (e) {
    inclusion = criteriaText.slice(0, 500) + (criteriaText.length > 500 ? '...' : '');
    exclusion = 'N/A';
  }
  return { inclusion, exclusion };
}

async function getStudyDetails(nctId) {
  try {
    const url = `https://clinicaltrials.gov/api/v2/studies/${nctId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const protocol = data.protocolSection || {};
    const contacts = protocol.contactsLocationsModule?.centralContacts || [];
    let contact = { ContactName: 'N/A', ContactRole: 'N/A', ContactPhone: 'N/A', ContactEmail: 'N/A' };
    if (contacts.length) {
      const main = contacts[0];
      contact = {
        ContactName: main.name || 'N/A',
        ContactRole: main.role || 'N/A',
        ContactPhone: main.phone || 'N/A',
        ContactEmail: main.email || 'N/A',
      };
    }
    const sponsor = protocol.sponsorCollaboratorsModule?.leadSponsor || {};
    return {
      ...contact,
      LeadSponsor: sponsor.name || 'N/A',
      SponsorType: sponsor.class || 'N/A',
    };
  } catch (e) {
    return null;
  }
}

async function main() {
  try {
    console.log('Starting clinical trial extraction...');
    const baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
    const pageSize = 500;
    let pageToken = undefined;
    let allStudies = [];
    let page = 1;
    // Read existing NCTIds from CSV if it exists
    const csvPath = path.join(__dirname, '../filtered_trials.csv');
    let existingNCTIds = new Set();
    let existingRows = [];
    if (fs.existsSync(csvPath)) {
      const csvData = fs.readFileSync(csvPath, 'utf8');
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      for (const row of parsed.data) {
        if (row.NCTId) {
          existingNCTIds.add(row.NCTId);
          existingRows.push(row);
        }
      }
      console.log(`Loaded ${existingNCTIds.size} existing NCTIds from CSV.`);
    }
    while (allStudies.length < 50000) {
      const params = new URLSearchParams({
        'pageSize': String(pageSize),
        'format': 'json',
      });
      if (pageToken) params.append('pageToken', pageToken);
      const url = `${baseUrl}?${params}`;
      console.log(`Fetching page ${page} from:`, url);
      const apiRes = await fetch(url);
      if (!apiRes.ok) throw new Error('Failed to fetch studies: ' + apiRes.status + ' ' + apiRes.statusText);
      const data = await apiRes.json();
      const studies = data.studies || [];
      allStudies = allStudies.concat(studies);
      console.log(`Fetched ${studies.length} studies, total so far: ${allStudies.length}`);
      if (data.nextPageToken && allStudies.length < 50000) {
        pageToken = data.nextPageToken;
        page++;
        await new Promise(r => setTimeout(r, 300));
      } else {
        break;
      }
    }
    console.log('Total studies fetched:', allStudies.length);
    const processed = [];
    let usCount = 0, contactCount = 0, diseaseCount = 0, recruitingCount = 0, newCount = 0;
    for (let study of allStudies) {
      const protocol = study.protocolSection || {};
      const idMod = protocol.identificationModule || {};
      const statusMod = protocol.statusModule || {};
      const designMod = protocol.designModule || {};
      const condMod = protocol.conditionsModule || {};
      const armsMod = protocol.armsInterventionsModule || {};
      const outMod = protocol.outcomesModule || {};
      const descMod = protocol.descriptionModule || {};
      const eligMod = protocol.eligibilityModule || {};
      const contactsMod = protocol.contactsLocationsModule || {};
      const sponsorMod = protocol.sponsorCollaboratorsModule || {};

      const studyInfo = {
        NCTId: idMod.nctId || 'N/A',
        BriefTitle: idMod.briefTitle || 'N/A',
        OfficialTitle: idMod.officialTitle || 'N/A',
        OverallStatus: statusMod.overallStatus || 'N/A',
        StartDate: statusMod.startDateStruct?.date || 'N/A',
        CompletionDate: statusMod.completionDateStruct?.date || 'N/A',
        StudyType: designMod.studyType || 'N/A',
        Phase: (designMod.phases || []).join('; ') || 'N/A',
        Condition: (condMod.conditions || []).join('; ') || 'N/A',
        InterventionName: (armsMod.interventions || []).map(i => i.name).join('; ') || 'N/A',
        PrimaryOutcomeMeasure: (outMod.primaryOutcomes || []).map(o => o.measure).join('; ') || 'N/A',
        BriefSummary: descMod.briefSummary || 'N/A',
        EnrollmentCount: designMod.enrollmentInfo?.count || 'N/A',
        HealthyVolunteers: eligMod.healthyVolunteers || 'N/A',
        Gender: eligMod.sex || 'N/A',
        MinimumAge: eligMod.minimumAge || 'N/A',
        MaximumAge: eligMod.maximumAge || 'N/A',
        StdAges: (eligMod.stdAges || []).join('; ') || 'N/A',
        InclusionCriteria: 'N/A',
        ExclusionCriteria: 'N/A',
        LocationCountry: 'N/A',
        ContactName: 'N/A',
        ContactRole: 'N/A',
        ContactPhone: 'N/A',
        ContactEmail: 'N/A',
        LeadSponsor: sponsorMod.leadSponsor?.name || 'N/A',
        SponsorType: sponsorMod.leadSponsor?.type || 'N/A',
      };
      // Parse eligibility
      const parsed = parseEligibilityCriteria(eligMod.eligibilityCriteria || '');
      studyInfo.InclusionCriteria = parsed.inclusion;
      studyInfo.ExclusionCriteria = parsed.exclusion;
      // Location
      const locations = contactsMod.locations || [];
      const countries = [...new Set(locations.map(l => l.country || 'N/A'))];
      studyInfo.LocationCountry = countries.join('; ');
      // USA location filter
      if (!countries.some(c => /usa|united states/i.test(c))) continue;
      usCount++;
      // Contact info
      const centralContacts = contactsMod.centralContacts || [];
      if (centralContacts.length) {
        const main = centralContacts[0];
        studyInfo.ContactName = main.name || 'N/A';
        studyInfo.ContactRole = main.role || 'N/A';
        studyInfo.ContactPhone = main.phone || 'N/A';
        studyInfo.ContactEmail = main.email || 'N/A';
      }
      // Real contact info filter
      const hasContact = [studyInfo.ContactName, studyInfo.ContactPhone, studyInfo.ContactEmail].some(
        v => v && v !== 'N/A'
      );
      if (!hasContact) continue;
      contactCount++;
      // Disease filter
      const condStr = studyInfo.Condition.toLowerCase();
      if (!TARGET_DISEASES.some(d => condStr.includes(d))) continue;
      diseaseCount++;
      // Only actively recruiting
      if (studyInfo.OverallStatus.toLowerCase() !== 'recruiting') continue;
      recruitingCount++;
      if (existingNCTIds.has(studyInfo.NCTId)) continue; // skip if already in CSV
      processed.push(studyInfo);
      newCount++;
    }
    console.log('US-based trials:', usCount);
    console.log('With contact info:', contactCount);
    console.log('Matching diseases:', diseaseCount);
    console.log('Recruiting:', recruitingCount);
    console.log('New unique trials to add:', newCount);
    // Append new unique trials to existing rows and write CSV
    const allRows = existingRows.concat(processed);
    const parser = new Parser();
    const csv = parser.parse(allRows);
    fs.writeFileSync(csvPath, csv);
    console.log(`Saved filtered trials to ${csvPath}`);
    console.log(`Total trials in CSV: ${allRows.length}`);
  } catch (e) {
    console.error('Error:', e.message, e.stack);
  }
}

// Run if called directly (ESM compatible)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
} 