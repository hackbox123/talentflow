// src/features/assessments/AssessmentPreview.tsx
import { useForm, useWatch } from 'react-hook-form';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  VStack,
  Checkbox,
  CheckboxGroup,
  FormErrorMessage,
  Text,
  Box,
} from '@chakra-ui/react';
import { type Question } from '../../api/db';

export const AssessmentPreview = ({ questions }: { questions: Question[] }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const formValues = useWatch({ control });

  const onSubmit = async (data: any) => {
    try {
      // This would call the POST /assessments/:jobId/submit endpoint
      const response = await fetch(`/assessments/${window.location.pathname.split('/')[2]}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: data,
          submittedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit assessment');
      
      console.log('Form Responses:', data);
      alert('Assessment submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  // Helper function to check if a question should be shown based on conditions
  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.condition) return true;
    
    const { questionId, value } = question.condition;
    const dependentValue = formValues[questionId];
    
    return dependentValue === value;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={6} align="stretch">
        {questions.length === 0 ? (
          <Text color="#6c757d" textAlign="center" py={8}>
            No questions added yet. Add questions in the editor to see the preview.
          </Text>
        ) : (
          questions.map(q => {
            if (!shouldShowQuestion(q)) return null;

          const validationRules = {
            required: q.validation?.required ? "This field is required" : false,
            maxLength: q.validation?.maxLength ? { value: q.validation.maxLength, message: `Must be ${q.validation.maxLength} characters or less` } : undefined,
            min: q.validation?.min !== undefined ? { value: q.validation.min, message: `Minimum value is ${q.validation.min}` } : undefined,
            max: q.validation?.max !== undefined ? { value: q.validation.max, message: `Maximum value is ${q.validation.max}` } : undefined,
          };

          return (
            <Box key={q.id} bg="white" p={4} borderRadius="md" boxShadow="0 6px 20px rgba(0,0,0,0.04)">
              <FormControl isInvalid={!!errors[q.id]} isRequired={q.validation?.required}>
                <FormLabel htmlFor={q.id} color="#232323">{q.label}</FormLabel>
                {q.type === 'short-text' && <Input id={q.id} {...register(q.id, validationRules)} bg="white" />}
                {q.type === 'long-text' && <Textarea id={q.id} {...register(q.id, validationRules)} bg="white" />}
                {q.type === 'numeric' && <Input type="number" id={q.id} {...register(q.id, validationRules)} bg="white" />}
                {q.type === 'single-choice' && (
                  <RadioGroup>
                    <Stack>
                      {q.options?.map(opt => (
                        <Radio key={opt} value={opt} {...register(q.id, validationRules)} colorScheme="green">{opt}</Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                )}
                {q.type === 'multi-choice' && (
                  <CheckboxGroup>
                    <Stack>
                      {q.options?.map(opt => (
                        <Checkbox key={opt} value={opt} {...register(q.id, validationRules)} colorScheme="green">{opt}</Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                )}
                {q.type === 'file' && <Input type="file" id={q.id} isDisabled p={1} />}
                {/* CORRECTED: Display the actual error message */}
                <FormErrorMessage>{errors[q.id] && String(errors[q.id]?.message)}</FormErrorMessage>
              </FormControl>
            </Box>
          );
          })
        )}
        {questions.length > 0 && (
          <Button type="submit" bg="#D4A373" color="#232323" mt={4} _hover={{ bg: '#CCD5AE' }}>Submit Assessment</Button>
        )}
      </VStack>
    </form>
  );
}