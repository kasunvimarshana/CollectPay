type BackoffOptions = {
  baseMs?: number;
  factor?: number;
  maxMs?: number;
  retries?: number;
};

export async function backoff<T>(
  fn: () => Promise<T>,
  opts: BackoffOptions = {}
): Promise<T> {
  const base = opts.baseMs ?? 500;
  const factor = opts.factor ?? 2;
  const max = opts.maxMs ?? 10000;
  const retries = opts.retries ?? 3;
  let attempt = 0;
  let delay = base;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= retries) throw e;
      await new Promise((r) => setTimeout(r, Math.min(delay, max)));
      delay *= factor;
      attempt++;
    }
  }
}
