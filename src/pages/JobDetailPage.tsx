// src/pages/JobDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Box, Heading, Spinner, Text, VStack, HStack, Badge, Button, 
  Divider, Tag, TagLabel, Wrap, WrapItem, useToast 
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon } from '@chakra-ui/icons';
import { type Job } from '../api/db';

const JobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/jobs/${jobId}`);
        if (!response.ok) throw new Error('Job not found');
        const data = await response.json();
        setJob(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load job details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId, navigate, toast]);

  if (loading) return <Spinner size="xl" />;
  if (!job) return <Text>Job not found.</Text>;

  return (
    <VStack spacing={6} align="stretch" maxW="800px" mx="auto">
      <HStack>
        <Button 
          leftIcon={<ArrowBackIcon />} 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
        >
          Back to Jobs
        </Button>
      </HStack>

      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="xl">{job.title}</Heading>
          <Badge 
            colorScheme={job.status === 'active' ? 'green' : 'gray'} 
            fontSize="sm" 
            px={3} 
            py={1} 
            borderRadius="full"
          >
            {job.status}
          </Badge>
        </HStack>
        
        <Text color="gray.600" fontSize="lg" mb={6}>
          Job ID: {job.id} • Slug: {job.slug}
        </Text>

        <Box mb={6}>
          <Heading size="md" mb={3}>Tags</Heading>
          <Wrap>
            {job.tags.map(tag => (
              <WrapItem key={tag}>
                <Tag colorScheme="blue" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        <Divider my={6} />

        <VStack spacing={4} align="stretch">
          <Heading size="md">Actions</Heading>
          <HStack spacing={4} flexWrap="wrap">
            <Button 
              as={Link} 
              to={`/jobs/${job.id}/edit`}
              leftIcon={<EditIcon />}
              colorScheme="blue"
              variant="outline"
            >
              Edit Job
            </Button>
            <Button 
              as={Link} 
              to={`/jobs/${job.id}/assessment`}
              colorScheme="teal"
            >
              Manage Assessment
            </Button>
            <Button 
              as={Link} 
              to={`/jobs/${job.id}/livepreview`}
              colorScheme="green"
              size="lg"
            >
              Preview Assessment
            </Button>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default JobDetailPage;