import Redis from 'ioredis';

// --- MOCK REDIS IMPLEMENTATION ---
class MockRedis {
  private store = new Map<string, string>();
  private expiries = new Map<string, NodeJS.Timeout>();

  constructor() {
    console.warn('⚠️  REDIS NOT FOUND. Using In-Memory Mock Redis. Concurrency checks will work within this instance only.');
  }

  async get(key: string) {
    return this.store.get(key) || null;
  }

  async mget(keys: string[]) {
    return keys.map((k) => this.store.get(k) || null);
  }

  async set(key: string, value: string, ...args: (string | number)[]) {
    // Naive implementation of SET key value [NX] [PX milliseconds]

    // Parse args
    let nx = false;
    let px = 0; // 0 means no expiry

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === 'string' && arg.toUpperCase() === 'NX') nx = true;
      if (typeof arg === 'string' && arg.toUpperCase() === 'PX') {
        px = Number(args[i + 1]) || 0;
      }
    }

    if (nx && this.store.has(key)) {
      return null; // Key exists, NX failed
    }

    this.store.set(key, value);

    // Clear existing timeout if any
    if (this.expiries.has(key)) {
      clearTimeout(this.expiries.get(key)!);
      this.expiries.delete(key);
    }

    if (px > 0) {
      const timeout = setTimeout(() => {
        this.store.delete(key);
        this.expiries.delete(key);
      }, px);
      this.expiries.set(key, timeout);
    }

    return 'OK';
  }

  async del(key: string) {
    this.store.delete(key);
    if (this.expiries.has(key)) {
      clearTimeout(this.expiries.get(key)!);
      this.expiries.delete(key);
    }
    return 1;
  }

  // Pipeline mock for seat-details
  pipeline() {
    const stack: any[] = [];
    const self = this;
    return {
      get(key: string) {
        stack.push(async () => [null, await self.get(key)]);
        return this;
      },
      pttl(key: string) {
        // Mock TTL not perfectly tracked, return estimate or fake
        // Since we don't store startTime, we can't return accurate TTL in this simple mock
        // For the demo, let's assume if it exists, return 50000 (abitrary) or just handle it in client
        // Actually, let's just return a static valid TTL if key exists, else -2
        stack.push(async () => {
          if (self.store.has(key)) return [null, 60000];
          return [null, -2];
        });
        return this;
      },
      async exec() {
        return Promise.all(stack.map(fn => fn()));
      }
    }
  }

  on(event: string, cb: Function) {
    // no-op
  }
}

// Check environment to decide (Real vs Mock)
// ideally we try to connect and failover, but simpler to just default mock if we know it's missing
// FOR DEMO: Defaulting to Mock since user env lacked redis-server
const shouldUseRealRedis = process.env.USE_REAL_REDIS === 'true';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  return 'redis://localhost:6379';
};

export const redis: any = shouldUseRealRedis
  ? new Redis(getRedisUrl(), { lazyConnect: true })
  : new MockRedis();

if (shouldUseRealRedis) {
  // @ts-ignore
  redis.on('error', (err) => {
    // console.error('Redis Error', err);
  });
}
