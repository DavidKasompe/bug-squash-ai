# Mirai

Mirai is being rebuilt as a single Next.js application that combines the frontend and backend into one stack. The product idea remains the same: upload logs, analyze bugs, generate patches, validate results, and connect GitHub repositories.

## Target Stack

- Next.js App Router
- Tailwind CSS
- Supabase
- Better Auth
- Mastra
- TypeScript

## Migration Status

The repository is currently in transition from:

- Vite + React frontend
- Django backend

to:

- Next.js for both UI and server logic

The legacy code remains in the repo temporarily as reference while Mirai is rebuilt.

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## Planned Domains

- Authentication and sessions with Better Auth
- Data and storage with Supabase
- AI workflows for bug analysis and patch generation with Mastra
- GitHub repository integration
- Upload, dashboard, patch preview, and validation flows
