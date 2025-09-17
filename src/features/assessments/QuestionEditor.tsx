// src/features/assessments/QuestionEditor.tsx
import { Box, Checkbox, FormControl, FormLabel, HStack, IconButton, Input, Select, VStack } from '@chakra-ui/react';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { type Question } from '../../api/db';

interface Props {
  question: Question;
  allQuestions: Question[];
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
}

export const QuestionEditor = ({ question, allQuestions, updateQuestion, removeQuestion }: Props) => {
  // A helper to update a specific property of the question
  const handleChange = (key: keyof Question, value: any) => {
    updateQuestion(question.id, { [key]: value });
  };
  
  return (
    <VStack p={4} borderWidth="1px" borderRadius="md" align="stretch" spacing={4} bg="white">
      <HStack justify="space-between">
        <FormLabel m={0}>Question Label</FormLabel>
        <IconButton aria-label="Remove question" icon={<SmallCloseIcon />} size="sm" onClick={() => removeQuestion(question.id)} />
      </HStack>
      <Input value={question.label} onChange={(e) => handleChange('label', e.target.value)} />
      
      {/* Inputs for options, if applicable */}
      {(question.type === 'single-choice' || question.type === 'multi-choice') && (
         <VStack align="stretch">
          {question.options?.map((opt, index) => (
            <Input key={index} value={opt} />
          ))}
         </VStack>
      )}

      {/* Inputs for validation */}
      <Checkbox isChecked={question.validation?.required} onChange={(e) => handleChange('validation', { ...question.validation, required: e.target.checked })}>
        Required
      </Checkbox>

      {/* Inputs for conditional logic */}
      <HStack>
        <Select 
          placeholder="Conditional on..."
          value={question.condition?.questionId || ''}
          onChange={(e) => handleChange('condition', { ...question.condition, questionId: e.target.value })}
        >
          {allQuestions.filter(q => q.id !== question.id).map(q => (
            <option key={q.id} value={q.id}>{q.label}</option>
          ))}
        </Select>
        <Input 
          placeholder="...equals value"
          value={question.condition?.value || ''}
          onChange={(e) => handleChange('condition', { ...question.condition, value: e.target.value })}
        />
      </HStack>
    </VStack>
  );
};