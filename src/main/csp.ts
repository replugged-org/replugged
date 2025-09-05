import { session } from "electron";

session.defaultSession.webRequest.onBeforeRequest(
  {
    urls: [
      "https://*/api/v*/science",
      "https://*/api/v*/metrics",
      "https://*/api/v*/metrics/*",
      "https://sentry.io/*",
      "https://discord.com/assets/sentry.*.js",
      "https://*.discord.com/assets/sentry.*.js",
    ],
  },
  function (_details, callback) {
    callback({ cancel: true });
  },
);
// @todo: Whitelist a few domains instead of removing CSP altogether; See #386
session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
  if (!responseHeaders) {
    done({});
    return;
  }

  const hasFrameOptions = Object.keys(responseHeaders).find((e) => /x-frame-options/i.test(e));
  const hasAllowCredentials = Object.keys(responseHeaders).find((e) =>
    /access-control-allow-credentials/i.test(e),
  );

  const headersWithoutCSP = Object.fromEntries(
    Object.entries(responseHeaders).filter(
      ([k]) =>
        !/^x-frame-options/i.test(k) &&
        !/^content-security-policy/i.test(k) &&
        !(/^access-control-allow-origin$/i.test(k) && !hasAllowCredentials),
    ),
  );

  if (!hasAllowCredentials) {
    headersWithoutCSP["Access-Control-Allow-Origin"] = ["*"];
  }

  if (hasFrameOptions) {
    headersWithoutCSP["Content-Security-Policy"] = [
      "frame-ancestors 'self' https://discord.com https://*.discord.com https://*.discordsays.com;",
    ];
  }

  done({ responseHeaders: headersWithoutCSP });
});
