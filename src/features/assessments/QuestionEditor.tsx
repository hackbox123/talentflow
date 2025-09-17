// src/features/assessments/QuestionEditor.tsx
import { Box, Button, Checkbox, FormControl, FormLabel, HStack, Icon, IconButton, Input, InputGroup, InputRightElement, Select, VStack } from '@chakra-ui/react';
import { AddIcon, DragHandleIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Question } from '../../api/db';


interface Props {
    question: Question;
    allQuestions: Question[];
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    removeQuestion: (id: string) => void;
}

export const QuestionEditor = ({ question, allQuestions, updateQuestion, removeQuestion }: Props) => {
    // CORRECTED: A more specific handler for validation to fix the 'never' type error
    const updateValidationRule = (rule: keyof NonNullable<Question['validation']>, value: any) => {
        updateQuestion(question.id, {
            validation: {
                ...question.validation,
                [rule]: value,
            },
        });
    };

    //drag and drop
    // 1. ADD THE useSortable HOOK
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question.id });

    // 2. DEFINE THE STYLE FOR DRAG ANIMATION
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(question.options || [])];
        newOptions[index] = value;
        updateQuestion(question.id, { options: newOptions });
    };

    const addOption = () => {
        const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
        updateQuestion(question.id, { options: newOptions });
    };

    const removeOption = (index: number) => {
        const newOptions = (question.options || []).filter((_, i) => i !== index);
        updateQuestion(question.id, { options: newOptions });
    };

    return (
      <div ref={setNodeRef} style={style}>
        <VStack p={4} borderWidth="1px" borderRadius="md" align="stretch" spacing={4} bg="white">
            <HStack justify="space-between">
                <HStack>
                    {/* 4. ADD THE DRAG HANDLE and apply the listeners to it */}
                    <Icon as={DragHandleIcon} cursor="grab" color="gray.400" {...attributes} {...listeners} />
                    <FormLabel m={0} fontWeight="bold" textTransform="capitalize">{question.type.replace('-', ' ')}</FormLabel>
                </HStack>
                <IconButton aria-label="Remove question" icon={<SmallCloseIcon />} size="sm" onClick={() => removeQuestion(question.id)} />
            </HStack>
            <Input placeholder="Question Label" value={question.label} onChange={(e) => updateQuestion(question.id, { label: e.target.value })} />

            {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                <VStack align="stretch" pl={4} borderLeft="2px solid" borderColor="gray.100">
                    <FormLabel fontSize="sm">Options</FormLabel>
                    {question.options?.map((opt, index) => (
                        <InputGroup key={index}>
                            <Input value={opt} onChange={(e) => handleOptionChange(index, e.target.value)} />
                            <InputRightElement>
                                <IconButton aria-label="Remove option" size="xs" icon={<SmallCloseIcon />} onClick={() => removeOption(index)} />
                            </InputRightElement>
                        </InputGroup>
                    ))}
                    <Button size="sm" leftIcon={<AddIcon />} onClick={addOption}>Add Option</Button>
                </VStack>
            )}

            <VStack align="stretch" pl={4} borderLeft="2px solid" borderColor="gray.100">
                <FormLabel fontSize="sm">Validation</FormLabel>
                <Checkbox isChecked={question.validation?.required} onChange={(e) => updateValidationRule('required', e.target.checked)}>Required</Checkbox>
                {(question.type === 'short-text' || question.type === 'long-text') && (
                    <Input placeholder="Max Length" type="number" value={question.validation?.maxLength || ''} onChange={(e) => updateValidationRule('maxLength', parseInt(e.target.value) || undefined)} />
                )}
                {question.type === 'numeric' && (
                    <HStack>
                        <Input placeholder="Min Value" type="number" value={question.validation?.min || ''} onChange={(e) => updateValidationRule('min', parseInt(e.target.value) || undefined)} />
                        <Input placeholder="Max Value" type="number" value={question.validation?.max || ''} onChange={(e) => updateValidationRule('max', parseInt(e.target.value) || undefined)} />
                    </HStack>
                )}
            </VStack>

            <VStack align="stretch" pl={4} borderLeft="2px solid" borderColor="gray.100">
                <FormLabel fontSize="sm">Conditional Logic</FormLabel>
                <HStack>
                    <Select
                        placeholder="Show this question if..."
                        value={question.condition?.questionId || ''}
                        // CORRECTED: Ensure value is reset if the questionId is cleared
                        onChange={(e) => updateQuestion(question.id, { condition: { questionId: e.target.value, value: '' } })}
                    >
                        {allQuestions.filter(q => q.id !== question.id && (q.type === 'single-choice')).map(q => (
                            <option key={q.id} value={q.id}>{q.label}</option>
                        ))}
                    </Select>
                    <Input
                        placeholder="...equals value"
                        value={question.condition?.value || ''}
                        // CORRECTED: Always include the existing questionId when updating the value
                        onChange={(e) => updateQuestion(question.id, {
                            condition: {
                                questionId: question.condition?.questionId!, // Use existing questionId
                                value: e.target.value
                            }
                        })}
                    />
                </HStack>
            </VStack>
        </VStack>
      </div >
    );
};