# Resume Builder Frontend

A React-based frontend application for creating, editing, and managing professional resumes. This project is the frontend counterpart of [Resume-Generator](https://github.com/achint227/Resume-Generator).

## Features

- Create and edit resumes with a dynamic JSON Schema-based form
- Select from multiple resume templates
- Customize section ordering (Projects, Work Experience, Education)
- Download resumes as PDF
- Copy resume as LaTeX source code
- Tag-based keyword management for resumes

## Tech Stack

- React 18
- TypeScript
- React JSON Schema Form (RJSF) with Semantic UI
- Jest & React Testing Library

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- Running instance of the [Resume-Generator](https://github.com/achint227/Resume-Generator) backend

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd resume
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   REACT_APP_API_BASE_URL=http://localhost:3001
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs the app in development mode |
| `npm test` | Launches the test runner in watch mode |
| `npm run build` | Builds the app for production |
| `npm run typecheck` | Runs TypeScript type checking |

## Project Structure

```
src/
├── api-spec/          # OpenAPI specification
├── components/
│   ├── form/          # Form-related components (RJSF templates, widgets)
│   └── ui/            # Reusable UI components (Toast, ErrorBoundary, etc.)
├── constants/         # Configuration and default values
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/api/      # API client and service modules
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## API Endpoints

The frontend communicates with the backend via these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/resume` | GET | Get all resumes |
| `/resume` | POST | Create a new resume |
| `/resume/{id}` | GET | Get resume by ID |
| `/resume/{id}` | PUT | Update a resume |
| `/download/{id}/{template}/{order}` | GET | Download resume as PDF |
| `/copy/{id}/{template}/{order}` | GET | Get resume as LaTeX |
| `/templates` | GET | Get available templates |

## Docker

Build and run with Docker:

```bash
docker build -t resume-frontend .
docker run -p 3000:3000 -e REACT_APP_API_BASE_URL=http://localhost:3001 resume-frontend
```

## License

See LICENSE file for details.
