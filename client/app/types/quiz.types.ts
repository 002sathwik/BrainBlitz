export interface Quiz {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  _count?: { questions: number };
}

export interface Question {
  question: string;
  timeLimit: number;
  options: { text: string; isCorrect: boolean }[];
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  questions: Question[];
}