# Authentic Hadith App

A mobile app for exploring verified hadith narrations, built with Expo (React Native) and Supabase.

## Features

- **Home**: Random hadith of the moment with Arabic + English text
- **Collections**: Browse hadith by collection (Sahih Bukhari, Muslim, etc.)
- **Search**: Full-text search across Arabic and English hadith text
- **Assistant (TruthSerum)**: Chat-based retrieval that only answers from authenticated hadith
- **Profile**: App info and settings (auth coming in v2)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

3. Start the dev server:
   ```bash
   npx expo start
   ```

## Tech Stack

- Expo SDK 54 + Expo Router
- React Native
- Supabase (PostgreSQL backend with ~36,246 hadith)
- TypeScript
