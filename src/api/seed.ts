// src/api/seed.ts
import { faker } from '@faker-js/faker';
import { db, type Candidate, type Job } from './db';

const createSlug = (title: string) => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    console.log("Database already seeded.");
    return;
  }

  console.log("Seeding database...");

  const jobsToSeed:Job[] = [];
  for (let i = 0; i < 25; i++) {
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
  console.log("Seeded 25 jobs.");

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

  // NEW: Seed Assessments
console.log("Seeding assessments...");
const reactJobId = allJobs.find(job => job.title.toLowerCase().includes('react'))?.id || allJobs[0].id!;
const nodeJobId = allJobs.find(job => job.title.toLowerCase().includes('node'))?.id || allJobs[1].id!;
const managerJobId = allJobs.find(job => job.title.toLowerCase().includes('manager'))?.id || allJobs[2].id!;

await db.assessments.bulkPut([
  {
    jobId: reactJobId,
    questions: [
      { id: 'q1', type: 'numeric', label: 'How many years of React experience do you have?', validation: { required: true, min: 1 } },
      { id: 'q2', type: 'single-choice', label: 'Have you used TypeScript with React?', options: ['Yes', 'No'], validation: { required: true } },
      { id: 'q3', type: 'long-text', label: 'If yes, describe a time you used TypeScript to prevent a bug.', condition: { questionId: 'q2', value: 'Yes' } },
      { id: 'q4', type: 'multi-choice', label: 'Which state management libraries have you used?', options: ['Redux', 'Zustand', 'MobX', 'Recoil'], validation: { required: true } },
    ],
  },
  {
    jobId: nodeJobId,
    questions: [
      { id: 'n1', type: 'short-text', label: 'What is your primary backend framework (Express, NestJS, etc.)?', validation: { required: true } },
      { id: 'n2', type: 'single-choice', label: 'Do you have experience with microservices architecture?', options: ['Yes', 'No'], validation: { required: true } },
    ],
  },
  {
    jobId: managerJobId,
    questions: [
      { id: 'm1', type: 'long-text', label: 'Describe your leadership style.' },
      { id: 'm2', type: 'numeric', label: 'How many people have you directly managed?', validation: { min: 1 } },
    ],
  },
]);
console.log("Seeded 3 assessments.");
}