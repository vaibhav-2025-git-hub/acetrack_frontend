// COMPLETE COMPREHENSIVE CURRICULUM - ALL BOARDS, CLASSES, STREAMS
// This file contains ALL topics that will be distributed in the study plan

import { Board } from './curriculum';

// Helper to create topics quickly
const t = (names: string[], hours: number = 2) =>
  names.map((name, i) => ({ id: `${Date.now()}_${i}`, name, estimatedHours: hours }));

export const completeCurriculumData: Board[] = [
  {
    id: 'cbse',
    name: 'CBSE',
    classes: {
      '11': [
        // ==================== PCM STREAM ====================
        {
          id: 'pcm',
          name: 'Science - PCM',
          description: 'Physics, Chemistry, Mathematics',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [
                { id: 'p11-1', name: 'Physical World', topics: t(['What is Physics', 'Scope of Physics', 'Physical Laws', 'SI Units', 'Measurements', 'Errors', 'Significant Figures', 'Dimensions', 'Dimensional Analysis'], 1.5) },
                { id: 'p11-2', name: 'Kinematics', topics: t(['Motion in Straight Line', 'Position and Displacement', 'Velocity', 'Acceleration', 'Equations of Motion', 'Graphs', 'Motion in Plane', 'Projectile Motion', 'Circular Motion'], 2) },
                { id: 'p11-3', name: 'Laws of Motion', topics: t(['Newton First Law', 'Newton Second Law', 'Newton Third Law', 'Momentum', 'Impulse', 'Friction', 'Circular Motion Dynamics'], 2) },
                { id: 'p11-4', name: 'Work Energy Power', topics: t(['Work', 'Kinetic Energy', 'Work-Energy Theorem', 'Potential Energy', 'Conservation of Energy', 'Power', 'Collisions'], 2) },
                { id: 'p11-5', name: 'Rotational Motion', topics: t(['Centre of Mass', 'Torque', 'Angular Momentum', 'Moment of Inertia', 'Perpendicular Axis Theorem', 'Parallel Axis Theorem', 'Rolling Motion'], 2.5) },
                { id: 'p11-6', name: 'Gravitation', topics: t(['Universal Gravitation', 'Acceleration due to Gravity', 'Gravitational Potential Energy', 'Escape Velocity', 'Satellites', 'Kepler Laws'], 2) },
                { id: 'p11-7', name: 'Properties of Matter', topics: t(['Elasticity', 'Stress and Strain', 'Hooke Law', 'Fluid Pressure', 'Pascal Law', 'Archimedes Principle', 'Surface Tension', 'Viscosity'], 2) },
                { id: 'p11-8', name: 'Thermodynamics', topics: t(['Temperature', 'Heat', 'Thermal Expansion', 'Calorimetry', 'Heat Transfer', 'First Law', 'Thermodynamic Processes', 'Heat Engines', 'Second Law'], 2.5) },
                { id: 'p11-9', name: 'Kinetic Theory', topics: t(['Molecular Theory', 'Gas Laws', 'Kinetic Theory of Gases', 'Degrees of Freedom', 'Equipartition of Energy', 'Mean Free Path'], 2) },
                { id: 'p11-10', name: 'Oscillations and Waves', topics: t(['Periodic Motion', 'SHM', 'Energy in SHM', 'Pendulum', 'Damped Oscillations', 'Forced Oscillations', 'Wave Motion', 'Superposition', 'Standing Waves', 'Beats', 'Doppler Effect'], 2.5) },
              ],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [
                { id: 'c11-1', name: 'Basic Concepts', topics: t(['Matter', 'Laws of Chemical Combination', 'Dalton Theory', 'Atomic Mass', 'Mole Concept', 'Stoichiometry', 'Limiting Reagent'], 2) },
                { id: 'c11-2', name: 'Atomic Structure', topics: t(['Subatomic Particles', 'Thomson Model', 'Rutherford Model', 'Bohr Model', 'Quantum Numbers', 'Orbitals', 'Electronic Configuration'], 2.5) },
                { id: 'c11-3', name: 'Periodic Table', topics: t(['Periodic Law', 'Electronic Configuration', 'Atomic Radius', 'Ionization Energy', 'Electron Affinity', 'Electronegativity'], 2) },
                { id: 'c11-4', name: 'Chemical Bonding', topics: t(['Ionic Bond', 'Covalent Bond', 'Lewis Structures', 'VSEPR Theory', 'Valence Bond Theory', 'Hybridization sp sp2 sp3', 'Molecular Orbital Theory', 'Hydrogen Bonding'], 2.5) },
                { id: 'c11-5', name: 'States of Matter', topics: t(['Gaseous State', 'Gas Laws', 'Ideal Gas Equation', 'Kinetic Theory', 'Real Gases', 'Liquid State'], 2) },
                { id: 'c11-6', name: 'Thermodynamics', topics: t(['System and Surroundings', 'Internal Energy', 'First Law', 'Enthalpy', 'Hess Law', 'Spontaneity', 'Gibbs Energy'], 2.5) },
                { id: 'c11-7', name: 'Equilibrium', topics: t(['Physical Equilibrium', 'Chemical Equilibrium', 'Equilibrium Constant', 'Le Chatelier Principle', 'Ionic Equilibrium', 'pH', 'Buffer Solutions'], 2.5) },
                { id: 'c11-8', name: 'Redox Reactions', topics: t(['Oxidation Number', 'Balancing Redox Reactions', 'Redox Titrations'], 2) },
                { id: 'c11-9', name: 's-Block Elements', topics: t(['Alkali Metals', 'Alkaline Earth Metals', 'Properties', 'Compounds'], 2) },
                { id: 'c11-10', name: 'p-Block Elements', topics: t(['Group 13 Elements', 'Group 14 Elements', 'Properties', 'Compounds'], 2) },
                { id: 'c11-11', name: 'Organic Chemistry Basics', topics: t(['Classification', 'Nomenclature', 'Isomerism', 'Purification Methods', 'Qualitative Analysis'], 2.5) },
                { id: 'c11-12', name: 'Hydrocarbons', topics: t(['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic Hydrocarbons', 'Benzene', 'Reactions'], 2.5) },
                { id: 'c11-13', name: 'Environmental Chemistry', topics: t(['Air Pollution', 'Water Pollution', 'Soil Pollution', 'Green Chemistry'], 1.5) },
              ],
            },
            {
              id: 'mathematics',
              name: 'Mathematics',
              chapters: [
                { id: 'm11-1', name: 'Sets', topics: t(['Representations', 'Types of Sets', 'Venn Diagrams', 'Operations on Sets', 'Complement'], 1.5) },
                { id: 'm11-2', name: 'Relations and Functions', topics: t(['Cartesian Product', 'Relations', 'Functions', 'Domain Range', 'Types of Functions'], 2) },
                { id: 'm11-3', name: 'Trigonometry', topics: t(['Angles', 'Trigonometric Functions', 'Identities', 'Trigonometric Equations'], 2.5) },
                { id: 'm11-4', name: 'Mathematical Induction', topics: t(['Principle of MI', 'Applications'], 1.5) },
                { id: 'm11-5', name: 'Complex Numbers', topics: t(['Introduction', 'Algebra', 'Modulus Conjugate', 'Argand Plane', 'Polar Form'], 2) },
                { id: 'm11-6', name: 'Linear Inequalities', topics: t(['Inequalities', 'Algebraic Solutions', 'Graphical Solutions'], 2) },
                { id: 'm11-7', name: 'Permutations Combinations', topics: t(['Fundamental Principle', 'Permutations', 'Combinations'], 2.5) },
                { id: 'm11-8', name: 'Binomial Theorem', topics: t(['Binomial Expansion', 'General Term', 'Middle Term'], 2) },
                { id: 'm11-9', name: 'Sequences and Series', topics: t(['AP', 'GP', 'AM GM', 'Special Series'], 2.5) },
                { id: 'm11-10', name: 'Straight Lines', topics: t(['Slope', 'Equations of Line', 'Distance from Point to Line'], 2) },
                { id: 'm11-11', name: 'Conic Sections', topics: t(['Circle', 'Parabola', 'Ellipse', 'Hyperbola'], 2.5) },
                { id: 'm11-12', name: '3D Geometry', topics: t(['Coordinates in Space', 'Distance Formula', 'Section Formula'], 1.5) },
                { id: 'm11-13', name: 'Limits and Derivatives', topics: t(['Limits', 'Limits of Trig Functions', 'Derivatives', 'Algebra of Derivatives'], 3) },
                { id: 'm11-14', name: 'Statistics', topics: t(['Mean Deviation', 'Variance', 'Standard Deviation'], 2) },
                { id: 'm11-15', name: 'Probability', topics: t(['Random Experiments', 'Events', 'Axiomatic Probability'], 2) },
              ],
            },
            {
              id: 'english',
              name: 'English',
              chapters: [
                { id: 'e11-1', name: 'Reading', topics: t(['Comprehension', 'Note Making', 'Summary'], 2) },
                { id: 'e11-2', name: 'Writing', topics: t(['Notice', 'Poster', 'Formal Letter', 'Informal Letter', 'Article', 'Report', 'Debate', 'Speech'], 1.5) },
                { id: 'e11-3', name: 'Grammar', topics: t(['Tenses', 'Modals', 'Voice', 'Speech', 'Editing'], 1.5) },
                { id: 'e11-4', name: 'Literature', topics: t(['Prose Chapter 1', 'Prose Chapter 2', 'Prose Chapter 3', 'Poetry 1', 'Poetry 2', 'Poetry 3'], 2) },
              ],
            },
          ],
        },
        // ==================== PCB STREAM ====================
        {
          id: 'pcb',
          name: 'Science - PCB',
          description: 'Physics, Chemistry, Biology',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [
                { id: 'p11-1', name: 'Physical World', topics: t(['What is Physics', 'Scope of Physics', 'Physical Laws', 'SI Units', 'Measurements', 'Errors', 'Significant Figures', 'Dimensions', 'Dimensional Analysis'], 1.5) },
                { id: 'p11-2', name: 'Kinematics', topics: t(['Motion in Straight Line', 'Position and Displacement', 'Velocity', 'Acceleration', 'Equations of Motion', 'Graphs', 'Motion in Plane', 'Projectile Motion', 'Circular Motion'], 2) },
                { id: 'p11-3', name: 'Laws of Motion', topics: t(['Newton First Law', 'Newton Second Law', 'Newton Third Law', 'Momentum', 'Impulse', 'Friction', 'Circular Motion Dynamics'], 2) },
                { id: 'p11-4', name: 'Work Energy Power', topics: t(['Work', 'Kinetic Energy', 'Work-Energy Theorem', 'Potential Energy', 'Conservation of Energy', 'Power', 'Collisions'], 2) },
                { id: 'p11-5', name: 'Rotational Motion', topics: t(['Centre of Mass', 'Torque', 'Angular Momentum', 'Moment of Inertia', 'Perpendicular Axis Theorem', 'Parallel Axis Theorem', 'Rolling Motion'], 2.5) },
                { id: 'p11-6', name: 'Gravitation', topics: t(['Universal Gravitation', 'Acceleration due to Gravity', 'Gravitational Potential Energy', 'Escape Velocity', 'Satellites', 'Kepler Laws'], 2) },
                { id: 'p11-7', name: 'Properties of Matter', topics: t(['Elasticity', 'Stress and Strain', 'Hooke Law', 'Fluid Pressure', 'Pascal Law', 'Archimedes Principle', 'Surface Tension', 'Viscosity'], 2) },
                { id: 'p11-8', name: 'Thermodynamics', topics: t(['Temperature', 'Heat', 'Thermal Expansion', 'Calorimetry', 'Heat Transfer', 'First Law', 'Thermodynamic Processes', 'Heat Engines', 'Second Law'], 2.5) },
                { id: 'p11-9', name: 'Kinetic Theory', topics: t(['Molecular Theory', 'Gas Laws', 'Kinetic Theory of Gases', 'Degrees of Freedom', 'Equipartition of Energy', 'Mean Free Path'], 2) },
                { id: 'p11-10', name: 'Oscillations and Waves', topics: t(['Periodic Motion', 'SHM', 'Energy in SHM', 'Pendulum', 'Damped Oscillations', 'Forced Oscillations', 'Wave Motion', 'Superposition', 'Standing Waves', 'Beats', 'Doppler Effect'], 2.5) },
              ],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [
                { id: 'c11-1', name: 'Basic Concepts', topics: t(['Matter', 'Laws of Chemical Combination', 'Dalton Theory', 'Atomic Mass', 'Mole Concept', 'Stoichiometry', 'Limiting Reagent'], 2) },
                { id: 'c11-2', name: 'Atomic Structure', topics: t(['Subatomic Particles', 'Thomson Model', 'Rutherford Model', 'Bohr Model', 'Quantum Numbers', 'Orbitals', 'Electronic Configuration'], 2.5) },
                { id: 'c11-3', name: 'Periodic Table', topics: t(['Periodic Law', 'Electronic Configuration', 'Atomic Radius', 'Ionization Energy', 'Electron Affinity', 'Electronegativity'], 2) },
                { id: 'c11-4', name: 'Chemical Bonding', topics: t(['Ionic Bond', 'Covalent Bond', 'Lewis Structures', 'VSEPR Theory', 'Valence Bond Theory', 'Hybridization sp sp2 sp3', 'Molecular Orbital Theory', 'Hydrogen Bonding'], 2.5) },
                { id: 'c11-5', name: 'States of Matter', topics: t(['Gaseous State', 'Gas Laws', 'Ideal Gas Equation', 'Kinetic Theory', 'Real Gases', 'Liquid State'], 2) },
                { id: 'c11-6', name: 'Thermodynamics', topics: t(['System and Surroundings', 'Internal Energy', 'First Law', 'Enthalpy', 'Hess Law', 'Spontaneity', 'Gibbs Energy'], 2.5) },
                { id: 'c11-7', name: 'Equilibrium', topics: t(['Physical Equilibrium', 'Chemical Equilibrium', 'Equilibrium Constant', 'Le Chatelier Principle', 'Ionic Equilibrium', 'pH', 'Buffer Solutions'], 2.5) },
                { id: 'c11-8', name: 'Redox Reactions', topics: t(['Oxidation Number', 'Balancing Redox Reactions', 'Redox Titrations'], 2) },
                { id: 'c11-9', name: 's-Block Elements', topics: t(['Alkali Metals', 'Alkaline Earth Metals', 'Properties', 'Compounds'], 2) },
                { id: 'c11-10', name: 'p-Block Elements', topics: t(['Group 13 Elements', 'Group 14 Elements', 'Properties', 'Compounds'], 2) },
                { id: 'c11-11', name: 'Organic Chemistry Basics', topics: t(['Classification', 'Nomenclature', 'Isomerism', 'Purification Methods', 'Qualitative Analysis'], 2.5) },
                { id: 'c11-12', name: 'Hydrocarbons', topics: t(['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic Hydrocarbons', 'Benzene', 'Reactions'], 2.5) },
                { id: 'c11-13', name: 'Environmental Chemistry', topics: t(['Air Pollution', 'Water Pollution', 'Soil Pollution', 'Green Chemistry'], 1.5) },
              ],
            },
            {
              id: 'biology',
              name: 'Biology',
              chapters: [
                { id: 'b11-1', name: 'The Living World', topics: t(['What is Living', 'Diversity', 'Taxonomic Categories', 'Taxonomic Hierarchy', 'Nomenclature'], 1.5) },
                { id: 'b11-2', name: 'Biological Classification', topics: t(['Kingdom Monera', 'Kingdom Protista', 'Kingdom Fungi', 'Kingdom Plantae', 'Kingdom Animalia', 'Viruses'], 2.5) },
                { id: 'b11-3', name: 'Plant Kingdom', topics: t(['Algae', 'Bryophytes', 'Pteridophytes', 'Gymnosperms', 'Angiosperms'], 2.5) },
                { id: 'b11-4', name: 'Animal Kingdom', topics: t(['Basis of Classification', 'Porifera', 'Coelenterata', 'Platyhelminthes', 'Nematoda', 'Annelida', 'Arthropoda', 'Mollusca', 'Echinodermata', 'Chordata'], 3) },
                { id: 'b11-5', name: 'Morphology of Flowering Plants', topics: t(['Root', 'Stem', 'Leaf', 'Inflorescence', 'Flower', 'Fruit', 'Seed'], 2.5) },
                { id: 'b11-6', name: 'Anatomy of Flowering Plants', topics: t(['Tissues', 'Tissue Systems', 'Anatomy of Dicot and Monocot', 'Secondary Growth'], 2.5) },
                { id: 'b11-7', name: 'Cell The Unit of Life', topics: t(['Cell Theory', 'Prokaryotic and Eukaryotic Cells', 'Cell Membrane', 'Cell Wall', 'Cell Organelles', 'Nucleus'], 3) },
                { id: 'b11-8', name: 'Biomolecules', topics: t(['Carbohydrates', 'Proteins', 'Amino Acids', 'Nucleic Acids', 'Enzymes'], 2.5) },
                { id: 'b11-9', name: 'Cell Cycle', topics: t(['Cell Cycle', 'Mitosis', 'Meiosis'], 2.5) },
                { id: 'b11-10', name: 'Transport in Plants', topics: t(['Means of Transport', 'Plant Water Relations', 'Long Distance Transport', 'Transpiration', 'Mineral Uptake'], 2.5) },
                { id: 'b11-11', name: 'Mineral Nutrition', topics: t(['Essential Minerals', 'Macro and Micro Nutrients', 'Nitrogen Metabolism', 'Nitrogen Fixation'], 2) },
                { id: 'b11-12', name: 'Photosynthesis', topics: t(['Photosynthesis in Higher Plants', 'Light Reaction', 'Dark Reaction', 'C3 C4 CAM Pathways'], 2.5) },
                { id: 'b11-13', name: 'Respiration', topics: t(['Glycolysis', 'Krebs Cycle', 'Electron Transport Chain', 'Fermentation'], 2.5) },
                { id: 'b11-14', name: 'Plant Growth', topics: t(['Growth', 'Differentiation', 'Development', 'Plant Growth Regulators', 'Photoperiodism', 'Vernalization'], 2) },
              ],
            },
            {
              id: 'english',
              name: 'English',
              chapters: [
                { id: 'e11-1', name: 'Reading', topics: t(['Comprehension', 'Note Making', 'Summary'], 2) },
                { id: 'e11-2', name: 'Writing', topics: t(['Notice', 'Poster', 'Formal Letter', 'Informal Letter', 'Article', 'Report', 'Debate', 'Speech'], 1.5) },
                { id: 'e11-3', name: 'Grammar', topics: t(['Tenses', 'Modals', 'Voice', 'Speech', 'Editing'], 1.5) },
                { id: 'e11-4', name: 'Literature', topics: t(['Prose Chapter 1', 'Prose Chapter 2', 'Prose Chapter 3', 'Poetry 1', 'Poetry 2', 'Poetry 3'], 2) },
              ],
            },
          ],
        },
        // ==================== COMMERCE STREAM ====================
        {
          id: 'commerce',
          name: 'Commerce',
          description: 'Accountancy, Business Studies, Economics',
          subjects: [
            {
              id: 'accountancy',
              name: 'Accountancy',
              chapters: [
                { id: 'a11-1', name: 'Accounting Theory', topics: t(['Introduction to Accounting', 'Objectives', 'Advantages', 'Limitations', 'Types of Accounts', 'Real Accounts', 'Personal Accounts', 'Nominal Accounts', 'Accounting Concepts', 'Business Entity', 'Money Measurement', 'Going Concern', 'Accounting Period', 'Matching Concept', 'Realization Concept', 'Dual Aspect', 'Accounting Conventions', 'Consistency', 'Conservatism', 'Materiality', 'Full Disclosure', 'GAAP', 'Accounting Standards'], 1.5) },
                { id: 'a11-2', name: 'Recording Transactions I', topics: t(['Source Documents', 'Vouchers', 'Journal', 'Types of Journal Entries', 'Opening Entry', 'Transfer Entry', 'Closing Entry', 'Rectification Entry', 'Compound Entry', 'Ledger Posting', 'Balancing Ledger', 'Trial Balance', 'Objectives', 'Methods of Preparation'], 2) },
                { id: 'a11-3', name: 'Recording Transactions II', topics: t(['Cash Book', 'Simple Cash Book', 'Two Column Cash Book', 'Three Column Cash Book', 'Petty Cash Book', 'Purchase Book', 'Sales Book', 'Purchase Return Book', 'Sales Return Book', 'Bills Receivable Book', 'Bills Payable Book', 'Journal Proper'], 2.5) },
                { id: 'a11-4', name: 'Bank Reconciliation Statement', topics: t(['Need for BRS', 'Causes of Difference', 'Cheques Issued but not Presented', 'Cheques Deposited but not Collected', 'Bank Charges', 'Direct Deposits', 'Interest Credited', 'Dishonor of Bills', 'Preparation of BRS', 'Adjusted Cash Book Method', 'Problems on BRS'], 2) },
                { id: 'a11-5', name: 'Depreciation', topics: t(['Concept of Depreciation', 'Causes of Depreciation', 'Physical Deterioration', 'Obsolescence', 'Time Factor', 'Depletion', 'Methods of Depreciation', 'Straight Line Method', 'Written Down Value Method', 'Comparison of Methods', 'Accounting Treatment', 'Recording in Books', 'Disposal of Assets', 'Sale of Asset', 'Exchange of Asset'], 2.5) },
                { id: 'a11-6', name: 'Inventory Valuation', topics: t(['Meaning of Inventory', 'Types of Inventory', 'Methods of Valuation', 'FIFO Method', 'LIFO Method', 'Weighted Average Method', 'Simple Average Method', 'Comparison of Methods', 'Effect on Profit'], 2) },
                { id: 'a11-7', name: 'Bills of Exchange', topics: t(['Introduction to Negotiable Instruments', 'Promissory Note', 'Bills of Exchange', 'Parties to Bill', 'Drawer Drawee Payee', 'Acceptance of Bill', 'Endorsement', 'Types of Endorsement', 'Dishonor of Bill', 'Noting Charges', 'Renewal of Bill', 'Retirement of Bill', 'Rebate Calculation', 'Insolvency of Drawer', 'Insolvency of Acceptor', 'Accommodation Bills'], 3) },
                { id: 'a11-8', name: 'Trial Balance and Rectification of Errors', topics: t(['Meaning of Trial Balance', 'Objectives', 'Methods of Preparation', 'Totals Method', 'Balance Method', 'Types of Errors', 'Errors of Omission', 'Errors of Commission', 'Errors of Principle', 'Compensating Errors', 'One Sided Errors', 'Two Sided Errors', 'Rectification Before Trial Balance', 'Rectification After Trial Balance', 'Suspense Account', 'Closing Suspense Account'], 2.5) },
                { id: 'a11-9', name: 'Financial Statements I', topics: t(['Meaning of Financial Statements', 'Objectives', 'Users of Financial Statements', 'Trading Account', 'Gross Profit', 'Gross Loss', 'Profit and Loss Account', 'Net Profit', 'Net Loss', 'Revenue vs Capital Items'], 2.5) },
                { id: 'a11-10', name: 'Financial Statements II', topics: t(['Balance Sheet', 'Assets Classification', 'Fixed Assets', 'Current Assets', 'Liabilities Classification', 'Long Term Liabilities', 'Current Liabilities', 'Marshalling of Assets', 'Marshalling of Liabilities', 'Adjustments in Final Accounts', 'Closing Stock', 'Outstanding Expenses', 'Prepaid Expenses', 'Accrued Income', 'Income Received in Advance', 'Depreciation', 'Bad Debts', 'Provision for Doubtful Debts', 'Interest on Capital', 'Interest on Drawings'], 3) },
              ],
            },
            {
              id: 'business-studies',
              name: 'Business Studies',
              chapters: [
                { id: 'bs11-1', name: 'Nature and Purpose of Business', topics: t(['Concept of Business', 'Characteristics of Business', 'Economic Activity', 'Production of Goods', 'Exchange of Goods', 'Regularity', 'Profit Motive', 'Risk and Uncertainty', 'Objectives of Business', 'Economic Objectives', 'Social Objectives', 'Human Objectives', 'National Objectives', 'Comparison with Profession', 'Comparison with Employment'], 2) },
                { id: 'bs11-2', name: 'Classification of Business Activities', topics: t(['Industry Concept', 'Primary Industry', 'Extractive Industry', 'Genetic Industry', 'Secondary Industry', 'Manufacturing Industry', 'Construction Industry', 'Tertiary Industry', 'Service Industry', 'Commerce', 'Trade', 'Internal Trade', 'External Trade', 'Wholesale Trade', 'Retail Trade', 'Aids to Trade', 'Transportation', 'Warehousing', 'Insurance', 'Banking', 'Advertising', 'Communication'], 2.5) },
                { id: 'bs11-3', name: 'Forms of Business Organization', topics: t(['Sole Proprietorship Features', 'Formation', 'Advantages', 'Limitations', 'Suitability', 'Joint Hindu Family Business', 'Features of HUF', 'Karta and Coparceners', 'Partnership Concept', 'Partnership Deed', 'Types of Partners', 'Active Partner', 'Sleeping Partner', 'Nominal Partner', 'Minor Partner', 'Rights of Partners', 'Duties of Partners', 'Registration of Partnership', 'Advantages', 'Limitations', 'Cooperative Society', 'Principles', 'Types of Cooperative', 'Consumer Cooperative', 'Producer Cooperative', 'Marketing Cooperative', 'Credit Cooperative', 'Housing Cooperative', 'Company Form', 'Characteristics', 'Private Company', 'Public Company', 'Comparison'], 3.5) },
                { id: 'bs11-4', name: 'Public Private and Global Enterprises', topics: t(['Public Sector Enterprises', 'Role and Importance', 'Departmental Undertaking', 'Features', 'Advantages', 'Limitations', 'Statutory Corporation', 'Features', 'Examples', 'Government Company', 'Features', 'Examples', 'Changing Role of Public Sector', 'Privatization', 'Disinvestment', 'Private Sector Role', 'Importance', 'Joint Sector Concept', 'PPP Model', 'Global Enterprises', 'MNCs Features', 'Benefits', 'Concerns', 'Joint Ventures'], 3) },
                { id: 'bs11-5', name: 'Business Services - Banking', topics: t(['Banking Services', 'Functions of Commercial Banks', 'Primary Functions', 'Accepting Deposits', 'Savings Account', 'Current Account', 'Fixed Deposit', 'Recurring Deposit', 'Advancing Loans', 'Cash Credit', 'Overdraft', 'Term Loans', 'Secondary Functions', 'Agency Functions', 'Transfer of Funds', 'Collection of Bills', 'General Utility Services', 'Locker Facility', 'Travellers Cheques', 'E-Banking', 'ATM', 'Internet Banking', 'Mobile Banking', 'NEFT RTGS IMPS', 'UPI'], 3) },
                { id: 'bs11-6', name: 'Business Services - Insurance', topics: t(['Insurance Principles', 'Utmost Good Faith', 'Insurable Interest', 'Indemnity', 'Subrogation', 'Contribution', 'Causa Proxima', 'Mitigation of Loss', 'Types of Insurance', 'Life Insurance', 'Term Insurance', 'Endowment Policy', 'Whole Life Policy', 'Money Back Policy', 'General Insurance', 'Fire Insurance', 'Marine Insurance', 'Motor Insurance', 'Health Insurance', 'Benefits of Insurance', 'Difference Life and General Insurance'], 3) },
                { id: 'bs11-7', name: 'Business Services - Others', topics: t(['Transportation Services', 'Importance', 'Railways Features', 'Advantages', 'Roadways Features', 'Airways Features', 'Waterways Features', 'Pipelines', 'Choosing Mode of Transport', 'Warehousing', 'Functions of Warehouse', 'Types of Warehouses', 'Private Warehouse', 'Public Warehouse', 'Government Warehouse', 'Bonded Warehouse', 'Communication Services', 'Postal Services', 'Courier Services', 'Telecom Services', 'Internet Services'], 2.5) },
                { id: 'bs11-8', name: 'Emerging Modes of Business', topics: t(['E-Business Concept', 'Scope of E-Business', 'Benefits of E-Business', 'E-Business vs Traditional Business', 'Resources Required', 'E-Commerce', 'Online Trading', 'Online Shopping', 'Online Booking', 'Outsourcing', 'Meaning', 'Reasons', 'Benefits', 'Concerns', 'BPO Industry', 'Types of BPO', 'Call Centers', 'KPO Industry', 'Difference BPO and KPO'], 2.5) },
                { id: 'bs11-9', name: 'Social Responsibility and Business Ethics', topics: t(['Concept of Social Responsibility', 'Case For Social Responsibility', 'Case Against Social Responsibility', 'Responsibility towards Owners', 'Responsibility towards Employees', 'Fair Wages', 'Good Working Conditions', 'Responsibility towards Consumers', 'Quality Products', 'Fair Prices', 'Honest Advertising', 'Responsibility towards Government', 'Tax Payment', 'Law Compliance', 'Responsibility towards Society', 'Employment Generation', 'Environment Protection', 'Community Development', 'Business Ethics Concept', 'Elements of Business Ethics', 'Honesty', 'Fairness', 'Respect', 'Transparency'], 2.5) },
                { id: 'bs11-10', name: 'Sources of Business Finance', topics: t(['Meaning of Business Finance', 'Classification of Sources', 'On the Basis of Period', 'On the Basis of Ownership', 'Owner Funds', 'Equity Shares', 'Retained Earnings', 'Borrowed Funds', 'Preference Shares', 'Debentures', 'Bonds', 'Loans from Banks', 'Term Loans', 'Cash Credit', 'Public Deposits', 'Trade Credit', 'Factoring', 'Lease Financing', 'Hire Purchase', 'Venture Capital'], 3) },
              ],
            },
            {
              id: 'economics',
              name: 'Economics',
              chapters: [
                { id: 'ec11-1', name: 'Introduction to Economics', topics: t(['What is Economics', 'Adam Smith Definition', 'Alfred Marshall Definition', 'Lionel Robbins Definition', 'Scope of Economics', 'Microeconomics', 'Macroeconomics', 'Difference Micro and Macro', 'Positive Economics', 'Normative Economics', 'Central Problems of Economy', 'What to Produce', 'How to Produce', 'For Whom to Produce', 'Production Possibility Curve', 'Assumptions', 'Properties', 'Shifts in PPC', 'Opportunity Cost', 'Marginal Opportunity Cost', 'Economic Systems', 'Capitalist Economy', 'Socialist Economy', 'Mixed Economy'], 3) },
                { id: 'ec11-2', name: 'Consumer Equilibrium', topics: t(['Utility Concept', 'Total Utility', 'Marginal Utility', 'Relationship TU and MU', 'Law of Diminishing Marginal Utility', 'Assumptions', 'Exceptions', 'Consumer Equilibrium Meaning', 'Conditions of Equilibrium', 'One Commodity Case', 'Two Commodity Case', 'Indifference Curve', 'Meaning', 'Properties of IC', 'Negative Slope', 'Convex to Origin', 'Higher IC Higher Satisfaction', 'Cannot Intersect', 'Marginal Rate of Substitution', 'Diminishing MRS', 'Budget Line', 'Slope of Budget Line', 'Shifts in Budget Line', 'Income Change', 'Price Change', 'Consumer Equilibrium with IC', 'Condition MRS equals Price Ratio', 'Effects of Changes', 'Price Effect', 'Income Effect', 'Substitution Effect'], 3.5) },
                { id: 'ec11-3', name: 'Demand', topics: t(['Demand Concept', 'Demand vs Desire', 'Demand vs Quantity Demanded', 'Demand Function', 'Law of Demand', 'Assumptions', 'Exceptions', 'Giffen Goods', 'Veblen Effect', 'Determinants of Demand', 'Price of Commodity', 'Price of Related Goods', 'Substitutes', 'Complements', 'Income of Consumer', 'Normal Goods', 'Inferior Goods', 'Tastes and Preferences', 'Expectations', 'Population', 'Individual Demand', 'Market Demand', 'Movement Along Demand Curve', 'Shift in Demand Curve', 'Increase in Demand', 'Decrease in Demand', 'Elasticity of Demand', 'Price Elasticity', 'Perfectly Elastic', 'Perfectly Inelastic', 'Unit Elastic', 'More than Unit Elastic', 'Less than Unit Elastic', 'Methods of Measurement', 'Percentage Method', 'Total Expenditure Method', 'Geometric Method', 'Income Elasticity', 'Cross Elasticity', 'Factors Affecting Price Elasticity', 'Nature of Commodity', 'Availability of Substitutes', 'Number of Uses', 'Postponement'], 4) },
                { id: 'ec11-4', name: 'Production and Costs', topics: t(['Production Function', 'Short Run', 'Long Run', 'Fixed Factor', 'Variable Factor', 'Total Product', 'Average Product', 'Marginal Product', 'Relationship TP AP MP', 'Law of Variable Proportions', 'Assumptions', 'Three Stages', 'Stage 1 Increasing Returns', 'Stage 2 Diminishing Returns', 'Stage 3 Negative Returns', 'Reasons for Stages', 'Returns to Scale', 'Increasing Returns to Scale', 'Reasons', 'Constant Returns to Scale', 'Decreasing Returns to Scale', 'Reasons', 'Cost Concepts', 'Money Cost', 'Real Cost', 'Opportunity Cost', 'Fixed Cost', 'Variable Cost', 'Total Cost', 'Average Fixed Cost', 'Average Variable Cost', 'Average Total Cost', 'Marginal Cost', 'Short Run Cost Curves', 'Shapes of Cost Curves', 'Relationship AC and MC', 'Long Run Cost Curves', 'Economies of Scale', 'Diseconomies of Scale'], 4) },
                { id: 'ec11-5', name: 'Supply', topics: t(['Supply Concept', 'Supply vs Stock', 'Supply Function', 'Law of Supply', 'Assumptions', 'Exceptions', 'Determinants of Supply', 'Price of Commodity', 'Price of Other Goods', 'Price of Factors', 'Technology', 'Government Policies', 'Taxes', 'Subsidies', 'Goals of Firm', 'Individual Supply', 'Market Supply', 'Movement Along Supply Curve', 'Shift in Supply Curve', 'Increase in Supply', 'Decrease in Supply', 'Elasticity of Supply', 'Price Elasticity of Supply', 'Perfectly Elastic', 'Perfectly Inelastic', 'Unit Elastic', 'More than Unit Elastic', 'Less than Unit Elastic', 'Methods of Measurement', 'Factors Affecting Elasticity', 'Time Period', 'Nature of Commodity', 'Stock vs Supply'], 3) },
                { id: 'ec11-6', name: 'Forms of Market and Price Determination', topics: t(['Market Concept', 'Types of Markets', 'On Basis of Area', 'On Basis of Time', 'On Basis of Competition', 'Perfect Competition', 'Features', 'Large Number of Buyers and Sellers', 'Homogeneous Product', 'Free Entry and Exit', 'Perfect Knowledge', 'Perfect Mobility', 'Price Determination', 'Equilibrium Price', 'Market Demand', 'Market Supply', 'Effects of Shifts in Demand', 'Increase in Demand', 'Decrease in Demand', 'Effects of Shifts in Supply', 'Increase in Supply', 'Decrease in Supply', 'Simultaneous Changes', 'Monopoly Concept', 'Characteristics', 'Single Seller', 'No Close Substitutes', 'Barriers to Entry', 'Price Maker', 'Price Discrimination', 'Monopolistic Competition', 'Features', 'Product Differentiation', 'Oligopoly', 'Features', 'Few Sellers', 'Interdependence', 'Simple Applications'], 3.5) },
                { id: 'ec11-7', name: 'Revenue Concepts', topics: t(['Total Revenue', 'Average Revenue', 'Marginal Revenue', 'Relationship AR and MR', 'Revenue under Perfect Competition', 'AR equals MR equals Price', 'Revenue under Imperfect Competition', 'MR less than AR', 'Revenue Curves'], 2) },
              ],
            },
            {
              id: 'mathematics',
              name: 'Mathematics',
              chapters: [
                { id: 'mc11-1', name: 'Sets Relations Functions', topics: t(['Set Representations', 'Roster Form', 'Set Builder Form', 'Types of Sets', 'Empty Set', 'Finite and Infinite', 'Equal Sets', 'Subset', 'Universal Set', 'Power Set', 'Venn Diagrams', 'Set Operations', 'Union', 'Intersection', 'Difference', 'Complement', 'Relations', 'Domain Range', 'Functions', 'Types of Functions'], 2.5) },
                { id: 'mc11-2', name: 'Algebra', topics: t(['Linear Equations', 'Two Variables', 'Three Variables', 'Quadratic Equations', 'Solving Methods', 'Factorization', 'Formula Method', 'Applications in Business'], 2) },
                { id: 'mc11-3', name: 'Sequences and Series', topics: t(['Arithmetic Progression', 'nth Term', 'Sum of n Terms', 'Geometric Progression', 'nth Term of GP', 'Sum of n Terms', 'Arithmetic Mean', 'Geometric Mean', 'Applications in Finance', 'Compound Interest', 'Installments'], 2.5) },
                { id: 'mc11-4', name: 'Permutations and Combinations', topics: t(['Fundamental Principle of Counting', 'Addition Principle', 'Multiplication Principle', 'Permutations', 'nPr Formula', 'Permutations with Repetition', 'Circular Permutations', 'Combinations', 'nCr Formula', 'Properties', 'Business Applications', 'Selection Problems'], 3) },
                { id: 'mc11-5', name: 'Statistics for Economics', topics: t(['Meaning of Statistics', 'Functions', 'Limitations', 'Collection of Data', 'Primary Data', 'Secondary Data', 'Presentation of Data', 'Tabulation', 'Frequency Distribution', 'Graphical Representation', 'Bar Diagrams', 'Pie Charts', 'Histogram', 'Frequency Polygon', 'Ogives', 'Measures of Central Tendency', 'Mean', 'Median', 'Mode', 'Measures of Dispersion', 'Range', 'Quartile Deviation', 'Mean Deviation', 'Standard Deviation', 'Variance', 'Coefficient of Variation', 'Correlation', 'Scatter Diagram', 'Karl Pearson Coefficient', 'Spearman Rank Correlation'], 4) },
                { id: 'mc11-6', name: 'Probability', topics: t(['Random Experiments', 'Sample Space', 'Events', 'Types of Events', 'Impossible Event', 'Sure Event', 'Simple Event', 'Compound Event', 'Mutually Exclusive', 'Exhaustive Events', 'Probability Definition', 'Classical Approach', 'Frequency Approach', 'Axiomatic Approach', 'Addition Theorem', 'Mutually Exclusive Events', 'Not Mutually Exclusive', 'Multiplication Theorem', 'Independent Events', 'Dependent Events', 'Conditional Probability', 'Applications in Business'], 3) },
                { id: 'mc11-7', name: 'Mathematics in Business', topics: t(['Simple Interest', 'Compound Interest', 'Annuities', 'Present Value', 'Future Value', 'EMI Calculation', 'Depreciation', 'Break Even Analysis', 'Linear Programming Introduction'], 2.5) },
              ],
            },
            {
              id: 'english',
              name: 'English',
              chapters: [
                { id: 'ec11-1', name: 'Reading Skills', topics: t(['Comprehension Passages', 'Factual Passages', 'Discursive Passages', 'Literary Passages', 'Note Making Techniques', 'Abbreviations', 'Symbols', 'Summary Writing'], 2.5) },
                { id: 'ec11-2', name: 'Business Writing Skills', topics: t(['Notice Writing Format', 'School Notice', 'Office Notice', 'Poster Making', 'Commercial Poster', 'Social Issue Poster', 'Advertisement Writing', 'Classified Ad', 'Display Ad', 'Formal Letter Business', 'Letter of Inquiry', 'Letter of Complaint', 'Letter of Order', 'Letter to Editor', 'Job Application Letter', 'Resume Writing', 'Article Writing', 'Debate Writing', 'Speech Writing', 'Report Writing'], 3) },
                { id: 'ec11-3', name: 'Grammar', topics: t(['Tenses', 'Present Tense', 'Past Tense', 'Future Tense', 'Modals', 'Can Could', 'May Might', 'Shall Should', 'Will Would', 'Must', 'Determiners', 'Articles', 'Demonstratives', 'Possessives', 'Active Passive Voice', 'Rules', 'Direct Indirect Speech', 'Statements', 'Questions', 'Commands', 'Sentence Reordering', 'Error Correction', 'Gap Filling', 'Omission', 'Editing'], 3) },
                { id: 'ec11-4', name: 'Literature', topics: t(['Prose Analysis', 'The Portrait of a Lady', 'We Are Not Afraid to Die', 'Discovering Tut', 'Landscape of the Soul', 'The Ailing Planet', 'Poetry Analysis', 'A Photograph', 'The Voice of the Rain', 'Childhood', 'Father to Son', 'Supplementary Reader Chapters'], 2.5) },
              ],
            },
          ],
        },
        // ==================== HUMANITIES STREAM ====================
        {
          id: 'humanities',
          name: 'Arts/Humanities',
          description: 'History, Political Science, Geography, Psychology',
          subjects: [
            {
              id: 'history',
              name: 'History',
              chapters: [
                { id: 'h11-1', name: 'Early Societies', topics: t(['Hunter Gatherers', 'Early Cities', 'Writing and Civilization'], 2) },
                { id: 'h11-2', name: 'Empires', topics: t(['Islamic Lands', 'Nomadic Empires', 'Medieval Europe'], 2.5) },
                { id: 'h11-3', name: 'Changing Cultural Traditions', topics: t(['Renaissance', 'Reformation'], 2) },
              ],
            },
            {
              id: 'political-science',
              name: 'Political Science',
              chapters: [
                { id: 'ps11-1', name: 'Constitution', topics: t(['Why and How', 'Rights', 'Elections'], 2.5) },
                { id: 'ps11-2', name: 'Legislature', topics: t(['Parliament', 'Executive', 'Judiciary'], 2.5) },
              ],
            },
            {
              id: 'geography',
              name: 'Geography',
              chapters: [
                { id: 'g11-1', name: 'Physical Geography', topics: t(['Geography as Discipline', 'Origin of Earth', 'Interior of Earth', 'Landforms'], 2.5) },
                { id: 'g11-2', name: 'Climate', topics: t(['Atmosphere', 'Temperature', 'Pressure', 'Winds'], 2) },
              ],
            },
            {
              id: 'psychology',
              name: 'Psychology',
              chapters: [
                { id: 'psy11-1', name: 'Introduction', topics: t(['What is Psychology', 'Methods', 'Branches'], 2) },
                { id: 'psy11-2', name: 'Cognitive Processes', topics: t(['Attention', 'Perception', 'Learning', 'Memory'], 2.5) },
              ],
            },
            {
              id: 'english',
              name: 'English',
              chapters: [
                { id: 'eh11-1', name: 'Literature and Writing', topics: t(['Prose', 'Poetry', 'Writing Skills'], 2) },
              ],
            },
          ],
        },
      ],
      // ==================== CLASS 12 - ALL STREAMS ====================
      '12': [
        {
          id: 'pcm',
          name: 'Science - PCM',
          description: 'Physics, Chemistry, Mathematics',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [
                { id: 'p12-1', name: 'Electric Charges and Fields', topics: t(['Electric Charge', 'Coulomb Law', 'Electric Field', 'Electric Flux', 'Gauss Law'], 2.5) },
                { id: 'p12-2', name: 'Electrostatic Potential', topics: t(['Potential', 'Potential Difference', 'Capacitance', 'Capacitors'], 2.5) },
                { id: 'p12-3', name: 'Current Electricity', topics: t(['Electric Current', 'Ohm Law', 'Resistance', 'Kirchhoff Laws', 'Wheatstone Bridge'], 2.5) },
                { id: 'p12-4', name: 'Magnetism', topics: t(['Magnetic Force', 'Biot-Savart Law', 'Ampere Law', 'Moving Charges'], 2.5) },
                { id: 'p12-5', name: 'Electromagnetic Induction', topics: t(['Magnetic Flux', 'Faraday Law', 'Lenz Law', 'Self and Mutual Inductance'], 2.5) },
                { id: 'p12-6', name: 'AC Circuits', topics: t(['AC Voltage', 'LCR Circuit', 'Resonance', 'Transformer'], 2.5) },
                { id: 'p12-7', name: 'EM Waves', topics: t(['Displacement Current', 'EM Waves', 'EM Spectrum'], 2) },
                { id: 'p12-8', name: 'Ray Optics', topics: t(['Reflection', 'Refraction', 'TIR', 'Lenses', 'Optical Instruments'], 2.5) },
                { id: 'p12-9', name: 'Wave Optics', topics: t(['Huygens Principle', 'Interference', 'Diffraction', 'Polarization'], 2.5) },
                { id: 'p12-10', name: 'Dual Nature', topics: t(['Photoelectric Effect', 'Matter Waves'], 2) },
                { id: 'p12-11', name: 'Atoms and Nuclei', topics: t(['Atomic Models', 'Bohr Model', 'Radioactivity', 'Nuclear Reactions'], 2.5) },
                { id: 'p12-12', name: 'Semiconductors', topics: t(['Semiconductors', 'pn Junction', 'Diode', 'Transistor', 'Logic Gates'], 2.5) },
              ],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [
                { id: 'c12-1', name: 'Solid State', topics: t(['Classification', 'Crystal Lattices', 'Packing', 'Defects'], 2.5) },
                { id: 'c12-2', name: 'Solutions', topics: t(['Concentration Terms', 'Solubility', 'Colligative Properties'], 2.5) },
                { id: 'c12-3', name: 'Electrochemistry', topics: t(['Electrochemical Cells', 'Nernst Equation', 'Conductance', 'Electrolysis'], 2.5) },
                { id: 'c12-4', name: 'Chemical Kinetics', topics: t(['Rate of Reaction', 'Order', 'Collision Theory'], 2) },
                { id: 'c12-5', name: 'Surface Chemistry', topics: t(['Adsorption', 'Catalysis', 'Colloids'], 2) },
                { id: 'c12-6', name: 'p-Block Elements', topics: t(['Group 15', 'Group 16', 'Group 17', 'Group 18'], 2.5) },
                { id: 'c12-7', name: 'd and f Block', topics: t(['Transition Elements', 'Inner Transition Elements'], 2) },
                { id: 'c12-8', name: 'Coordination Compounds', topics: t(['Werner Theory', 'Nomenclature', 'Isomerism', 'Bonding'], 2.5) },
                { id: 'c12-9', name: 'Haloalkanes', topics: t(['Classification', 'Nomenclature', 'Reactions'], 2) },
                { id: 'c12-10', name: 'Alcohols Phenols Ethers', topics: t(['Alcohols', 'Phenols', 'Ethers', 'Reactions'], 2.5) },
                { id: 'c12-11', name: 'Aldehydes Ketones', topics: t(['Nomenclature', 'Preparation', 'Reactions'], 2.5) },
                { id: 'c12-12', name: 'Carboxylic Acids', topics: t(['Nomenclature', 'Preparation', 'Reactions'], 2) },
                { id: 'c12-13', name: 'Amines', topics: t(['Classification', 'Preparation', 'Properties'], 2) },
                { id: 'c12-14', name: 'Biomolecules', topics: t(['Carbohydrates', 'Proteins', 'Vitamins', 'Nucleic Acids'], 2.5) },
                { id: 'c12-15', name: 'Polymers', topics: t(['Classification', 'Polymerization', 'Important Polymers'], 2) },
              ],
            },
            {
              id: 'mathematics',
              name: 'Mathematics',
              chapters: [
                { id: 'm12-1', name: 'Relations Functions', topics: t(['Types of Relations', 'Types of Functions', 'Composition', 'Inverse'], 2) },
                { id: 'm12-2', name: 'Inverse Trig Functions', topics: t(['Basic Concepts', 'Properties'], 2) },
                { id: 'm12-3', name: 'Matrices', topics: t(['Types', 'Operations', 'Transpose', 'Inverse'], 2.5) },
                { id: 'm12-4', name: 'Determinants', topics: t(['Properties', 'Minors Cofactors', 'Applications'], 2.5) },
                { id: 'm12-5', name: 'Continuity Differentiability', topics: t(['Continuity', 'Differentiability', 'Chain Rule', 'Derivative of Inverse Trig'], 3) },
                { id: 'm12-6', name: 'Application of Derivatives', topics: t(['Rate of Change', 'Increasing Decreasing', 'Maxima Minima'], 2.5) },
                { id: 'm12-7', name: 'Integrals', topics: t(['Antiderivative', 'Integration Methods', 'Definite Integrals', 'Properties'], 3) },
                { id: 'm12-8', name: 'Application of Integrals', topics: t(['Area under Curves', 'Area between Curves'], 2) },
                { id: 'm12-9', name: 'Differential Equations', topics: t(['Basic Concepts', 'Formation', 'Methods of Solving'], 2.5) },
                { id: 'm12-10', name: 'Vector Algebra', topics: t(['Vectors', 'Operations', 'Scalar Product', 'Vector Product'], 2.5) },
                { id: 'm12-11', name: '3D Geometry', topics: t(['Direction Cosines', 'Equation of Line', 'Equation of Plane'], 2.5) },
                { id: 'm12-12', name: 'Linear Programming', topics: t(['Introduction', 'Formulation', 'Graphical Method'], 2) },
                { id: 'm12-13', name: 'Probability', topics: t(['Conditional Probability', 'Multiplication Theorem', 'Bayes Theorem', 'Random Variables'], 2.5) },
              ],
            },
            {
              id: 'english',
              name: 'English',
              chapters: [
                { id: 'e12-1', name: 'Advanced Reading Writing', topics: t(['Comprehension', 'Writing Skills', 'Grammar'], 2) },
              ],
            },
          ],
        },
        {
          id: 'pcb',
          name: 'Science - PCB',
          description: 'Physics, Chemistry, Biology',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [
                { id: 'p12-1', name: 'Electric Charges and Fields', topics: t(['Electric Charge', 'Coulomb Law', 'Electric Field', 'Electric Flux', 'Gauss Law'], 2.5) },
                { id: 'p12-2', name: 'Electrostatic Potential', topics: t(['Potential', 'Potential Difference', 'Capacitance', 'Capacitors'], 2.5) },
                { id: 'p12-3', name: 'Current Electricity', topics: t(['Electric Current', 'Ohm Law', 'Resistance', 'Kirchhoff Laws', 'Wheatstone Bridge'], 2.5) },
                { id: 'p12-4', name: 'Magnetism', topics: t(['Magnetic Force', 'Biot-Savart Law', 'Ampere Law', 'Moving Charges'], 2.5) },
                { id: 'p12-5', name: 'Electromagnetic Induction', topics: t(['Magnetic Flux', 'Faraday Law', 'Lenz Law', 'Self and Mutual Inductance'], 2.5) },
                { id: 'p12-6', name: 'AC Circuits', topics: t(['AC Voltage', 'LCR Circuit', 'Resonance', 'Transformer'], 2.5) },
                { id: 'p12-7', name: 'EM Waves', topics: t(['Displacement Current', 'EM Waves', 'EM Spectrum'], 2) },
                { id: 'p12-8', name: 'Ray Optics', topics: t(['Reflection', 'Refraction', 'TIR', 'Lenses', 'Optical Instruments'], 2.5) },
                { id: 'p12-9', name: 'Wave Optics', topics: t(['Huygens Principle', 'Interference', 'Diffraction', 'Polarization'], 2.5) },
                { id: 'p12-10', name: 'Dual Nature', topics: t(['Photoelectric Effect', 'Matter Waves'], 2) },
                { id: 'p12-11', name: 'Atoms and Nuclei', topics: t(['Atomic Models', 'Bohr Model', 'Radioactivity', 'Nuclear Reactions'], 2.5) },
                { id: 'p12-12', name: 'Semiconductors', topics: t(['Semiconductors', 'pn Junction', 'Diode', 'Transistor', 'Logic Gates'], 2.5) },
              ],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [
                { id: 'c12-1', name: 'Solid State', topics: t(['Classification', 'Crystal Lattices', 'Packing', 'Defects'], 2.5) },
                { id: 'c12-2', name: 'Solutions', topics: t(['Concentration Terms', 'Solubility', 'Colligative Properties'], 2.5) },
                { id: 'c12-3', name: 'Electrochemistry', topics: t(['Electrochemical Cells', 'Nernst Equation', 'Conductance', 'Electrolysis'], 2.5) },
                { id: 'c12-4', name: 'Chemical Kinetics', topics: t(['Rate of Reaction', 'Order', 'Collision Theory'], 2) },
                { id: 'c12-5', name: 'Surface Chemistry', topics: t(['Adsorption', 'Catalysis', 'Colloids'], 2) },
                { id: 'c12-6', name: 'p-Block Elements', topics: t(['Group 15', 'Group 16', 'Group 17', 'Group 18'], 2.5) },
                { id: 'c12-7', name: 'd and f Block', topics: t(['Transition Elements', 'Inner Transition Elements'], 2) },
                { id: 'c12-8', name: 'Coordination Compounds', topics: t(['Werner Theory', 'Nomenclature', 'Isomerism', 'Bonding'], 2.5) },
                { id: 'c12-9', name: 'Haloalkanes', topics: t(['Classification', 'Nomenclature', 'Reactions'], 2) },
                { id: 'c12-10', name: 'Alcohols Phenols Ethers', topics: t(['Alcohols', 'Phenols', 'Ethers', 'Reactions'], 2.5) },
                { id: 'c12-11', name: 'Aldehydes Ketones', topics: t(['Nomenclature', 'Preparation', 'Reactions'], 2.5) },
                { id: 'c12-12', name: 'Carboxylic Acids', topics: t(['Nomenclature', 'Preparation', 'Reactions'], 2) },
                { id: 'c12-13', name: 'Amines', topics: t(['Classification', 'Preparation', 'Properties'], 2) },
                { id: 'c12-14', name: 'Biomolecules', topics: t(['Carbohydrates', 'Proteins', 'Vitamins', 'Nucleic Acids'], 2.5) },
                { id: 'c12-15', name: 'Polymers', topics: t(['Classification', 'Polymerization', 'Important Polymers'], 2) },
              ],
            },
            {
              id: 'biology',
              name: 'Biology',
              chapters: [
                { id: 'b12-1', name: 'Reproduction', topics: t(['Asexual Reproduction', 'Sexual Reproduction'], 2) },
                { id: 'b12-2', name: 'Flowering Plants Reproduction', topics: t(['Flower Structure', 'Pollination', 'Fertilization', 'Post-Fertilization'], 2.5) },
                { id: 'b12-3', name: 'Human Reproduction', topics: t(['Male System', 'Female System', 'Gametogenesis', 'Menstrual Cycle', 'Pregnancy'], 2.5) },
                { id: 'b12-4', name: 'Reproductive Health', topics: t(['Population Control', 'Birth Control', 'STDs'], 2) },
                { id: 'b12-5', name: 'Inheritance', topics: t(['Mendel Laws', 'Chromosomal Theory', 'Linkage', 'Sex Determination'], 2.5) },
                { id: 'b12-6', name: 'Molecular Basis', topics: t(['DNA Structure', 'Replication', 'Transcription', 'Translation', 'Gene Regulation'], 3) },
                { id: 'b12-7', name: 'Evolution', topics: t(['Origin of Life', 'Darwin Theory', 'Mechanism', 'Hardy-Weinberg'], 2.5) },
                { id: 'b12-8', name: 'Health and Disease', topics: t(['Common Diseases', 'Immunity', 'AIDS', 'Cancer', 'Drugs'], 2.5) },
                { id: 'b12-9', name: 'Biotechnology', topics: t(['Principles', 'Tools', 'Applications'], 2.5) },
                { id: 'b12-10', name: 'Ecology', topics: t(['Organisms and Environment', 'Populations', 'Ecosystem', 'Biodiversity', 'Environmental Issues'], 3) },
              ],
            },
            {
              id: 'english',
              name: 'English',
              chapters: [
                { id: 'e12-1', name: 'Advanced Reading Writing', topics: t(['Comprehension', 'Writing Skills', 'Grammar'], 2) },
              ],
            },
          ],
        },
        {
          id: 'commerce',
          name: 'Commerce',
          description: 'Accountancy, Business Studies, Economics',
          subjects: [
            {
              id: 'accountancy',
              name: 'Accountancy',
              chapters: [
                { id: 'a12-1', name: 'Partnership Fundamentals', topics: t(['Partnership Accounts Basics', 'Fixed vs Fluctuating Capital', 'Past Adjustments', 'Interest on Capital', 'Interest on Drawings', 'Salary to Partners', 'Commission to Partners', 'Profit and Loss Appropriation Account'], 2.5) },
                { id: 'a12-2', name: 'Goodwill', topics: t(['Nature of Goodwill', 'Factors Affecting Goodwill', 'Methods of Valuation', 'Average Profit Method', 'Super Profit Method', 'Capitalization Method', 'Annuity Method', 'Treatment of Goodwill'], 2.5) },
                { id: 'a12-3', name: 'Change in Profit Sharing Ratio', topics: t(['Reasons for Change', 'Gaining Ratio', 'Sacrificing Ratio', 'Treatment of Reserves', 'Treatment of Goodwill', 'Revaluation of Assets and Liabilities', 'Adjustment Entries'], 2.5) },
                { id: 'a12-4', name: 'Admission of a Partner', topics: t(['Effects of Admission', 'New Profit Sharing Ratio', 'Sacrificing Ratio', 'Treatment of Goodwill', 'Revaluation Account', 'Adjustment of Capital', 'Hidden Goodwill', 'Problems on Admission'], 3) },
                { id: 'a12-5', name: 'Retirement and Death', topics: t(['Retirement of Partner', 'Gaining Ratio', 'Treatment of Goodwill', 'Revaluation on Retirement', 'Settlement of Retiring Partner', "Death of Partner", 'Executor Account', 'Treatment of Goodwill on Death', 'Problems on Retirement and Death'], 3) },
                { id: 'a12-6', name: 'Dissolution of Partnership', topics: t(['Dissolution vs Dissolution of Partnership', 'Settlement of Accounts', 'Realization Account', 'Treatment of Assets', 'Treatment of Liabilities', 'Unrecorded Assets and Liabilities', 'Insolvency of Partners', "Garner vs Murray Rule", 'Problems on Dissolution'], 3) },
                { id: 'a12-7', name: 'Company Accounts - Share Capital', topics: t(['Share and Share Capital', 'Types of Share Capital', 'Authorized Capital', 'Issued Capital', 'Subscribed Capital', 'Called Up Capital', 'Paid Up Capital', 'Issue of Shares', 'At Par', 'At Premium', 'At Discount', 'Forfeiture of Shares', 'Reissue of Forfeited Shares', 'Issue of Bonus Shares', 'Issue of Rights Shares', 'Buy Back of Shares', 'Calls in Arrears', 'Calls in Advance'], 3.5) },
                { id: 'a12-8', name: 'Company Accounts - Debentures', topics: t(['Debenture Concept', 'Types of Debentures', 'Issue of Debentures', 'At Par Premium Discount', 'For Cash', 'For Consideration Other than Cash', 'As Collateral Security', 'Interest on Debentures', 'Redemption of Debentures', 'Payment in Lump Sum', 'Payment in Installments', 'Purchase in Open Market', 'Conversion into Shares', 'Sinking Fund Method'], 3) },
                { id: 'a12-9', name: 'Financial Statements of Company', topics: t(['Preparation as per Schedule III', 'Balance Sheet Format', 'Statement of Profit and Loss', 'Notes to Accounts', 'Contingent Liabilities', 'Managerial Remuneration'], 2.5) },
                { id: 'a12-10', name: 'Financial Statement Analysis', topics: t(['Meaning and Objectives', 'Tools of Analysis', 'Comparative Statements', 'Comparative Balance Sheet', 'Comparative Income Statement', 'Common Size Statements', 'Trend Analysis'], 2.5) },
                { id: 'a12-11', name: 'Accounting Ratios', topics: t(['Meaning and Objectives', 'Classification of Ratios', 'Liquidity Ratios', 'Current Ratio', 'Quick Ratio', 'Solvency Ratios', 'Debt to Equity', 'Total Assets to Debt', 'Proprietary Ratio', 'Interest Coverage Ratio', 'Activity Ratios', 'Inventory Turnover', 'Trade Receivables Turnover', 'Trade Payables Turnover', 'Working Capital Turnover', 'Profitability Ratios', 'Gross Profit Ratio', 'Net Profit Ratio', 'Operating Ratio', 'Return on Investment', 'Return on Capital Employed', 'Interpretation of Ratios'], 4) },
                { id: 'a12-12', name: 'Cash Flow Statement', topics: t(['Meaning and Importance', 'Cash vs Profit', 'Operating Activities', 'Investing Activities', 'Financing Activities', 'Direct Method', 'Indirect Method', 'Preparation of Cash Flow Statement', 'Adjustments Required', 'Analysis of Cash Flow'], 3) },
              ],
            },
            {
              id: 'business-studies',
              name: 'Business Studies',
              chapters: [
                { id: 'bs12-1', name: 'Nature and Significance of Management', topics: t(['Concept of Management', 'Objectives of Management', 'Importance of Management', 'Nature of Management - Art Science Profession', 'Levels of Management', 'Functions of Management'], 2) },
                { id: 'bs12-2', name: 'Principles of Management', topics: t(['Taylor Scientific Management', 'Principles of Scientific Management', 'Techniques', 'Fayol Principles', '14 Principles of Management', 'Division of Work', 'Authority and Responsibility', 'Discipline', 'Unity of Command', 'Unity of Direction', 'Subordination', 'Remuneration', 'Centralization', 'Scalar Chain', 'Order', 'Equity', 'Stability', 'Initiative', 'Esprit de Corps'], 3) },
                { id: 'bs12-3', name: 'Business Environment', topics: t(['Meaning and Features', 'Importance', 'Dimensions of Business Environment', 'Economic Environment', 'Social Environment', 'Technological Environment', 'Political Environment', 'Legal Environment', 'Economic Reforms in India', 'Liberalization', 'Privatization', 'Globalization', 'Impact of Government Policy Changes'], 2.5) },
                { id: 'bs12-4', name: 'Planning', topics: t(['Meaning and Features', 'Importance of Planning', 'Limitations', 'Planning Process', 'Types of Plans', 'Objectives', 'Strategy', 'Policy', 'Procedure', 'Method', 'Rule', 'Budget', 'Programme'], 2.5) },
                { id: 'bs12-5', name: 'Organizing', topics: t(['Meaning and Importance', 'Steps in Organizing', 'Organization Structure', 'Functional Structure', 'Divisional Structure', 'Formal vs Informal Organization', 'Delegation', 'Elements of Delegation', 'Importance', 'Decentralization', 'Difference Delegation and Decentralization'], 2.5) },
                { id: 'bs12-6', name: 'Staffing', topics: t(['Meaning and Importance', 'Staffing as Function', 'Staffing Process', 'Recruitment', 'Sources of Recruitment', 'Internal Sources', 'External Sources', 'Selection', 'Selection Process', 'Training and Development', 'Methods of Training', 'On the Job', 'Off the Job'], 2.5) },
                { id: 'bs12-7', name: 'Directing', topics: t(['Meaning and Importance', 'Elements of Direction', 'Supervision', 'Motivation', 'Maslow Hierarchy', 'Herzberg Two Factor Theory', 'McGregor Theory X and Y', 'Leadership', 'Leadership Styles', 'Autocratic', 'Democratic', 'Laissez Faire', 'Communication', 'Formal vs Informal', 'Barriers to Communication', 'Overcoming Barriers'], 3) },
                { id: 'bs12-8', name: 'Controlling', topics: t(['Meaning and Importance', 'Relationship with Planning', 'Steps in Controlling', 'Setting Standards', 'Measurement', 'Comparison', 'Analyzing Deviations', 'Corrective Action', 'Techniques of Controlling'], 2) },
                { id: 'bs12-9', name: 'Financial Management', topics: t(['Meaning and Objectives', 'Financial Decisions', 'Investment Decision', 'Financing Decision', 'Dividend Decision', 'Factors Affecting', 'Financial Planning', 'Capital Structure', 'Factors Determining', 'Fixed vs Working Capital'], 2.5) },
                { id: 'bs12-10', name: 'Financial Markets', topics: t(['Meaning and Functions', 'Money Market', 'Capital Market', 'Primary Market', 'Secondary Market', 'Stock Exchange', 'Functions', 'Trading Procedure', 'SEBI Role and Functions', 'NSDL CDSL'], 2.5) },
                { id: 'bs12-11', name: 'Marketing Management', topics: t(['Meaning and Functions', 'Marketing vs Selling', 'Marketing Mix', '4 Ps', 'Product', 'Price', 'Place', 'Promotion', 'Product - Branding', 'Labelling', 'Packaging', 'Price - Factors Affecting', 'Physical Distribution', 'Channels of Distribution', 'Promotion Mix', 'Advertising', 'Personal Selling', 'Sales Promotion', 'Public Relations'], 3) },
                { id: 'bs12-12', name: 'Consumer Protection', topics: t(['Importance', 'Ways of Consumer Protection', 'Consumer Rights', 'Right to Safety', 'Right to Information', 'Right to Choose', 'Right to be Heard', 'Right to Redress', 'Right to Education', 'Consumer Responsibilities', 'Redressal Machinery', 'District Forum', 'State Commission', 'National Commission', 'Remedies Available'], 2.5) },
              ],
            },
            {
              id: 'economics',
              name: 'Economics',
              chapters: [
                { id: 'ec12-1', name: 'Introduction to Macroeconomics', topics: t(['Meaning of Macroeconomics', 'Microeconomics vs Macroeconomics', 'Importance', 'Limitations', 'Circular Flow of Income', 'Two Sector Model', 'Three Sector Model', 'Four Sector Model'], 2) },
                { id: 'ec12-2', name: 'National Income', topics: t(['Concepts of National Income', 'GDP', 'GNP', 'NNP', 'NDP', 'National Income', 'Personal Income', 'Disposable Income', 'Methods of Measurement', 'Value Added Method', 'Income Method', 'Expenditure Method', 'Precautions', 'Real vs Nominal GDP', 'GDP Deflator'], 3) },
                { id: 'ec12-3', name: 'Money and Banking', topics: t(['Money Functions', 'Medium of Exchange', 'Measure of Value', 'Store of Value', 'Transfer of Value', 'Supply of Money', 'M1 M2 M3 M4', 'Central Bank', 'Functions of RBI', 'Monetary Policy', 'Quantitative Measures', 'Bank Rate', 'Repo Rate', 'Reverse Repo Rate', 'CRR', 'SLR', 'Open Market Operations', 'Qualitative Measures', 'Commercial Banks', 'Functions', 'Credit Creation', 'Credit Multiplier'], 3.5) },
                { id: 'ec12-4', name: 'Determination of Income and Employment', topics: t(['Aggregate Demand', 'Components of AD', 'Consumption Function', 'Saving Function', 'Investment', 'Aggregate Supply', 'Short Run AS', 'Determination of Equilibrium', 'AD equals AS Approach', 'S equals I Approach', 'Changes in Equilibrium', 'Excess Demand', 'Deficient Demand', 'Measures to Correct', 'Investment Multiplier', 'Working of Multiplier'], 3.5) },
                { id: 'ec12-5', name: 'Government Budget', topics: t(['Meaning and Components', 'Revenue Budget', 'Capital Budget', 'Objectives of Budget', 'Allocation', 'Redistribution', 'Stabilization', 'Revenue Receipts', 'Tax Revenue', 'Non Tax Revenue', 'Revenue Expenditure', 'Capital Receipts', 'Recoveries of Loans', 'Borrowings', 'Disinvestment', 'Capital Expenditure', 'Balanced Budget', 'Surplus Budget', 'Deficit Budget', 'Revenue Deficit', 'Fiscal Deficit', 'Primary Deficit', 'Implications of Fiscal Deficit', 'Measures to Reduce'], 3) },
                { id: 'ec12-6', name: 'Balance of Payments', topics: t(['Meaning', 'Components of BOP', 'Current Account', 'Visible Items', 'Invisible Items', 'Capital Account', 'Autonomous vs Accommodating Items', 'Deficit in BOP', 'Measures to Correct', 'Foreign Exchange Rate', 'Determination', 'Fixed Exchange Rate', 'Flexible Exchange Rate', 'Managed Floating'], 2.5) },
                { id: 'ec12-7', name: 'Indian Economy on Eve of Independence', topics: t(['Occupational Structure', 'Agricultural Sector', 'Industrial Sector', 'Foreign Trade', 'Demographic Profile', 'Economic Condition'], 2) },
                { id: 'ec12-8', name: 'Indian Economy 1950-1990', topics: t(['Goals of Five Year Plans', 'Agriculture', 'Green Revolution', 'Land Reforms', 'Industry and Trade Policies', 'Import Substitution'], 2) },
                { id: 'ec12-9', name: 'Economic Reforms Since 1991', topics: t(['Need for Economic Reforms', 'Liberalization', 'Industrial Policy Reforms', 'Financial Sector Reforms', 'Tax Reforms', 'Foreign Exchange Reforms', 'Trade Policy Reforms', 'Privatization', 'Globalization', 'Impact of Reforms'], 2.5) },
                { id: 'ec12-10', name: 'Poverty', topics: t(['Meaning', 'Poverty Line', 'Estimation', 'Trends in Poverty', 'Causes', 'Anti-Poverty Measures', 'Government Programmes'], 2) },
                { id: 'ec12-11', name: 'Human Capital Formation', topics: t(['Meaning', 'Sources', 'Education', 'Health', 'On the Job Training', 'Migration', 'Role in Economic Development', 'Education Sector in India', 'Health Sector in India', 'Problems'], 2) },
                { id: 'ec12-12', name: 'Rural Development', topics: t(['Meaning and Importance', 'Credit and Marketing', 'Agricultural Diversification', 'Organic Farming', 'Rural Development Programmes'], 2) },
                { id: 'ec12-13', name: 'Employment', topics: t(['Worker and Workforce', 'Labour Force Participation Rate', 'Worker Population Ratio', 'Unemployment', 'Types', 'Trends', 'Government Initiatives'], 2) },
                { id: 'ec12-14', name: 'Infrastructure', topics: t(['Meaning and Types', 'Importance', 'State of Infrastructure in India', 'Energy', 'Health', 'Education', 'Sustainable Development'], 2) },
              ],
            },
            {
              id: 'english',
              name: 'English',
              chapters: [
                { id: 'ec12-1', name: 'Reading and Comprehension', topics: t(['Unseen Passages', 'Factual', 'Literary', 'Discursive', 'Note Making Advanced', 'Summary Advanced'], 2.5) },
                { id: 'ec12-2', name: 'Advanced Business Writing', topics: t(['Notice Advanced', 'Advertisement Advanced', 'Formal Letter Advanced', 'Letter of Inquiry', 'Complaint', 'Order', 'Job Application Advanced', 'Resume Building', 'Article Writing Advanced', 'Report Writing Advanced', 'Proposal Writing'], 3) },
                { id: 'ec12-3', name: 'Advanced Grammar', topics: t(['Error Spotting', 'Sentence Improvement', 'Para Jumbles', 'Cloze Test', 'Advanced Editing', 'Advanced Transformation'], 2.5) },
                { id: 'ec12-4', name: 'Literature', topics: t(['The Last Lesson', 'Lost Spring', 'Deep Water', 'The Rattrap', 'Indigo', 'Poets and Pancakes', 'My Mother at Sixty-six', 'An Elementary School Classroom', 'Keeping Quiet', 'A Thing of Beauty'], 2.5) },
              ],
            },
          ],
        },
        {
          id: 'humanities',
          name: 'Arts/Humanities',
          description: 'History, Political Science, Geography',
          subjects: [
            {
              id: 'history',
              name: 'History',
              chapters: [
                { id: 'h12-1', name: 'Modern World', topics: t(['Industrial Revolution', 'World Wars', 'Cold War'], 2.5) },
                { id: 'h12-2', name: 'Indian History', topics: t(['Freedom Struggle', 'Post Independence'], 2.5) },
              ],
            },
            {
              id: 'political-science',
              name: 'Political Science',
              chapters: [
                { id: 'ps12-1', name: 'Contemporary Politics', topics: t(['Globalization', 'International Relations', 'UN'], 2.5) },
              ],
            },
            {
              id: 'geography',
              name: 'Geography',
              chapters: [
                { id: 'g12-1', name: 'Human Geography', topics: t(['Population', 'Migration', 'Settlements', 'Resources'], 2.5) },
              ],
            },
            {
              id: 'english',
              name: 'English',
              chapters: [
                { id: 'eh12-1', name: 'Advanced Literature', topics: t(['Prose', 'Poetry', 'Drama'], 2) },
              ],
            },
          ],
        },
      ],
    },
  },
  // Add ICSE and State boards with similar structure (simplified for space)
  {
    id: 'icse',
    name: 'ICSE/ISC',
    classes: {
      '11': [
        {
          id: 'pcm',
          name: 'Science - PCM',
          description: 'Physics, Chemistry, Mathematics',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [
                { id: 'ip11-1', name: 'Mechanics', topics: t(['Kinematics', 'Dynamics', 'Work Energy', 'Gravitation'], 2.5) },
                { id: 'ip11-2', name: 'Heat', topics: t(['Thermodynamics', 'Kinetic Theory'], 2) },
              ],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [
                { id: 'ic11-1', name: 'Basics', topics: t(['Atomic Structure', 'Periodic Table', 'Bonding'], 2.5) },
              ],
            },
            {
              id: 'mathematics',
              name: 'Mathematics',
              chapters: [
                { id: 'im11-1', name: 'Algebra', topics: t(['Sets', 'Functions', 'Sequences'], 2) },
              ],
            },
          ],
        },
        {
          id: 'pcb',
          name: 'Science - PCB',
          description: 'Physics, Chemistry, Biology',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [{ id: 'ip11-1', name: 'Mechanics', topics: t(['Kinematics', 'Dynamics'], 2) }],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [{ id: 'ic11-1', name: 'Basics', topics: t(['Atomic Structure', 'Bonding'], 2) }],
            },
            {
              id: 'biology',
              name: 'Biology',
              chapters: [{ id: 'ib11-1', name: 'Cell Biology', topics: t(['Cell Structure', 'Biomolecules'], 2) }],
            },
          ],
        },
        {
          id: 'commerce',
          name: 'Commerce',
          description: 'Commerce Subjects',
          subjects: [
            {
              id: 'accountancy',
              name: 'Accountancy',
              chapters: [{ id: 'ia11-1', name: 'Accounting Basics', topics: t(['Journal', 'Ledger'], 2) }],
            },
          ],
        },
      ],
      '12': [
        {
          id: 'pcm',
          name: 'Science - PCM',
          description: 'Physics, Chemistry, Mathematics',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [{ id: 'ip12-1', name: 'Electricity', topics: t(['Current', 'Magnetism'], 2.5) }],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [{ id: 'ic12-1', name: 'Physical Chemistry', topics: t(['Solutions', 'Kinetics'], 2.5) }],
            },
            {
              id: 'mathematics',
              name: 'Mathematics',
              chapters: [{ id: 'im12-1', name: 'Calculus', topics: t(['Differentiation', 'Integration'], 3) }],
            },
          ],
        },
        {
          id: 'pcb',
          name: 'Science - PCB',
          description: 'Physics, Chemistry, Biology',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [{ id: 'ip12-1', name: 'Electricity', topics: t(['Current', 'Magnetism'], 2.5) }],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [{ id: 'ic12-1', name: 'Physical Chemistry', topics: t(['Solutions', 'Kinetics'], 2.5) }],
            },
            {
              id: 'biology',
              name: 'Biology',
              chapters: [{ id: 'ib12-1', name: 'Genetics', topics: t(['Heredity', 'Evolution'], 2.5) }],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'state',
    name: 'State Board',
    classes: {
      '11': [
        {
          id: 'pcm',
          name: 'Science - PCM',
          description: 'Physics, Chemistry, Mathematics',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [{ id: 'sp11-1', name: 'Mechanics', topics: t(['Motion', 'Forces'], 2) }],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [{ id: 'sc11-1', name: 'Chemical Bonding', topics: t(['Ionic', 'Covalent'], 2) }],
            },
            {
              id: 'mathematics',
              name: 'Mathematics',
              chapters: [{ id: 'sm11-1', name: 'Algebra', topics: t(['Matrices', 'Determinants'], 2) }],
            },
          ],
        },
        {
          id: 'pcb',
          name: 'Science - PCB',
          description: 'Physics, Chemistry, Biology',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [{ id: 'sp11-1', name: 'Mechanics', topics: t(['Motion', 'Forces'], 2) }],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [{ id: 'sc11-1', name: 'Chemical Bonding', topics: t(['Ionic', 'Covalent'], 2) }],
            },
            {
              id: 'biology',
              name: 'Biology',
              chapters: [{ id: 'sb11-1', name: 'Plant Biology', topics: t(['Morphology', 'Anatomy'], 2) }],
            },
          ],
        },
      ],
      '12': [
        {
          id: 'pcm',
          name: 'Science - PCM',
          description: 'Physics, Chemistry, Mathematics',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [{ id: 'sp12-1', name: 'Electrostatics', topics: t(['Charge', 'Field'], 2.5) }],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [{ id: 'sc12-1', name: 'Chemical Kinetics', topics: t(['Rate', 'Order'], 2.5) }],
            },
            {
              id: 'mathematics',
              name: 'Mathematics',
              chapters: [{ id: 'sm12-1', name: 'Integration', topics: t(['Methods', 'Applications'], 3) }],
            },
          ],
        },
        {
          id: 'pcb',
          name: 'Science - PCB',
          description: 'Physics, Chemistry, Biology',
          subjects: [
            {
              id: 'physics',
              name: 'Physics',
              chapters: [{ id: 'sp12-1', name: 'Electrostatics', topics: t(['Charge', 'Field'], 2.5) }],
            },
            {
              id: 'chemistry',
              name: 'Chemistry',
              chapters: [{ id: 'sc12-1', name: 'Chemical Kinetics', topics: t(['Rate', 'Order'], 2.5) }],
            },
            {
              id: 'biology',
              name: 'Biology',
              chapters: [{ id: 'sb12-1', name: 'Human Physiology', topics: t(['Digestion', 'Circulation'], 2.5) }],
            },
          ],
        },
      ],
    },
  },
];
