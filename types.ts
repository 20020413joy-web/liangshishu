export enum QuestionType {
  SINGLE_CHOICE = '單選題',
  FILL_IN_BLANK = '填充題'
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string; // LaTeX supported
  options?: string[]; // Only for SINGLE_CHOICE
  correctAnswer: string;
  solution: string; // LaTeX supported
  tags: string[]; // e.g., '1-1', 'Basic'
  difficulty: number; // 1-5
}

export interface Chapter {
  id: string;
  title: string;
  subChapters?: Chapter[];
  videoId?: string;
}

export interface ExamStats {
  topMark: number;
  avgMark: number;
  lowMark: number;
  distribution: number[]; // Array of 10 numbers representing 0-10, 10-20, ... 90-100 scores
}

export interface ExamRecord {
  id: string;
  examId?: string; // Links to WeeklyExam.id
  date: string; 
  title: string;
  type: 'Practice' | 'Exam';
  score: number;
  totalScore: number;
  answers: Record<string, string>;
  questions: Question[];
  globalStats?: ExamStats; // Stats for Weekly Exams
}

export interface UserStats {
  streak: number;
  points: number;
  lastDailyChallenge?: string; 
}

export interface WeeklyExam {
  id: string;
  title: string;
  dateRange: string;
  status: 'upcoming' | 'available' | 'completed' | 'missed';
  questions: Question[];
}