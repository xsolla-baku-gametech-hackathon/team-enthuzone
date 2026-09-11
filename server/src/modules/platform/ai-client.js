async function aiCall(action, body) {
  if (!process.env.AI_INTERNAL_TOKEN) throw new Error("AI_NOT_CONFIGURED");
  const response = await fetch(
    `${process.env.AI_SERVICE_URL || "http://127.0.0.1:4001"}/internal/ai/${action}`,
    {
      method: "POST",
      signal: AbortSignal.timeout(60000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_INTERNAL_TOKEN}`,
      },
      body: JSON.stringify(body),
    },
  );
  if (!response.ok) throw new Error(`AI_SERVICE_${response.status}`);
  return response.json();
}
module.exports = { aiCall };
