export default async function handler(request, context) {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "https://tomba66.github.io",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
        }
      });
    }

    const { targetUrl, method = "POST", headers = {}, body = "" } = await request.json();
    const forwardResponse = await fetch(targetUrl, {
      method,
      headers,
      body: body || undefined
    });

    const text = await forwardResponse.text();

    return new Response(text, {
      status: forwardResponse.status,
      headers: {
        "Access-Control-Allow-Origin": "https://tomba66.github.io",
        "Content-Type": "application/xml"
      }
    });
  } catch (err) {
    console.error("[Proxy] Error forwarding request:", err);

    return new Response("Proxy error: " + err.message, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://tomba66.github.io",
        "Content-Type": "text/plain"
      }
    });
  }
}


