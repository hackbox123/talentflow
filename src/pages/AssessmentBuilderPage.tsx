// src/pages/AssessmentBuilderPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, Grid, GridItem, Heading, Spinner, useToast, VStack, HStack,
  Text, IconButton, Badge, Card, CardBody, CardHeader, Flex, Container
} from '@chakra-ui/react';
import { 
  ArrowBackIcon, AddIcon, EditIcon, ViewIcon, SettingsIcon 
} from '@chakra-ui/icons';
import { nanoid } from 'nanoid';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type Question } from '../api/db';
import { AssessmentPreview } from '../features/assessments/AssessmentPreview';
import { QuestionEditor } from '../features/assessments/QuestionEditor';

export default function AssessmentBuilderPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions => questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };
  const removeQuestion = (id: string) => {
    setQuestions(questions => questions.filter(q => q.id !== id));
  };

  useEffect(() => {
    // Load existing assessment structure
    console.log('Fetching assessment for jobId:', jobId);
    fetch(`/assessments/${jobId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Assessment data received:', data);
        if (data && data.questions) {
          setQuestions(data.questions);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching assessment:', error);
        setLoading(false);
      });
  }, [jobId]);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `q_${nanoid(5)}`,
      type,
      label: `New ${type.replace('-', ' ')} Question`,
      options: type === 'single-choice' || type === 'multi-choice' ? ['Option 1', 'Option 2'] : undefined,
      validation: { required: false },
    };
    setQuestions(prev => [...prev, newQuestion]);
    toast({
      title: 'Question Added',
      description: `New ${type.replace('-', ' ')} question added to assessment`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/assessments/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      
      if (!response.ok) throw new Error('Failed to save assessment');
      
      toast({ 
        title: 'Assessment saved!', 
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save assessment',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setSaving(false);
    }
  };

  // NEW: Handler for reordering questions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (loading) return (
    <Flex justify="center" align="center" h="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" />
        <Text>Loading assessment builder...</Text>
      </VStack>
    </Flex>
  );

  return (
    <Container maxW="full" p={0}>
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" p={6}>
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <IconButton
              aria-label="Back to job"
              icon={<ArrowBackIcon />}
              variant="ghost"
              onClick={() => navigate(`/jobs/${jobId}`)}
            />
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="gray.800">Assessment Builder</Heading>
              <Text color="gray.600" fontSize="sm">
                Create and customize your job assessment
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={3}>
            <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
              {questions.length} Questions
            </Badge>
            <Button 
              colorScheme="blue" 
              onClick={handleSave} 
              isLoading={saving}
              loadingText="Saving..."
              leftIcon={<SettingsIcon />}
            >
              Save Assessment
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Grid templateColumns="1fr 400px" gap={0} h="calc(100vh - 120px)">
        {/* Main Editor */}
        <GridItem bg="gray.50" p={6} overflowY="auto">
          <VStack spacing={6} align="stretch">
            {/* Add Question Section */}
            <Card>
              <CardHeader pb={3}>
                <HStack justify="space-between">
                  <Heading size="md" color="gray.700">Add Questions</Heading>
                  <Badge colorScheme="green" variant="subtle">
                    {questions.length} Total
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" color="gray.600">
                    Choose a question type to add to your assessment:
                  </Text>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                    <Button
                      leftIcon={<AddIcon />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => addQuestion('short-text')}
                      h="60px"
                      flexDirection="column"
                      gap={1}
                    >
                      <Text fontSize="sm" fontWeight="medium">Short Text</Text>
                      <Text fontSize="xs" color="gray.500">Single line input</Text>
                    </Button>
                    
                    <Button
                      leftIcon={<AddIcon />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => addQuestion('long-text')}
                      h="60px"
                      flexDirection="column"
                      gap={1}
                    >
                      <Text fontSize="sm" fontWeight="medium">Long Text</Text>
                      <Text fontSize="xs" color="gray.500">Multi-line input</Text>
                    </Button>
                    
                    <Button
                      leftIcon={<AddIcon />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => addQuestion('numeric')}
                      h="60px"
                      flexDirection="column"
                      gap={1}
                    >
                      <Text fontSize="sm" fontWeight="medium">Numeric</Text>
                      <Text fontSize="xs" color="gray.500">Number input</Text>
                    </Button>
                    
                    <Button
                      leftIcon={<AddIcon />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => addQuestion('single-choice')}
                      h="60px"
                      flexDirection="column"
                      gap={1}
                    >
                      <Text fontSize="sm" fontWeight="medium">Single Choice</Text>
                      <Text fontSize="xs" color="gray.500">Radio buttons</Text>
                    </Button>
                    
                    <Button
                      leftIcon={<AddIcon />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => addQuestion('multi-choice')}
                      h="60px"
                      flexDirection="column"
                      gap={1}
                    >
                      <Text fontSize="sm" fontWeight="medium">Multi Choice</Text>
                      <Text fontSize="xs" color="gray.500">Checkboxes</Text>
                    </Button>
                    
                    <Button
                      leftIcon={<AddIcon />}
                      variant="outline"
                      colorScheme="blue"
                      onClick={() => addQuestion('file')}
                      h="60px"
                      flexDirection="column"
                      gap={1}
                    >
                      <Text fontSize="sm" fontWeight="medium">File Upload</Text>
                      <Text fontSize="xs" color="gray.500">Document upload</Text>
                    </Button>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* Questions List */}
            {questions.length === 0 ? (
              <Card>
                <CardBody textAlign="center" py={12}>
                  <VStack spacing={4}>
                    <Box p={4} bg="blue.50" borderRadius="full">
                      <EditIcon boxSize={8} color="blue.500" />
                    </Box>
                    <VStack spacing={2}>
                      <Heading size="md" color="gray.600">No Questions Yet</Heading>
                      <Text color="gray.500" fontSize="sm">
                        Add your first question using the buttons above to get started
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardHeader pb={3}>
                  <HStack justify="space-between">
                    <Heading size="md" color="gray.700">Questions</Heading>
                    <Text fontSize="sm" color="gray.500">
                      Drag to reorder
                    </Text>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                      <VStack align="stretch" spacing={4}>
                        {questions.map((q, index) => (
                          <QuestionEditor 
                            key={q.id} 
                            question={q} 
                            allQuestions={questions}
                            updateQuestion={updateQuestion}
                            removeQuestion={removeQuestion}
                            questionNumber={index + 1}
                          />
                        ))}
                      </VStack>
                    </SortableContext>
                  </DndContext>
                </CardBody>
              </Card>
            )}
          </VStack>
        </GridItem>
        
        {/* Preview Panel */}
        <GridItem bg="white" borderLeft="1px" borderColor="gray.200" p={6} overflowY="auto">
          <VStack spacing={4} align="stretch" h="full">
            <HStack justify="space-between">
              <Heading size="md" color="gray.700">Live Preview</Heading>
              <Badge colorScheme="green" variant="subtle">
                <ViewIcon mr={1} />
                Candidate View
              </Badge>
            </HStack>
            
            <Text fontSize="sm" color="gray.600">
              This is how candidates will see and interact with your assessment
            </Text>
            
            <Box flex="1" overflowY="auto">
              <AssessmentPreview questions={questions} />
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
}