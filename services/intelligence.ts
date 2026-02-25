
import { SwipeDecision, SessionResult, StyleCategory } from '../types';

/**
 * Aesthetic Architect Intelligence Service
 * Uses weighted analysis to determine stylistic preferences.
 */

export const analyzeSession = (
  decisions: SwipeDecision[],
  categories: StyleCategory[]
): SessionResult['summary'] => {
  const likes = decisions.filter((d) => d.direction === 'right');
  
  if (likes.length === 0) {
    return {
      primaryStyles: [],
      secondaryStyles: [],
      narrative: "No clear visual preferences were established during this session. This suggests a highly eclectic taste or a need for a broader visual exploration.",
      confidence: 'low',
      decisiveness: 0,
      averageResponseTime: decisions.reduce((acc, curr) => acc + curr.responseTimeMs, 0) / (decisions.length || 1),
    };
  }

  const styleWeights: Record<string, number> = {};

  likes.forEach((l) => {
    // Weighting logic:
    // Fast (< 1.2s): 3.0 influence (Instinctive)
    // Moderate (1.2s - 2.5s): 1.5 influence (Confident)
    // Slow (> 2.5s): 0.8 influence (Deliberate)
    let weight = 1.5;
    if (l.responseTimeMs < 1200) weight = 3.0;
    else if (l.responseTimeMs > 2500) weight = 0.8;

    l.styleCategories.forEach((catId) => {
      styleWeights[catId] = (styleWeights[catId] || 0) + weight;
    });
  });

  // Convert weights to sorted style names
  const sortedStyleEntries = Object.entries(styleWeights)
    .sort(([, a], [, b]) => b - a);

  const styleNames = sortedStyleEntries
    .map(([id]) => categories.find((c) => c.id === id)?.name)
    .filter((name): name is string => !!name);

  // Take the most significant styles
  // Primary: Top 1-2 styles if they have significant weight
  // Secondary: Next 2 styles
  const primaryStyles = styleNames.slice(0, 2);
  const secondaryStyles = styleNames.slice(2, 4);

  const avgResponse = decisions.reduce((acc, curr) => acc + curr.responseTimeMs, 0) / decisions.length;
  const undoCount = decisions.filter((d) => d.undoUsed).length;
  
  // Calculate decisiveness: influenced by response speed and consistency
  const decisiveness = Math.min(1, Math.max(0.1, 1 - (avgResponse / 6000) - (undoCount * 0.15)));
  
  let confidence: 'low' | 'moderate' | 'high' = 'high';
  if (decisiveness < 0.45) confidence = 'low';
  else if (decisiveness < 0.75) confidence = 'moderate';

  const narrative = generateDynamicNarrative(primaryStyles, secondaryStyles, confidence, decisiveness);

  return {
    primaryStyles,
    secondaryStyles,
    narrative,
    confidence,
    decisiveness,
    averageResponseTime: avgResponse,
  };
};

const generateDynamicNarrative = (
  primary: string[], 
  secondary: string[], 
  confidence: string,
  decisiveness: number
): string => {
  if (primary.length === 0) return "A visual baseline is still being established.";

  const mainAesthetic = primary.length > 1 
    ? `a sophisticated blend of ${primary[0]} and ${primary[1]}` 
    : `a definitive preference for ${primary[0]} design`;

  const supportAesthetic = secondary.length > 0 
    ? `, nuanced by subtle ${secondary.join(' and ')} undertones` 
    : "";

  let tone = "";
  if (decisiveness > 0.85) {
    tone = "Your selections were remarkably instinctive, suggesting a deeply refined and unwavering aesthetic intuition.";
  } else if (decisiveness > 0.6) {
    tone = "There is a consistent and clear vision emerging, showing a strong pull toward cohesive textures and forms.";
  } else {
    tone = "Your selections reflect a thoughtful, multi-faceted approach, balancing diverse visual influences into a unique personal vocabulary.";
  }

  return `The analysis identifies ${mainAesthetic}${supportAesthetic}. ${tone}`;
};
