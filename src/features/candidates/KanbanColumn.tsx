// src/features/candidates/KanbanColumn.tsx
import { Box, Heading } from '@chakra-ui/react';
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
      bg="gray.100"
      borderRadius="md"
      p={4}
      flex="1"
      minW="300px" // Add min-width to prevent squishing
      minH="500px"
    >
      <Heading size="md" mb={4} textTransform="capitalize">{stage}</Heading>
      {/* This makes all cards within the column sortable */}
      <SortableContext items={candidates.map(c => c.id!)} strategy={verticalListSortingStrategy}>
        {candidates.map(candidate => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </SortableContext>
    </Box>
  );
};