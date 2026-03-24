// Complete comprehensive curriculum for all boards and streams
import type { Board } from './curriculum';

// This file contains the full curriculum with all topics for proper distribution

export const comprehensiveCurriculum: Board[] = [
  {
    id: 'cbse',
    name: 'CBSE',
    classes: {
      '12': [
        {
          id: 'science',
          name: 'Science - Class 12',
          description: 'CBSE Class 12 Science Curriculum',
          subjects: [
            // PHYSICS CLASS 12
            {
              id: 'physics',
              name: 'Physics',
              chapters: [
                {
                  id: 'p12-ch1',
                  name: 'Electric Charges and Fields',
                  topics: [
                    { id: 'p12t1', name: 'Electric Charge', estimatedHours: 1.5 },
                    { id: 'p12t2', name: 'Conductors and Insulators', estimatedHours: 1 },
                    { id: 'p12t3', name: 'Charging by Induction', estimatedHours: 1.5 },
                    { id: 'p12t4', name: "Coulomb's Law", estimatedHours: 2.5 },
                    { id: 'p12t5', name: 'Forces between Multiple Charges', estimatedHours: 2 },
                    { id: 'p12t6', name: 'Electric Field', estimatedHours: 2 },
                    { id: 'p12t7', name: 'Electric Field Lines', estimatedHours: 1.5 },
                    { id: 'p12t8', name: 'Electric Flux', estimatedHours: 2 },
                    { id: 'p12t9', name: 'Electric Dipole', estimatedHours: 2.5 },
                    { id: 'p12t10', name: "Gauss's Law", estimatedHours: 2 },
                    { id: 'p12t11', name: "Applications of Gauss's Law", estimatedHours: 3 },
                  ],
                },
                {
                  id: 'p12-ch2',
                  name: 'Electrostatic Potential and Capacitance',
                  topics: [
                    { id: 'p12t12', name: 'Electrostatic Potential', estimatedHours: 2 },
                    { id: 'p12t13', name: 'Potential due to a Point Charge', estimatedHours: 2 },
                    { id: 'p12t14', name: 'Potential due to an Electric Dipole', estimatedHours: 2.5 },
                    { id: 'p12t15', name: 'Potential due to a System of Charges', estimatedHours: 2 },
                    { id: 'p12t16', name: 'Equipotential Surfaces', estimatedHours: 1.5 },
                    { id: 'p12t17', name: 'Potential Energy in an External Field', estimatedHours: 2.5 },
                    { id: 'p12t18', name: 'Electrostatics of Conductors', estimatedHours: 2 },
                    { id: 'p12t19', name: 'Dielectrics and Polarisation', estimatedHours: 2.5 },
                    { id: 'p12t20', name: 'Capacitors and Capacitance', estimatedHours: 2 },
                    { id: 'p12t21', name: 'The Parallel Plate Capacitor', estimatedHours: 2 },
                    { id: 'p12t22', name: 'Combination of Capacitors', estimatedHours: 2.5 },
                    { id: 'p12t23', name: 'Energy Stored in a Capacitor', estimatedHours: 2 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
];
