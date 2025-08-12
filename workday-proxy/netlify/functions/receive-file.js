// Netlify function for receiving and serving the Workday deliverable
export default async (req, ctx) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
	"Access-Control-Expose-Headers": "Content-Disposition"
  };

  // Handle preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // === Handle file upload ===
  if (req.method === "POST") {
    try {
      const raw = await req.arrayBuffer();
      const file = new Uint8Array(raw);
      const fileName = req.headers.get("x-file-name") || "output.html";

      const fileId = Date.now().toString();

      globalThis.latestFile = {
        id: fileId,
        buffer: file,
        fileName,
        receivedAt: new Date().toISOString()
      };

      return new Response(
        JSON.stringify({
          status: "ok",
          message: "File received successfully",
          file_id: fileId,
          file_name: fileName,
          size: file.length
        }),
        {
          status: 200,
          headers: {
            ...headers,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (err) {
      console.error("Upload failed:", err);
      return new Response(
        JSON.stringify({ status: "error", message: "Upload failed" }),
        {
          status: 500,
          headers: {
            ...headers,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }

  // === Handle file download ===
  if (req.method === "GET") {
    const latest = globalThis.latestFile;

    if (!latest || !latest.buffer) {
      return new Response(
        JSON.stringify({ status: "error", message: "No file available" }),
        {
          status: 404,
          headers: {
            ...headers,
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(latest.buffer, {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${latest.fileName}"`
      }
    });
  }

  // === Invalid method fallback ===
  return new Response(
    JSON.stringify({ status: "error", message: "Method not allowed" }),
    {
      status: 405,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    }
  );
};

