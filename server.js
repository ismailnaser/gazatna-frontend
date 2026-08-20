/**
 * cPanel Setup Node.js App entry point.
 * Set "Application startup file" to: server.js
 * (or scripts/start-cpanel.sh if your panel accepts shell startup files)
 *
 * - /backend/* → local web stack (Passenger/Django path helper)
 * - /api + /media → BACKEND_URL (Django origin) with streamed body
 *   (fixes LiteSpeed empty JSON bodies from Edge middleware rewrites)
 */
const { execSync } = require("child_process");
const path = require("path");

// Shared hosting: duplicate lsnode workers (~43 threads each) exhaust NPROC.
function cleanupStaleLsnodeWorkers() {
  if (process.env.GHAZATNA_SKIP_LSNODE_CLEANUP === "1") return;

  const appDir = __dirname;
  const script = path.join(appDir, "scripts", "kill-stale-lsnode.sh");
  try {
    execSync(`bash "${script}"`, {
      stdio: "ignore",
      timeout: 8000,
      env: { ...process.env, APP_DIR: appDir },
    });
  } catch {
    // pgrep/kill may be unavailable — non-fatal
  }
}

if (process.env.NODE_ENV === "production") {
  cleanupStaleLsnodeWorkers();
}

process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || "4";
const http = require("http");
const https = require("https");
const { parse, URL } = require("url");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "127.0.0.1";
const PROXY_MARK = "ghazatna-node-backend-proxy";
const API_PROXY_MARK = "ghazatna-node-api-proxy";

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

function isApiOrMediaPath(urlPath) {
  return (
    urlPath === "/api" ||
    urlPath.startsWith("/api/") ||
    urlPath === "/media" ||
    urlPath.startsWith("/media/")
  );
}

function headerHasMark(headers, mark) {
  const raw = headers["x-ghazatna-proxy"];
  if (!raw) return false;
  const value = Array.isArray(raw) ? raw.join(",") : String(raw);
  return value.includes(mark);
}

function resolveDjangoOrigin() {
  const explicit = (process.env.BACKEND_URL || process.env.DJANGO_BACKEND_URL || "").trim();
  if (!explicit) return null;
  try {
    const cleaned = explicit.replace(/\/$/, "").replace(/\/api\/?$/, "");
    return new URL(cleaned);
  } catch {
    return null;
  }
}

/** Refuse proxying back onto the public frontend host (loop). */
function canSafelyProxyTo(originUrl, req) {
  if (!originUrl) return false;
  const reqHost = String(req.headers.host || "")
    .split(":")[0]
    .toLowerCase();
  const targetHost = originUrl.hostname.toLowerCase();
  if (!reqHost) return true;
  if (targetHost === reqHost) return false;
  if (
    (reqHost === "gzs.edu.ps" || reqHost === "www.gzs.edu.ps") &&
    (targetHost === "gzs.edu.ps" || targetHost === "www.gzs.edu.ps")
  ) {
    return false;
  }
  return true;
}

function proxyBackend(req, res) {
  if (headerHasMark(req.headers, PROXY_MARK)) {
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

/**
 * Stream /api and /media to Django via BACKEND_URL (runtime env).
 * Safe no-op when BACKEND_URL missing or points at this same frontend host —
 * request then falls through to Next.js rewrites.
 */
function proxyApiOrMedia(req, res, originUrl) {
  if (headerHasMark(req.headers, API_PROXY_MARK)) {
    console.error("API proxy loop detected for", req.url);
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ detail: "Bad Gateway: API proxy loop." }));
    return;
  }

  const useTls = originUrl.protocol === "https:";
  const transport = useTls ? https : http;
  const headers = { ...req.headers };
  delete headers["accept-encoding"];
  delete headers["connection"];
  headers.host = originUrl.host;
  headers["x-ghazatna-proxy"] = API_PROXY_MARK;
  headers["x-forwarded-proto"] = "https";
  headers["x-forwarded-host"] = String(req.headers.host || "gzs.edu.ps").split(":")[0];

  const opts = {
    protocol: originUrl.protocol,
    hostname: originUrl.hostname,
    port: originUrl.port || (useTls ? 443 : 80),
    path: req.url,
    method: req.method,
    headers,
    rejectUnauthorized: false,
    servername: useTls ? originUrl.hostname : undefined,
    timeout: 45000,
  };

  const upstream = transport.request(opts, (upRes) => {
    const outHeaders = { ...upRes.headers };
    delete outHeaders["transfer-encoding"];
    res.writeHead(upRes.statusCode || 502, outHeaders);
    upRes.pipe(res);
  });

  upstream.on("timeout", () => {
    upstream.destroy(new Error("upstream timeout"));
  });

  upstream.on("error", (err) => {
    console.error("API proxy error:", req.url, err.message);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ detail: "Bad Gateway (api proxy): " + err.message }));
    } else {
      res.end();
    }
  });

  req.pipe(upstream);
}

app
  .prepare()
  .then(() => {
    const djangoOrigin = resolveDjangoOrigin();
    http
      .createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url || "/", true);
          const pathname = parsedUrl.pathname || "/";

          if (isBackendPath(pathname)) {
            proxyBackend(req, res);
            return;
          }

          if (isApiOrMediaPath(pathname) && canSafelyProxyTo(djangoOrigin, req)) {
            proxyApiOrMedia(req, res, djangoOrigin);
            return;
          }

          await handle(req, res, parsedUrl);
        } catch (err) {
          console.error("Request error:", req.url, err);
          res.statusCode = 500;
          res.end("internal server error");
        }
      })
      .listen(port, hostname, () => {
        console.log(`Next.js ready on http://${hostname}:${port}`);
        if (djangoOrigin) {
          console.log(`Proxying /api and /media to ${djangoOrigin.origin}`);
        } else {
          console.log("BACKEND_URL not set — /api uses Next rewrites only");
        }
        console.log("Proxying /backend/* via local web server for Django");
      });
  })
  .catch((err) => {
    console.error("Failed to start Next.js:", err);
    process.exit(1);
  });
