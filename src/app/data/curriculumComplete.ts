// Complete comprehensive curriculum for all subjects - Class 12
import { Subject } from './curriculum';

// Helper function to create topics
const createTopics = (names: string[], baseHours: number = 2): Array<{id: string; name: string; estimatedHours: number}> => {
  return names.map((name, idx) => ({
    id: `t${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    estimatedHours: baseHours,
  }));
};


// MATHEMATICS CLASS 12
export const mathClass12: Subject = {
  id: 'mathematics',
  name: 'Mathematics',
  chapters: [
    {
      id: 'math12-ch1',
      name: 'Relations and Functions',
      topics: createTopics([
        'Types of Relations',
        'Reflexive, Symmetric, Transitive Relations',
        'Equivalence Relations',
        'Types of Functions',
        'One to One and Onto Functions',
        'Composite Functions',
        'Inverse of a Function',
        'Binary Operations',
        'Commutative and Associative Binary Operations',
      ], 2),
    },
    {
      id: 'math12-ch2',
      name: 'Inverse Trigonometric Functions',
      topics: createTopics([
        'Definition and Range of Inverse Trigonometric Functions',
        'Properties of Inverse Trigonometric Functions',
        'Graphs of Inverse Trigonometric Functions',
      ], 2),
    },
    {
      id: 'math12-ch3',
      name: 'Matrices',
      topics: createTopics([
        'Concept of Matrix',
        'Types of Matrices',
        'Equality of Matrices',
        'Transpose of a Matrix',
        'Symmetric and Skew Symmetric Matrices',
        'Addition and Multiplication of Matrices',
        'Multiplication of Matrix by a Scalar',
        'Properties of Matrix Operations',
        'Elementary Operations on Matrices',
        'Inverse of a Matrix by Elementary Operations',
      ], 2.5),
    },
    {
      id: 'math12-ch4',
      name: 'Determinants',
      topics: createTopics([
        'Determinant of a Square Matrix',
        'Properties of Determinants',
        'Area of a Triangle',
        'Minors and Cofactors',
        'Adjoint of a Matrix',
        'Inverse of a Matrix',
        'Applications of Determinants and Matrices',
        'Solution of Linear Equations using Matrix Method',
      ], 2.5),
    },
    {
      id: 'math12-ch5',
      name: 'Continuity and Differentiability',
      topics: createTopics([
        'Continuity of a Function',
        'Algebra of Continuous Functions',
        'Differentiability',
        'Derivatives of Composite Functions - Chain Rule',
        'Derivatives of Inverse Trigonometric Functions',
        'Derivatives of Implicit Functions',
        'Derivatives of Exponential and Logarithmic Functions',
        'Logarithmic Differentiation',
        'Derivatives of Functions in Parametric Forms',
        'Second Order Derivatives',
        "Mean Value Theorem - Rolle's Theorem",
      ], 3),
    },
    {
      id: 'math12-ch6',
      name: 'Application of Derivatives',
      topics: createTopics([
        'Rate of Change of Quantities',
        'Increasing and Decreasing Functions',
        'Tangents and Normals',
        'Approximations',
        'Maxima and Minima',
        'Maximum and Minimum Values in Closed Interval',
        'Applications in Business and Economics',
      ], 2.5),
    },
    {
      id: 'math12-ch7',
      name: 'Integrals',
      topics: createTopics([
        'Integration as Inverse Process of Differentiation',
        'Geometrical Interpretation of Indefinite Integral',
        'Properties of Indefinite Integral',
        'Integration by Substitution',
        'Integration using Trigonometric Identities',
        'Integration by Partial Fractions',
        'Integration by Parts',
        'Definite Integral',
        'Fundamental Theorem of Calculus',
        'Evaluation of Definite Integrals by Substitution',
        'Properties of Definite Integrals',
      ], 3),
    },
    {
      id: 'math12-ch8',
      name: 'Application of Integrals',
      topics: createTopics([
        'Area under Simple Curves',
        'Area between Two Curves',
        'Area of Circle and Ellipse',
      ], 2),
    },
    {
      id: 'math12-ch9',
      name: 'Differential Equations',
      topics: createTopics([
        'Definition, Order and Degree',
        'General and Particular Solutions',
        'Formation of Differential Equation',
        'Solution of Differential Equations by Separation of Variables',
        'Homogeneous Differential Equations',
        'Linear Differential Equations',
      ], 2.5),
    },
    {
      id: 'math12-ch10',
      name: 'Vector Algebra',
      topics: createTopics([
        'Vectors and Scalars',
        'Types of Vectors',
        'Addition of Vectors',
        'Multiplication of a Vector by a Scalar',
        'Components of a Vector',
        'Vector Joining Two Points',
        'Section Formula',
        'Scalar (Dot) Product of Vectors',
        'Vector (Cross) Product of Vectors',
        'Scalar Triple Product',
      ], 2.5),
    },
    {
      id: 'math12-ch11',
      name: 'Three Dimensional Geometry',
      topics: createTopics([
        'Direction Cosines and Direction Ratios',
        'Equation of a Line in Space',
        'Angle between Two Lines',
        'Shortest Distance between Two Lines',
        'Equation of a Plane',
        'Angle between Two Planes',
        'Distance of a Point from a Plane',
        'Angle between a Line and a Plane',
      ], 2.5),
    },
    {
      id: 'math12-ch12',
      name: 'Linear Programming',
      topics: createTopics([
        'Introduction to Linear Programming',
        'Mathematical Formulation of LPP',
        'Graphical Method of Solution',
        'Different Types of Linear Programming Problems',
      ], 2),
    },
    {
      id: 'math12-ch13',
      name: 'Probability',
      topics: createTopics([
        'Conditional Probability',
        'Properties of Conditional Probability',
        'Multiplication Theorem on Probability',
        'Independent Events',
        'Partition of Sample Space',
        "Theorem of Total Probability and Bayes' Theorem",
        'Random Variables and Probability Distribution',
        'Probability Distribution of a Random Variable',
        'Mean and Variance of Random Variable',
        'Bernoulli Trials and Binomial Distribution',
      ], 3),
    },
  ],
};



// BIOLOGY CLASS 12  
export const bioClass12: Subject = {
  id: 'biology',
  name: 'Biology',
  chapters: [
    {
      id: 'bio12-ch1',
      name: 'Reproduction in Organisms',
      topics: createTopics([
        'Asexual Reproduction',
        'Sexual Reproduction',
        'Pre-fertilisation Events',
        'Fertilisation',
        'Post-fertilisation Events',
      ], 2),
    },
    {
      id: 'bio12-ch2',
      name: 'Sexual Reproduction in Flowering Plants',
      topics: createTopics([
        'Structure of Flower',
        'Pre-fertilisation: Structures and Events',
        'Microsporogenesis',
        'Megasporogenesis',
        'Pollination',
        'Pollen-Pistil Interaction',
        'Double Fertilisation',
        'Post-fertilisation: Structures and Events',
        'Apomixis and Polyembryony',
      ], 2.5),
    },
    {
      id: 'bio12-ch3',
      name: 'Human Reproduction',
      topics: createTopics([
        'Male Reproductive System',
        'Female Reproductive System',
        'Gametogenesis',
        'Menstrual Cycle',
        'Fertilisation and Implantation',
        'Pregnancy and Embryonic Development',
        'Parturition and Lactation',
      ], 2.5),
    },
    {
      id: 'bio12-ch4',
      name: 'Reproductive Health',
      topics: createTopics([
        'Reproductive Health - Problems and Strategies',
        'Population Explosion and Birth Control',
        'Medical Termination of Pregnancy',
        'Sexually Transmitted Infections',
        'Infertility and Assisted Reproductive Technologies',
      ], 2),
    },
    {
      id: 'bio12-ch5',
      name: 'Principles of Inheritance and Variation',
      topics: createTopics([
        "Mendel's Laws of Inheritance",
        'Inheritance of One Gene',
        'Inheritance of Two Genes',
        'Chromosomal Theory of Inheritance',
        'Linkage and Recombination',
        'Sex Determination',
        'Mutation',
        'Genetic Disorders',
      ], 3),
    },
    {
      id: 'bio12-ch6',
      name: 'Molecular Basis of Inheritance',
      topics: createTopics([
        'The DNA',
        'The Search for Genetic Material',
        'RNA World',
        'Replication',
        'Transcription',
        'Genetic Code',
        'Translation',
        'Regulation of Gene Expression',
        'Human Genome Project',
        'DNA Fingerprinting',
      ], 3),
    },
    {
      id: 'bio12-ch7',
      name: 'Evolution',
      topics: createTopics([
        'Origin of Life',
        'Evolution of Life Forms',
        "Darwin's Contribution",
        'Modern Synthetic Theory',
        'Mechanism of Evolution',
        'Hardy-Weinberg Principle',
        'Adaptive Radiation',
        'Biological Evolution',
        'Evolution of Man',
      ], 2.5),
    },
    {
      id: 'bio12-ch8',
      name: 'Human Health and Disease',
      topics: createTopics([
        'Common Diseases in Humans',
        'Immunity',
        'AIDS',
        'Cancer',
        'Drugs and Alcohol Abuse',
      ], 2),
    },
    {
      id: 'bio12-ch9',
      name: 'Strategies for Enhancement in Food Production',
      topics: createTopics([
        'Animal Husbandry',
        'Plant Breeding',
        'Single Cell Protein',
        'Tissue Culture',
      ], 2),
    },
    {
      id: 'bio12-ch10',
      name: 'Microbes in Human Welfare',
      topics: createTopics([
        'Microbes in Household Products',
        'Microbes in Industrial Products',
        'Microbes in Sewage Treatment',
        'Microbes in Production of Biogas',
        'Microbes as Biocontrol Agents',
        'Microbes as Biofertilisers',
      ], 2),
    },
    {
      id: 'bio12-ch11',
      name: 'Biotechnology: Principles and Processes',
      topics: createTopics([
        'Principles of Biotechnology',
        'Tools of Recombinant DNA Technology',
        'Processes of Recombinant DNA Technology',
      ], 2.5),
    },
    {
      id: 'bio12-ch12',
      name: 'Biotechnology and its Applications',
      topics: createTopics([
        'Biotechnological Applications in Agriculture',
        'Biotechnological Applications in Medicine',
        'Transgenic Animals',
        'Ethical Issues',
      ], 2),
    },
    {
      id: 'bio12-ch13',
      name: 'Organisms and Populations',
      topics: createTopics([
        'Organism and Its Environment',
        'Populations',
        'Population Attributes',
        'Population Growth',
        'Population Interactions',
      ], 2),
    },
    {
      id: 'bio12-ch14',
      name: 'Ecosystem',
      topics: createTopics([
        'Ecosystem - Structure and Function',
        'Productivity',
        'Decomposition',
        'Energy Flow',
        'Ecological Pyramids',
        'Ecological Succession',
        'Nutrient Cycling',
        'Ecosystem Services',
      ], 2.5),
    },
    {
      id: 'bio12-ch15',
      name: 'Biodiversity and Conservation',
      topics: createTopics([
        'Biodiversity',
        'Biodiversity Conservation',
        'IUCN Red List',
        'Endemic Species',
        'Biodiversity Hotspots',
        'Threats to Biodiversity',
      ], 2),
    },
    {
      id: 'bio12-ch16',
      name: 'Environmental Issues',
      topics: createTopics([
        'Air Pollution and Control',
        'Water Pollution and Control',
        'Solid Wastes',
        'Agro-chemicals and their Effects',
        'Radioactive Wastes',
        'Greenhouse Effect and Climate Change',
        'Ozone Layer Depletion',
        'Deforestation',
      ], 2),
    },
  ],
};

// Export for use in main curriculum file
export const comprehensiveSubjects = {
  mathClass12,
  bioClass12,
};
