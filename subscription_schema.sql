-- 1. Create Bundles Table
CREATE TABLE public.bundles (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    weekly_price NUMERIC NOT NULL,
    monthly_price NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for bundles
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active bundles
CREATE POLICY "Public can view active bundles" ON public.bundles
    FOR SELECT USING (is_active = true);

-- Allow admins to manage bundles (assuming admin has a specific role or you can just allow all authenticated users for now if no admin role exists)
-- This is a basic policy, adjust according to your admin setup
CREATE POLICY "Admins can manage bundles" ON public.bundles
    FOR ALL USING (auth.role() = 'authenticated');

-- 2. Create Subscriptions Table
CREATE TYPE subscription_frequency AS ENUM ('weekly', 'monthly');
CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled');

CREATE TABLE public.subscriptions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    bundle_id UUID REFERENCES public.bundles(id) NOT NULL,
    frequency subscription_frequency NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    status subscription_status DEFAULT 'active' NOT NULL,
    next_billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_token TEXT, -- Token from Korapay to charge future payments
    delivery_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Admins can view and manage all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'authenticated');

-- 3. Create Subscription History Table
CREATE TABLE public.subscription_history (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    subscription_id UUID REFERENCES public.subscriptions(id) NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL, -- 'success', 'failed'
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_id UUID REFERENCES public.orders(id), -- Nullable if payment fails before order creation
    korapay_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription history
CREATE POLICY "Users can view own subscription history" ON public.subscription_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subscriptions 
            WHERE id = public.subscription_history.subscription_id 
            AND user_id = auth.uid()
        )
    );

-- Admins can view all history
CREATE POLICY "Admins can view all subscription history" ON public.subscription_history
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Update Orders Table
-- Add a flag to indicate if an order was generated from a subscription
ALTER TABLE public.orders ADD COLUMN is_subscription BOOLEAN DEFAULT false;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
