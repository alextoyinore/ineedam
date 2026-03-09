-- Migration: Add fcm_token column to profiles table for Firebase Cloud Messaging
-- Run this in your Supabase SQL editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fcm_token TEXT;
