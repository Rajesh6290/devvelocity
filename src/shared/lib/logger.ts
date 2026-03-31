/**
 * Server-side logger for DevVelocity.
 * Use this instead of console.log everywhere.
 * Output format: [TIMESTAMP] [LEVEL] [CATEGORY] message
 */

function timestamp(): string {
  return new Date().toISOString();
}

function fmt(
  level: string,
  category: string,
  message: string,
  meta?: unknown
): void {
  const base = `[${timestamp()}] [${level}] [${category}] ${message}`;
  if (meta !== undefined) {
    process.stdout.write(base + " " + JSON.stringify(meta) + "\n");
  } else {
    process.stdout.write(base + "\n");
  }
}

function errFmt(
  level: string,
  category: string,
  message: string,
  error?: unknown
): void {
  const base = `[${timestamp()}] [${level}] [${category}] ${message}`;
  if (error instanceof Error) {
    process.stderr.write(base + " | " + error.message + "\n");
  } else if (error !== undefined) {
    process.stderr.write(base + " " + JSON.stringify(error) + "\n");
  } else {
    process.stderr.write(base + "\n");
  }
}

export const logger = {
  info: (category: string, message: string, meta?: unknown) =>
    fmt("INFO ", category, message, meta),
  warn: (category: string, message: string, meta?: unknown) =>
    fmt("WARN ", category, message, meta),
  error: (category: string, message: string, error?: unknown) =>
    errFmt("ERROR", category, message, error),
  debug: (category: string, message: string, meta?: unknown) => {
    if (process.env["NODE_ENV"] !== "production")
      fmt("DEBUG", category, message, meta);
  },
};
