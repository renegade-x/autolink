-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE user_role AS ENUM ('dealer', 'customer');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_method_type AS ENUM ('card', 'cash');

-- 1. Profiles (Extends auth.users, but we'll manage it loosely for this MVP if not using Triggers)
-- Note: In a real Supabase app, we'd use a Trigger on auth.users to create this.
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT,
    address TEXT,
    phone_number TEXT,
    bank_details TEXT, -- Only relevant for dealers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Vehicles
CREATE TABLE public.vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    dealer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    images TEXT[], -- Array of image URLs
    location TEXT, -- Can default to Dealer's address
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bookings
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending_payment',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Payments
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method payment_method_type NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE, -- Dealers must verify cash/manual payments
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Reviews
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    dealer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Low-level RLS Policies (Optional for MVP if connection is via Service Role, but good practice)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Open for MVP demo purposes or specific roles)
-- Allowing read access to world for Vehicles
CREATE POLICY "Public vehicles are viewable by everyone" ON public.vehicles FOR SELECT USING (true);
