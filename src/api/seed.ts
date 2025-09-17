// src/api/seed.ts
import { faker } from '@faker-js/faker';
import { db, type Candidate, type Job } from './db';

const createSlug = (title: string) => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    console.log("Database already seeded. Clearing and re-seeding...");
    // Clear existing data to ensure fresh seed with specific jobs
    await db.jobs.clear();
    await db.candidates.clear();
    await db.assessments.clear();
    await db.assessmentResponses.clear();
  }

  console.log("Seeding database...");

  const jobsToSeed:Job[] = [];
  
  // Create specific jobs for assessments
  const specificJobs = [
    { title: 'Senior React Developer', tags: ['React', 'TypeScript', 'Frontend', 'Senior'] },
    { title: 'Node.js Backend Engineer', tags: ['Node.js', 'Backend', 'JavaScript', 'API'] },
    { title: 'Engineering Manager', tags: ['Management', 'Leadership', 'Engineering', 'Senior'] },
  ];
  
  for (let i = 0; i < specificJobs.length; i++) {
    const job = specificJobs[i];
    jobsToSeed.push({
      title: job.title,
      slug: `${createSlug(job.title)}-${faker.string.uuid().substring(0, 5)}`,
      status: 'active',
      tags: job.tags,
      order: i,
    });
  }
  
  // Create additional random jobs
  for (let i = specificJobs.length; i < 25; i++) {
    const title = faker.person.jobTitle();
    jobsToSeed.push({
      title: title,
      slug: `${createSlug(title)}-${faker.string.uuid().substring(0, 5)}`,
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: faker.helpers.arrayElements(['Full-time', 'Remote', 'Contract', 'Engineering'], { min: 1, max: 3 }),
      order: i,
    });
  }
  
  await db.jobs.bulkAdd(jobsToSeed);
  console.log("Seeded 25 jobs (3 specific + 22 random).");

  const allJobs = await db.jobs.toArray();
  const candidatesToSeed = [];
  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

  for (let i = 0; i < 1000; i++) {
    candidatesToSeed.push({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      jobId: faker.helpers.arrayElement(allJobs).id!,
      stage: faker.helpers.arrayElement(stages),
    });
  }
  await db.candidates.bulkAdd(candidatesToSeed);
  console.log("Seeded 1000 candidates.");

  // Enhanced: Seed comprehensive assessments with 10+ questions each
console.log("Seeding assessments...");
const reactJobId = allJobs.find(job => job.title === 'Senior React Developer')?.id!;
const nodeJobId = allJobs.find(job => job.title === 'Node.js Backend Engineer')?.id!;
const managerJobId = allJobs.find(job => job.title === 'Engineering Manager')?.id!;

await db.assessments.bulkPut([
  {
    jobId: reactJobId,
    questions: [
      { id: 'r1', type: 'numeric', label: 'How many years of React experience do you have?', validation: { required: true, min: 0, max: 20 } },
      { id: 'r2', type: 'single-choice', label: 'Have you used TypeScript with React?', options: ['Yes', 'No'], validation: { required: true } },
      { id: 'r3', type: 'long-text', label: 'If yes, describe a time you used TypeScript to prevent a bug.', condition: { questionId: 'r2', value: 'Yes' }, validation: { maxLength: 500 } },
      { id: 'r4', type: 'multi-choice', label: 'Which state management libraries have you used?', options: ['Redux', 'Zustand', 'MobX', 'Recoil', 'Context API', 'Apollo Client'], validation: { required: true } },
      { id: 'r5', type: 'short-text', label: 'What is your preferred testing framework?', validation: { required: true, maxLength: 100 } },
      { id: 'r6', type: 'single-choice', label: 'Do you have experience with React hooks?', options: ['Yes', 'No'], validation: { required: true } },
      { id: 'r7', type: 'long-text', label: 'Describe a complex React component you built and the challenges you faced', condition: { questionId: 'r6', value: 'Yes' }, validation: { maxLength: 800 } },
      { id: 'r8', type: 'multi-choice', label: 'Which build tools have you used with React?', options: ['Webpack', 'Vite', 'Create React App', 'Next.js', 'Parcel'], validation: { required: true } },
      { id: 'r9', type: 'numeric', label: 'How many React projects have you worked on?', validation: { min: 0, max: 100 } },
      { id: 'r10', type: 'short-text', label: 'What is your favorite React feature and why?', validation: { maxLength: 200 } },
      { id: 'r11', type: 'single-choice', label: 'Have you worked with React Server Components?', options: ['Yes', 'No', 'Not sure'], validation: { required: false } },
      { id: 'r12', type: 'file', label: 'Upload your portfolio or GitHub profile screenshot', validation: { required: false } },
    ],
  },
  {
    jobId: nodeJobId,
    questions: [
      { id: 'n1', type: 'short-text', label: 'What is your primary backend framework?', validation: { required: true, maxLength: 50 } },
      { id: 'n2', type: 'single-choice', label: 'Do you have experience with microservices architecture?', options: ['Yes', 'No'], validation: { required: true } },
      { id: 'n3', type: 'long-text', label: 'Describe a challenging backend problem you solved', condition: { questionId: 'n2', value: 'Yes' }, validation: { maxLength: 1000 } },
      { id: 'n4', type: 'numeric', label: 'How many API endpoints have you built?', validation: { min: 0, max: 1000 } },
      { id: 'n5', type: 'multi-choice', label: 'Which databases have you worked with?', options: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch'], validation: { required: true } },
      { id: 'n6', type: 'single-choice', label: 'Do you have experience with authentication systems?', options: ['JWT', 'OAuth', 'Session-based', 'Multiple', 'None'], validation: { required: true } },
      { id: 'n7', type: 'long-text', label: 'Describe your experience with error handling and logging in Node.js applications', validation: { maxLength: 600 } },
      { id: 'n8', type: 'multi-choice', label: 'Which testing frameworks have you used?', options: ['Jest', 'Mocha', 'Chai', 'Supertest', 'Cypress'], validation: { required: true } },
      { id: 'n9', type: 'numeric', label: 'How many years of Node.js experience do you have?', validation: { required: true, min: 0, max: 15 } },
      { id: 'n10', type: 'short-text', label: 'What is your preferred package manager?', options: ['npm', 'yarn', 'pnpm'], validation: { required: true } },
      { id: 'n11', type: 'single-choice', label: 'Have you worked with GraphQL?', options: ['Yes', 'No'], validation: { required: false } },
      { id: 'n12', type: 'file', label: 'Upload a sample of your Node.js code', validation: { required: false } },
    ],
  },
  {
    jobId: managerJobId,
    questions: [
      { id: 'm1', type: 'long-text', label: 'Describe your leadership style and approach to team management', validation: { required: true, maxLength: 800 } },
      { id: 'm2', type: 'numeric', label: 'How many people have you directly managed?', validation: { min: 0, max: 100 } },
      { id: 'm3', type: 'single-choice', label: 'Do you have experience with agile methodologies?', options: ['Yes', 'No'], validation: { required: true } },
      { id: 'm4', type: 'multi-choice', label: 'Which project management tools have you used?', options: ['Jira', 'Trello', 'Asana', 'Monday.com', 'Notion'], validation: { required: true } },
      { id: 'm5', type: 'short-text', label: 'What is your biggest management challenge?', validation: { maxLength: 200 } },
      { id: 'm6', type: 'single-choice', label: 'How do you handle team conflicts?', options: ['Direct confrontation', 'Mediation', 'Team meetings', 'One-on-one discussions', 'Avoidance'], validation: { required: true } },
      { id: 'm7', type: 'long-text', label: 'Describe a time when you had to make a difficult decision that affected your team', validation: { maxLength: 600 } },
      { id: 'm8', type: 'multi-choice', label: 'Which leadership styles do you identify with?', options: ['Democratic', 'Autocratic', 'Transformational', 'Servant Leadership', 'Laissez-faire'], validation: { required: true } },
      { id: 'm9', type: 'numeric', label: 'How many years of management experience do you have?', validation: { required: true, min: 0, max: 20 } },
      { id: 'm10', type: 'short-text', label: 'What motivates you as a leader?', validation: { maxLength: 300 } },
      { id: 'm11', type: 'single-choice', label: 'Do you have experience with remote team management?', options: ['Yes', 'No'], validation: { required: true } },
      { id: 'm12', type: 'file', label: 'Upload your management philosophy document', validation: { required: false } },
    ],
  },
]);
console.log("Seeded 3 comprehensive assessments with 12 questions each.");
}