const dns = require("node:dns/promises");
const https = require("node:https");
const ipaddr = require("ipaddr.js");
const { AppError } = require("../../shared/errors/app-error");
async function checkPublicUrl(value, redirects = 0) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  )
    throw new AppError("Use a public HTTPS URL on port 443", 400);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    throw new AppError("Game hostname could not be resolved", 400);
  }
  if (
    !addresses.length ||
    addresses.some((a) => ipaddr.process(a.address).range() !== "unicast")
  )
    throw new AppError("Game URL must point to a public host", 400);
  const address = addresses[0];
  const result = await new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "GET",
        headers: {