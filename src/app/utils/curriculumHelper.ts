// Helper to generate comprehensive curriculum topics
import type { Subject, Chapter, Topic } from '../data/curriculum';

// Generate topics with unique IDs
const genTopics = (names: string[], hours: number = 2): Topic[] => {
  return names.map((name, idx) => ({
    id: `topic_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    estimatedHours: hours,
  }));
};

// Get total topic count for a stream
export const getTotalTopicCount = (subjects: Subject[]): number => {
  return subjects.reduce((total, subject) => {
    return total + subject.chapters.reduce((subTotal, chapter) => {
      return subTotal + chapter.topics.length;
    }, 0);
  }, 0);
};

// Get total estimated hours for a stream
export const getTotalEstimatedHours = (subjects: Subject[]): number => {
  return subjects.reduce((total, subject) => {
    return total + subject.chapters.reduce((subTotal, chapter) => {
      return subTotal + chapter.topics.reduce((topicTotal, topic) => {
        return topicTotal + topic.estimatedHours;
      }, 0);
    }, 0);
  }, 0);
};

// Verify all topics are included in plan
export const verifyPlanCompleteness = (
  subjects: Subject[],
  dailyPlans: Record<string, any>
): {
  totalTopics: number;
  plannedTopics: number;
  coverage: number;
  missingTopics: string[];
} => {
  const allTopicIds = new Set<string>();
  subjects.forEach(subject => {
    subject.chapters.forEach(chapter => {
      chapter.topics.forEach(topic => {
        allTopicIds.add(topic.id);
      });
    });
  });

  const plannedTopicIds = new Set<string>();
  Object.values(dailyPlans).forEach((day: any) => {
    day.sessions.forEach((session: any) => {
      if (!session.topicId.startsWith('revision-')) {
        plannedTopicIds.add(session.topicId);
      }
    });
  });

  const missingTopicIds = Array.from(allTopicIds).filter(id => !plannedTopicIds.has(id));
  
  return {
    totalTopics: allTopicIds.size,
    plannedTopics: plannedTopicIds.size,
    coverage: (plannedTopicIds.size / allTopicIds.size) * 100,
    missingTopics: missingTopicIds,
  };
};

// Export comprehensive topic generation for different subjects
export const generateComprehensiveTopics = {
  // Chemistry Class 12 topics
  chemistryClass12: (): Chapter[] => [
    {
      id: 'chem12-ch1',
      name: 'The Solid State',
      topics: genTopics([
        'General Characteristics of Solid State',
        'Amorphous and Crystalline Solids',
        'Classification of Crystalline Solids',
        'Crystal Lattices and Unit Cells',
        'Number of Atoms in a Unit Cell',
        'Close Packed Structures',
        'Packing Efficiency',
        'Calculations Involving Unit Cell Dimensions',
        'Imperfections in Solids',
        'Electrical Properties',
        'Magnetic Properties',
      ], 2),
    },
    {
      id: 'chem12-ch2',
      name: 'Solutions',
      topics: genTopics([
        'Types of Solutions',
        'Expressing Concentration of Solutions',
        'Solubility',
        'Vapour Pressure of Liquid Solutions',
        "Raoult's Law",
        'Ideal and Non-ideal Solutions',
        'Colligative Properties',
        'Relative Lowering of Vapour Pressure',
        'Elevation of Boiling Point',
        'Depression of Freezing Point',
        'Osmotic Pressure',
        'Abnormal Molar Masses',
      ], 2.5),
    },
    {
      id: 'chem12-ch3',
      name: 'Electrochemistry',
      topics: genTopics([
        'Electrochemical Cells',
        'Galvanic Cells',
        'Measurement of Electrode Potential',
        'Nernst Equation',
        'Equilibrium Constant from Nernst Equation',
        'Electrochemical Cell and Gibbs Energy',
        'Conductance of Electrolytic Solutions',
        'Electrolytic Cells and Electrolysis',
        'Batteries',
        'Fuel Cells',
        'Corrosion',
      ], 2.5),
    },
    {
      id: 'chem12-ch4',
      name: 'Chemical Kinetics',
      topics: genTopics([
        'Rate of a Chemical Reaction',
        'Factors Influencing Rate of Reaction',
        'Integrated Rate Equations',
        'Pseudo First Order Reaction',
        'Temperature Dependence of Rate',
        'Effect of Catalyst',
        'Collision Theory of Chemical Reactions',
      ], 2),
    },
    {
      id: 'chem12-ch5',
      name: 'Surface Chemistry',
      topics: genTopics([
        'Adsorption',
        'Distinction Between Adsorption and Absorption',
        'Catalysis',
        'Catalysis in Industry',
        'Colloids',
        'Classification of Colloids',
        'Emulsions',
        'Micelles',
      ], 2),
    },
    {
      id: 'chem12-ch6',
      name: 'General Principles of Isolation of Elements',
      topics: genTopics([
        'Occurrence of Metals',
        'Concentration of Ores',
        'Extraction of Crude Metal',
        'Thermodynamic Principles',
        'Electrochemical Principles',
        'Oxidation Reduction',
        'Refining',
      ], 2),
    },
    {
      id: 'chem12-ch7',
      name: 'p-Block Elements',
      topics: genTopics([
        'Group 15 Elements',
        'Dinitrogen',
        'Ammonia',
        'Oxides of Nitrogen',
        'Nitric Acid',
        'Phosphorus',
        'Group 16 Elements',
        'Dioxygen',
        'Ozone',
        'Sulphur',
        'Oxides of Sulphur',
        'Sulphuric Acid',
        'Group 17 Elements',
        'Chlorine',
        'Hydrogen Chloride',
        'Oxoacids of Halogens',
        'Interhalogen Compounds',
        'Group 18 Elements',
      ], 3),
    },
    {
      id: 'chem12-ch8',
      name: 'd and f Block Elements',
      topics: genTopics([
        'Position in Periodic Table',
        'Electronic Configurations',
        'General Properties of Transition Elements',
        'Preparation and Properties of Potassium Dichromate',
        'Preparation and Properties of Potassium Permanganate',
        'Inner Transition Elements',
        'Lanthanoids',
        'Actinoids',
      ], 2),
    },
    {
      id: 'chem12-ch9',
      name: 'Coordination Compounds',
      topics: genTopics([
        'Werner Theory of Coordination Compounds',
        'Definitions of Important Terms',
        'Nomenclature',
        'Isomerism in Coordination Compounds',
        'Bonding in Coordination Compounds',
        'Bonding in Metal Carbonyls',
        'Importance and Applications',
      ], 2.5),
    },
    {
      id: 'chem12-ch10',
      name: 'Haloalkanes and Haloarenes',
      topics: genTopics([
        'Classification and Nomenclature',
        'Nature of C-X Bond',
        'Methods of Preparation of Haloalkanes',
        'Preparation of Haloarenes',
        'Physical Properties',
        'Chemical Reactions of Haloalkanes',
        'Chemical Reactions of Haloarenes',
        'Polyhalogen Compounds',
      ], 2.5),
    },
    {
      id: 'chem12-ch11',
      name: 'Alcohols, Phenols and Ethers',
      topics: genTopics([
        'Classification',
        'Nomenclature',
        'Structures of Functional Groups',
        'Alcohols - Preparation',
        'Physical Properties of Alcohols',
        'Chemical Reactions of Alcohols',
        'Commercially Important Alcohols',
        'Phenols - Preparation',
        'Physical Properties of Phenols',
        'Chemical Reactions of Phenols',
        'Ethers - Preparation',
        'Physical Properties of Ethers',
        'Chemical Reactions of Ethers',
      ], 2.5),
    },
    {
      id: 'chem12-ch12',
      name: 'Aldehydes, Ketones and Carboxylic Acids',
      topics: genTopics([
        'Nomenclature and Structure',
        'Preparation of Aldehydes and Ketones',
        'Physical Properties',
        'Chemical Reactions',
        'Uses of Aldehydes and Ketones',
        'Nomenclature and Structure of Carboxylic Acids',
        'Preparation of Carboxylic Acids',
        'Physical Properties of Carboxylic Acids',
        'Chemical Reactions of Carboxylic Acids',
      ], 2.5),
    },
    {
      id: 'chem12-ch13',
      name: 'Amines',
      topics: genTopics([
        'Structure of Amines',
        'Classification',
        'Nomenclature',
        'Preparation of Amines',
        'Physical Properties',
        'Chemical Reactions',
        'Diazonium Salts',
      ], 2),
    },
    {
      id: 'chem12-ch14',
      name: 'Biomolecules',
      topics: genTopics([
        'Carbohydrates',
        'Proteins',
        'Enzymes',
        'Vitamins',
        'Nucleic Acids',
        'Hormones',
      ], 2),
    },
    {
      id: 'chem12-ch15',
      name: 'Polymers',
      topics: genTopics([
        'Classification of Polymers',
        'Types of Polymerisation Reactions',
        'Molecular Mass of Polymers',
        'Biodegradable Polymers',
        'Important Polymers',
      ], 1.5),
    },
    {
      id: 'chem12-ch16',
      name: 'Chemistry in Everyday Life',
      topics: genTopics([
        'Drugs and their Classification',
        'Drug-Target Interaction',
        'Therapeutic Action of Different Classes',
        'Chemicals in Food',
        'Cleansing Agents',
      ], 1.5),
    },
  ],
};
