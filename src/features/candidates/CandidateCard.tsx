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
    zIndex: transform ? 1 : 0,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      p={{ base: 3, sm: 4 }}
      bg="white"
      borderWidth="1.5px"
      borderRadius="xl"
      borderColor="#E9EDC9"
      boxShadow={transform ? 'lg' : 'base'}
      cursor="grab"
      mb={3}
      minW={{ base: '180px', sm: '220px' }}
      maxW={{ base: '95vw', sm: '260px' }}
      _hover={{ boxShadow: 'lg', borderColor: '#D4A373' }}
      transition="all 0.18s"
    >
      <Heading size="sm" color="#232323" mb={1} fontWeight="semibold" letterSpacing="tight" fontSize={{ base: 'sm', sm: 'md' }}>
        {candidate.name}
      </Heading>
      <Text fontSize={{ base: 'xs', sm: 'sm' }} color="#6c757d" mb={1} noOfLines={1}>
        {candidate.email}
      </Text>
      {/* You can add more candidate info here, e.g. role, status, etc., styled with the palette if needed */}
    </Box>
  );
};