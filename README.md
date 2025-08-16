# Quiz Easy (Next.js 14 + Gemini)

**Quiz Easy** is a modern web application that allows users to create and play interactive quizzes powered by the Google Gemini API. The app supports multiple question types, including multiple-choice and open-ended questions, and provides real-time feedback, statistics, and a history of past quizzes. With an elegant UI built using shadcn/ui and Tailwind CSS, Quiz Easy ensures a smooth and engaging learning experience.

A modern web app that generates and runs quizzes using the Gemini API. Built with the newest Next.js 14 features and deployed on Vercel.

## Overview
This full-stack build showcases App Router patterns, type-safe data access, form UX with shadcn/ui, and robust querying. The app lets users create quizzes, play multiple game modes, and view rich statistics.

## Key Features
- Next.js App Router architecture (server components, layouts, nested routes)
- shadcn/ui + Tailwind CSS for consistent, accessible UI
- Data fetching best practices (server actions, caching/invalidations)
- Gemini API integration for LLM-powered question generation
- ORM-backed database models and relations
- Auth, theming, and responsive nav
- Game modes: MCQ, open-ended, blank input
- Word cloud insights, quiz history, and stats pages
- Production deploys on Vercel

## Tech Stack
- **Frontend:** Next.js 14, React, App Router, shadcn/ui, Tailwind CSS
- **State/Data:** React Query (TanStack), server actions, REST endpoints
- **Backend:** Next.js API routes / server components
- **Database/ORM:** Prisma with a neon data base
- **Auth:** NextAuth (configuration driven)
- **AI:** Gemini API for quiz generation
- **Hosting:** Vercel

## Getting Started (High-Level)
1. Set up a new Next.js 14 project and initialize Tailwind CSS and shadcn/ui.
2. Configure a SQL database (e.g., PostgreSQL). Initialize Prisma and run migrations.
3. Create environment variables for database, auth providers, and your Gemini API key.
4. Scaffold auth with NextAuth and add a protected layout for app routes.
5. Implement UI primitives (Navbar, Theme Toggle) and core pages (Home, Dashboard, Quiz views).
6. Add quiz creation flows and endpoints that call the Gemini API to generate questions.
7. Implement game logic (create game, check answer, scoring, time deltas).
8. Build analytics (word clouds, per-question stats, history).
9. Optimize data fetching and caching; wire React Query where appropriate.
10. Deploy to Vercel and configure environment variables and database.

## Environment & Configuration (Conceptual)
- Database connection URL
- Auth secrets and provider IDs
- Gemini API key and model configuration
- App base URL for callbacks

> Note: Keep secrets in environment variables. Rotate keys regularly and limit scopes.

## Data Model (Conceptual)
- **User**: profile, auth
- **Quiz**: title, topic, metadata
- **Question**: prompt, options/answers, type
- **Game**: instance state, timestamps
- **Attempt/Result**: per-question outcome, time delta, score

## Endpoints & Flows (Conceptual)
- **Generate Questions**: accepts topic/params, returns model-generated items
- **Create Game**: spawns a playable session from a quiz
- **Check Answer**: validates responses and updates results


## License
Choose and include a suitable license for your project repository.


