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
}