// src/features/candidates/KanbanColumn.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { type Candidate } from '../../api/db';
import { CandidateCard } from './CandidateCard';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';



interface Props {
  stage: string;
  candidates: Candidate[];
}

export const KanbanColumn = ({ stage, candidates }: Props) => {
  // Height of each card (adjust as needed)
  const CARD_HEIGHT = 100;
  // Height of the column (adjust as needed)
  const COLUMN_HEIGHT = 500;
  const parentRef = useRef<HTMLDivElement>(null);



  // Set up the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: candidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: 5,
  });
  const { setNodeRef } = useDroppable({
    id: stage,
    data: {
      type: 'container',
      stage: stage,
    },
  });





  return (
    <Box
      ref={setNodeRef}
      bg="gray.50"
      borderRadius="lg"
      p={4}
      flex="1"
      minW="300px"
      minH={`${COLUMN_HEIGHT}px`}
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Heading size="sm" mb={4} textTransform="capitalize" color="gray.700">
        {stage} ({candidates.length})
      </Heading>
      <SortableContext id={stage} items={candidates.map(c => c.id!)} strategy={verticalListSortingStrategy}>
        {candidates.length > 0 ? (
          <Box
            ref={parentRef}
            height={`${COLUMN_HEIGHT}px`}
            width="100%"
            overflowY="auto"
            position="relative"
          >
            <Box height={`${rowVirtualizer.getTotalSize()}px`} position="relative">
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const candidate = candidates[virtualRow.index];
                return (
                  <Box
                    key={candidate.id}
                    position="absolute"
                    top={0}
                    left={0}
                    width="100%"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                  >
                    <CandidateCard candidate={candidate} />
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={8}>
            No candidates
          </Text>
        )}
      </SortableContext>
    </Box>
  );
};