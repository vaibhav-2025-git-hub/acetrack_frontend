// Comprehensive curriculum data for Class 11 & 12 - All Boards and Streams

export interface Topic {
  id: string;
  name: string;
  estimatedHours: number;
}

export interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Stream {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
}

export interface Board {
  id: string;
  name: string;
  classes: {
    [key: string]: Stream[];
  };
}

// Import complete curriculum with all topics
import { completeCurriculumData } from './completeCurriculum';
import { cbseScience12Streams } from './cbseScience12';

// Override CBSE Class 12 with science-only streams
const modifiedCurriculumData = completeCurriculumData.map(board => {
  if (board.id === 'cbse') {
    return {
      ...board,
      classes: {
        ...board.classes,
        '12': cbseScience12Streams
      }
    };
  }
  return board;
});

// Export the modified curriculum as the main data
export const curriculumData: Board[] = modifiedCurriculumData;