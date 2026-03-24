// COMPLETE COMPREHENSIVE CURRICULUM - ALL BOARDS, CLASSES, STREAMS
// This file contains ALL topics that will be distributed in the study plan

import type { Board } from './curriculum';

// Helper to create topics quickly
const t = (names: string[], hours: number = 2) =>
  names.map((name, i) => ({ id: `${Date.now()}_${i}`, name, estimatedHours: hours }));

export const completeCurriculumData: Board[] = [
  {
    id: 'cbse',
    name: 'CBSE',
    classes: {
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
