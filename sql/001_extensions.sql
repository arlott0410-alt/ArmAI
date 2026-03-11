-- ArmAI SQL Schema - Part 1: Extensions
-- Run in Supabase SQL Editor first.
-- Required for uuid_generate_v4(), and any future use of pgcrypto if needed.

create extension if not exists "uuid-ossp";
