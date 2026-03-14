-- Migration: Add newsletter_subscribed and last_seen_at to profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;
