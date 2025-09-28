// /api/aqi.js
export default async function handler(req, res) {
  const { city } = req.query;
  const token = process.env.WAQI_API_KEY; // stored in Vercel env vars

  try {
    const resp = await fetch(`https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${token}`);
    const data = await resp.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch AQI data" });
  }
}
