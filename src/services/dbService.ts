import { supabase } from '../lib/supabaseClient';
import { geminiService } from './geminiService';
import { 
  mockAccounts, 
  mockInteractions, 
  mockRecommendations, 
  mockMemoryEmbeddings, 
  mockThinkingSteps, 
  mockMemoryTimeline 
} from '../data/mockData';

// ==========================================
// TYPESCRIPT DATABASE INTERFACES
// ==========================================

export interface Customer {
  id: string;
  name: string;
  domain: string;
  industry: string;
  status: 'active' | 'churn_risk' | 'expansion_target';
  arr: number;
  stage: string;
  created_at?: string;
}

export interface Interaction {
  id: string;
  customer_id: string;
  customer_name?: string;
  type: 'Email' | 'Call' | 'MeetingNote' | 'CRM_Update';
  source: 'Gmail' | 'Zoom' | 'Salesforce' | 'Slack';
  content: string;
  occurred_at: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
}

export interface Recommendation {
  id: string;
  customer_id: string;
  customer_name?: string;
  category: 'Risk Mitigation' | 'Upsell' | 'Follow Up' | 'Relationship';
  title: string;
  summary: string;
  reasoning: string;
  evidence: string[];
  payload: {
    channel: 'email' | 'linkedin' | 'tasks';
    recipient: string;
    subject?: string;
    body: string;
  };
  confidence_score: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Executed';
  created_at: string;
}

export interface SharedMemory {
  id: string;
  customer_id: string | null;
  customer_name?: string;
  category: 'Sales Playbook' | 'Account Fact' | 'Rep Feedback';
  insight: string;
  created_at: string;
}

export interface Approval {
  id: string;
  recommendation_id: string;
  reviewer_id: string;
  action_taken: 'Approved' | 'Modified' | 'Rejected';
  modification_notes?: string;
  rejection_reason?: string;
  reviewed_at: string;
}

export interface AgentLog {
  id: string;
  customer_id: string;
  agent_name: string;
  timestamp: string;
  thought: string;
  tool_call?: string;
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

export interface DashboardMetrics {
  totalARR: number;
  churnRisksCount: number;
  pendingApprovalsCount: number;
  arrSavedTotal: number;
}

// ==========================================
// LOCAL STORAGE OFFLINE DATABASE ENGINE
// ==========================================

const LS_KEYS = {
  CUSTOMERS: 'dp_db_customers',
  INTERACTIONS: 'dp_db_interactions',
  RECOMMENDATIONS: 'dp_db_recommendations',
  SHARED_MEMORY: 'dp_db_shared_memory',
  AGENT_LOGS: 'dp_db_agent_logs',
  TIMELINE: 'dp_db_timeline',
  APPROVALS: 'dp_db_approvals'
};

const initializeLocalStorageDB = () => {
  if (!localStorage.getItem(LS_KEYS.CUSTOMERS)) {
    localStorage.setItem(LS_KEYS.CUSTOMERS, JSON.stringify(
      mockAccounts.map(a => ({ ...a, arr: Number(a.arr) }))
    ));
  }
  if (!localStorage.getItem(LS_KEYS.INTERACTIONS)) {
    localStorage.setItem(LS_KEYS.INTERACTIONS, JSON.stringify(
      mockInteractions.map(i => ({ ...i, customer_id: i.accountId, customer_name: i.accountName }))
    ));
  }
  if (!localStorage.getItem(LS_KEYS.RECOMMENDATIONS)) {
    localStorage.setItem(LS_KEYS.RECOMMENDATIONS, JSON.stringify(
      mockRecommendations.map(r => ({ ...r, customer_id: r.accountId, customer_name: r.accountName, confidence_score: r.confidenceScore }))
    ));
  }
  if (!localStorage.getItem(LS_KEYS.SHARED_MEMORY)) {
    localStorage.setItem(LS_KEYS.SHARED_MEMORY, JSON.stringify(
      mockMemoryEmbeddings.map(m => ({ ...m, customer_id: m.accountId === 'none' ? null : m.accountId, customer_name: m.accountName }))
    ));
  }
  if (!localStorage.getItem(LS_KEYS.AGENT_LOGS)) {
    const flatLogs: AgentLog[] = [];
    Object.keys(mockThinkingSteps).forEach(cId => {
      mockThinkingSteps[cId].forEach(step => {
        flatLogs.push({
          id: step.id,
          customer_id: cId,
          agent_name: step.agent,
          timestamp: step.timestamp,
          thought: step.thought,
          tool_call: step.toolCall,
          observation: step.observation,
          status: step.status
        });
      });
    });
    localStorage.setItem(LS_KEYS.AGENT_LOGS, JSON.stringify(flatLogs));
  }
  if (!localStorage.getItem(LS_KEYS.TIMELINE)) {
    localStorage.setItem(LS_KEYS.TIMELINE, JSON.stringify(mockMemoryTimeline));
  }
  if (!localStorage.getItem(LS_KEYS.APPROVALS)) {
    localStorage.setItem(LS_KEYS.APPROVALS, JSON.stringify([]));
  }
};

// Fire initialization immediately
initializeLocalStorageDB();

// Helper to resolve customer names locally
const getCustomerNameLocal = (customerId: string | null): string => {
  if (!customerId || customerId === 'none') return 'Global Playbook';
  const customers: Customer[] = JSON.parse(localStorage.getItem(LS_KEYS.CUSTOMERS) || '[]');
  const match = customers.find(c => c.id === customerId);
  return match ? match.name : 'Unknown Account';
};

// ==========================================
// UNIFIED DATA SERVICE LAYER
// ==========================================

export const dbService = {
  // Auth Services
  async signIn(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    } else {
      // Mock validation
      if (email === 'demo@decisionpilot.ai' && password === 'password') {
        const mockUser = { id: 'mock-user-111', email, user_metadata: { full_name: 'Alice Roberts' } };
        localStorage.setItem('dp_auth', 'true');
        localStorage.setItem('dp_user', JSON.stringify(mockUser));
        return { success: true, user: mockUser };
      }
      return { success: false, error: 'Invalid email or password.' };
    }
  },

  async signOut(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('dp_auth');
    localStorage.removeItem('dp_user');
  },

  async getUser(): Promise<any | null> {
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      return session ? session.user : null;
    } else {
      const userStr = localStorage.getItem('dp_user');
      return userStr ? JSON.parse(userStr) : null;
    }
  },

  // Customer / Account Services
  async fetchCustomers(): Promise<Customer[]> {
    if (supabase) {
      const { data, error } = await supabase.from('customers').select('*').order('name');
      if (error) throw error;
      return data.map(c => ({ ...c, arr: Number(c.arr) }));
    } else {
      return JSON.parse(localStorage.getItem(LS_KEYS.CUSTOMERS) || '[]');
    }
  },

  // Interactions Services
  async fetchInteractions(customerId?: string): Promise<Interaction[]> {
    if (supabase) {
      let query = supabase.from('interactions').select('*, customers(name)').order('occurred_at', { ascending: false });
      if (customerId && customerId !== 'all') {
        query = query.eq('customer_id', customerId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.map(item => ({
        ...item,
        customer_name: item.customers ? (item.customers as any).name : 'Unknown Account'
      }));
    } else {
      const list: Interaction[] = JSON.parse(localStorage.getItem(LS_KEYS.INTERACTIONS) || '[]');
      if (customerId && customerId !== 'all') {
        return list.filter(i => i.customer_id === customerId);
      }
      return list;
    }
  },

  async createInteraction(content: string, customerId: string, source: any, type: any): Promise<Interaction> {
    const occurredAt = new Date().toISOString();

    // 1. Fetch customer details to identify account name
    let customerName = 'Unknown Account';
    if (supabase) {
      const { data: custData } = await supabase.from('customers').select('name').eq('id', customerId).single();
      if (custData) customerName = custData.name;
    } else {
      customerName = getCustomerNameLocal(customerId);
    }

    // 2. Sequential multi-agent execution pipeline runs via Gemini (or simulated fallback)
    // Agent 1: Planner Agent
    const planner = await geminiService.runPlannerAgent(content);

    // Agent 2: Meeting Analysis Agent
    const meeting = await geminiService.runMeetingAnalysisAgent(content);

    // Agent 3: Risk Analysis Agent
    const risks = await geminiService.runRiskAnalysisAgent(content, meeting.sentiment);

    // Fetch latest 5 shared memory records for customer/account context
    let historicalMemories: string[] = [];
    if (supabase) {
      const { data: memData } = await supabase.from('shared_memory')
        .select('insight')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (memData) {
        historicalMemories = memData.map(m => m.insight);
      }
    } else {
      const mems: SharedMemory[] = JSON.parse(localStorage.getItem(LS_KEYS.SHARED_MEMORY) || '[]');
      historicalMemories = mems
        .filter(m => m.customer_id === customerId)
        .slice(0, 5)
        .map(m => m.insight);
    }
    const memoryContext = historicalMemories.length > 0 
      ? historicalMemories.map(m => m).join('\n- ') 
      : 'No previous customer memory logs available.';

    // Agent 4: Recommendation Agent
    const rec = await geminiService.runRecommendationAgent(
      content,
      meeting.sentiment,
      meeting.customerIntent,
      risks.identifiedRisks,
      risks.identifiedOpportunities,
      customerName,
      memoryContext
    );

    // Formulate chronological logs
    const logIdPrefix = `log-${Date.now()}`;
    const agentLogs: AgentLog[] = [
      {
        id: `${logIdPrefix}-1`,
        customer_id: customerId,
        agent_name: 'Planner Agent',
        timestamp: new Date().toLocaleTimeString(),
        thought: `Planner Agent outlined plan: ${planner.planSteps.join(' -> ')} | Executive Summary: ${planner.executiveSummary}`,
        status: 'completed'
      },
      {
        id: `${logIdPrefix}-2`,
        customer_id: customerId,
        agent_name: 'Meeting Analysis Agent',
        timestamp: new Date(Date.now() + 2000).toLocaleTimeString(),
        thought: `Meeting Analysis Agent extracted customer intent: "${meeting.customerIntent}" | Detected Sentiment: ${meeting.sentiment} (Score: ${meeting.sentimentScore}) | Key phrases: ${meeting.keyPhrases.join(', ')}`,
        status: 'completed'
      },
      {
        id: `${logIdPrefix}-3`,
        customer_id: customerId,
        agent_name: 'Risk Analysis Agent',
        timestamp: new Date(Date.now() + 4000).toLocaleTimeString(),
        thought: `Risk Agent calculated Churn probability: ${(risks.churnProbability * 100).toFixed(0)}%. Identified Risks: ${risks.identifiedRisks.join(', ') || 'None'}. Opportunities: ${risks.identifiedOpportunities.join(', ') || 'None'}`,
        status: 'completed'
      },
      {
        id: `${logIdPrefix}-4`,
        customer_id: customerId,
        agent_name: 'Recommendation Agent',
        timestamp: new Date(Date.now() + 6000).toLocaleTimeString(),
        thought: `Recommendation Agent generated Next Best Action recommendation: "${rec.title}" with a Confidence score of ${(rec.confidenceScore * 100).toFixed(0)}%`,
        status: 'completed'
      }
    ];

    // Determine memory insight to store based on risks or opportunities
    const memoryInsight = risks.identifiedRisks.length > 0
      ? `Account Fact: User reported churn risk: ${risks.identifiedRisks.join('; ')}`
      : risks.identifiedOpportunities.length > 0
      ? `Account Fact: Identified expansion targets: ${risks.identifiedOpportunities.join('; ')}`
      : `Account Fact: Communication checked. Sentiment is ${meeting.sentiment}.`;

    const interactionSentiment = meeting.sentiment;
    const interactionSummary = planner.executiveSummary.substring(0, 150) + '...';

    // 3. Persist outputs to backend database (Supabase or LocalStorage)
    if (supabase) {
      // Write interaction record
      const { data: intData, error: intError } = await supabase.from('interactions').insert({
        customer_id: customerId,
        type,
        source,
        content,
        occurred_at: occurredAt,
        sentiment: interactionSentiment,
        summary: interactionSummary
      }).select('*, customers(name)').single();
      if (intError) throw intError;

      // Write recommendation record
      const { error: recError } = await supabase.from('recommendations').insert({
        customer_id: customerId,
        category: rec.category,
        title: rec.title,
        summary: rec.summary,
        reasoning: rec.reasoning,
        evidence: rec.evidence,
        payload: rec.payload,
        confidence_score: rec.confidenceScore,
        status: 'Pending',
        created_at: occurredAt
      });
      if (recError) console.error('Failed to write recommendation to database:', recError);

      // Write agent logs sequentially
      const { error: logError } = await supabase.from('agent_logs').insert(
        agentLogs.map(l => ({
          customer_id: l.customer_id,
          agent_name: l.agent_name,
          timestamp: l.timestamp,
          thought: l.thought,
          status: l.status
        }))
      );
      if (logError) console.error('Failed to write agent logs to database:', logError);

      // Write shared memory embedding fact
      const { error: memError } = await supabase.from('shared_memory').insert({
        customer_id: customerId,
        category: 'Account Fact',
        insight: memoryInsight,
        created_at: occurredAt
      });
      if (memError) console.error('Failed to write memory insight to database:', memError);

      return {
        ...intData,
        customer_name: intData.customers ? (intData.customers as any).name : 'Unknown Account'
      };

    } else {
      // LocalStorage Offline Fallback Engine
      // Save Interaction
      const ints: Interaction[] = JSON.parse(localStorage.getItem(LS_KEYS.INTERACTIONS) || '[]');
      const newInt: Interaction = {
        id: `int-${Date.now()}`,
        customer_id: customerId,
        customer_name: customerName,
        type,
        source,
        content,
        occurred_at: occurredAt,
        sentiment: interactionSentiment,
        summary: interactionSummary
      };
      localStorage.setItem(LS_KEYS.INTERACTIONS, JSON.stringify([newInt, ...ints]));

      // Save Recommendation
      const recs: Recommendation[] = JSON.parse(localStorage.getItem(LS_KEYS.RECOMMENDATIONS) || '[]');
      const newRec: Recommendation = {
        id: `rec-${Date.now()}`,
        customer_id: customerId,
        customer_name: customerName,
        category: rec.category,
        title: rec.title,
        summary: rec.summary,
        reasoning: rec.reasoning,
        evidence: rec.evidence,
        payload: rec.payload,
        confidence_score: rec.confidenceScore,
        status: 'Pending',
        created_at: occurredAt
      };
      localStorage.setItem(LS_KEYS.RECOMMENDATIONS, JSON.stringify([newRec, ...recs]));

      // Save Agent logs
      const logs: AgentLog[] = JSON.parse(localStorage.getItem(LS_KEYS.AGENT_LOGS) || '[]');
      localStorage.setItem(LS_KEYS.AGENT_LOGS, JSON.stringify([...agentLogs, ...logs]));

      // Save Shared Memory
      const memories: SharedMemory[] = JSON.parse(localStorage.getItem(LS_KEYS.SHARED_MEMORY) || '[]');
      const newMem: SharedMemory = {
        id: `mem-${Date.now()}`,
        customer_id: customerId,
        customer_name: customerName,
        category: 'Account Fact',
        insight: memoryInsight,
        created_at: occurredAt
      };
      localStorage.setItem(LS_KEYS.SHARED_MEMORY, JSON.stringify([newMem, ...memories]));

      // Save Timeline log
      const timeline: Record<string, MemoryTimelineItem[]> = JSON.parse(localStorage.getItem(LS_KEYS.TIMELINE) || '{}');
      const accountTimeline = timeline[customerId] || [];
      const newTimelineItem: MemoryTimelineItem = {
        id: `mt-${Date.now()}`,
        accountId: customerId,
        occurredAt,
        type: `${source} Ingested`,
        description: interactionSummary,
        factExtracted: memoryInsight
      };
      timeline[customerId] = [newTimelineItem, ...accountTimeline];
      localStorage.setItem(LS_KEYS.TIMELINE, JSON.stringify(timeline));

      return newInt;
    }
  },

  // Recommendations Services
  async fetchRecommendations(customerId?: string): Promise<Recommendation[]> {
    if (supabase) {
      let query = supabase.from('recommendations').select('*, customers(name)').order('created_at', { ascending: false });
      if (customerId && customerId !== 'all') {
        query = query.eq('customer_id', customerId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.map(r => ({
        ...r,
        confidence_score: Number(r.confidence_score),
        customer_name: r.customers ? (r.customers as any).name : 'Unknown Account'
      }));
    } else {
      const list: Recommendation[] = JSON.parse(localStorage.getItem(LS_KEYS.RECOMMENDATIONS) || '[]');
      if (customerId && customerId !== 'all') {
        return list.filter(r => r.customer_id === customerId);
      }
      return list;
    }
  },

  // Shared Memory Services
  async fetchMemoryEmbeddings(): Promise<SharedMemory[]> {
    if (supabase) {
      const { data, error } = await supabase.from('shared_memory').select('*, customers(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(m => ({
        ...m,
        customer_name: m.customers ? (m.customers as any).name : 'Global Playbook'
      }));
    } else {
      return JSON.parse(localStorage.getItem(LS_KEYS.SHARED_MEMORY) || '[]');
    }
  },

  async createMemory(insight: string, category: any, customerId: string | null): Promise<SharedMemory> {
    const createdAt = new Date().toISOString();
    const resolvedCustId = customerId === 'none' ? null : customerId;

    if (supabase) {
      const { data, error } = await supabase.from('shared_memory').insert({
        customer_id: resolvedCustId,
        category,
        insight,
        created_at: createdAt
      }).select('*, customers(name)').single();

      if (error) throw error;
      return {
        ...data,
        customer_name: data.customers ? (data.customers as any).name : 'Global Playbook'
      };
    } else {
      const list: SharedMemory[] = JSON.parse(localStorage.getItem(LS_KEYS.SHARED_MEMORY) || '[]');
      const newMem: SharedMemory = {
        id: `mem-${Date.now()}`,
        customer_id: resolvedCustId,
        customer_name: getCustomerNameLocal(resolvedCustId),
        category,
        insight,
        created_at: createdAt
      };
      
      localStorage.setItem(LS_KEYS.SHARED_MEMORY, JSON.stringify([newMem, ...list]));
      return newMem;
    }
  },

  async fetchMemoryTimeline(customerId: string): Promise<MemoryTimelineItem[]> {
    // Falls back to timeline structure
    const timeline: Record<string, MemoryTimelineItem[]> = JSON.parse(localStorage.getItem(LS_KEYS.TIMELINE) || '{}');
    return timeline[customerId] || [];
  },

  // Human Approvals Services
  async submitApproval(
    recommendationId: string, 
    action: 'Approved' | 'Rejected', 
    modificationNotes?: string, 
    rejectionReason?: string
  ): Promise<void> {
    const user = await this.getUser();
    const userId = user ? user.id : 'mock-reviewer-uuid';
    const status = action === 'Approved' ? 'Executed' : 'Rejected';

    if (supabase) {
      // 1. Update recommendation status
      const { error: recError } = await supabase.from('recommendations')
        .update({ status })
        .eq('id', recommendationId);
      if (recError) throw recError;

      // 2. Insert human approvals log
      const { error: appError } = await supabase.from('approvals').insert({
        recommendation_id: recommendationId,
        reviewer_id: userId,
        action_taken: action === 'Approved' ? 'Approved' : 'Rejected',
        modification_notes: modificationNotes || null,
        rejection_reason: rejectionReason || null
      });
      if (appError) throw appError;
    } else {
      // 1. Update recommendations in LocalStorage
      const recs: Recommendation[] = JSON.parse(localStorage.getItem(LS_KEYS.RECOMMENDATIONS) || '[]');
      const updatedRecs = recs.map(r => {
        if (r.id === recommendationId) {
          return { ...r, status };
        }
        return r;
      });
      localStorage.setItem(LS_KEYS.RECOMMENDATIONS, JSON.stringify(updatedRecs));

      // 2. Save approval row log
      const approvals = JSON.parse(localStorage.getItem(LS_KEYS.APPROVALS) || '[]');
      const newApproval: Approval = {
        id: `app-${Date.now()}`,
        recommendation_id: recommendationId,
        reviewer_id: userId,
        action_taken: action === 'Approved' ? 'Approved' : 'Rejected',
        modification_notes: modificationNotes,
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString()
      };
      localStorage.setItem(LS_KEYS.APPROVALS, JSON.stringify([newApproval, ...approvals]));
    }
  },

  // Dashboard Metrics
  async fetchDashboardMetrics(): Promise<DashboardMetrics> {
    const customers = await this.fetchCustomers();
    const recommendations = await this.fetchRecommendations();

    const totalARR = customers.reduce((sum, c) => sum + c.arr, 0);
    const churnRisksCount = customers.filter(c => c.status === 'churn_risk').length;
    const pendingApprovalsCount = recommendations.filter(r => r.status === 'Pending').length;

    return {
      totalARR,
      churnRisksCount,
      pendingApprovalsCount,
      arrSavedTotal: 275000 // Protected value matching business seeds
    };
  },

  // Agent Thinking logs retrace
  async fetchAgentLogs(customerId: string): Promise<AgentLog[]> {
    if (supabase) {
      const { data, error } = await supabase.from('agent_logs')
        .select('*')
        .eq('customer_id', customerId)
        .order('timestamp');
      if (error) throw error;
      return data;
    } else {
      const logs: AgentLog[] = JSON.parse(localStorage.getItem(LS_KEYS.AGENT_LOGS) || '[]');
      return logs.filter(l => l.customer_id === customerId).sort((a,b) => a.timestamp.localeCompare(b.timestamp));
    }
  }
};
