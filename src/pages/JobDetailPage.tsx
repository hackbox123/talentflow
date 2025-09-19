// src/pages/JobDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Box, Heading, Spinner, Text, VStack, HStack, Badge, Button, 
  Divider, Tag, TagLabel, Wrap, WrapItem, useToast, Kbd, List, ListItem 
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon } from '@chakra-ui/icons';
import { type Job, type Candidate } from '../api/db';

const JobDetailPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Candidate[] | null>(null);
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
        // fetch applicants for this job
        try {
          const candRes = await fetch(`/candidates?jobId=${data.id}`);
          if (candRes.ok) {
            const candidates = await candRes.json();
            setApplicants(candidates);
          }
        } catch {}
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

  if (loading) return <VStack justify="center" align="center" h="50vh"><Spinner size="xl" color="#D4A373" /></VStack>;
  if (!job) return <Text>Job not found.</Text>;

  return (
    <VStack spacing={6} align="stretch" maxW="900px" mx="auto" px={{ base: 4, md: 0 }}>
      <HStack>
        <Button 
          leftIcon={<ArrowBackIcon />} 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
        >
          Back to Jobs
        </Button>
      </HStack>

      <Box bg="#FFFFFF" p={{ base: 4, md: 8 }} borderRadius="xl" boxShadow="0 12px 40px rgba(0,0,0,0.06)">
        <HStack justify="space-between" mb={4}>
          <Heading size="xl" color="#232323">{job.title}</Heading>
          <Badge 
            bg={job.status === 'active' ? '#D4A373' : '#E9EDC9'}
            color="#232323"
            fontSize="sm"
            px={3}
            py={1}
            borderRadius="full"
            boxShadow="0 4px 12px rgba(212,163,115,0.12)"
          >
            {job.status}
          </Badge>
        </HStack>

        <Text color="#6c757d" fontSize="lg" mb={6}>
          Job ID: {job.id} • Slug: {job.slug}
          {applicants !== null && (
            <>
              {' '}• Applicants: <Kbd bg="#FAEDCD" color="#232323">{applicants.length}</Kbd>
            </>
          )}
        </Text>

        <Box mb={6}>
          <Heading size="md" mb={3} color="#232323">Tags</Heading>
          <Wrap>
            {job.tags.map(tag => (
              <WrapItem key={tag}>
                <Tag bg="#E9EDC9" color="#232323" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        <Divider my={6} borderColor="#E9EDC9" />

        <VStack spacing={4} align="stretch">
          <Heading size="md" color="#232323">Actions</Heading>
          <HStack spacing={4} flexWrap="wrap">
            <Button 
              as={Link} 
              to={`/jobs/${job.id}/edit`}
              leftIcon={<EditIcon />}
              bg="transparent"
              border="1px"
              borderColor="#CCD5AE"
              color="#232323"
              _hover={{ bg: '#FAEDCD' }}
            >
              Edit Job
            </Button>
            <Button 
              as={Link} 
              to={`/jobs/${job.id}/assessment`}
              bg="#CCD5AE"
              color="#232323"
              _hover={{ bg: '#E9EDC9' }}
            >
              Manage Assessment
            </Button>
            <Button 
              as={Link} 
              to={`/jobs/${job.id}/livepreview`}
              bg="#D4A373"
              color="#232323"
              size="lg"
              _hover={{ bg: '#CCD5AE' }}
            >
              Preview Assessment
            </Button>
          </HStack>
        </VStack>

        <Divider my={6} borderColor="#E9EDC9" />

        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Heading size="md" color="#232323">Applicants</Heading>
            {applicants !== null && (
              <Badge bg="#FAEDCD" color="#232323" borderRadius="full" px={3}>{applicants.length}</Badge>
            )}
          </HStack>
          {applicants === null ? (
            <Spinner />
          ) : applicants.length === 0 ? (
            <Text color="#6c757d">No applicants yet.</Text>
          ) : (
            <List spacing={2}>
              {applicants.map(c => (
                <ListItem key={c.id}>
                  <HStack justify="space-between" p={3} bg="#FEFAE0" borderRadius="md">
                    <VStack align="start" spacing={0}>
                      <Button as={Link} to={`/candidates/${c.id}`} variant="link" color="#232323">
                        {c.name}
                      </Button>
                      <Text fontSize="sm" color="#6c757d">{c.email}</Text>
                    </VStack>
                    <Badge
                      bg={
                        c.stage === 'offer' ? '#FFA500' : // orange
                        c.stage === 'applied' ? '#3182ce' : // blue.500
                        c.stage === 'tech' ? '#FF8C00' : // dark orange
                        c.stage === 'screen' ? '#38B2AC' : // teal.400
                        c.stage === 'hired' ? '#23f80fff' :
                        c.stage === 'rejected' ? '#f9422eff' :
                        '#CCD5AE'
                      }
                      color="#232323"
                    >
                      {c.stage}
                    </Badge>
                  </HStack>
                </ListItem>
              ))}
            </List>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default JobDetailPage;