// src/pages/CandidateAssessmentPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { AssessmentPreview } from '../features/assessments/AssessmentPreview';
import { type Assessment } from '../api/db';

export default function CandidateAssessmentPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/assessments/${jobId}`);
        if (!response.ok) throw new Error('Assessment not found');
        const data = await response.json();
        setAssessment(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load assessment',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [jobId, navigate, toast]);

  if (loading) return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="40vh">
      <Spinner size="xl" color="#D4A373" />
    </Box>
  );

  if (!assessment) {
    return (
      <Box bg="#FEFAE0" minH="60vh" p={6}>
        <Box maxW="800px" mx="auto" bg="white" p={6} borderRadius="xl" boxShadow="0 8px 32px rgba(212,163,115,0.06)">
          <VStack spacing={6} align="stretch">
            <HStack>
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                onClick={() => navigate('/jobs')}
                color="#232323"
              >
                Back to Jobs
              </Button>
            </HStack>

            <Alert status="warning" bg="#FAEDCD" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>No Assessment Available</AlertTitle>
                <AlertDescription>
                  This job doesn't have an assessment set up yet.
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box bg="#FEFAE0" minH="80vh" p={6}>
      <Box maxW="800px" mx="auto" bg="white" p={6} borderRadius="xl" boxShadow="0 8px 32px rgba(212,163,115,0.06)">
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate('/jobs')}
              color="#232323"
            >
              Back to Jobs
            </Button>
          </HStack>

          <Box>
            <Heading size="xl" mb={2} color="#232323">Job Assessment</Heading>
            <Text color="#6c757d" mb={6}>
              Please complete this assessment to apply for the position. 
              All required fields must be filled out.
            </Text>

            <Box p={6} bg="white" borderRadius="md" borderWidth="1px" borderColor="#E9EDC9" boxShadow="0 6px 20px rgba(0,0,0,0.06)">
              <AssessmentPreview questions={assessment.questions} />
            </Box>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
