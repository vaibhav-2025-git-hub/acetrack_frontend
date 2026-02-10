import { ReferenceLink } from '../types';

// Comprehensive reference links for all major topics
export const referenceLinksDatabase: Record<string, ReferenceLink[]> = {
  // Physics Topics
  'units-and-measurements': [
    { title: 'Units and Measurements - Khan Academy', url: 'https://www.khanacademy.org/science/physics/one-dimensional-motion/displacement-velocity-time', type: 'video', platform: 'Khan Academy' },
    { title: 'Physical Quantities and Measurement', url: 'https://www.youtube.com/watch?v=AwzThzwaJxs', type: 'video', platform: 'YouTube' },
    { title: 'NCERT Solutions - Units and Measurements', url: 'https://ncert.nic.in/textbook/pdf/keph101.pdf', type: 'notes', platform: 'NCERT' },
    { title: 'Practice Problems - Units', url: 'https://www.learncbse.in/ncert-solutions-class-11-physics-chapter-2/', type: 'practice' },
  ],
  'motion-in-a-straight-line': [
    { title: 'Motion in One Dimension - Khan Academy', url: 'https://www.khanacademy.org/science/physics/one-dimensional-motion', type: 'video', platform: 'Khan Academy' },
    { title: 'Kinematics Explained', url: 'https://www.youtube.com/watch?v=ZM8ECpBuQYE', type: 'video', platform: 'YouTube' },
    { title: 'Interactive Motion Simulator', url: 'https://phet.colorado.edu/en/simulation/moving-man', type: 'interactive', platform: 'PhET' },
    { title: 'Practice Problems - Motion', url: 'https://www.learncbse.in/ncert-solutions-class-11-physics-chapter-3/', type: 'practice' },
  ],
  'motion-in-a-plane': [
    { title: '2D Motion and Projectiles - Khan Academy', url: 'https://www.khanacademy.org/science/physics/two-dimensional-motion', type: 'video', platform: 'Khan Academy' },
    { title: 'Projectile Motion Explained', url: 'https://www.youtube.com/watch?v=_02xeD9p9lk', type: 'video', platform: 'YouTube' },
    { title: 'Projectile Motion Simulator', url: 'https://phet.colorado.edu/en/simulation/projectile-motion', type: 'interactive', platform: 'PhET' },
  ],
  'laws-of-motion': [
    { title: "Newton's Laws - Khan Academy", url: 'https://www.khanacademy.org/science/physics/forces-newtons-laws', type: 'video', platform: 'Khan Academy' },
    { title: "Newton's Laws Explained", url: 'https://www.youtube.com/watch?v=kKKM8Y-u7ds', type: 'video', platform: 'YouTube' },
    { title: 'Forces and Motion Simulator', url: 'https://phet.colorado.edu/en/simulation/forces-and-motion-basics', type: 'interactive', platform: 'PhET' },
    { title: 'NCERT Solutions - Laws of Motion', url: 'https://ncert.nic.in/textbook/pdf/keph105.pdf', type: 'notes', platform: 'NCERT' },
  ],
  'work-energy-and-power': [
    { title: 'Work and Energy - Khan Academy', url: 'https://www.khanacademy.org/science/physics/work-and-energy', type: 'video', platform: 'Khan Academy' },
    { title: 'Energy Conservation Explained', url: 'https://www.youtube.com/watch?v=w4QFJb9a8vo', type: 'video', platform: 'YouTube' },
    { title: 'Energy Skate Park Simulator', url: 'https://phet.colorado.edu/en/simulation/energy-skate-park', type: 'interactive', platform: 'PhET' },
  ],

  // Chemistry Topics
  'atomic-structure': [
    { title: 'Atomic Structure - Khan Academy', url: 'https://www.khanacademy.org/science/chemistry/atomic-structure-and-properties', type: 'video', platform: 'Khan Academy' },
    { title: 'Bohr Model and Quantum Numbers', url: 'https://www.youtube.com/watch?v=Rd4a1X3B61w', type: 'video', platform: 'YouTube' },
    { title: 'Build an Atom Simulator', url: 'https://phet.colorado.edu/en/simulation/build-an-atom', type: 'interactive', platform: 'PhET' },
    { title: 'NCERT Solutions - Atomic Structure', url: 'https://ncert.nic.in/textbook/pdf/kech102.pdf', type: 'notes', platform: 'NCERT' },
  ],
  'chemical-bonding': [
    { title: 'Chemical Bonds - Khan Academy', url: 'https://www.khanacademy.org/science/chemistry/chemical-bonds', type: 'video', platform: 'Khan Academy' },
    { title: 'Ionic and Covalent Bonding', url: 'https://www.youtube.com/watch?v=CGA8sRwqIFg', type: 'video', platform: 'YouTube' },
    { title: 'Molecule Shapes Simulator', url: 'https://phet.colorado.edu/en/simulation/molecule-shapes', type: 'interactive', platform: 'PhET' },
  ],
  'states-of-matter': [
    { title: 'States of Matter - Khan Academy', url: 'https://www.khanacademy.org/science/chemistry/states-of-matter-and-intermolecular-forces', type: 'video', platform: 'Khan Academy' },
    { title: 'Gas Laws Explained', url: 'https://www.youtube.com/watch?v=BxUS1K7xu30', type: 'video', platform: 'YouTube' },
    { title: 'States of Matter Simulator', url: 'https://phet.colorado.edu/en/simulation/states-of-matter', type: 'interactive', platform: 'PhET' },
  ],
  'thermodynamics': [
    { title: 'Thermodynamics - Khan Academy', url: 'https://www.khanacademy.org/science/chemistry/thermodynamics-chemistry', type: 'video', platform: 'Khan Academy' },
    { title: 'Laws of Thermodynamics', url: 'https://www.youtube.com/watch?v=NyOYW07-L5g', type: 'video', platform: 'YouTube' },
  ],
  'equilibrium': [
    { title: 'Chemical Equilibrium - Khan Academy', url: 'https://www.khanacademy.org/science/chemistry/chemical-equilibrium', type: 'video', platform: 'Khan Academy' },
    { title: "Le Chatelier's Principle", url: 'https://www.youtube.com/watch?v=_hGG57TzYt0', type: 'video', platform: 'YouTube' },
  ],

  // Mathematics Topics
  'sets': [
    { title: 'Sets and Set Theory - Khan Academy', url: 'https://www.khanacademy.org/math/statistics-probability/probability-library/basic-set-ops', type: 'video', platform: 'Khan Academy' },
    { title: 'Introduction to Sets', url: 'https://www.youtube.com/watch?v=yCwnifwVjIg', type: 'video', platform: 'YouTube' },
    { title: 'NCERT Solutions - Sets', url: 'https://ncert.nic.in/textbook/pdf/kemh101.pdf', type: 'notes', platform: 'NCERT' },
  ],
  'relations-and-functions': [
    { title: 'Functions - Khan Academy', url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:functions', type: 'video', platform: 'Khan Academy' },
    { title: 'Relations and Functions Explained', url: 'https://www.youtube.com/watch?v=kfk6ScpkDq4', type: 'video', platform: 'YouTube' },
    { title: 'Practice Problems - Functions', url: 'https://www.learncbse.in/ncert-solutions-class-11-maths-chapter-2/', type: 'practice' },
  ],
  'trigonometric-functions': [
    { title: 'Trigonometry - Khan Academy', url: 'https://www.khanacademy.org/math/trigonometry', type: 'video', platform: 'Khan Academy' },
    { title: 'Trigonometric Functions', url: 'https://www.youtube.com/watch?v=PUB0TaZ7bhA', type: 'video', platform: 'YouTube' },
    { title: 'Interactive Unit Circle', url: 'https://www.mathsisfun.com/algebra/trig-interactive-unit-circle.html', type: 'interactive' },
  ],
  'calculus': [
    { title: 'Calculus - Khan Academy', url: 'https://www.khanacademy.org/math/calculus-1', type: 'video', platform: 'Khan Academy' },
    { title: 'Introduction to Derivatives', url: 'https://www.youtube.com/watch?v=WsQQvHm4lSw', type: 'video', platform: 'YouTube' },
    { title: 'Calculus Grapher', url: 'https://www.desmos.com/calculator', type: 'interactive', platform: 'Desmos' },
  ],
  'limits-and-derivatives': [
    { title: 'Limits - Khan Academy', url: 'https://www.khanacademy.org/math/calculus-1/cs1-limits-and-continuity', type: 'video', platform: 'Khan Academy' },
    { title: 'Derivatives Explained', url: 'https://www.youtube.com/watch?v=9vKqVkMQHKk', type: 'video', platform: 'YouTube' },
  ],

  // Biology Topics
  'cell-structure': [
    { title: 'Cell Structure - Khan Academy', url: 'https://www.khanacademy.org/science/biology/structure-of-a-cell', type: 'video', platform: 'Khan Academy' },
    { title: 'Cell Biology Overview', url: 'https://www.youtube.com/watch?v=URUJD5NEXC8', type: 'video', platform: 'YouTube' },
    { title: 'NCERT Solutions - Cell Structure', url: 'https://ncert.nic.in/textbook/pdf/kebo108.pdf', type: 'notes', platform: 'NCERT' },
  ],
  'cell-division': [
    { title: 'Cell Division - Khan Academy', url: 'https://www.khanacademy.org/science/biology/cellular-molecular-biology/mitosis', type: 'video', platform: 'Khan Academy' },
    { title: 'Mitosis and Meiosis', url: 'https://www.youtube.com/watch?v=zx1V77bHKVE', type: 'video', platform: 'YouTube' },
  ],
  'photosynthesis': [
    { title: 'Photosynthesis - Khan Academy', url: 'https://www.khanacademy.org/science/biology/photosynthesis-in-plants', type: 'video', platform: 'Khan Academy' },
    { title: 'Photosynthesis Explained', url: 'https://www.youtube.com/watch?v=uixA8ZXx0KU', type: 'video', platform: 'YouTube' },
  ],
  'respiration': [
    { title: 'Cellular Respiration - Khan Academy', url: 'https://www.khanacademy.org/science/biology/cellular-respiration-and-fermentation', type: 'video', platform: 'Khan Academy' },
    { title: 'Respiration Process', url: 'https://www.youtube.com/watch?v=00jbG_cfGuQ', type: 'video', platform: 'YouTube' },
  ],

  // Default fallback for topics without specific links
  'default': [
    { title: 'Khan Academy', url: 'https://www.khanacademy.org/', type: 'video', platform: 'Khan Academy' },
    { title: 'YouTube Educational Videos', url: 'https://www.youtube.com/edu', type: 'video', platform: 'YouTube' },
    { title: 'NCERT Textbooks', url: 'https://ncert.nic.in/textbook.php', type: 'notes', platform: 'NCERT' },
  ],
};

// Helper function to get reference links for a topic
export const getReferenceLinks = (topicId: string, subjectId: string): ReferenceLink[] => {
  // Normalize topic ID (remove spaces, lowercase, add hyphens)
  const normalizedTopicId = topicId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Try exact match first
  if (referenceLinksDatabase[normalizedTopicId]) {
    return referenceLinksDatabase[normalizedTopicId];
  }

  // Try partial matches
  const partialMatch = Object.keys(referenceLinksDatabase).find(key => 
    normalizedTopicId.includes(key) || key.includes(normalizedTopicId)
  );

  if (partialMatch) {
    return referenceLinksDatabase[partialMatch];
  }

  // Generate subject-specific default links
  const subjectLinks: Record<string, ReferenceLink[]> = {
    'physics': [
      { title: 'Physics - Khan Academy', url: 'https://www.khanacademy.org/science/physics', type: 'video', platform: 'Khan Academy' },
      { title: 'Physics Tutorials', url: 'https://www.youtube.com/results?search_query=physics+' + topicId, type: 'video', platform: 'YouTube' },
      { title: 'PhET Simulations', url: 'https://phet.colorado.edu/en/simulations/filter?subjects=physics', type: 'interactive', platform: 'PhET' },
    ],
    'chemistry': [
      { title: 'Chemistry - Khan Academy', url: 'https://www.khanacademy.org/science/chemistry', type: 'video', platform: 'Khan Academy' },
      { title: 'Chemistry Tutorials', url: 'https://www.youtube.com/results?search_query=chemistry+' + topicId, type: 'video', platform: 'YouTube' },
      { title: 'ChemCollective', url: 'http://chemcollective.org/', type: 'interactive' },
    ],
    'mathematics': [
      { title: 'Math - Khan Academy', url: 'https://www.khanacademy.org/math', type: 'video', platform: 'Khan Academy' },
      { title: 'Math Tutorials', url: 'https://www.youtube.com/results?search_query=mathematics+' + topicId, type: 'video', platform: 'YouTube' },
      { title: 'Desmos Calculator', url: 'https://www.desmos.com/calculator', type: 'interactive', platform: 'Desmos' },
    ],
    'biology': [
      { title: 'Biology - Khan Academy', url: 'https://www.khanacademy.org/science/biology', type: 'video', platform: 'Khan Academy' },
      { title: 'Biology Tutorials', url: 'https://www.youtube.com/results?search_query=biology+' + topicId, type: 'video', platform: 'YouTube' },
      { title: 'NCERT Biology', url: 'https://ncert.nic.in/textbook.php?kebo1=0-8', type: 'notes', platform: 'NCERT' },
    ],
  };

  const subjectKey = subjectId.toLowerCase();
  return subjectLinks[subjectKey] || referenceLinksDatabase['default'];
};
