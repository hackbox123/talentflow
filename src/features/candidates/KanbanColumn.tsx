// src/features/candidates/KanbanColumn.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { type Candidate } from '../../api/db';
import { CandidateCard } from './CandidateCard';

interface Props {
  stage: string;
  candidates: Candidate[];
}

export const KanbanColumn = ({ stage, candidates }: Props) => {
  const { setNodeRef } = useDroppable({ 
    id: stage,
    data: {
      type: 'container',
      stage: stage,
    }
  });

  return (
    <Box
      ref={setNodeRef}
      bg="gray.50"
      borderRadius="lg"
      p={4}
      flex="1"
      minW="300px" // Add min-width to prevent squishing
      minH="500px"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Heading size="sm" mb={4} textTransform="capitalize" color="gray.700">
        {stage} ({candidates.length})
      </Heading>
      {/* This makes all cards within the column sortable. Provide an id so containerId is available. */}
      <SortableContext id={stage} items={candidates.map(c => c.id!)} strategy={verticalListSortingStrategy}>
        {candidates.length > 0 ? (
          candidates.map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))
        ) : (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
            No candidates
          </Text>
        )}
      </SortableContext>
    </Box>
  );
};