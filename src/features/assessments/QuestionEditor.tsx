// src/features/assessments/QuestionEditor.tsx
import { Box, Button, Checkbox, FormControl, FormLabel, HStack, Icon, IconButton, Input, InputGroup, InputRightElement, Select, VStack } from '@chakra-ui/react';
import { Badge, Text } from '@chakra-ui/react';
import { AddIcon, DragHandleIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Question } from '../../api/db';


interface Props {
    question: Question;
    allQuestions: Question[];
    updateQuestion: (id: string, updates: Partial<Question>) => void;
    removeQuestion: (id: string) => void;
    questionNumber?: number;
}

export const QuestionEditor = ({ question, allQuestions, updateQuestion, removeQuestion, questionNumber }: Props) => {
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

  // Precompute available questions for conditional logic (those before this question)
  const availableQuestions = allQuestions.filter(q => {
    const currentIndex = allQuestions.findIndex(questionItem => questionItem.id === q.id);
    const thisIndex = allQuestions.findIndex(questionItem => questionItem.id === question.id);
    return q.id !== question.id && currentIndex < thisIndex;
  });

  const dependentQuestion = allQuestions.find(q => q.id === question.condition?.questionId);

    return (
      <div ref={setNodeRef} style={style}>
        <Box
          p={{ base: 3, md: 6 }}
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          shadow="sm"
          borderColor="#E9EDC9"
          _hover={{ shadow: "md", borderColor: "#D4A373" }}
          transition="all 0.2s"
        >
          {/* Header */}
          <HStack justify="space-between" mb={4} flexDir={{ base: 'column', sm: 'row' }} align={{ base: 'flex-start', sm: 'center' }} gap={2}>
            <HStack spacing={3} align="center">
              <Icon
                as={DragHandleIcon}
                cursor="grab"
                color="#6c757d"
                _hover={{ color: "#D4A373" }}
                {...attributes}
                {...listeners}
              />
              <Badge
                bg="#CCD5AE"
                color="#232323"
                fontSize={{ base: 'xs', md: 'xs' }}
                px={2}
                py={1}
                borderRadius="md"
              >
                Q{questionNumber}
              </Badge>
              <Badge
                bg="#FAEDCD"
                color="#232323"
                fontSize={{ base: 'xs', md: 'xs' }}
                px={2}
                py={1}
                borderRadius="md"
                textTransform="capitalize"
              >
                {question.type.replace('-', ' ')}
              </Badge>
            </HStack>
            <IconButton
              aria-label="Remove question"
              icon={<SmallCloseIcon />}
              size={{ base: 'sm', md: 'sm' }}
              variant="ghost"
              colorScheme="red"
              onClick={() => removeQuestion(question.id)}
              alignSelf={{ base: 'flex-end', sm: 'auto' }}
            />
          </HStack>

          {/* Question Label */}
            <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
                Question Text
              </FormLabel>
              <Input 
                placeholder="Enter your question here..." 
                value={question.label} 
                onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                size="md"
              />
            </FormControl>

            {/* Options for choice questions */}
            {(question.type === 'single-choice' || question.type === 'multi-choice') && (
              <Box p={{ base: 2, md: 4 }} bg="#FEFAE0" borderRadius="md" border="1px" borderColor="#E9EDC9">
                <FormLabel fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium" color="#232323" mb={3}>
                  Answer Options
                </FormLabel>
                <VStack align="stretch" spacing={2}>
                  {question.options?.map((opt, index) => (
                    <InputGroup key={index} size="sm">
                      <Input
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        bg="white"
                        fontSize={{ base: 'xs', md: 'sm' }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label="Remove option"
                          size="xs"
                          icon={<SmallCloseIcon />}
                          variant="ghost"
                          color="#c0392b"
                          onClick={() => removeOption(index)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  ))}
                  <Button
                    size="sm"
                    leftIcon={<AddIcon />}
                    onClick={addOption}
                    variant="outline"
                    borderColor="#D4A373"
                    color="#232323"
                    w="fit-content"
                    fontSize={{ base: 'xs', md: 'sm' }}
                  >
                    Add Option
                  </Button>
                </VStack>
              </Box>
            )}

            {/* Validation Settings */}
            <Box p={{ base: 2, md: 4 }} bg="#FEFAE0" borderRadius="md" border="1px" borderColor="#E9EDC9">
              <FormLabel fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium" color="#232323" mb={3}>
                Validation Rules
              </FormLabel>
              <VStack align="stretch" spacing={3}>
                <Checkbox
                  isChecked={question.validation?.required}
                  onChange={(e) => updateValidationRule('required', e.target.checked)}
                  colorScheme="green"
                >
                  Required field
                </Checkbox>

                {(question.type === 'short-text' || question.type === 'long-text') && (
                  <FormControl>
                    <FormLabel fontSize="xs" color="#6c757d">Maximum Length</FormLabel>
                    <Input
                      placeholder="No limit"
                      type="number"
                      size="sm"
                      value={question.validation?.maxLength || ''}
                      onChange={(e) => updateValidationRule('maxLength', parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                )}

                {question.type === 'numeric' && (
                  <HStack spacing={3}>
                    <FormControl>
                      <FormLabel fontSize="xs" color="#6c757d">Min Value</FormLabel>
                      <Input
                        placeholder="No limit"
                        type="number"
                        size="sm"
                        value={question.validation?.min || ''}
                        onChange={(e) => updateValidationRule('min', parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="xs" color="#6c757d">Max Value</FormLabel>
                      <Input
                        placeholder="No limit"
                        type="number"
                        size="sm"
                        value={question.validation?.max || ''}
                        onChange={(e) => updateValidationRule('max', parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                  </HStack>
                )}
              </VStack>
            </Box>

            {/* Conditional Logic */}
            <Box p={{ base: 2, md: 4 }} bg="#E9EDC9" borderRadius="md" border="1px" borderColor="#CCD5AE">
              <FormLabel fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium" color="#232323" mb={3}>
                Conditional Logic
              </FormLabel>
              <VStack align="stretch" spacing={3}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Show this question if...</FormLabel>
                  {availableQuestions.length === 0 ? (
                    <Box p={3} bg="gray.100" borderRadius="md" textAlign="center">
                      <Text fontSize="xs" color="gray.500">
                        No previous questions available for conditional logic
                      </Text>
                    </Box>
                  ) : (
                    <>
                      <Select
                        placeholder="Select a question"
                        value={question.condition?.questionId || ''}
                        size="sm"
                        onChange={(e) => {
                          const questionId = e.target.value;
                          if (questionId) {
                            updateQuestion(question.id, { condition: { questionId, value: question.condition?.value || '' } });
                          } else {
                            updateQuestion(question.id, { condition: undefined });
                          }
                        }}
                      >
                        {availableQuestions.map(q => (
                          <option key={q.id} value={q.id}>
                            Q{allQuestions.findIndex(questionItem => questionItem.id === q.id) + 1}: {q.label}
                          </option>
                        ))}
                      </Select>

                      {dependentQuestion && dependentQuestion.options && dependentQuestion.options.length > 0 ? (
                        <FormControl>
                          <FormLabel fontSize="xs" color="#6c757d">...equals this value</FormLabel>
                          <Select
                            placeholder="Select value"
                            size="sm"
                            value={question.condition?.value || ''}
                            onChange={(e) => updateQuestion(question.id, {
                              condition: {
                                questionId: question.condition?.questionId!,
                                value: e.target.value
                              }
                            })}
                          >
                            {dependentQuestion.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <FormControl>
                          <FormLabel fontSize="xs" color="#6c757d">...equals this value</FormLabel>
                          <Input
                            placeholder="Enter the value"
                            size="sm"
                            value={question.condition?.value || ''}
                            onChange={(e) => updateQuestion(question.id, {
                              condition: {
                                questionId: question.condition?.questionId!,
                                value: e.target.value
                              }
                            })}
                          />
                        </FormControl>
                      )}
                    </>
                  )}
                </FormControl>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </div>
    );
};