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
          Range: "bytes=0-0",
          "User-Agent": "PlayerIntelligence-LinkCheck/1.0",
        },
        lookup: (_h, _o, cb) =>
          _o.all
            ? cb(null, [address])
            : cb(null, address.address, address.family),
      },
      (res) => {
        const result = {
          status: res.statusCode,
          location: res.headers.location,
        };
        res.destroy();
        resolve(result);
      },
    );
    req.setTimeout(6000, () => req.destroy(new Error("TIMEOUT")));
    req.on("error", () =>
      reject(new AppError("Game URL is not reachable", 400)),
    );
    req.end();
  });
  if (result.status >= 300 && result.status < 400 && result.location) {
    if (redirects >= 3) throw new AppError("Too many game URL redirects", 400);
    return checkPublicUrl(new URL(result.location, url).href, redirects + 1);
  }
  if (result.status < 200 || result.status >= 400)
    throw new AppError(`Game host returned HTTP ${result.status}`, 400);
  return value;
}
module.exports = { checkPublicUrl };
