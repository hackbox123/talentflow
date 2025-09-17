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
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const rawTags = url.searchParams.get('tags');
    const tags = rawTags
      ? rawTags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
          .map(t => t.toLowerCase())
      : undefined; // Robust tag parsing
    // Start with a collection
    let jobCollection = db.jobs.orderBy('order');
    let jobsArray = await jobCollection.toArray();
    // Apply filters
    if (status) {
      jobsArray = jobsArray.filter(job => job.status === status);
    }
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase().trim();
      jobsArray = jobsArray.filter(job => {
        const titleMatch = job.title?.toLowerCase().includes(q);
        const slugMatch = job.slug?.toLowerCase().includes(q);
        const tagsMatch = (job.tags || []).some(tag => tag.toLowerCase().includes(q));
        return titleMatch || slugMatch || tagsMatch;
      });
    }
    if (tags && tags.length > 0) { // Filter by tags (case-insensitive, all selected must be present)
      jobsArray = jobsArray.filter(job => {
        const jobTagsLc = (job.tags || []).map(t => t.toLowerCase());
        return tags.every(tag => jobTagsLc.includes(tag));
      });
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
    const updatedJob = await db.jobs.get(Number(params.id));
    return HttpResponse.json(updatedJob);
  }),

  http.patch('/jobs/:id/reorder', async ({ request, params }) => {
    await delay(800);
    // Occasionally return a 500 error to test rollback
    if (Math.random() < 0.2) { // 20% failure rate for testing
      return new HttpResponse('Server error!', { status: 500 });
    }

    const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
    
    // Get all jobs and update their order values
    const allJobs = await db.jobs.toArray();
    
    // Find the job being moved
    const movedJob = allJobs.find(job => job.id === Number(params.id));
    if (!movedJob) {
      return new HttpResponse('Job not found', { status: 404 });
    }
    
    // Update the order of the moved job
    await db.jobs.update(Number(params.id), { order: toOrder });
    
    // Update orders of other jobs that were affected by the move
    const jobsToUpdate = allJobs.filter(job => {
      if (job.id === Number(params.id)) return false; // Skip the moved job
      
      if (fromOrder < toOrder) {
        // Moving down: jobs between fromOrder and toOrder move up
        return job.order > fromOrder && job.order <= toOrder;
      } else {
        // Moving up: jobs between toOrder and fromOrder move down
        return job.order >= toOrder && job.order < fromOrder;
      }
    });
    
    // Update the affected jobs
    for (const job of jobsToUpdate) {
      const newOrder = fromOrder < toOrder ? job.order - 1 : job.order + 1;
      await db.jobs.update(job.id!, { order: newOrder });
    }
    
    return HttpResponse.json({ success: true });
  }),

  // candidates handlers
  http.get('/candidates', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = 1000; // For virtualization, we often get all and filter on client.

    let candidates = await db.candidates.toArray();

    if (stage) {
      candidates = candidates.filter(c => c.stage === stage);
    }
    if (search) {
      candidates = candidates.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Server-side pagination is less critical for a virtualized list, but good to have
    const paginatedCandidates = candidates.slice((page - 1) * pageSize, page * pageSize);

    return HttpResponse.json(paginatedCandidates);
  }),

  // NEW: Handler to create a candidate
  http.post('/candidates', async ({ request }) => {
    await delay(500);
    if (Math.random() < 0.1) return new HttpResponse('Server Error', { status: 500 });
    
    const newCandidateData = await request.json() as any;
    const newCandidate = {
      ...newCandidateData,
      stage: 'applied', // Default to 'applied' stage
    };
    
    const id = await db.candidates.add(newCandidate);
    return HttpResponse.json({ ...newCandidate, id }, { status: 201 });
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
    console.log('API: Fetching assessment for jobId:', params.jobId);
    const assessment = await db.assessments.get(Number(params.jobId));
    console.log('API: Assessment found:', assessment);
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