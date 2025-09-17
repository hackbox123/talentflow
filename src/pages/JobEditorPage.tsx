import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Heading, Spinner, useToast } from '@chakra-ui/react';
import { JobForm } from '../features/jobs/JobForm';
import { type Job } from '../api/db';

export default function JobEditorPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const isEditing = useMemo(() => Boolean(jobId), [jobId]);
    const [job, setJob] = useState<Job | undefined>(undefined);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all jobs for client-side slug uniqueness validation
                const jobsRes = await fetch(`/jobs?page=1&pageSize=1000`);
                const jobsData = await jobsRes.json();
                setAllJobs(jobsData.jobs ?? []);

                if (isEditing) {
                    const res = await fetch(`/jobs/${jobId}`);
                    if (!res.ok) throw new Error('Failed to load job');
                    const data = await res.json();
                    setJob(data);
                }
            } catch (error) {
                toast({ title: 'Failed to load data', status: 'error', isClosable: true });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isEditing, jobId, toast]);

    const handleSubmit = async (formData: { title: string; slug: string; tags: string[]; }) => {
        setIsSaving(true);
        try {
            const url = isEditing ? `/jobs/${jobId}` : '/jobs';
            const method = isEditing ? 'PATCH' : 'POST';
            
            // For new jobs, include the order field (set to end of list)
            const jobData = isEditing ? formData : { ...formData, order: allJobs.length };
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(jobData),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save job: ${errorText}`);
            }
            toast({ title: `Job ${isEditing ? 'updated' : 'created'}.`, status: 'success', duration: 3000, isClosable: true });
            navigate('/jobs');
        } catch (error) {
            toast({ title: 'An error occurred.', description: (error as Error).message, status: 'error', duration: 5000, isClosable: true });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/jobs');
    };

    if (isLoading) return (<Spinner />);

    return (
        <Box>
            <Heading mb={6}>{isEditing ? 'Edit Job' : 'Create New Job'}</Heading>
            <JobForm
                job={job}
                allJobs={allJobs}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSaving}
            />
        </Box>
    );
}


