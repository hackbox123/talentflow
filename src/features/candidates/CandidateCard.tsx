// src/features/candidates/CandidateCard.tsx
import { Box, Heading, Text } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Candidate } from '../../api/db';

interface Props {
  candidate: Candidate;
}

export const CandidateCard = ({ candidate }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: candidate.id!,
    // Pass the whole candidate object in the data property
    data: { candidate },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      p={3}
      bg="white"
      borderWidth="1px"
      borderRadius="md"
      boxShadow="sm"
      cursor="grab"
      mb={3}
    >
      <Heading size="xs">{candidate.name}</Heading>
      <Text fontSize="sm" color="gray.600">{candidate.email}</Text>
    </Box>
  );
};