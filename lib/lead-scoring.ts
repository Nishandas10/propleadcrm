// Lead Scoring Engine - Rule-based scoring system

import { Lead, LeadSource } from "./types";

interface LeadScoringInput {
  lead: Lead;
  messageCount: number;
  firstResponseTimeMinutes?: number;
  targetPropertyPrice?: number;
}

interface ScoringBreakdown {
  responseScore: number;
  engagementScore: number;
  visitScore: number;
  budgetScore: number;
  recencyScore: number;
  sourceScore: number;
  penalties: number;
  totalScore: number;
  priority: "HOT" | "WARM" | "COLD";
}

// Source quality scores
const SOURCE_SCORES: Record<LeadSource, number> = {
  website: 10,
  whatsapp: 8,
  portal: 6,
  facebook: 5,
  "walk-in": 4,
  csv: 3,
  manual: 2,
};

/**
 * Calculate lead score based on multiple factors
 * Total possible score: 100 points
 */
export function calculateLeadScore(input: LeadScoringInput): ScoringBreakdown {
  const { lead, messageCount, firstResponseTimeMinutes, targetPropertyPrice } =
    input;

  // 1. Response Speed Score (Max 25 pts)
  let responseScore = 0;
  if (firstResponseTimeMinutes !== undefined) {
    if (firstResponseTimeMinutes <= 60) responseScore = 25;
    else if (firstResponseTimeMinutes <= 360) responseScore = 20;
    else if (firstResponseTimeMinutes <= 1440) responseScore = 10;
  }

  // 2. Engagement Level (Max 20 pts)
  let engagementScore = 0;
  if (messageCount >= 5) engagementScore = 20;
  else if (messageCount >= 3) engagementScore = 15;
  else if (messageCount >= 1) engagementScore = 5;

  // 3. Site Visit Score (Max 20 pts)
  let visitScore = 0;
  if (lead.status === "closed_won") visitScore = 20;
  else if (lead.status === "visit_scheduled") visitScore = 15;
  else if (lead.visit_scheduled_at) {
    const now = new Date();
    const visitDate = lead.visit_scheduled_at.toDate();
    if (visitDate < now) {
      // Visit was scheduled but has passed - might be missed
      visitScore = -10;
    } else {
      visitScore = 15;
    }
  }

  // 4. Budget Match Score (Max 15 pts)
  let budgetScore = 0;
  if (lead.budget && targetPropertyPrice && targetPropertyPrice > 0) {
    const matchPercent = (lead.budget / targetPropertyPrice) * 100;
    if (matchPercent >= 90) budgetScore = 15;
    else if (matchPercent >= 70) budgetScore = 10;
    else if (matchPercent >= 50) budgetScore = 5;
  } else if (lead.budget) {
    // If we have budget but no target price, give partial score
    budgetScore = 8;
  }

  // 5. Recency Score (Max 10 pts)
  let recencyScore = 0;
  const lastInteraction =
    lead.last_interaction_at?.toDate() ||
    lead.updated_at?.toDate() ||
    lead.created_at?.toDate();
  if (lastInteraction) {
    const hoursSinceInteraction =
      (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60);
    if (hoursSinceInteraction <= 24) recencyScore = 10;
    else if (hoursSinceInteraction <= 72) recencyScore = 5;
  }

  // 6. Source Quality Score (Max 10 pts)
  const sourceScore = SOURCE_SCORES[lead.source] || 0;

  // 7. Penalties (Negative scoring)
  let penalties = 0;

  // No reply penalties
  if (lastInteraction) {
    const daysSinceInteraction =
      (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceInteraction >= 10 && messageCount === 0) penalties -= 25;
    else if (daysSinceInteraction >= 5 && messageCount === 0) penalties -= 15;
  }

  // Status penalties
  if (lead.status === "closed_lost") penalties -= 50;

  // Calculate total score
  let totalScore =
    responseScore +
    engagementScore +
    visitScore +
    budgetScore +
    recencyScore +
    sourceScore +
    penalties;

  // Clamp score between 0 and 100
  totalScore = Math.max(0, Math.min(100, totalScore));

  // Determine priority
  let priority: "HOT" | "WARM" | "COLD";
  if (totalScore >= 80) priority = "HOT";
  else if (totalScore >= 50) priority = "WARM";
  else priority = "COLD";

  return {
    responseScore,
    engagementScore,
    visitScore,
    budgetScore,
    recencyScore,
    sourceScore,
    penalties,
    totalScore,
    priority,
  };
}

/**
 * Quick score calculation for display purposes
 */
export function getLeadPriority(score: number): "HOT" | "WARM" | "COLD" {
  if (score >= 80) return "HOT";
  if (score >= 50) return "WARM";
  return "COLD";
}

/**
 * Calculate initial score for new leads
 */
export function calculateInitialScore(
  source: LeadSource,
  hasBudget: boolean,
): number {
  let score = SOURCE_SCORES[source] || 0;

  // New leads start with recency bonus
  score += 10;

  // Budget bonus
  if (hasBudget) score += 5;

  return Math.min(score, 100);
}

/**
 * Create scoring input from lead with message data
 */
export function createScoringInput(
  lead: Lead,
  messageCount: number,
  firstResponseTimeMinutes?: number,
  targetPropertyPrice?: number,
): LeadScoringInput {
  return {
    lead,
    messageCount,
    firstResponseTimeMinutes,
    targetPropertyPrice,
  };
}
