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

  // Handle GET requests
  if (req.method === 'GET') {
    const response = {
      status: "healthy",
      message: "Clinical Trials Matching API is working!",
      timestamp: new Date().toISOString(),
      endpoint: "health"
    };
    
    return res.status(200).json(response);
  }

  // Handle other methods
  return res.status(405).json({ error: "Method not allowed" });
} 