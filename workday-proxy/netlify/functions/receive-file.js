// Netlify function for receiving and serving the Workday deliverable
export default async (req, ctx) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*"
  };

  // === Preflight (CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // === POST (Receive file)
  if (req.method === "POST") {
    try {
      const raw = await req.arrayBuffer();
      const file = new Uint8Array(raw);

      const fileId = Date.now().toString();

      globalThis.latestFile = {
        id: fileId,
        buffer: file,
        receivedAt: new Date().toISOString()
      };

      return new Response(
        JSON.stringify({
          status: "ok",
          message: "File received successfully",
          file_id: fileId,
          size: file.length
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    } catch (err) {
      console.error("Error handling file upload:", err);
      return new Response(
        JSON.stringify({ status: "error", message: "Upload failed" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }

  // === GET (Serve latest file)
  if (req.method === "GET") {
    if (!globalThis.latestFile) {
      return new Response(
        JSON.stringify({ status: "error", message: "No file available" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(globalThis.latestFile.buffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html", // or use original MIME if available
        "Content-Disposition": "attachment; filename=Workday_Field_Tracer.html"
      }
    });
  }

  // === All other methods
  return new Response(
    JSON.stringify({ status: "error", message: "Method not allowed" }),
    {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
};
