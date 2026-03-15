# nexNotes

**Transforming Documents into Interactive Notes**

nexNotes is a web app that uses AI to convert documents and content into structured, interactive notes — with a built-in AI assistant, PDF export, and a complete notes management system.

---

## Features

- **AI-Powered Notes Generation** — Submit a document or topic and get structured notes generated via n8n AI workflows
- **Interactive Notes** — View and manage AI-generated notes with rich formatting
- **AI Assistant** — Chat with an in-app AI assistant for help understanding your notes
- **Download as PDF** — Export any note as a PDF using jsPDF
- **Complete Notes Maintenance** — Create, view, and manage all your notes in one workspace
- **Cross-Platform Access** — Web-based, works on any device
- **Dark / Light Theme** — Toggle between dark and light modes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Auth & Database | Supabase |
| AI Workflows | n8n |
| PDF Export | jsPDF |
| State / Data | TanStack Query |
| Routing | React Router v6 |

---

## Project Structure

```
src/
├── pages/
│   ├── Landing.tsx        # Public landing page
│   ├── Login.tsx          # Authentication - login
│   ├── Signup.tsx         # Authentication - signup
│   ├── Workspace.tsx      # Main app (protected)
│   ├── Settings.tsx       # User settings (protected)
│   └── NotFound.tsx       # 404 page
├── components/
│   ├── workspace/
│   │   ├── WorkspaceSidebar.tsx    # Sidebar with note list
│   │   ├── NotesPanel.tsx          # Main notes display panel
│   │   ├── AiAssistant.tsx         # AI chat assistant
│   │   ├── NoteImportForm.tsx      # Form to generate notes from input
│   │   ├── CreateNoteDialog.tsx    # Dialog for creating new notes
│   │   └── ...                     # Other workspace state components
│   └── ui/                         # shadcn/ui component library
├── contexts/
│   └── AuthContext.tsx     # Supabase authentication context
├── integrations/
│   └── supabase/           # Supabase client & generated types
├── lib/
│   ├── n8n-api.ts          # n8n webhook integration
│   ├── export-note.ts      # PDF export logic
│   └── utils.ts            # Shared utilities
└── hooks/                  # Custom React hooks
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [n8n](https://n8n.io) instance with AI workflow configured

### Installation

```bash
git clone <repo-url>
cd nexNotes
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |

---

## Team

**Team Code: IT-15**

---

## Future Scope

- Video / lecture to notes conversion
- Collaborative notes editing
- Mobile app support
- Enhanced AI interactions — quizzes, summaries, and flashcards
