# LegBuddy — AI Indian Legal & Government Assistant

> **“Understand Indian Law. Complete Government Work. Start With Confidence.”**

LegBuddy is a production-grade full-stack platform engineered to empower citizens, beginners, entrepreneurs, startups, and small businesses to navigate Indian laws, company registrations, mandatory licenses, government circulars, and ongoing statutory compliances with zero prior knowledge.

---

## 🏛️ Core Features

1. **Nyaya AI Chatbot (न्याय AI)**
   - Grounded RAG architecture utilizing verified official Indian legal and regulatory sources.
   - Strictly references official Acts, sections, circulars, and `.gov.in` portals (MCA, CBIC GST, FSSAI, MSME Udyam, DGFT, IP India, EPFO, ESIC).
   - Never hallucinates statutory fees or non-existent sections.
   - Live citations with official portal hyperlinks and verification timestamps.
   - **Multi-lingual support**: English, Hindi (हिंदी), and Gujarati (ગુજરાતી).

2. **Universal Business Setup Assistant**
   - Covers **ALL business sectors**: Manufacturing, Transportation & Logistics, Hotels & Hospitality, Study & Educational Institutions, Research & Development, IT/Software/SaaS, Healthcare & Clinics, E-Commerce, Food Processing, Renewable Energy, etc.
   - Dynamic step-by-step roadmap: Recommended entity structure, mandatory registrations, sector-specific licenses, document checklists, and annual compliance calendar.

3. **Document Assistant & Explainer**
   - Upload Indian contracts, commercial leases, GST show-cause notices (DRC-01), NDAs, employment agreements, or government orders.
   - Clause-by-clause breakdown, plain-language translation, red flag / risk detector, and statutory remedies under Indian law.

4. **Compliance & Deadlines Dashboard**
   - Live statutory tracker for GST returns (GSTR-1, GSTR-3B), Advance Tax, TDS deposits, ROC filings (AOC-4, MGT-7), and IEC annual validations.
   - License validity and countdown renewals tracker with direct portal links.

5. **Admin Knowledge Base Management**
   - Version, verify, audit, and update verified Indian legal sources with live citation counts and government portal verification stamps.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + Motion animations + Lucide React icons.
- **Backend**: Node.js + Express + Vite Middleware with rate limiting and secure input sanitization.
- **AI / LLM**: Google Gemini 3.8 Flash (`@google/genai`) configured securely server-side.
- **Database / RAG**: PostgreSQL 15+ with `pgvector` vector extension and full-text search (`tsvector`), paired with an in-memory high-speed keyword retrieval fallback.
- **Languages Supported**: English, Hindi (`hi`), Gujarati (`gu`).

---

## 📦 Database Schema (PostgreSQL + pgvector)

The complete SQL setup script is provided in `server/db/schema.sql`.

To initialize in your local or production PostgreSQL instance:

```bash
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Create the database
CREATE DATABASE legbuddy;
\c legbuddy

# 3. Apply schema
\i server/db/schema.sql
```

Key tables created:
- `knowledge_sources`: Legal knowledge base with `vector(768)` embeddings, full-text search indexing, and verification audit metadata.
- `users`: User profiles with preferred language and role-based access control.
- `chat_sessions` & `chat_messages`: Grounded chat history with citation metadata.
- `business_roadmaps`: Generated entity setups, licences, and compliance timelines.
- `document_analyses`: Uploaded document analyses, red flags, and checklists.
- `compliance_tasks`: Statutory tasks and due dates.
- `user_licences`: Tracked government licences and renewal dates.

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Gemini API Key (Server-only)
GEMINI_API_KEY="your-gemini-api-key"

# Application URL
APP_URL="http://localhost:3000"

# PostgreSQL with pgvector (Optional for persistence)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/legbuddy"

PORT=3000
```

---

## 🚀 Running the Application

### Development Mode

```bash
# Install dependencies
npm install

# Start the full-stack dev server (Express + Vite on Port 3000)
npm run dev
```

The application will be accessible at: `http://localhost:3000`

### Production Build

```bash
# Build frontend and bundle backend server
npm run build

# Start production server
npm start
```

---

## ⚖️ Legal Disclaimer

*LegBuddy provides informational guidance based on verified Indian legal and regulatory databases. It does not constitute formal legal representation, financial audit, or attorney-client privilege. For formal representation before judicial or quasi-judicial forums, users should consult an enrolled Advocate or Chartered Accountant.*
