-- Enable pgvector extension for long term semantic memory
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),cls
    
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'churn_risk', 'expansion_target')),
    arr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stage VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Interactions Table
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Email', 'Call', 'MeetingNote', 'CRM_Update')),
    source VARCHAR(50) NOT NULL CHECK (source IN ('Gmail', 'Zoom', 'Salesforce', 'Slack')),
    content TEXT NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sentiment VARCHAR(20) NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    summary VARCHAR(500) NOT NULL
);

-- 3. Create Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Risk Mitigation', 'Upsell', 'Follow Up', 'Relationship')),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    evidence TEXT[] NOT NULL DEFAULT '{}',
    payload JSONB NOT NULL,
    confidence_score NUMERIC(5, 4) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Executed')) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Shared Memory Table
CREATE TABLE IF NOT EXISTS shared_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- Can be null for global playbooks
    category VARCHAR(50) NOT NULL CHECK (category IN ('Sales Playbook', 'Account Fact', 'Rep Feedback')),
    insight TEXT NOT NULL,
    embedding VECTOR(1536), -- Vector embedding representation (optional / for future use)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL, -- AE Representative ID (Supabase Auth user ID)
    action_taken VARCHAR(50) NOT NULL CHECK (action_taken IN ('Approved', 'Modified', 'Rejected')),
    modification_notes TEXT,
    rejection_reason TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Agent Logs Table
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    timestamp VARCHAR(50) NOT NULL,
    thought TEXT NOT NULL,
    tool_call TEXT,
    observation TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('completed', 'running', 'failed')) DEFAULT 'completed'
);

-- Enable Row Level Security (RLS) if production. 
-- For Hackathon purposes, we keep tables open or configure permissive policy:
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write access" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON interactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON shared_memory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON approvals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON agent_logs FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- SEED DATA INJECTION
-- ==========================================

-- Seed Customers (Accounts)
INSERT INTO customers (id, name, domain, industry, status, arr, stage) VALUES
('3fa85f64-5717-4562-b3fc-2c963f66afa1', 'Snowflake Inc.', 'snowflake.com', 'Data Cloud', 'churn_risk', 180000.00, 'Renewal Negotiation'),
('3fa85f64-5717-4562-b3fc-2c963f66afa2', 'Stripe', 'stripe.com', 'Fintech', 'expansion_target', 340000.00, 'Proposal Presented'),
('3fa85f64-5717-4562-b3fc-2c963f66afa3', 'Retool', 'retool.com', 'Developer Tools', 'churn_risk', 95000.00, 'Onboarding'),
('3fa85f64-5717-4562-b3fc-2c963f66afa4', 'Vercel', 'vercel.com', 'Cloud Hosting', 'expansion_target', 150000.00, 'Discovery'),
('3fa85f64-5717-4562-b3fc-2c963f66afa5', 'Datadog', 'datadog.com', 'Monitoring', 'active', 220000.00, 'Key Account');

-- Seed Interactions
INSERT INTO interactions (id, customer_id, type, source, content, occurred_at, sentiment, summary) VALUES
('8c7f99ee-70bb-4c28-98e9-d7547ff5f001', '3fa85f64-5717-4562-b3fc-2c963f66afa1', 'Email', 'Gmail', 'Hi Alice, we just had a corporate mandate freeze all software spending for Q3. We still love the platform but renewal might get blocked by finance if we cannot justify CS headcount savings.', '2026-06-27T10:15:00Z', 'negative', 'Corporate budget freeze threatens upcoming Q3 renewal.'),
('8c7f99ee-70bb-4c28-98e9-d7547ff5f002', '3fa85f64-5717-4562-b3fc-2c963f66afa2', 'MeetingNote', 'Zoom', 'Zoom call transcript summary: Dave (Stripe Director of Eng) mentioned they are doubling the size of their frontend team next quarter and need to add 45 new seats. He asked if we can provide a tier volume discount.', '2026-06-27T08:30:00Z', 'positive', 'Customer planning to add 45 seats and requested pricing options.'),
('8c7f99ee-70bb-4c28-98e9-d7547ff5f003', '3fa85f64-5717-4562-b3fc-2c963f66afa3', 'CRM_Update', 'Salesforce', 'Alert: Sarah Jenkins (our main Champion & Director of Product) has left Retool to join a competitor. Her replacement has not been announced yet.', '2026-06-26T17:45:00Z', 'negative', 'Key champion Sarah Jenkins departed the account.'),
('8c7f99ee-70bb-4c28-98e9-d7547ff5f004', '3fa85f64-5717-4562-b3fc-2c963f66afa4', 'Call', 'Zoom', 'Meeting notes: Discussed the custom integration timeline. The team is running ahead of schedule on their API integrations and wants to roll out the solution next month instead of waiting for October.', '2026-06-26T14:00:00Z', 'positive', 'Integration ahead of schedule; migration timeline accelerated.');

-- Seed Recommendations
INSERT INTO recommendations (id, customer_id, category, title, summary, reasoning, evidence, payload, confidence_score, status, created_at) VALUES
('b271d431-7bc3-4886-9a29-450f612bf001', '3fa85f64-5717-4562-b3fc-2c963f66afa1', 'Risk Mitigation', 'Deliver CS Headcount Business Value Case', 'Draft a targeted proposal demonstrating how DecisionPilot saves 12 hours/week per rep to bypass the corporate budget freeze.', 'Snowflake has a Q3 spending freeze. However, business units can bypass this freeze if they present a verified ROI document illustrating direct operational savings.', ARRAY['"renewal might get blocked by finance if we cannot justify CS headcount savings" (Gmail - 2026-06-27)', 'Snowflake core playbook (Playbook Vector ID: PB-91)'], '{"channel": "email", "recipient": "champion@snowflake.com", "subject": "DecisionPilot ROI: Operational Savings Breakdown for Snowflake CS", "body": "Hi Team,\\n\\nI understand Q3 budgets are under high scrutiny. To assist with the renewal review, we put together a brief ROI report. Based on Snowflake''s usage logs, the platform has cut rep lookup times by 12 hours/week, driving an estimated $42,000 in monthly productivity gains.\\n\\nLet me know if we can hop on a 10-minute call to align on this data for finance.\\n\\nBest,\\nSales Team"}', 0.9400, 'Pending', '2026-06-27T10:45:00Z'),
('b271d431-7bc3-4886-9a29-450f612bf002', '3fa85f64-5717-4562-b3fc-2c963f66afa2', 'Upsell', 'Present Volume Expansion Quote', 'Present Stripe with a tiered enterprise expansion quote for the requested 45 seats, applying the standard 15% volume discount.', 'Dave requested tier pricing. Offering the 15% discount for bulk seats immediately fits their expansion schedule and captures $28,000 in new ARR.', ARRAY['"doubling the size of their frontend team next quarter and need to add 45 new seats" (Zoom call transcript)', 'Volume discounting agreement guideline (Playbook Vector ID: PB-14)'], '{"channel": "email", "recipient": "dave@stripe.com", "subject": "DecisionPilot Enterprise Tier Proposal - Stripe Team Expansion", "body": "Hi Dave,\\n\\nGreat connecting on Zoom earlier. To support your team''s expansion next quarter, we''ve prepared a custom quote for the 45 new seats. By upgrading to our Enterprise Growth Tier, we can offer a 15% volume discount, bringing the seat price to $42/month.\\n\\nI''ve attached the formal proposal here. Let me know if you would like me to push this through.\\n\\nBest regards,\\nSales Team"}', 0.9800, 'Pending', '2026-06-27T09:00:00Z'),
('b271d431-7bc3-4886-9a29-450f612bf003', '3fa85f64-5717-4562-b3fc-2c963f66afa3', 'Relationship', 'Introduce Account Team to New Product Lead', 'Reach out to the interim Product Lead to re-introduce DecisionPilot and schedule a brief re-onboarding session.', 'Champion departure creates high churn risk. Need to immediately establish a relationship with the new stakeholder to protect the $95,000 ARR account.', ARRAY['"Sarah Jenkins (our main Champion & Director of Product) has left Retool to join a competitor" (Salesforce CRM Log)'], '{"channel": "linkedin", "recipient": "interim-lead@retool.com", "body": "Hi there, I wanted to reach out and welcome you to the Retool Product team. I have been partnering closely with Retool to support their customer insights workspace. I''d love to connect for 5 minutes next week to share details of our current integration and align on goals."}', 0.8200, 'Pending', '2026-06-26T18:00:00Z');

-- Seed Memory Embeddings
INSERT INTO shared_memory (id, customer_id, category, insight) VALUES
('b08dbdf3-6ff9-49ad-bc0e-c49b6a1bf001', '3fa85f64-5717-4562-b3fc-2c963f66afa1', 'Rep Feedback', 'User rejects aggressive upsells. Prefers analytical, ROI-driven, low-frequency correspondence focusing strictly on quantitative rep metrics.'),
('b08dbdf3-6ff9-49ad-bc0e-c49b6a1bf002', '3fa85f64-5717-4562-b3fc-2c963f66afa2', 'Account Fact', 'Stripe CS and frontend engineering teams are highly integrated. Tone should be technical, product-focused, and mention APIs and automation.'),
('b08dbdf3-6ff9-49ad-bc0e-c49b6a1bf003', NULL, 'Sales Playbook', 'Rule: If a corporate budget freeze is reported, route to CS Saving Value Playbook. Never pitch secondary modules; focus exclusively on renewal cost offset.');

-- Seed Agent Logs
INSERT INTO agent_logs (id, customer_id, agent_name, timestamp, thought, tool_call, observation, status) VALUES
('07212e3e-4fb8-4c9f-b7a4-84226d1bf001', '3fa85f64-5717-4562-b3fc-2c963f66afa1', 'Planner Agent', '10:15:01', 'Ingested raw email from Snowflake Inc. Champion Alice. Analyzing message intent and semantic structure...', NULL, NULL, 'completed'),
('07212e3e-4fb8-4c9f-b7a4-84226d1bf002', '3fa85f64-5717-4562-b3fc-2c963f66afa1', 'Context Retrieval Agent', '10:15:03', 'Need to look up historical interactions and corporate constraints relating to budget freeze renewals.', 'pgvector_similarity_search("budget freeze renewal Snowflake")', 'Found 1 matching Playbook Fact (PB-91: Focus renewal offsets via CS saving value proposition). Found 1 Rep feedback loop (Avoid aggressive pricing pitches; use analytical models).', 'completed'),
('07212e3e-4fb8-4c9f-b7a4-84226d1bf003', '3fa85f64-5717-4562-b3fc-2c963f66afa1', 'Risk Analysis Agent', '10:15:05', 'Evaluating budget freeze statement. Message indicates finance block is likely without quantified justification.', 'sentiment_classifier("mandate freeze all software spending...")', 'Sentiment is negative (score: -0.74). High Risk category flagged (Score: 82%).', 'completed'),
('07212e3e-4fb8-4c9f-b7a4-84226d1bf004', '3fa85f64-5717-4562-b3fc-2c963f66afa1', 'Recommendation Agent', '10:15:08', 'Formulating next step. Churn hazard requires CS productivity saving deck pitch immediately to address finance hurdle.', 'action_playbook_mapper(risk_level=0.82, context="PB-91")', 'Drafted: Deliver CS Headcount Business Value Case (Confidence Score: 94%).', 'completed');
