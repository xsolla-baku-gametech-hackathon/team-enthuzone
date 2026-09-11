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