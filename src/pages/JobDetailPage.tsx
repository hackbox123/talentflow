// src/pages/JobDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Spinner, Text } from '@chakra-ui/react';
import { type Job } from '../api/db';
import { Link } from 'react-router-dom'; // <-- Import Link
import { Button } from '@chakra-ui/react'; // <-- Import Button

const JobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/jobs/${jobId}`)
      .then(res => res.json())
      .then(data => {
        setJob(data);
        setLoading(false);
      });
  }, [jobId]);

  if (loading) return <Spinner />;
  if (!job) return <Text>Job not found.</Text>;

  return (
    <Box>
      <Heading>{job.title}</Heading>
      <Text>Status: {job.status}</Text>
      <Text>Tags: {job.tags.join(', ')}</Text>
      <Button as={Link} to={`/jobs/${job.id}/assessment`} colorScheme="teal" mt={6}>
        Edit Assessment
      </Button>
    </Box>
  );
};

export default JobDetailPage;