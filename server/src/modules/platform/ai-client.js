async function aiCall(action, body) {
  if (!process.env.AI_INTERNAL_TOKEN) throw new Error("AI_NOT_CONFIGURED");
  const response = await fetch(
    `${process.env.AI_SERVICE_URL || "http://127.0.0.1:4001"}/internal/ai/${action}`,
    {
      method: "POST",