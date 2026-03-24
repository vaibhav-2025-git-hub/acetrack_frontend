import type { Flashcard } from '../types';

// Spaced Repetition Algorithm (SM-2)
export const calculateNextReviewDate = (
  flashcard: Flashcard,
  confidence: number // 0-5 rating from user
): string => {
  const today = new Date();
  let interval = 1; // days

  // SM-2 Algorithm
  if (confidence >= 4) {
    // Easy/Good
    if (flashcard.reviewCount === 0) {
      interval = 1;
    } else if (flashcard.reviewCount === 1) {
      interval = 6;
    } else {
      // Calculate based on previous interval and confidence
      const easinessFactor = 1.3 + (confidence - 3) * 0.1;
      interval = Math.round(flashcard.reviewCount * easinessFactor);
    }
  } else if (confidence >= 2) {
    // Hard
    interval = Math.max(1, Math.floor(flashcard.reviewCount * 0.5));
  } else {
    // Again - review today
    interval = 0;
  }

  const nextReview = new Date(today);
  nextReview.setDate(nextReview.getDate() + interval);
  return nextReview.toISOString().split('T')[0];
};

// Generate flashcards from topic content (AI-powered mock)
export const generateFlashcardsForTopic = (
  topicId: string,
  topicName: string,
  subjectId: string,
  chapterName: string
): Flashcard[] => {
  const templates = getFlashcardTemplates(subjectId, topicName);
  
  return templates.map((template, index) => ({
    id: `flashcard-${topicId}-${Date.now()}-${index}`,
    topicId,
    subjectId,
    front: template.front,
    back: template.back,
    difficulty: template.difficulty,
    lastReviewed: undefined,
    nextReview: new Date().toISOString().split('T')[0],
    reviewCount: 0,
    confidence: 0,
    createdAt: new Date().toISOString(),
    tags: [chapterName, topicName],
  }));
};

// Flashcard templates for different subjects
const getFlashcardTemplates = (subjectId: string, topicName: string): Array<{
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}> => {
  const subject = subjectId.toLowerCase();
  
  if (subject.includes('physics')) {
    return [
      {
        front: `What is the main concept of ${topicName}?`,
        back: `${topicName} refers to [fundamental principle and definition with real-world context]`,
        difficulty: 'easy',
      },
      {
        front: `What is the key formula for ${topicName}?`,
        back: `Key formula: [Mathematical expression]\n\nWhere:\n- Variable 1 = [definition]\n- Variable 2 = [definition]\n\nUnits: [SI units]`,
        difficulty: 'medium',
      },
      {
        front: `State the law/principle related to ${topicName}`,
        back: `[Name of Law/Principle]:\n\n"[Statement of the law]"\n\nThis means: [Simple explanation]`,
        difficulty: 'medium',
      },
      {
        front: `What are the real-world applications of ${topicName}?`,
        back: `Applications:\n1. [Application 1 with example]\n2. [Application 2 with example]\n3. [Application 3 with example]`,
        difficulty: 'hard',
      },
      {
        front: `Derive the equation for ${topicName}`,
        back: `Starting from: [Initial equation]\n\nStep 1: [Derivation step]\nStep 2: [Derivation step]\nStep 3: [Derivation step]\n\nFinal: [Derived equation]`,
        difficulty: 'hard',
      },
      {
        front: `What are the units and dimensions in ${topicName}?`,
        back: `SI Unit: [unit]\nCGS Unit: [unit]\nDimensions: [dimensional formula]\n\nConversion: [conversion factors if applicable]`,
        difficulty: 'easy',
      },
      {
        front: `What are common misconceptions about ${topicName}?`,
        back: `❌ Wrong: [Common misconception]\n✓ Correct: [Actual fact]\n\nRemember: [Key point to avoid confusion]`,
        difficulty: 'medium',
      },
      {
        front: `Give a numerical example for ${topicName}`,
        back: `Example Problem:\n[Problem statement]\n\nGiven: [values]\nFind: [what to calculate]\n\nSolution:\n[Step-by-step solution with final answer]`,
        difficulty: 'hard',
      },
    ];
  } else if (subject.includes('chemistry')) {
    return [
      {
        front: `What is ${topicName} in chemistry?`,
        back: `${topicName}:\n\nDefinition: [Chemical definition]\nType: [Category - organic/inorganic/physical]\nImportance: [Why it matters]`,
        difficulty: 'easy',
      },
      {
        front: `What are the key chemical reactions in ${topicName}?`,
        back: `Main Reaction:\n[Chemical equation with states]\n\nConditions: [Temperature, pressure, catalyst]\nType: [Reaction type]\nProducts: [What forms]`,
        difficulty: 'medium',
      },
      {
        front: `What are the properties involved in ${topicName}?`,
        back: `Physical Properties:\n- [Property 1]\n- [Property 2]\n\nChemical Properties:\n- [Property 1]\n- [Property 2]`,
        difficulty: 'easy',
      },
      {
        front: `What is the mechanism for ${topicName}?`,
        back: `Reaction Mechanism:\n\nStep 1: [Initiation]\nStep 2: [Propagation]\nStep 3: [Termination]\n\nIntermediate: [Reactive species]`,
        difficulty: 'hard',
      },
      {
        front: `Name important compounds related to ${topicName}`,
        back: `Key Compounds:\n1. [Name] - [Formula] - [Use]\n2. [Name] - [Formula] - [Use]\n3. [Name] - [Formula] - [Use]`,
        difficulty: 'medium',
      },
      {
        front: `What tests identify ${topicName}?`,
        back: `Chemical Tests:\n\n1. [Test name]: [Procedure] → [Result]\n2. [Test name]: [Procedure] → [Result]\n\nObservations: [Visual changes]`,
        difficulty: 'medium',
      },
      {
        front: `What are industrial applications of ${topicName}?`,
        back: `Industrial Uses:\n1. [Industry] - [Specific use]\n2. [Industry] - [Specific use]\n\nEconomic Importance: [Brief explanation]`,
        difficulty: 'hard',
      },
      {
        front: `What safety precautions relate to ${topicName}?`,
        back: `Safety Points:\n⚠️ [Hazard 1]: [Precaution]\n⚠️ [Hazard 2]: [Precaution]\n\nFirst Aid: [Emergency measures]`,
        difficulty: 'easy',
      },
    ];
  } else if (subject.includes('math')) {
    return [
      {
        front: `Define the concept: ${topicName}`,
        back: `${topicName}:\n\nFormal Definition: [Mathematical definition]\n\nIn simple terms: [Easy explanation]\n\nNotation: [Symbols used]`,
        difficulty: 'easy',
      },
      {
        front: `State the theorem/formula for ${topicName}`,
        back: `Theorem:\n[Mathematical statement]\n\nFormula: [Equation]\n\nConditions: [When it applies]`,
        difficulty: 'medium',
      },
      {
        front: `Prove the result for ${topicName}`,
        back: `Proof:\n\nGiven: [Assumptions]\nTo Prove: [Statement]\n\nStep 1: [Logical step]\nStep 2: [Logical step]\nStep 3: [Logical step]\n\n∴ Hence proved.`,
        difficulty: 'hard',
      },
      {
        front: `What are the properties of ${topicName}?`,
        back: `Key Properties:\n1. [Property 1 with explanation]\n2. [Property 2 with explanation]\n3. [Property 3 with explanation]\n\nNote: [Important observation]`,
        difficulty: 'medium',
      },
      {
        front: `Give an example problem for ${topicName}`,
        back: `Example:\n\nProblem: [Question]\n\nSolution:\nGiven: [Data]\nMethod: [Approach]\nSteps:\n1. [Step]\n2. [Step]\n\nAnswer: [Final result]`,
        difficulty: 'hard',
      },
      {
        front: `What are common mistakes in ${topicName}?`,
        back: `Common Errors:\n\n❌ Mistake 1: [What students do wrong]\n✓ Correct: [Right approach]\n\n❌ Mistake 2: [Another error]\n✓ Correct: [Right method]`,
        difficulty: 'medium',
      },
      {
        front: `When do we use ${topicName}?`,
        back: `Applications:\n\n1. [Problem type 1]\n2. [Problem type 2]\n3. [Problem type 3]\n\nUseful when: [Conditions]`,
        difficulty: 'easy',
      },
      {
        front: `What is the graphical representation of ${topicName}?`,
        back: `Graph/Visual:\n\nShape: [Description]\nKey Points: [Important coordinates]\nBehavior: [How it changes]\n\nInterpretation: [What it means]`,
        difficulty: 'medium',
      },
      {
        front: `What are shortcuts for ${topicName}?`,
        back: `Quick Methods:\n\n1. [Shortcut 1]: [When to use]\n2. [Shortcut 2]: [When to use]\n\nTip: [Memory aid or trick]`,
        difficulty: 'easy',
      },
    ];
  } else if (subject.includes('biology')) {
    return [
      {
        front: `What is ${topicName}?`,
        back: `${topicName}:\n\nDefinition: [Biological definition]\nCategory: [Classification]\nOccurs in: [Organisms/cells/systems]`,
        difficulty: 'easy',
      },
      {
        front: `What is the structure of ${topicName}?`,
        back: `Structure:\n\nMacroscopic: [Visible features]\nMicroscopic: [Cellular details]\nMolecular: [Chemical composition]\n\nDiagram: [Key parts labeled]`,
        difficulty: 'medium',
      },
      {
        front: `What is the function of ${topicName}?`,
        back: `Primary Function:\n[Main biological role]\n\nSecondary Functions:\n1. [Additional role 1]\n2. [Additional role 2]\n\nImportance: [Why it matters]`,
        difficulty: 'easy',
      },
      {
        front: `Explain the process of ${topicName}`,
        back: `Process Steps:\n\n1. [Stage 1]: [What happens]\n2. [Stage 2]: [What happens]\n3. [Stage 3]: [What happens]\n\nResult: [Final outcome]`,
        difficulty: 'medium',
      },
      {
        front: `What are the types/categories of ${topicName}?`,
        back: `Classification:\n\n1. [Type 1]: [Description]\n2. [Type 2]: [Description]\n3. [Type 3]: [Description]\n\nBasis: [How they differ]`,
        difficulty: 'medium',
      },
      {
        front: `What diseases/disorders relate to ${topicName}?`,
        back: `Related Conditions:\n\n1. [Disease 1]: [Cause and symptoms]\n2. [Disease 2]: [Cause and symptoms]\n\nPrevention: [How to avoid]`,
        difficulty: 'hard',
      },
      {
        front: `What are examples of ${topicName}?`,
        back: `Examples:\n\n1. [Example 1 in context]\n2. [Example 2 in context]\n3. [Example 3 in context]\n\nNote: [Important observation]`,
        difficulty: 'easy',
      },
      {
        front: `How does ${topicName} work at the molecular level?`,
        back: `Molecular Mechanism:\n\nMolecules Involved: [Key biomolecules]\nSteps:\n1. [Molecular event 1]\n2. [Molecular event 2]\n\nRegulation: [Control mechanisms]`,
        difficulty: 'hard',
      },
      {
        front: `What experiments demonstrate ${topicName}?`,
        back: `Key Experiments:\n\n1. [Scientist Name] ([Year]):\n   - Method: [Brief procedure]\n   - Result: [Finding]\n   - Conclusion: [What proved]`,
        difficulty: 'hard',
      },
    ];
  }
  
  // Default for other subjects (History, Economics, etc.)
  return [
    {
      front: `What is ${topicName}?`,
      back: `${topicName}:\n\n[Comprehensive definition and explanation with key points and context]`,
      difficulty: 'easy',
    },
    {
      front: `What are the key concepts in ${topicName}?`,
      back: `Main Concepts:\n\n1. [Concept 1]: [Explanation]\n2. [Concept 2]: [Explanation]\n3. [Concept 3]: [Explanation]`,
      difficulty: 'medium',
    },
    {
      front: `Why is ${topicName} important?`,
      back: `Significance:\n\n1. [Reason 1]\n2. [Reason 2]\n3. [Reason 3]\n\nImpact: [Overall importance]`,
      difficulty: 'easy',
    },
    {
      front: `What are examples of ${topicName}?`,
      back: `Examples:\n\n1. [Example 1 with details]\n2. [Example 2 with details]\n3. [Example 3 with details]`,
      difficulty: 'medium',
    },
    {
      front: `How does ${topicName} work?`,
      back: `Process/Mechanism:\n\nStep 1: [Explanation]\nStep 2: [Explanation]\nStep 3: [Explanation]\n\nOutcome: [Result]`,
      difficulty: 'medium',
    },
    {
      front: `What are the applications of ${topicName}?`,
      back: `Practical Applications:\n\n1. [Application 1]\n2. [Application 2]\n3. [Application 3]\n\nReal-world relevance: [Context]`,
      difficulty: 'hard',
    },
    {
      front: `Compare and contrast aspects of ${topicName}`,
      back: `Comparison:\n\nSimilarities:\n- [Point 1]\n- [Point 2]\n\nDifferences:\n- [Point 1]\n- [Point 2]`,
      difficulty: 'hard',
    },
    {
      front: `What are common questions about ${topicName}?`,
      back: `FAQ:\n\nQ1: [Question]\nA1: [Answer]\n\nQ2: [Question]\nA2: [Answer]`,
      difficulty: 'medium',
    },
  ];
};

// Get flashcards due for review today
export const getFlashcardsDueToday = (flashcards: Flashcard[]): Flashcard[] => {
  const today = new Date().toISOString().split('T')[0];
  
  return flashcards.filter((card) => {
    if (!card.nextReview) return true;
    return card.nextReview <= today;
  });
};

// Get flashcards by subject
export const getFlashcardsBySubject = (
  flashcards: Flashcard[],
  subjectId: string
): Flashcard[] => {
  return flashcards.filter((card) => card.subjectId === subjectId);
};

// Get flashcard statistics
export const getFlashcardStats = (flashcards: Flashcard[]) => {
  const total = flashcards.length;
  const mastered = flashcards.filter((card) => card.confidence >= 4 && card.reviewCount >= 3).length;
  const learning = flashcards.filter((card) => card.reviewCount > 0 && card.reviewCount < 3).length;
  const new_cards = flashcards.filter((card) => card.reviewCount === 0).length;
  const dueToday = getFlashcardsDueToday(flashcards).length;

  return {
    total,
    mastered,
    learning,
    new: new_cards,
    dueToday,
    masteryPercentage: total > 0 ? Math.round((mastered / total) * 100) : 0,
  };
};

// Update flashcard after review
export const reviewFlashcard = (
  flashcard: Flashcard,
  confidence: number
): Flashcard => {
  return {
    ...flashcard,
    confidence,
    reviewCount: flashcard.reviewCount + 1,
    lastReviewed: new Date().toISOString().split('T')[0],
    nextReview: calculateNextReviewDate(flashcard, confidence),
  };
};