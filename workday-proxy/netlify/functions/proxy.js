export default async (req, ctx) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*"
        }
      });
    }

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    const { targetUrl, method, headers, body } = await req.json();

    if (!targetUrl || !method || !headers) {
      return new Response("Missing required fields", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    console.log(`[Proxy] Forwarding ${method} to ${targetUrl}`);

    const forwardRes = await fetch(targetUrl, {
      method,
      headers,
      body: body || null,
    });

    const responseBody = await forwardRes.text();

    return new Response(responseBody, {
      status: forwardRes.status,
      headers: {
        "Content-Type": forwardRes.headers.get("Content-Type") || "text/plain",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
};
