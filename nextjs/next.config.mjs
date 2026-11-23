import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.dirname(appRoot);

// The app's Markdown is in content/, inside nextjs/, and pages read it at request time. On Vercel, public/ is served
// from the CDN and is not in the server's file system, so the files pages read from public/ (the database JSON, the
// gallery pictures they check for) are traced in too.
export default {
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.local"],
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
  outputFileTracingIncludes: {
    "/*": ["./content/**/*", "./public/database/**/*.json", "./public/gallery/**/*", "./app/remix/*/PLAN.md"],
  },
};
