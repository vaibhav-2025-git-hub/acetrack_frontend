// Helper to generate comprehensive curriculum topics
import { Subject, Chapter, Topic } from '../data/curriculum';

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
  // Chemistry Class 11 topics
  chemistryClass11: (): Chapter[] => [
    {
      id: 'chem11-ch1',
      name: 'Some Basic Concepts of Chemistry',
      topics: genTopics([
        'Importance of Chemistry',
        'Nature of Matter',
        'Properties of Matter',
        'Laws of Chemical Combination',
        "Dalton's Atomic Theory",
        'Atomic and Molecular Masses',
        'Mole Concept and Molar Mass',
        'Percentage Composition',
        'Stoichiometry',
        'Reactions in Solutions',
      ], 2),
    },
    {
      id: 'chem11-ch2',
      name: 'Structure of Atom',
      topics: genTopics([
        'Discovery of Electron',
        'Atomic Models - Thomson Model',
        "Rutherford's Nuclear Model",
        "Bohr's Model",
        'Quantum Mechanical Model',
        'Quantum Numbers',
        'Electronic Configuration',
        'Stability of Orbitals',
      ], 2),
    },
    {
      id: 'chem11-ch3',
      name: 'Classification of Elements',
      topics: genTopics([
        'Genesis of Periodic Classification',
        'Modern Periodic Law',
        'Nomenclature of Elements',
        'Electronic Configuration and Periodic Table',
        'Periodic Trends - Atomic Radius',
        'Ionization Enthalpy',
        'Electron Gain Enthalpy',
        'Electronegativity',
        'Valency',
      ], 2),
    },
    {
      id: 'chem11-ch4',
      name: 'Chemical Bonding',
      topics: genTopics([
        'Kossel-Lewis Approach',
        'Ionic Bond',
        'Lattice Energy',
        'Covalent Bond',
        'Lewis Structures',
        'Polar Character of Covalent Bond',
        'VSEPR Theory',
        'Valence Bond Theory',
        'Hybridization',
        'Molecular Orbital Theory',
        'Hydrogen Bonding',
      ], 2.5),
    },
    {
      id: 'chem11-ch5',
      name: 'States of Matter',
      topics: genTopics([
        'Intermolecular Forces',
        'Thermal Energy',
        'Gaseous State',
        'Gas Laws',
        'Ideal Gas Equation',
        'Kinetic Molecular Theory',
        'Behaviour of Real Gases',
        'Liquefaction of Gases',
        'Liquid State',
      ], 2),
    },
    {
      id: 'chem11-ch6',
      name: 'Thermodynamics',
      topics: genTopics([
        'Thermodynamic Terms',
        'Applications of First Law',
        'Work, Heat and Internal Energy',
        'Enthalpy',
        'Enthalpies for Different Reactions',
        "Hess's Law",
        'Spontaneity',
        'Gibbs Energy Change',
      ], 2.5),
    },
    {
      id: 'chem11-ch7',
      name: 'Equilibrium',
      topics: genTopics([
        'Equilibrium in Physical Processes',
        'Equilibrium in Chemical Processes',
        'Law of Chemical Equilibrium',
        'Equilibrium Constant',
        'Factors Affecting Equilibrium',
        "Le Chatelier's Principle",
        'Ionic Equilibrium',
        'Acids and Bases',
        'pH Scale',
        'Buffer Solutions',
        'Solubility Equilibria',
      ], 2.5),
    },
    {
      id: 'chem11-ch8',
      name: 'Redox Reactions',
      topics: genTopics([
        'Classical Idea of Redox',
        'Redox Reactions in Terms of Electron Transfer',
        'Oxidation Number',
        'Balancing Redox Reactions',
        'Redox Reactions as Basis for Titrations',
      ], 2),
    },
    {
      id: 'chem11-ch9',
      name: 'Hydrogen',
      topics: genTopics([
        'Position of Hydrogen',
        'Occurrence and Isotopes',
        'Preparation, Properties and Uses',
        'Hydrides',
        'Water',
        'Hydrogen Peroxide',
        'Heavy Water',
      ], 2),
    },
    {
      id: 'chem11-ch10',
      name: 's-Block Elements',
      topics: genTopics([
        'Alkali Metals',
        'General Characteristics',
        'Anomalous Properties of Lithium',
        'Compounds of Alkali Metals',
        'Alkaline Earth Metals',
        'Anomalous Behaviour of Beryllium',
        'Compounds of Alkaline Earth Metals',
      ], 2),
    },
    {
      id: 'chem11-ch11',
      name: 'p-Block Elements',
      topics: genTopics([
        'Group 13 Elements',
        'Boron Family',
        'Group 14 Elements',
        'Carbon Family',
        'Allotropes of Carbon',
      ], 2),
    },
    {
      id: 'chem11-ch12',
      name: 'Organic Chemistry: Basic Principles',
      topics: genTopics([
        'General Introduction',
        'Tetravalence of Carbon',
        'Structural Representations',
        'Classification of Organic Compounds',
        'Nomenclature - IUPAC System',
        'Isomerism',
        'Fundamental Concepts in Organic Reaction Mechanism',
        'Purification Methods',
        'Qualitative Analysis',
        'Quantitative Analysis',
      ], 2.5),
    },
    {
      id: 'chem11-ch13',
      name: 'Hydrocarbons',
      topics: genTopics([
        'Classification',
        'Alkanes - Nomenclature',
        'Preparation of Alkanes',
        'Properties of Alkanes',
        'Alkenes - Nomenclature',
        'Structure of Double Bond',
        'Preparation of Alkenes',
        'Properties of Alkenes',
        'Alkynes - Nomenclature',
        'Preparation of Alkynes',
        'Properties of Alkynes',
        'Aromatic Hydrocarbons',
        'Nomenclature and Isomerism',
        'Benzene - Structure',
        'Aromaticity',
        'Preparation of Benzene',
        'Properties of Benzene',
        'Carcinogenicity and Toxicity',
      ], 3),
    },
    {
      id: 'chem11-ch14',
      name: 'Environmental Chemistry',
      topics: genTopics([
        'Environmental Pollution',
        'Atmospheric Pollution',
        'Water Pollution',
        'Soil Pollution',
        'Industrial Waste',
        'Strategies to Control Pollution',
        'Green Chemistry',
      ], 1.5),
    },
  ],

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
