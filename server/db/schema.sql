-- =================================================================
-- LegBuddy - AI Indian Legal & Government Assistant
-- Production PostgreSQL + pgvector Database Schema
-- Compatible with PostgreSQL 15+ and pgvector extension
-- =================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Legal Knowledge Sources (RAG Knowledge Base)
CREATE TABLE IF NOT EXISTS knowledge_sources (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    act_or_regulation VARCHAR(255) NOT NULL,
    section_or_rule VARCHAR(128),
    ministry_or_authority VARCHAR(255) NOT NULL,
    official_url TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_content TEXT NOT NULL,
    embedding vector(768), -- Gemini text-embedding-004 / 2 vector dimension
    verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
    version VARCHAR(32) NOT NULL DEFAULT '1.0',
    verification_status VARCHAR(32) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'pending', 'updated')),
    verified_by VARCHAR(128) DEFAULT 'Legal Research Team, Bar Council Registered Consultant',
    citations_count INT NOT NULL DEFAULT 0,
    category VARCHAR(64) NOT NULL CHECK (category IN ('business', 'tax', 'ipr', 'labour', 'licence', 'statutory', 'sectoral')),
    tags TEXT[] DEFAULT '{}',
    tsv_content tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(act_or_regulation, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(full_content, ''))
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for full text search and vector similarity (HNSW)
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_tsv ON knowledge_sources USING GIN(tsv_content);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_category ON knowledge_sources(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_status ON knowledge_sources(verification_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_vector ON knowledge_sources USING hnsw (embedding vector_cosine_ops);

-- 3. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    preferred_language VARCHAR(8) DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'gu')),
    role VARCHAR(32) DEFAULT 'citizen' CHECK (role IN ('citizen', 'entrepreneur', 'admin', 'advocate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Nyaya AI Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_title VARCHAR(255) NOT NULL DEFAULT 'Legal Inquiry',
    language VARCHAR(8) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'gu')),
    domain_topic VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chat Messages with Grounded Citations
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    citations_json JSONB DEFAULT '[]'::jsonb,
    suggested_questions TEXT[] DEFAULT '{}',
    tokens_used INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- 6. Business Setup Roadmaps
CREATE TABLE IF NOT EXISTS business_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    domain VARCHAR(128) NOT NULL,
    state VARCHAR(64) NOT NULL,
    scale VARCHAR(32) NOT NULL,
    recommended_structure JSONB NOT NULL,
    registrations JSONB NOT NULL,
    licences JSONB NOT NULL,
    documents JSONB NOT NULL,
    implementation_plan JSONB NOT NULL,
    compliance_calendar JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Document Analysis Records
CREATE TABLE IF NOT EXISTS document_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(64) NOT NULL,
    document_type VARCHAR(128) NOT NULL,
    governing_law VARCHAR(255),
    executive_summary TEXT NOT NULL,
    plain_language_explanation TEXT NOT NULL,
    risk_rating VARCHAR(32) NOT NULL,
    key_clauses JSONB NOT NULL,
    red_flags JSONB NOT NULL,
    action_checklist JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Compliance Tasks & Deadlines
CREATE TABLE IF NOT EXISTS compliance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(32) NOT NULL CHECK (category IN ('tax', 'registration', 'licence', 'statutory', 'labour')),
    due_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    priority VARCHAR(16) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    authority VARCHAR(128) NOT NULL,
    portal_url TEXT,
    form_name VARCHAR(128),
    penalty_risk TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Active Licences Tracker
CREATE TABLE IF NOT EXISTS user_licences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    licence_number VARCHAR(128) NOT NULL,
    authority VARCHAR(128) NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'renewal_due', 'expired')),
    portal_url TEXT NOT NULL,
    renewal_fee VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Log for Legal Source Verification & Updates
CREATE TABLE IF NOT EXISTS legal_source_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(64) REFERENCES knowledge_sources(id) ON DELETE CASCADE,
    action VARCHAR(32) NOT NULL CHECK (action IN ('created', 'updated', 'verified', 'version_bump')),
    performed_by VARCHAR(128) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
