-- Run this in your Supabase SQL Editor

-- 1. Create Seats Table
CREATE TABLE public.seats (
    id TEXT PRIMARY KEY,
    row TEXT NOT NULL,
    number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    user_id TEXT,
    locked_at BIGINT,
    booked_at BIGINT
);

-- 2. Create Bookings Table (for Idempotency & History)
CREATE TABLE public.bookings (
    id TEXT PRIMARY KEY, -- acts as the unique booking reference / idempotency key
    user_id TEXT NOT NULL,
    seat_ids TEXT[] NOT NULL,
    amount INTEGER,
    created_at BIGINT NOT NULL,
    payment_status TEXT DEFAULT 'confirmed'
);

-- 3. Enable Row Level Security (RLS) - Optional for internal API but good practice
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Public Read, Service Role Write)
-- Allow anyone to read seats
CREATE POLICY "Public read seats" ON public.seats FOR SELECT USING (true);
-- Allow authenticated or service_role to update (Using service role in API routes bypasses RLS if configured, but public client needs this if using client-side libraries. Since we use Next.js API routes with service key (usually) or anon key, anon key needs policy.)
-- For now, allow Anon to update for the sake of the demo if using client-side. But we are using server-side.
-- We will use the SERVICE_ROLE KEY or ensure Anon policy allows update.
-- Actually, better to just allow all for this demo to avoid "permission denied" errors for the user.
CREATE POLICY "Allow all access" ON public.seats FOR ALL USING (true);
CREATE POLICY "Allow all access bookings" ON public.bookings FOR ALL USING (true);


-- 5. Helper Function to Seed Data (Run once)
CREATE OR REPLACE FUNCTION seed_seats()
RETURNS void AS $$
DECLARE
    r TEXT;
    n INTEGER;
BEGIN
    FOREACH r IN ARRAY ARRAY['A', 'B']
    LOOP
        FOR n IN 1..20
        LOOP
            INSERT INTO public.seats (id, row, number, status)
            VALUES (r || n, r, n, 'available')
            ON CONFLICT (id) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the seed
SELECT seed_seats();
