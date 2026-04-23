const buckets = new Map();

export function rateLimit({ windowMs = 60_000, max = 60, keyPrefix = "global" } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      return res.status(429).json({ message: "Demasiados intentos. Proba nuevamente en unos minutos." });
    }

    return next();
  };
}
