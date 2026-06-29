# DecisionPilot AI — Project Documentation

Welcome to the documentation for **DecisionPilot AI**. This document provides an overview of the architecture, key database schemas, visual frontend views, and the multi-agent AI pipeline that powers DecisionPilot.

---

## 1. High-Level Architecture Overview

DecisionPilot AI is a modern, reactive Customer Success Management (CSM) and Revenue Intelligence workspace designed to protect and expand Enterprise ARR (Annual Recurring Revenue). 



It is structured into three primary tiers:
1. **Frontend Interface:** A premium, dark-themed dashboard built with React 19, TypeScript, Vite, Tailwind CSS, Recharts (for charts), and Framer Motion (for interface animations).
2. **Unified Data Layer (`dbService.ts`):** A dual-engine database layer that automatically uses a live **Supabase backend** if credentials are provided in `.env`, or falls back gracefully to a fully functional client-side **LocalStorage database engine** for sandbox/demo operations.
3. **Multi-Agent Reasoning Pipeline (`geminiService.ts`):** An orchestrator that chain-links four specialized LLM agents (Planner, NLP Meeting Analyzer, Risk Classifier, and Recommendation Synthesizer) powered by Google's Gemini models.

---
## 2. Directory Layout (Folder Structure)

decisionpilot-ai/
├── .github/                  # CI/CD Workflows
├── docker-compose.yml        # Local orchestration (DB, Redis, API)
├── README.md
├── frontend/                 # Next.js SPA
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI Elements (shadcn)
│   │   │   ├── ui/           # Atom components (buttons, inputs)
│   │   │   ├── dashboard/    # Dashboard-specific components
│   │   │   └── agents/       # Agent monitoring elements
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Core utilities (API client)
│   │   ├── store/            # Global state (Zustand)
│   │   ├── types/            # TypeScript interfaces
│   │   └── app/              # Next.js App Router pages
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/              # API Route Handlers
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── interactions.py
│   │   │   │   ├── actions.py
│   │   │   │   └── memory.py
│   │   │   └── router.py
│   │   ├── core/             # Configuration, Security, DB Connections
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/           # SQLAlchemy / SQLModel database models
│   │   ├── schemas/          # Pydantic schemas (Request/Response)
│   │   ├── services/         # Business logic layer
│   │   │   ├── crm_sync.py
│   │   │   └── action_executor.py
│   │   ├── agents/           # Agentic Orchestration Core
│   │   │   ├── base.py       # Base Agent Class
│   │   │   ├── planner.py    # Planner / Coordinator Agent
│   │   │   ├── specialist/   # Specialized Agent Modules
│   │   │   │   ├── risk_sentiment.py
│   │   │   │   ├── opp_discovery.py
│   │   │   │   ├── action_drafter.py
│   │   │   │   └── copywriter.py
│   │   │   └── memory/       # Semantic and Episodic Memory utilities
│   │   │       ├── vector_store.py
│   │   │       └── memory_manager.py
│   │   ├── tasks/            # Celery/Background workers
│   │   │   └── ingestion_worker.py
│   │   └── main.py           # Application Entrypoint
│   ├── requirements.txt
│   └── Dockerfile
└── database/                 # Migration scripts & schemas
    └── migrations/

---

## 2. Multi-Agent Reasoning Pipeline


When a customer interaction is logged (such as a new email from Snowflake or a Zoom call notes summary from Stripe), DecisionPilot triggers a sequential, multi-agent AI flow:

sequenceDiagram
    participant UI as Interactions View
    participant P as Planner Agent
    participant M as Meeting Analysis Agent
    participant R as Risk Analysis Agent
    participant Rec as Recommendation Agent
    
    UI->>P: 1. Ingest Interaction
    P->>M: 2. Outlines execution plan & logs summary
    M->>R: 3. Extracts customer intent, sentiment & key phrases
    R->>Rec: 4. Classifies churn probability & opportunities
    Rec->>UI: 5. Generates Next Best Action based on memory & rules
```

### Agent Roles & Workflows:
1. **Planner Agent:** Ingests the customer interaction text and outputs a chronological execution outline along with a single-sentence executive summary.
2. **Meeting Analysis Agent:** Evaluates conversation sentiment (Positive, Neutral, Negative) and outputs a sentiment score (scale from `-1.0` to `1.0`), extracts customer intent, and isolates key terms.
3. **Risk Analysis Agent:** Evaluates risks and opportunities. Calculates churn probability percentage and outputs lists of identified revenue risks or upsell growth vectors.
4. **Recommendation Agent:** Formulates the **Next Best Action** for the Account Executive. It checks the latest 5 shared memory logs for context, avoids duplicating previous recommendations, and builds a customized outreach package (e.g., draft email or LinkedIn script) with step-by-step reasoning.

---
 3. Database Schema (`supabase_schema.sql`) 

The database uses PostgreSQL (with pgvector enabled for semantic embeddings/memory support). It is composed of six main tables:

### `customers`
Tracks customer accounts, their industry, current ARR tier, and customer success stage.
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `domain` (VARCHAR)
- `industry` (VARCHAR)
- `status` (VARCHAR: `active`, `churn_risk`, `expansion_target`)
- `arr` (NUMERIC)
- `stage` (VARCHAR)

### `interactions`
Stores communication logs from external services (Gmail, Salesforce, Zoom, Slack).
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key)
- `type` (VARCHAR: `Email`, `Call`, `MeetingNote`, `CRM_Update`)
- `source` (VARCHAR: `Gmail`, `Zoom`, `Salesforce`, `Slack`)
- `content` (TEXT)
- `sentiment` (VARCHAR: `positive`, `neutral`, `negative`)
- `summary` (VARCHAR)

### `recommendations`
Stores AI-generated next best actions that are waiting for human validation.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key)
- `category` (VARCHAR: `Risk Mitigation`, `Upsell`, `Follow Up`, `Relationship`)
- `title` (VARCHAR)
- `summary` (TEXT)
- `reasoning` (TEXT)
- `payload` (JSONB containing message template details: `channel`, `recipient`, `subject`, `body`)
- `confidence_score` (NUMERIC)
- `status` (VARCHAR: `Pending`, `Approved`, `Rejected`, `Executed`)

### `shared_memory`
Stores key account facts, constraints, and instructions used by the Recommendation Agent to customize outreach and adjust strategic playbooks.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key, NULL for global playbooks)
- `category` (VARCHAR: `Sales Playbook`, `Account Fact`, `Rep Feedback`)
- `insight` (TEXT)
- `embedding` (VECTOR(1536))

### `approvals`
Tracks audit history of human reviews (who approved/rejected/modified actions).
- `id` (UUID, Primary Key)
- `recommendation_id` (UUID, Foreign Key)
- `reviewer_id` (UUID, Supabase Auth user ID)
- `action_taken` (VARCHAR: `Approved`, `Modified`, `Rejected`)
- `modification_notes` (TEXT)
- `rejection_reason` (TEXT)

### `agent_logs`
Stores the intermediate thinking traces and output observations of the reasoning pipeline.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key)
- `agent_name` (VARCHAR)
- `timestamp` (VARCHAR)
- `thought` (TEXT)
- `tool_call` (TEXT)
- `observation` (TEXT)
- `status` (VARCHAR)

---

## 4. Frontend View & Components

The interface is organized into a side-navigation layout:

*   **Dashboard (`Dashboard.tsx`):** Renders high-level metrics (Active ARR Managed, Churn Risks, Pending Approvals, ARR Saved) using the **Indian Rupees (₹)** currency format. Displays interactive charts using Recharts showing ARR saved metrics over time, along with a live `WorkflowVisualizer` animation.
*   **Interactions (`Interactions.tsx`):** Lists communication history and allows adding new records (emails, transcripts, etc.) which instantly triggers the live multi-agent execution overlay.
*   **AI Analysis (`AIAnalysis.tsx`):** Provides diagnostics per customer account. Displays individual risk scores, buying intent levels, and detailed chronological agent execution logs.
*   **Recommendations (`Recommendations.tsx`):** Lists generated playbooks, their confidence scores, and reasoning.
*   **Shared Memory (`Memory.tsx`):** Visualizes account facts and sales playbook rules.
*   **Human Approval (`HumanApproval.tsx`):** Allows team members to inspect, modify, reject, or approve and dispatch generated outreach messages.
*   **Settings (`Settings.tsx`):** Settings and model customization panel.

---

## 5. Development and Build Instructions

To run and compile the application locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```
3. **Start development server:**
   ```bash
   npm run dev
   ```
4. **Compile and Build:**
   ```bash
   npm run build
   ```
