// Netlify function for receiving and serving the Workday deliverable
let storedFile = null; // In-memory storage for single-file delivery
let fileName = "workday_output.html"; // Default name (can be overridden if needed)

export default async (req, ctx) => {
  const method = req.method.toUpperCase();

  // === Handle File Upload from Workday ===
  if (method === "POST") {
    const buffer = await req.arrayBuffer();
    storedFile = buffer;

    return new Response("✅ File received and stored temporarily", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // === Handle File Download from Launcher ===
  if (method === "GET") {
    if (!storedFile) {
      return new Response("❌ No file available", {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response(storedFile, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // === Preflight (CORS) Handling ===
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
      }
    });
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  });
};
