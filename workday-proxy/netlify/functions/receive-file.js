// Netlify function for receiving and serving the Workday deliverable
export default async (req, ctx) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Handle file upload via POST
  if (req.method === "POST") {
    try {
      const raw = await req.arrayBuffer();
      const file = new Uint8Array(raw);

      // Optional: generate a simple ID or timestamp
      const fileId = Date.now().toString();

      // Store in memory (ephemeral) — you could use a global Map for demo
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
        { status: 200, headers }
      );
    } catch (error) {
      console.error("Error handling file upload:", error);
      return new Response(
        JSON.stringify({ status: "error", message: "Upload failed" }),
        { status: 500, headers }
      );
    }
  }

  // Fallback for other methods
  return new Response(
    JSON.stringify({ status: "error", message: "Method not allowed" }),
    { status: 405, headers }
  );
};
