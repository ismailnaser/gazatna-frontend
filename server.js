/**
 * cPanel Setup Node.js App entry point.
 * Set "Application startup file" to: server.js
 *
 * When Node owns gzs.edu.ps root, LiteSpeed often sends /backend/* to Next too.
 * We reverse-proxy those paths back to the local web server so Passenger/Django
 * (Setup Python App on /backend) can handle them.
 */
const http = require("http");
const https = require("https");
const { parse } = require("url");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "127.0.0.1";

const app = next({
  dev: false,
  hostname,
  port,
  dir: __dirname,
});
const handle = app.getRequestHandler();

function isBackendPath(urlPath) {
  return urlPath === "/backend" || urlPath.startsWith("/backend/");
}

/**
 * Proxy /backend to the site's HTTP stack on loopback.
 * Prefer BACKEND_PROXY_HOST / BACKEND_PROXY_PORT if set; else 127.0.0.1:80
 * with the original Host header so cPanel routes to the Python app.
 */
function proxyBackend(req, res) {
  const proxyHost = (process.env.BACKEND_PROXY_HOST || "127.0.0.1").trim();
  const proxyPort = Number(process.env.BACKEND_PROXY_PORT || 80);
  const useTls = process.env.BACKEND_PROXY_TLS === "1";
  const transport = useTls ? https : http;

  const headers = { ...req.headers };
  // Avoid compressing through the proxy pipe in awkward ways on some hosts.
  delete headers["accept-encoding"];

  const opts = {
    hostname: proxyHost,
    port: proxyPort,
    path: req.url,
    method: req.method,
    headers,
    servername: useTls ? headers.host && String(headers.host).split(":")[0] : undefined,
  };

  const upstream = transport.request(opts, (upRes) => {
    res.writeHead(upRes.statusCode || 502, upRes.headers);
    upRes.pipe(res);
  });

  upstream.on("error", (err) => {
    console.error("Backend proxy error:", req.url, err.message);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end("Bad Gateway (backend proxy)");
    }
  });

  req.pipe(upstream);
}

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url || "/", true);
        const pathname = parsedUrl.pathname || "/";

        if (isBackendPath(pathname)) {
          proxyBackend(req, res);
          return;
        }

        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Request error:", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    }).listen(port, hostname, () => {
      console.log(`Next.js ready on http://${hostname}:${port}`);
      console.log("Proxying /backend/* to local web server for Django/Passenger");
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js:", err);
    process.exit(1);
  });
