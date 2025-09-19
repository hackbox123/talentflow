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
      bg="#FFF"
      borderRadius="2xl"
      p={4}
      flex="1"
      minW="300px"
      minH={`${COLUMN_HEIGHT}px`}
      borderWidth="1.5px"
      borderColor="#E9EDC9"
      boxShadow="base"
      transition="box-shadow 0.18s, border-color 0.18s"
      _hover={{ boxShadow: 'md', borderColor: '#D4A373' }}
    >
      <Heading size="sm" mb={4} textTransform="capitalize" color="#232323" fontWeight="semibold" letterSpacing="tight">
        {stage} <Text as="span" color="#D4A373">({candidates.length})</Text>
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
          <Text fontSize="sm" color="#adb5bd" textAlign="center" py={8}>
            No candidates
          </Text>
        )}
      </SortableContext>
    </Box>
  );
};