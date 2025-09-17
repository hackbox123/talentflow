// src/api/handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { db } from './db';
import { type Job } from './db';
import { type Assessment, type AssessmentResponse } from './db';

export const handlers = [
  // Handler for GET /jobs
  http.get('/jobs', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);

    // Extract query params
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '15');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const tags = url.searchParams.get('tags')?.split(','); // NEW: Handle tags
    // Start with a collection
    let jobCollection = db.jobs.orderBy('order');
    let jobsArray = await jobCollection.toArray();
    // Apply filters
    if (status) {
      jobsArray = jobsArray.filter(job => job.status === status);
    }
    if (search) {
      jobsArray = jobsArray.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (tags && tags.length > 0) { // NEW: Filter by tags
      jobsArray = jobsArray.filter(job =>
        tags.every(tag => job.tags.includes(tag))
      );
    }

    const totalCount = jobsArray.length;
    const jobs = jobsArray.slice((page - 1) * pageSize, page * pageSize);

    return HttpResponse.json({
      jobs,
      totalCount,
      page,
      pageSize,
    });
  }),
  http.get('/jobs/:id', async ({ params }) => {
    await delay(300);
    const job = await db.jobs.get(Number(params.id));
    return job ? HttpResponse.json(job) : new HttpResponse('Not Found', { status: 404 });
  }),

  // Handler for POST /jobs
  http.post('/jobs', async ({ request }) => {
    await delay(Math.random() * 1000 + 200);

    // Simulate a 10% failure rate
    if (Math.random() < 0.1) {
      return new HttpResponse('Failed to create job', { status: 500 });
    }

    const newJobData = await request.json() as any; // Cast to any for simplicity here
    const newJob = {
      ...newJobData,
      status: 'active',
      tags: newJobData.tags || [],
    };

    const id = await db.jobs.add(newJob);

    return HttpResponse.json({ ...newJob, id }, { status: 201 });
  }),

  http.patch('/jobs/:id', async ({ request, params }) => {
    await delay(600);
    if (Math.random() < 0.1) return new HttpResponse('Server Error', { status: 500 });
    const updates = await request.json() as Partial<Job>;
    await db.jobs.update(Number(params.id), updates);
    return HttpResponse.json({ success: true });
  }),

  http.patch('/jobs/:id/reorder', async () => {
    await delay(800);
    // Occasionally return a 500 error to test rollback
    if (Math.random() < 0.2) { // 20% failure rate for testing
      return new HttpResponse('Server error!', { status: 500 });
    }

    // In a real app, you'd update the 'order' property in the DB here.
    // For now, we'll just simulate success.
    return HttpResponse.json({ success: true });
  }),

  // candidates handlers
  http.get('/candidates', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage');

    let candidateQuery = db.candidates.toCollection();

    if (stage) {
      candidateQuery = db.candidates.where('stage').equals(stage);
    }

    const candidates = await candidateQuery.toArray();
    return HttpResponse.json(candidates);
  }),
  http.get('/candidates/:id', async ({ params }) => {
    await delay(300);
    const candidate = await db.candidates.get(Number(params.id));
    return candidate ? HttpResponse.json(candidate) : new HttpResponse('Not Found', { status: 404 });
  }),
  http.get('/candidates/:id/timeline', async ({ params }) => {
    await delay(500);
    // Simulate a timeline for a candidate
    return HttpResponse.json([
      { event: 'Applied', date: '2025-09-10T10:00:00Z', notes: 'Applied via company website.' },
      { event: 'Moved to Screen', date: '2025-09-11T14:30:00Z', notes: 'Passed initial resume screen.' },
      { event: 'Moved to Tech', date: '2025-09-14T11:00:00Z', notes: 'Scheduled for technical interview.' },
    ]);
  }),
  http.patch('/candidates/:id', async ({ request, params }) => {
    await delay(600);
    if (Math.random() < 0.1) {
      return new HttpResponse('Server error', { status: 500 });
    }
    const { id } = params;
    const { stage } = await request.json() as any;
    await db.candidates.update(Number(id), { stage });
    return HttpResponse.json({ success: true });
  }),

  // Get the structure of an assessment for a job
  http.get('/assessments/:jobId', async ({ params }) => {
    await delay(400);
    const assessment = await db.assessments.get(Number(params.jobId));
    return HttpResponse.json(assessment || null);
  }),

  // Save or update an assessment structure
  http.put('/assessments/:jobId', async ({ request, params }) => {
    await delay(800);
    const assessmentData = await request.json() as Assessment;
    await db.assessments.put({ ...assessmentData, jobId: Number(params.jobId) });
    return HttpResponse.json({ success: true });
  }),

  // Submit a candidate's answers
  http.post('/assessments/:jobId/submit', async ({ request }) => {
    await delay(1000);
    const responseData = await request.json() as Omit<AssessmentResponse, 'id'>;
    await db.assessmentResponses.add(responseData);
    return HttpResponse.json({ success: true }, { status: 201 });
  }),


];