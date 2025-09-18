import Dexie, { type Table } from 'dexie';

// Define the structure of our data
export interface Job {
  id?: number;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
}

export interface Candidate {
  id?: number;
  name: string;
  email: string;
  jobId: number;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
}

export interface Timeline {
  id?: number;
  candidateId: number;
  date: string;
  event: string;
  stage?: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  notes?: string;
  userId?: string;
}

export interface Question {
  id: string; // e.g., 'q1', 'q2'
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file';
  label: string;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    maxLength?: number;
  };
  condition?: {
    questionId: string;
    value?: string;
  };
}

export interface Assessment {
  jobId: number;
  questions: Question[];
}

export interface AssessmentResponse {
  id?: number;
  candidateId: number;
  assessmentId: number; // This would be the jobId
  responses: Record<string, any>; // e.g., { q1: 'Yes', q2: 'Some text' }
}

// This is our database class
class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment, number>;
  assessmentResponses!: Table<AssessmentResponse>;
  timeline!: Table<Timeline>;

  constructor() {
    super('talentFlowDB');
    this.version(2).stores({
      jobs: '++id, title, slug, order, status',
      candidates: '++id, name, email, jobId, stage',
      assessments: 'jobId',
      assessmentResponses: '++id, candidateId, assessmentId',
      timeline: '++id, candidateId, date, stage'
    });
  }
}

// Export a single instance of the database
export const db = new TalentFlowDB();