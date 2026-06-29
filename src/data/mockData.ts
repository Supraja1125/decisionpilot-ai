export interface Account {
  id: string;
  name: string;
  domain: string;
  industry: string;
  status: 'active' | 'churn_risk' | 'expansion_target';
  arr: number;
  stage: string;
}

export interface Interaction {
  id: string;
  accountId: string;
  accountName: string;
  type: 'Email' | 'Call' | 'MeetingNote' | 'CRM_Update';
  source: 'Gmail' | 'Zoom' | 'Salesforce' | 'Slack';
  content: string;
  occurredAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
}

export interface Recommendation {
  id: string;
  accountId: string;
  accountName: string;
  category: 'Risk Mitigation' | 'Upsell' | 'Follow Up' | 'Relationship';
  title: string;
  summary: string;
  reasoning: string;
  evidence: string[]; // Supporting text snippets
  payload: {
    channel: 'email' | 'linkedin' | 'tasks';
    recipient: string;
    subject?: string;
    body: string;
  };
  confidenceScore: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Executed';
  createdAt: string;
}

export interface MemoryEmbedding {
  id: string;
  accountId: string;
  accountName: string;
  category: 'Sales Playbook' | 'Account Fact' | 'Rep Feedback';
  insight: string;
  createdAt: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun: string;
  message: string;
}

export interface ThinkingStep {
  id: string;
  agent: string;
  timestamp: string;
  thought: string;
  toolCall?: string;
  observation?: string;
  status: 'completed' | 'running' | 'failed';
}

export interface MemoryTimelineItem {
  id: string;
  accountId: string;
  occurredAt: string;
  type: string;
  description: string;
  factExtracted: string;
}

export const mockAccounts: Account[] = [
  { id: '1', name: 'Snowflake Inc.', domain: 'snowflake.com', industry: 'Data Cloud', status: 'churn_risk', arr: 180000, stage: 'Renewal Negotiation' },
  { id: '2', name: 'Stripe', domain: 'stripe.com', industry: 'Fintech', status: 'expansion_target', arr: 340000, stage: 'Proposal Presented' },
  { id: '3', name: 'Retool', domain: 'retool.com', industry: 'Developer Tools', status: 'churn_risk', arr: 95000, stage: 'Onboarding' },
  { id: '4', name: 'Vercel', domain: 'vercel.com', industry: 'Cloud Hosting', status: 'expansion_target', arr: 150000, stage: 'Discovery' },
  { id: '5', name: 'Datadog', domain: 'datadog.com', industry: 'Monitoring', status: 'active', arr: 220000, stage: 'Key Account' }
];

export const mockInteractions: Interaction[] = [
  {
    id: 'int-1',
    accountId: '1',
    accountName: 'Snowflake Inc.',
    type: 'Email',
    source: 'Gmail',
    content: 'Hi Alice, we just had a corporate mandate freeze all software spending for Q3. We still love the platform but renewal might get blocked by finance if we cannot justify CS headcount savings.',
    occurredAt: '2026-06-27T10:15:00Z',
    sentiment: 'negative',
    summary: 'Corporate budget freeze threatens upcoming Q3 renewal.'
  },
  {
    id: 'int-2',
    accountId: '2',
    accountName: 'Stripe',
    type: 'MeetingNote',
    source: 'Zoom',
    content: 'Zoom call transcript summary: Dave (Stripe Director of Eng) mentioned they are doubling the size of their frontend team next quarter and need to add 45 new seats. He asked if we can provide a tier volume discount.',
    occurredAt: '2026-06-27T08:30:00Z',
    sentiment: 'positive',
    summary: 'Customer planning to add 45 seats and requested pricing options.'
  },
  {
    id: 'int-3',
    accountId: '3',
    accountName: 'Retool',
    type: 'CRM_Update',
    source: 'Salesforce',
    content: 'Alert: Sarah Jenkins (our main Champion & Director of Product) has left Retool to join a competitor. Her replacement has not been announced yet.',
    occurredAt: '2026-06-26T17:45:00Z',
    sentiment: 'negative',
    summary: 'Key champion Sarah Jenkins departed the account.'
  },
  {
    id: 'int-4',
    accountId: '4',
    accountName: 'Vercel',
    type: 'Call',
    source: 'Zoom',
    content: 'Meeting notes: Discussed the custom integration timeline. The team is running ahead of schedule on their API integrations and wants to roll out the solution next month instead of waiting for October.',
    occurredAt: '2026-06-26T14:00:00Z',
    sentiment: 'positive',
    summary: 'Integration ahead of schedule; migration timeline accelerated.'
  }
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    accountId: '1',
    accountName: 'Snowflake Inc.',
    category: 'Risk Mitigation',
    title: 'Deliver CS Headcount Business Value Case',
    summary: 'Draft a targeted proposal demonstrating how DecisionPilot saves 12 hours/week per rep to bypass the corporate budget freeze.',
    reasoning: 'Snowflake has a Q3 spending freeze. However, business units can bypass this freeze if they present a verified ROI document illustrating direct operational savings.',
    evidence: [
      '"renewal might get blocked by finance if we cannot justify CS headcount savings" (Gmail - 2026-06-27)',
      'Snowflake core playbook (Playbook Vector ID: PB-91)'
    ],
    payload: {
      channel: 'email',
      recipient: 'champion@snowflake.com',
      subject: 'DecisionPilot ROI: Operational Savings Breakdown for Snowflake CS',
      body: `Hi Team,\n\nI understand Q3 budgets are under high scrutiny. To assist with the renewal review, we put together a brief ROI report. Based on Snowflake's usage logs, the platform has cut rep lookup times by 12 hours/week, driving an estimated ₹42,000 in monthly productivity gains.\n\nLet me know if we can hop on a 10-minute call to align on this data for finance.\n\nBest,\nSales Team`
    },
    confidenceScore: 0.94,
    status: 'Pending',
    createdAt: '2026-06-27T10:45:00Z'
  },
  {
    id: 'rec-2',
    accountId: '2',
    accountName: 'Stripe',
    category: 'Upsell',
    title: 'Present Volume Expansion Quote',
    summary: 'Present Stripe with a tiered enterprise expansion quote for the requested 45 seats, applying the standard 15% volume discount.',
    reasoning: 'Dave requested tier pricing. Offering the 15% discount for bulk seats immediately fits their expansion schedule and captures ₹28,000 in new ARR.',
    evidence: [
      '"doubling the size of their frontend team next quarter and need to add 45 new seats" (Zoom call transcript)',
      'Volume discounting agreement guideline (Playbook Vector ID: PB-14)'
    ],
    payload: {
      channel: 'email',
      recipient: 'dave@stripe.com',
      subject: 'DecisionPilot Enterprise Tier Proposal - Stripe Team Expansion',
      body: `Hi Dave,\n\nGreat connecting on Zoom earlier. To support your team's expansion next quarter, we've prepared a custom quote for the 45 new seats. By upgrading to our Enterprise Growth Tier, we can offer a 15% volume discount, bringing the seat price to ₹42/month.\n\nI've attached the formal proposal here. Let me know if you would like me to push this through.\n\nBest regards,\nSales Team`
    },
    confidenceScore: 0.98,
    status: 'Pending',
    createdAt: '2026-06-27T09:00:00Z'
  },
  {
    id: 'rec-3',
    accountId: '3',
    accountName: 'Retool',
    category: 'Relationship',
    title: 'Introduce Account Team to New Product Lead',
    summary: 'Reach out to the interim Product Lead to re-introduce DecisionPilot and schedule a brief re-onboarding session.',
    reasoning: 'Champion departure creates high churn risk. Need to immediately establish a relationship with the new stakeholder to protect the ₹95,000 ARR account.',
    evidence: [
      '"Sarah Jenkins (our main Champion & Director of Product) has left Retool to join a competitor" (Salesforce CRM Log)'
    ],
    payload: {
      channel: 'linkedin',
      recipient: 'interim-lead@retool.com',
      body: `Hi there, I wanted to reach out and welcome you to the Retool Product team. I have been partnering closely with Retool to support their customer insights workspace. I'd love to connect for 5 minutes next week to share details of our current integration and align on goals.`
    },
    confidenceScore: 0.82,
    status: 'Pending',
    createdAt: '2026-06-26T18:00:00Z'
  }
];

export const mockMemoryEmbeddings: MemoryEmbedding[] = [
  {
    id: 'mem-1',
    accountId: '1',
    accountName: 'Snowflake Inc.',
    category: 'Rep Feedback',
    insight: 'User rejects aggressive upsells. Prefers analytical, ROI-driven, low-frequency correspondence focusing strictly on quantitative rep metrics.',
    createdAt: '2026-06-20T11:00:00Z'
  },
  {
    id: 'mem-2',
    accountId: '2',
    accountName: 'Stripe',
    category: 'Account Fact',
    insight: 'Stripe CS and frontend engineering teams are highly integrated. Tone should be technical, product-focused, and mention APIs and automation.',
    createdAt: '2026-06-25T09:30:00Z'
  },
  {
    id: 'mem-3',
    accountId: 'none',
    accountName: 'Global Playbook',
    category: 'Sales Playbook',
    insight: 'Rule: If a corporate budget freeze is reported, route to CS Saving Value Playbook. Never pitch secondary modules; focus exclusively on renewal cost offset.',
    createdAt: '2026-06-01T00:00:00Z'
  }
];

export const mockAgents: AgentStatus[] = [
  { id: 'agent-1', name: 'Planner Agent', role: 'Workflow Dispatcher', status: 'idle', lastRun: '10 mins ago', message: 'Assessing communication channels' },
  { id: 'agent-2', name: 'Context Retrieval Agent', role: 'Semantic Vector Loader', status: 'idle', lastRun: '10 mins ago', message: 'pgvector query pipeline idle' },
  { id: 'agent-3', name: 'Meeting Analysis Agent', role: 'NLP Transcript Analyzer', status: 'idle', lastRun: '45 mins ago', message: 'Meeting transcription parser loaded' },
  { id: 'agent-4', name: 'Risk Analysis Agent', role: 'Churn Risk Classifier', status: 'idle', lastRun: '10 mins ago', message: 'Risk detection algorithms online' },
  { id: 'agent-5', name: 'Recommendation Agent', role: 'Sales Playbook Mapper', status: 'idle', lastRun: '10 mins ago', message: 'Strategy generator loaded' },
  { id: 'agent-6', name: 'Memory Agent', role: 'Embedding Refiner', status: 'idle', lastRun: '10 mins ago', message: 'Continuous memory sync active' },
  { id: 'agent-7', name: 'Human Approval Agent', role: 'Rep Workspace Router', status: 'idle', lastRun: '10 mins ago', message: 'Pending verification queue monitor' }
];

export const mockThinkingSteps: Record<string, ThinkingStep[]> = {
  '1': [
    {
      id: 'step-1',
      agent: 'Planner Agent',
      timestamp: '10:15:01',
      thought: 'Ingested raw email from Snowflake Inc. Champion Alice. Analyzing message intent and semantic structure...',
      status: 'completed'
    },
    {
      id: 'step-2',
      agent: 'Context Retrieval Agent',
      timestamp: '10:15:03',
      thought: 'Need to look up historical interactions and corporate constraints relating to budget freeze renewals.',
      toolCall: 'pgvector_similarity_search("budget freeze renewal Snowflake")',
      observation: 'Found 1 matching Playbook Fact (PB-91: Focus renewal offsets via CS saving value proposition). Found 1 Rep feedback loop (Avoid aggressive pricing pitches; use analytical models).',
      status: 'completed'
    },
    {
      id: 'step-3',
      agent: 'Risk Analysis Agent',
      timestamp: '10:15:05',
      thought: 'Evaluating budget freeze statement. Message indicates finance block is likely without quantified justification.',
      toolCall: 'sentiment_classifier("mandate freeze all software spending...")',
      observation: 'Sentiment is negative (score: -0.74). High Risk category flagged (Score: 82%).',
      status: 'completed'
    },
    {
      id: 'step-4',
      agent: 'Recommendation Agent',
      timestamp: '10:15:08',
      thought: 'Formulating next step. Churn hazard requires CS productivity saving deck pitch immediately to address finance hurdle.',
      toolCall: 'action_playbook_mapper(risk_level=0.82, context="PB-91")',
      observation: 'Drafted: Deliver CS Headcount Business Value Case (Confidence Score: 94%).',
      status: 'completed'
    },
    {
      id: 'step-5',
      agent: 'Memory Agent',
      timestamp: '10:15:10',
      thought: 'Indexing raw interaction and generated strategy to memory cache for tone mapping alignment.',
      status: 'completed'
    }
  ],
  '2': [
    {
      id: 'step-1',
      agent: 'Planner Agent',
      timestamp: '08:30:01',
      thought: 'Ingested Zoom transcript summary from Stripe call. Scanning conversation parameters...',
      status: 'completed'
    },
    {
      id: 'step-2',
      agent: 'Context Retrieval Agent',
      timestamp: '08:30:03',
      thought: 'Retrieving pricing guidelines and client contracts.',
      toolCall: 'pgvector_similarity_search("Stripe volume pricing terms")',
      observation: 'Found custom enterprise discount guidelines: 15% discount for bulk seats expansion.',
      status: 'completed'
    },
    {
      id: 'step-3',
      agent: 'Meeting Analysis Agent',
      timestamp: '08:30:05',
      thought: 'Parsing transcript mentions. Customer indicates adding 45 new seats next quarter.',
      status: 'completed'
    },
    {
      id: 'step-4',
      agent: 'Recommendation Agent',
      timestamp: '08:30:08',
      thought: 'Drafting upsell contract outline with volume discount parameters.',
      toolCall: 'action_playbook_mapper(opportunity="45 seats", discount=0.15)',
      observation: 'Drafted: Volume Expansion Quote (Confidence Score: 98%).',
      status: 'completed'
    }
  ]
};

export const mockMemoryTimeline: Record<string, MemoryTimelineItem[]> = {
  '1': [
    { id: 'mt-1', accountId: '1', occurredAt: '2026-06-27T10:15:00Z', type: 'Email Ingested', description: 'Alice reported corporate spending freeze', factExtracted: 'Snowflake under active Q3 software spending cap' },
    { id: 'mt-2', accountId: '1', occurredAt: '2026-06-20T11:00:00Z', type: 'Rep Action Mod', description: 'Alice modified pitch from premium module to basic tier', factExtracted: 'Snowflake finance reviews are extremely price-sensitive' },
    { id: 'mt-3', accountId: '1', occurredAt: '2026-06-15T09:00:00Z', type: 'Zoom Call Ingested', description: 'Discussion of rep bandwidth constraints', factExtracted: 'CS team is short-staffed and looking for automation' }
  ],
  '2': [
    { id: 'mt-4', accountId: '2', occurredAt: '2026-06-27T08:30:00Z', type: 'Zoom Transcript', description: 'Request for pricing options for 45 seats', factExtracted: 'Dave needs to add 45 seats next month' },
    { id: 'mt-5', accountId: '2', occurredAt: '2026-06-25T09:30:00Z', type: 'Slack Ingested', description: 'Developer queries regarding Webhook limits', factExtracted: 'Stripe developer team highly integrates APIs' }
  ]
};
