export interface CreateQuizDTO {
  title: string;
  description?: string;
  questions: CreateQuestionDTO[];
}

export interface CreateQuestionDTO {
  question: string;
  timeLimit?: number;
  options: CreateOptionDTO[];
}

export interface CreateOptionDTO {
  text: string;
  isCorrect: boolean;
}

export interface QuizResponse {
  id: string;
  title: string;
  description?: string;
  questions: QuestionResponse[];
  createdAt: Date;
}

export interface QuestionResponse {
  id: string;
  question: string;
  timeLimit: number;
  order: number;
  options: OptionResponse[];
}

export interface OptionResponse {
  id: string;
  text: string;
  order: number;
  isCorrect?: boolean; 
}