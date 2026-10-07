# LexMind Project State

## Current Milestone

M1 — Project Foundation

## Completed

- Next.js frontend
- FastAPI backend
- Frontend-to-backend communication
- Health check endpoint
- Local CORS configuration

## Current Architecture

Next.js
    ↓
FastAPI
    ↓
Future services
    ↓
PostgreSQL / Hindsight / OpenAI

## Next Milestone

M2 — Case Management + PostgreSQL

## Important Rules

1. Frontend never directly accesses databases.
2. Frontend never directly accesses Hindsight.
3. API keys remain on the backend.
4. Each case will eventually have isolated memory.
5. Security and authorization must be enforced by the backend.\q