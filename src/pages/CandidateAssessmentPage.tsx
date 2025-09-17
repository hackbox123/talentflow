// src/pages/CandidateAssessmentPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, Heading, Spinner, Text, VStack, HStack, 
  Alert, AlertIcon, AlertTitle, AlertDescription, useToast 
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

  if (loading) return <Spinner size="xl" />;

  if (!assessment) {
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
        
        <Alert status="warning">
          <AlertIcon />
          <Box>
            <AlertTitle>No Assessment Available</AlertTitle>
            <AlertDescription>
              This job doesn't have an assessment set up yet.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    );
  }

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
        <Heading size="xl" mb={2}>Job Assessment</Heading>
        <Text color="gray.600" mb={6}>
          Please complete this assessment to apply for the position. 
          All required fields must be filled out.
        </Text>

        <Box p={6} bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.200">
          <AssessmentPreview questions={assessment.questions} />
        </Box>
      </Box>
    </VStack>
  );
}
