/**
 * cPanel Setup Node.js App entry point.
 * Set "Application startup file" to: server.js
 *
 * Proxies /backend/* to the local web stack so Django/Passenger can answer
 * when Node owns the domain root.
 */
const http = require("http");
const https = require("https");
const { parse } = require("url");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "127.0.0.1";
const PROXY_MARK = "ghazatna-node-backend-proxy";

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

function headerHasProxyMark(headers) {
  const raw = headers["x-ghazatna-proxy"];
  if (!raw) return false;
  const value = Array.isArray(raw) ? raw.join(",") : String(raw);
  return value.includes(PROXY_MARK);
}

function proxyBackend(req, res) {
  if (headerHasProxyMark(req.headers)) {
    console.error("Backend proxy loop detected for", req.url);
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(
      "Bad Gateway: /backend request looped back to Node.\n" +
        "Ask host to exclude /backend from Node, or put frontend on www only."
    );
    return;
  }

  const proxyHost = (process.env.BACKEND_PROXY_HOST || "127.0.0.1").trim();
  const proxyPort = Number(process.env.BACKEND_PROXY_PORT || 80);
  const useTls = String(process.env.BACKEND_PROXY_TLS || "").trim() === "1";
  const transport = useTls ? https : http;
  const publicHost = (process.env.BACKEND_PROXY_PUBLIC_HOST || "gzs.edu.ps").trim();

  const headers = { ...req.headers };
  delete headers["accept-encoding"];
  headers.host = publicHost;
  headers["x-ghazatna-proxy"] = PROXY_MARK;
  // Help some reverse proxies preserve original scheme/path.
  headers["x-forwarded-proto"] = useTls ? "https" : "http";
  headers["x-forwarded-host"] = publicHost;

  const opts = {
    hostname: proxyHost,
    port: proxyPort,
    path: req.url,
    method: req.method,
    headers,
    rejectUnauthorized: false,
    servername: useTls ? publicHost : undefined,
  };

  console.log(
    `[backend-proxy] ${req.method} ${req.url} -> ${useTls ? "https" : "http"}://${proxyHost}:${proxyPort}`
  );

  const upstream = transport.request(opts, (upRes) => {
    res.writeHead(upRes.statusCode || 502, upRes.headers);
    upRes.pipe(res);
  });

  upstream.on("error", (err) => {
    console.error("Backend proxy error:", req.url, err.message);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Bad Gateway (backend proxy): " + err.message);
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
      console.log("Proxying /backend/* via local web server for Django");
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js:", err);
    process.exit(1);
  });
