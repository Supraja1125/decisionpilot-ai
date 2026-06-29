# 🚀 DecisionPilot AI – Intelligent Next Best Action Platform

<img width="1918" height="905" alt="image" src="https://github.com/user-attachments/assets/72153e23-346e-43e5-91d4-595b6b5626be" />
<!-- <img width="1916" height="897" alt="image" src="https://github.com/user-attachments/assets/dac1172c-52ed-41d0-b828-2b439fb5b6b1" /> -->


## Team Details

1.Mekala Supraja - 23071A12A5 - Information Technology
2.Mogullapalli Anvita - 23071A12A8 - Information Technology
3.Shreya Sridhar - 23071A12C1 - Information Technology

## 📌Project Overview

DecisionPilot AI is an **Agentic Decision Intelligence Platform** built for the XLVentures.AI Hackathon.

The platform transforms customer interactions into intelligent, explainable, and actionable recommendations using a multi-agent AI architecture.

Unlike traditional chatbots, DecisionPilot orchestrates multiple AI agents to analyze customer conversations, identify risks and opportunities, retrieve organizational memory, and recommend the **Next Best Action** while keeping a human in the loop before execution.

---

## GitHub repo link 

https://github.com/Supraja1125/decisionpilot-ai


# 🎯 Problem Statement

Organizations receive customer information from multiple channels such as:

* Emails
* Meeting Notes
* CRM Updates
* Call Transcripts
* Slack Conversations

Business users often struggle to identify:

* Customer risks
* Expansion opportunities
* Renewal blockers
* Recommended follow-up actions

DecisionPilot automates this reasoning process using AI agents.

---

# ✨ Features

* 🔐 Secure Authentication using Supabase Auth
* 🤖 Multi-Agent AI Architecture
* 🧠 Shared Organizational Memory
* 📊 Customer Interaction Analysis
* ⚠️ Risk & Opportunity Detection
* 💡 AI-generated Next Best Actions
* 📈 Confidence Scores
* 📚 Explainable Recommendations with Evidence
* 👤 Human Approval Workflow
* 💾 Supabase Database Integration
* 🔄 Memory-aware Recommendations using Previous Customer History

---

# 🏗️ Agent Architecture

DecisionPilot consists of multiple specialized AI agents.

## 1. Planner Agent

* Receives incoming customer interaction
* Plans execution workflow
* Determines reasoning steps

---

## 2. Meeting Analysis Agent

Extracts:

* Customer sentiment
* Customer intent
* Key business phrases

---

## 3. Risk Analysis Agent

Identifies:

* Churn risks
* Renewal risks
* Business opportunities
* Expansion opportunities

---

## 4. Recommendation Agent

Generates:

* Next Best Action
* Confidence Score
* Supporting Evidence
* Business Reasoning
* Draft Customer Email

---

## 5. Human Approval

Allows business users to:

* Review AI recommendations
* Edit recommendations
* Approve or Reject actions

---

# 🧠 Shared Memory

DecisionPilot stores previous customer interactions and organizational knowledge.

Before generating new recommendations, the platform retrieves relevant historical memory to improve decision quality.

This enables context-aware recommendations rather than isolated responses.

---

# 🔄 Workflow

Customer Interaction

↓

Planner Agent

↓

Meeting Analysis Agent

↓

Risk Analysis Agent

↓

Shared Memory Retrieval

↓

Recommendation Agent (Gemini)

↓

Human Approval

↓

Recommendation Saved to Supabase

---

# 🛠️ Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

## Backend

* Supabase

## Authentication

* Supabase Auth

## Database

* PostgreSQL (Supabase)

## AI Model

* Google Gemini 2.5 Flash

## State Management

* React Query

---

# 📊 Business Domain

**Domain:** SaaS Sales & Customer Success

The platform assists Account Executives and Customer Success Managers in making better renewal, expansion, and customer engagement decisions.

---

# 🚀 Setup Instructions

## Clone Repository

```bash
git clone <repository-url>
cd decisionpilot
```

## Install Dependencies

```bash
npm install
```

## Configure Environment Variables

Create a `.env` file.

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

## Start Development Server

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

---

# 📂 Project Structure

```text
src/
 ├── components/   # Reusable UI widgets (modals, navigations, visualizers)
 ├── data/         # Mock data generator seed structures
 ├── lib/          # Helper libraries (Supabase client initializer)
 ├── services/     # core database layer and Gemini service agents
 ├── views/        # Platform workspace tab view components
 └── App.tsx       # Root entrypoint with layout & router
```

---

# 📸 Demo Flow

1. User logs in.
2. Customer interaction is ingested.
3. Planner Agent orchestrates AI workflow.
4. Meeting Analysis Agent extracts sentiment and intent.
5. Risk Analysis Agent identifies risks and opportunities.
6. Shared Memory retrieves historical customer context.
7. Recommendation Agent generates the Next Best Action.
8. Human reviews and approves recommendation.
9. Recommendation is stored for future learning.

---

# 🎯 Future Enhancements

* Real-time enterprise integrations
* CRM connectors
* Email automation
* Knowledge Graph integration
* Vector Search
* Multi-LLM support
* Live Agent Monitoring

---
