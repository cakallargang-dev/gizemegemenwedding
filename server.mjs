import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);

const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

const canAccess = async (targetPath) => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const resolveRequestPath = async (pathname) => {
  const trimmedPath = pathname.replace(/^\/+/, "");
  const normalizedPath = path.normalize(trimmedPath);
  const resolvedPath = path.resolve(distDir, normalizedPath);

  if (!resolvedPath.startsWith(distDir)) {
    return null;
  }

  if (await canAccess(resolvedPath)) {
    const fileStat = await stat(resolvedPath);

    if (fileStat.isDirectory()) {
      const nestedIndexPath = path.join(resolvedPath, "index.html");
      return (await canAccess(nestedIndexPath)) ? nestedIndexPath : null;
    }

    return resolvedPath;
  }

  if (!path.extname(resolvedPath)) {
    return path.join(distDir, "index.html");
  }

  return null;
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const filePath = await resolveRequestPath(url.pathname);

    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[extension] ?? "application/octet-stream";
    const fileStat = await stat(filePath);

    response.writeHead(200, {
      "Content-Length": fileStat.size,
      "Content-Type": contentType
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Server error");
    console.error(error);
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Static server ready on http://0.0.0.0:${port}`);
});
