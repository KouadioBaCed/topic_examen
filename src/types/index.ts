export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionStatus = 'unseen' | 'seen' | 'marked' | 'answered';

export type AnswerType = 'single' | 'multiple';

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  image?: string;
  answers: Answer[];
  answerType: AnswerType;
  explanation: string;
  difficulty: Difficulty;
  topic: string;
  chapter: string;
  status: QuestionStatus;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  questionCount: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  name: string;
  slug: string;
  questionCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  topics: Topic[];
  color: string;
  subcategories?: Category[];
}

export interface ExamResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  score: number;
  timeSpent: number;
  questions: ExamQuestionResult[];
}

export interface ExamQuestionResult {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface ExamSettings {
  questionCount: number;
  timeLimit: number; // in minutes
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showFeedback: boolean;
}

export interface FilterState {
  difficulty: Difficulty | 'all';
  status: QuestionStatus | 'all';
  chapter: string | 'all';
  search: string;
}

// Professional Categories for Homepage
export type ProfessionalDomain = 'audit-compliance' | 'project-management' | 'data-analytics';

export interface Certification {
  id: string;
  name: string;
  fullName: string;
  slug: string;
  description: string;
  detailedDescription?: string;
  examOverview?: string;
  highlights?: string[];
  icon: string;
  color: string;
  badge?: 'POPULAR' | 'NEW';
  questionCount: number;
  topicCount: number;
  subcategoryIds: string[];
  technicalInfo?: {
    organization: string;
    duration: string;
    questionCount: string;
    language: string;
    format: string;
  };
}

export interface ProfessionalCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  domain: ProfessionalDomain;
  certifications: Certification[];
}

export interface CertificationFilterState {
  domain: ProfessionalDomain | 'all';
  search: string;
}

// Auth & Admin types
export type UserRole = 'user' | 'admin';

export type CertificationSlug = 'cfe' | 'cia-1' | 'cia-2' | 'cia-3' | 'cisa' | 'pmp' | 'capm' | 'pm4ngos' | 'pl-300'
  | 'social-good-dpro' | 'program-dpro' | 'finance-dpro' | 'meal-dpro' | 'mos-excel';

export interface CourseSubscription {
  courseSlug: CertificationSlug;
  reference: string;
  amount: number;
  currency: string;
  paidAt: string;
  expiresAt: string;
  paymentMethod?: string | null;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  allowedCourses: CertificationSlug[];
  createdAt: string;
  expiresAt: string;
  courseSubscriptions?: CourseSubscription[];
}

export interface StoredExamAnswer {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  questionText?: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
}

export interface StoredExamResult {
  id?: string;
  userId: string;
  certification: string;
  examType: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  timeSpent: number;
  answers: StoredExamAnswer[];
  completedAt: string;
}
