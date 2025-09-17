// src/pages/AssessmentBuilderPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Grid, GridItem, Heading, Spinner, useToast, VStack, HStack } from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type Question } from '../api/db';
import { AssessmentPreview } from '../features/assessments/AssessmentPreview';
import { QuestionEditor } from '../features/assessments/QuestionEditor';

export default function AssessmentBuilderPage() {
  const { jobId } = useParams();
  const toast = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions => questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };
  const removeQuestion = (id: string) => {
    setQuestions(questions => questions.filter(q => q.id !== id));
  };

  useEffect(() => {
    // Load existing assessment structure
    fetch(`/assessments/${jobId}`).then(res => res.json()).then(data => {
      if (data) {
        setQuestions(data.questions);
      }
      setLoading(false);
    });
  }, [jobId]);

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: `q_${nanoid(5)}`,
      type,
      label: 'New Question',
      options: type === 'single-choice' || type === 'multi-choice' ? ['Option 1'] : undefined,
      validation: { required: false },
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleSave = async () => {
    await fetch(`/assessments/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions }),
    });
    toast({ title: "Assessment saved!", status: 'success' });
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

  if (loading) return <Spinner />;

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={8}>
      <GridItem as={VStack} align="stretch" spacing={4}>
        <HStack justify="space-between">
          <Heading size="lg">Assessment Builder</Heading>
          <Button colorScheme="blue" onClick={handleSave} isLoading={loading}>Save</Button>
        </HStack>
        <Button onClick={() => addQuestion('short-text')}>Add Short Text</Button>
        <Button onClick={() => addQuestion('long-text')}>Add Long Text</Button>
        <Button onClick={() => addQuestion('numeric')}>Add Numeric</Button>
        <Button onClick={() => addQuestion('single-choice')}>Add Single Choice</Button>
        <Button onClick={() => addQuestion('multi-choice')}>Add Multi Choice</Button>
        
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            <VStack align="stretch" spacing={4} mt={6}>
              {questions.map(q => (
                // Note: QuestionEditor will need a small change to be draggable
                <QuestionEditor 
                  key={q.id} 
                  question={q} 
                  allQuestions={questions}
                  updateQuestion={updateQuestion}
                  removeQuestion={removeQuestion}
                />
              ))}
            </VStack>
          </SortableContext>
        </DndContext>
      </GridItem>
      <GridItem p={6} bg="gray.50" borderRadius="md">
        <Heading size="lg" mb={6}>Live Preview</Heading>
        <AssessmentPreview questions={questions} />
      </GridItem>
    </Grid>
  );
}