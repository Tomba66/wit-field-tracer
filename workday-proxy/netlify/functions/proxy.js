export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    console.error("No 'url' query parameter provided.");
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
    console.log(`Forwarding request to Workday: ${targetUrl}`);
    const wdResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined, // prevent leaking Netlify's host
      },
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });

    const contentType = wdResponse.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    const rawBody = await wdResponse.text();

    console.log(`Response from Workday (${wdResponse.status}):`);
    console.log(rawBody.slice(0, 500)); // Print first 500 chars

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    res.status(wdResponse.status);
    res.setHeader("Content-Type", contentType);
    res.send(rawBody);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy request failed", details: err.message });
  }
}
