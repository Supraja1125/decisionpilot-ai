import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize Gemini client if key exists, else null (runs in offline simulated mode)
export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

if (!genAI) {
  console.warn(
    'DecisionPilot: VITE_GEMINI_API_KEY is missing. Using offline simulated agent reasoning.'
  );
}

// Helper to sanitize Gemini response text
const cleanJsonResponseText = (text: string): string => {
  // Remove markdown code fences
  text = text.replace(/```json/gi, "");
  text = text.replace(/```/g, "");

  // Extract only the JSON object
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  return text.trim();
};

export interface PlannerOutput {
  planSteps: string[];
  executiveSummary: string;
}

export interface MeetingAnalysisOutput {
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  customerIntent: string;
  keyPhrases: string[];
}

export interface RiskAnalysisOutput {
  churnProbability: number;
  identifiedRisks: string[];
  identifiedOpportunities: string[];
}

export interface RecommendationOutput {
  title: string;
  summary: string;
  reasoning: string;
  confidenceScore: number;
  category: 'Risk Mitigation' | 'Upsell' | 'Follow Up' | 'Relationship';
  payload: {
    channel: 'email' | 'linkedin' | 'tasks';
    recipient: string;
    subject?: string;
    body: string;
  };
  evidence: string[];
}

export const geminiService = {
  // 1. Planner Agent
  async runPlannerAgent(interactionText: string): Promise<PlannerOutput> {
    if (!genAI) {
      // Fallback
      return {
        planSteps: [
          'Ingested raw communication log.',
          'Triggering vector semantic similarity search for playbooks.',
          'Initiating customer sentiment analysis and churn classification.',
          'Generating outreach recommendation options.'
        ],
        executiveSummary: `Analyzed customer text input containing ${interactionText.substring(0, 30)}...`
      };
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are the Planner Agent of DecisionPilot AI.
        Analyze this customer interaction log:
        "${interactionText}"

        Formulate a plan outline (steps to take) and a 1-sentence executive summary.
        Respond ONLY with a JSON object of this structure:
        {
          "planSteps": ["step 1", "step 2"],
          "executiveSummary": "1-sentence summary"
        }
      `;

      const result = await model.generateContent(prompt);
      const cleaned = cleanJsonResponseText(result.response.text());
      return JSON.parse(cleaned) as PlannerOutput;
    } catch (err) {
      console.error('Planner Agent failed, using simulation:', err);
      return {
        planSteps: ['Ingested input', 'Triggered fallback search', 'Parsing logs'],
        executiveSummary: 'Simulated planner summary.'
      };
    }
  },

  // 2. Meeting Analysis Agent
  async runMeetingAnalysisAgent(interactionText: string): Promise<MeetingAnalysisOutput> {
    if (!genAI) {
      const isNeg = interactionText.toLowerCase().includes('angry') || interactionText.toLowerCase().includes('freeze') || interactionText.toLowerCase().includes('leave');
      return {
        sentiment: isNeg ? 'negative' : 'positive',
        sentimentScore: isNeg ? -0.85 : 0.90,
        customerIntent: 'Inquire about seat pricing and contract terms.',
        keyPhrases: ['budget freeze', 'seats next quarter']
      };
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are the Meeting Analysis Agent.
        Analyze this customer text:
        "${interactionText}"

        Classify:
        1. sentiment: "positive" or "neutral" or "negative"
        2. sentimentScore: decimal between -1.0 (most negative) and 1.0 (most positive)
        3. customerIntent: short description of what the customer wants.
        4. keyPhrases: string array of important keywords.

        Respond ONLY with a JSON object:
        {
          "sentiment": "positive" | "neutral" | "negative",
          "sentimentScore": 0.0,
          "customerIntent": "string description",
          "keyPhrases": ["phrase 1", "phrase 2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const cleaned = cleanJsonResponseText(result.response.text());
      return JSON.parse(cleaned) as MeetingAnalysisOutput;
    } catch (err) {
      console.error('Meeting Agent failed, using simulation:', err);
      return {
        sentiment: 'neutral',
        sentimentScore: 0.0,
        customerIntent: 'Standard query.',
        keyPhrases: []
      };
    }
  },

  // 3. Risk Analysis Agent
  async runRiskAnalysisAgent(interactionText: string, sentiment: string): Promise<RiskAnalysisOutput> {
    if (!genAI) {
      const hasRisk = sentiment === 'negative' || interactionText.toLowerCase().includes('freeze') || interactionText.toLowerCase().includes('leave');
      return {
        churnProbability: hasRisk ? 0.82 : 0.15,
        identifiedRisks: hasRisk ? ['Corporate spending freeze', 'Stakeholder departure'] : [],
        identifiedOpportunities: hasRisk ? [] : ['Expansion interest in Q4']
      };
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are the Risk & Opportunity Analysis Agent.
        Analyze this customer interaction:
        "${interactionText}"
        (Context: detected sentiment is ${sentiment})

        Calculate:
        1. churnProbability: float between 0.00 and 1.00
        2. identifiedRisks: list of customer risks or challenges (e.g. spending freeze, champions departing)
        3. identifiedOpportunities: list of sales growth vectors (e.g. adding seats, team expansion)

        Respond ONLY with a JSON object:
        {
          "churnProbability": 0.0,
          "identifiedRisks": ["risk 1"],
          "identifiedOpportunities": ["opportunity 1"]
        }
      `;

      const result = await model.generateContent(prompt);
      const cleaned = cleanJsonResponseText(result.response.text());
      return JSON.parse(cleaned) as RiskAnalysisOutput;
    } catch (err) {
      console.error('Risk Agent failed, using simulation:', err);
      return {
        churnProbability: 0.1,
        identifiedRisks: [],
        identifiedOpportunities: []
      };
    }
  },

  // 4. Recommendation Agent
  async runRecommendationAgent(
    interactionText: string,
    sentiment: string,
    intent: string,
    risks: string[],
    opportunities: string[],
    accountName: string,
    memoryContext: string
  ): Promise<RecommendationOutput> {
    if (!genAI) {
      // Mock synthesis
      const isRisk = risks.length > 0;
      const isFreezeMemory = memoryContext.toLowerCase().includes('freeze');
      return {
        title: isRisk 
          ? (isFreezeMemory ? 'Deliver CS Headcount Business Value Case (Memory Adjusted)' : 'Deliver CS Headcount Business Value Case') 
          : 'Present Volume Expansion Quote',
        summary: isRisk 
          ? 'Draft a targeted proposal demonstrating how DecisionPilot saves 12 hours/week per rep to bypass the corporate budget freeze.'
          : 'Offer Stripe with a custom quote for the expansion Seats applying volume discount.',
        reasoning: isRisk
          ? `${accountName} is under spending freeze. ${isFreezeMemory ? 'History shows they previously rejected generic pricing pitches. ' : ''}Presenting a productivity value justification offsets renewal blocks.`
          : 'Customer wants to buy seats. Offering bulk pricing helps convert expansion.',
        confidenceScore: 0.94,
        category: isRisk ? 'Risk Mitigation' : 'Upsell',
        payload: {
          channel: 'email',
          recipient: `champion@${accountName.toLowerCase().replace(/\s/g, '')}.com`,
          subject: `DecisionPilot ROI Analysis: Operational Gains for ${accountName}`,
          body: `Hi Team,\n\nI understand budgets are tight. Here is the custom productivity calculation showing the ROI on your renewal.`
        },
        evidence: [`Detected: ${sentiment} sentiment`, ...risks]
      };
    }

    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are the Recommendation & Action Synthesizer Agent of DecisionPilot AI.
        Synthesize this analysis for customer account "${accountName}":
        - Raw text input: "${interactionText}"
        - Extracted Sentiment: "${sentiment}"
        - Intent: "${intent}"
        - Risks: ${JSON.stringify(risks)}
        - Opportunities: ${JSON.stringify(opportunities)}

        Previous Customer Memory Context (Latest 5 logs):
        ${memoryContext}

        Formulate the Next Best Action for the Sales Account Executive, taking into account the following Continuous Learning constraints:
        1. Use previous customer history (shown in memory context) to improve the recommendation.
        2. Avoid repeating recommendations that were already suggested in previous memory logs.
        3. If previous recommendations or actions failed (e.g. customer rejected pricing discussion), propose a different strategy.
        4. If previous context changes the business decision, explain why.
        5. Mention relevant previous interactions when generating supporting evidence.
        6. The generated "reasoning" string property MUST explicitly reference historical memory items when appropriate. Example: "Previous interactions indicate that Finance rejected pricing discussions due to a spending freeze. Therefore, instead of proposing another discount, the recommended action is to prepare an executive ROI business case."

        Formulate a title, executive summary (summary), reasoning explanation, category classification ("Risk Mitigation", "Upsell", "Follow Up", "Relationship"), confidence score (float between 0.00 and 1.00), list of supporting evidence (evidence array), and a message payload (channel, recipient, email subject, and email body text).

        Respond ONLY with a JSON object matching this structure:
        {
          "title": "Action title",
          "summary": "1-sentence description of the recommended action",
          "reasoning": "multi-sentence reasoning explanation that incorporates previous memory checks",
          "confidenceScore": 0.94,
          "category": "Risk Mitigation" | "Upsell" | "Follow Up" | "Relationship",
          "payload": {
            "channel": "email" | "linkedin" | "tasks",
            "recipient": "recipient email address or handle",
            "subject": "email subject (omit if channel is tasks)",
            "body": "full formatted outreach email body text"
          },
          "evidence": ["evidence quote or key factor 1", "evidence quote or key factor 2"]
        }
      `;

      // const result = await model.generateContent(prompt);
      // const cleaned = cleanJsonResponseText(result.response.text());
      // return JSON.parse(cleaned) as RecommendationOutput;
      const result = await model.generateContent(prompt);

      const text = result.response.text();

      console.log("========== GEMINI RAW RESPONSE ==========");
      console.log(text);
      console.log("=========================================");

      const cleaned = cleanJsonResponseText(text);

      console.log("========== CLEANED RESPONSE ==========");
      console.log(cleaned);
      console.log("======================================");

      return JSON.parse(cleaned) as RecommendationOutput;

      } catch (err: any) {
      console.error("========== RECOMMENDATION AGENT ERROR ==========");
      console.error(err);

      if (err?.message) {
        console.error("Message:", err.message);
      }

      if (err?.stack) {
        console.error("Stack:", err.stack);
      }

      console.error("===============================================");

      return {
        title: "Schedule Catch-up call",
        summary: "Schedule a catch-up call to review account alignment.",
        reasoning: "AI generated recommendations failed to parse, falling back to relationship health checks.",
        confidenceScore: 0.80,
        category: "Follow Up",
        payload: {
          channel: "tasks",
          recipient: "ae@decisionpilot.ai",
          body: "Call customer to review alignment."
        },
        evidence: []
      };
    }
  }
};
