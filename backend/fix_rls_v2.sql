-- Allow Full Access to Vehicles for Authenticated Users (Dealers)
-- Ideally, we check if role='dealer', but for MVP 'authenticated' is sufficient or we can just open it up if we trust the backend validation.
-- Given backend uses 'anon' key usually (which maps to anon role) or 'authenticated' if signed in, Supabase Python client might be using 'service_role' if configured that way, BUT the error proves it's hitting a policy.

-- 1. Enable INSERT for Vehicles
CREATE POLICY "Enable insert for authenticated users only" ON public.vehicles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Enable UPDATE for Vehicles (Users can update their own vehicles)
-- Simplified for MVP: Allow authenticated users to update any vehicle or just theirs. 
-- Correct way: USING (dealer_id = auth.uid())
CREATE POLICY "Enable update for users based on dealer_id" ON public.vehicles FOR UPDATE USING (auth.uid() = dealer_id);

-- 3. Enable DELETE for Vehicles
CREATE POLICY "Enable delete for users based on dealer_id" ON public.vehicles FOR DELETE USING (auth.uid() = dealer_id);

-- 4. Enable INSERT for Bookings (Customers)
CREATE POLICY "Enable insert for authenticated users" ON public.bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Enable UPDATE for Bookings (Status changes)
-- Allow dealers (linked via vehicle) or customers (own booking)
-- MVP SImplified: Allow authenticated.
CREATE POLICY "Enable update for authenticated users" ON public.bookings FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Enable Reviews
CREATE POLICY "Enable insert for reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 7. Fix Profiles Insert (if handled by client, but usually handled by Auth triggers)
-- Assuming profiles are auto-created by triggers or open insert
CREATE POLICY "Enable insert for profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable update for own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- EMERGENCY FALLBACK (Use if above fails and you just want it to work for demo)
-- CREATE POLICY "Enable all for everyone" ON public.vehicles FOR ALL USING (true);
