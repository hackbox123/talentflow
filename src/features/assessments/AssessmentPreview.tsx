// src/features/assessments/AssessmentPreview.tsx
import { useForm, useWatch } from 'react-hook-form';
import { Box, Button, FormControl, FormLabel, Input, Radio, RadioGroup, Stack, Textarea,VStack,Checkbox,CheckboxGroup,FormErrorMessage } from '@chakra-ui/react';
import { type Question } from '../../api/db';

export const AssessmentPreview = ({ questions }: { questions: Question[] }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const formValues = useWatch({ control });

  const onSubmit = (data: any) => {
    // This would call the POST /assessments/:jobId/submit endpoint
    console.log('Form Responses:', data);
    alert('Check the console for form responses!');
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={6} align="stretch">
        {questions.map(q => {
          let shouldShow = !q.condition || formValues[q.condition.questionId] === q.condition.value;
          if (!shouldShow) return null;

          const validationRules = {
            required: q.validation?.required ? "This field is required" : false,
            maxLength: q.validation?.maxLength ? { value: q.validation.maxLength, message: `Must be ${q.validation.maxLength} characters or less` } : undefined,
            min: q.validation?.min !== undefined ? { value: q.validation.min, message: `Minimum value is ${q.validation.min}` } : undefined,
            max: q.validation?.max !== undefined ? { value: q.validation.max, message: `Maximum value is ${q.validation.max}` } : undefined,
          };

          return (
            <FormControl key={q.id} isInvalid={!!errors[q.id]} isRequired={q.validation?.required}>
              <FormLabel htmlFor={q.id}>{q.label}</FormLabel>
              {q.type === 'short-text' && <Input id={q.id} {...register(q.id, validationRules)} />}
              {q.type === 'long-text' && <Textarea id={q.id} {...register(q.id, validationRules)} />}
              {q.type === 'numeric' && <Input type="number" id={q.id} {...register(q.id, validationRules)} />}
              {q.type === 'single-choice' && (
                <RadioGroup>
                  <Stack>
                    {q.options?.map(opt => (
                      <Radio key={opt} value={opt} {...register(q.id, validationRules)}>{opt}</Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
              {q.type === 'multi-choice' && (
                <CheckboxGroup>
                  <Stack>
                    {q.options?.map(opt => (
                      <Checkbox key={opt} value={opt} {...register(q.id, validationRules)}>{opt}</Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              )}
              {q.type === 'file' && <Input type="file" id={q.id} isDisabled p={1} />}
              {/* CORRECTED: Display the actual error message */}
              <FormErrorMessage>{errors[q.id] && String(errors[q.id]?.message)}</FormErrorMessage>
            </FormControl>
          );
        })}
        <Button type="submit" colorScheme="green" mt={4}>Submit Assessment</Button>
      </VStack>
    </form>
  );
}