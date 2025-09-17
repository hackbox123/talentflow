// src/pages/CandidatesPage.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Box, 
  Heading, 
  Spinner, 
  Input, 
  HStack, 
  Button, 
  Select, 
  Text,
  VStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { type Candidate } from '../api/db';
import { KanbanBoard } from '../features/candidates/KanbanBoard';

const STAGES: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

export default function CandidatesPage() {
  const navigate = useNavigate(); // <-- 2. INITIALIZE the hook
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list'); // Default to list view
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState(''); // Empty string means "All Stages"

  // Fetch candidates when the stage filter changes
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const query = stageFilter ? `?stage=${stageFilter}` : '';
      try {
        const res = await fetch(`/candidates${query}`);
        if (!res.ok) throw new Error('Failed to fetch candidates');
        const data = await res.json();
        setAllCandidates(data);
      } catch (error) {
        console.error(error);
        // Handle error state if needed
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [stageFilter]);

  // Client-side filtering for the search term
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return allCandidates;
    return allCandidates.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCandidates, searchTerm]);

  const parentRef = useRef<HTMLDivElement>(null);

  // The virtualizer instance
  const rowVirtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 74, // Estimated height of a single row + border
    overscan: 5, // Render a few extra items for smoother scrolling
  });

  if (loading) {
    return (
      <VStack justify="center" h="50vh">
        <Spinner size="xl" />
      </VStack>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading>Candidates ({filteredCandidates.length})</Heading>
        <Button onClick={() => setView(view === 'list' ? 'kanban' : 'list')}>
          Switch to {view === 'list' ? 'Kanban View' : 'List View'}
        </Button>
      </HStack>

      {/* Filter Controls */}
      <HStack mb={6} spacing={4}>
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          placeholder="Filter by stage"
          value={stageFilter}
          onChange={(e) => {
            setSearchTerm(''); // Clear search when changing stage filter
            setStageFilter(e.target.value);
          }}
        >
          {STAGES.map(stage => (
            <option key={stage} value={stage} style={{ textTransform: 'capitalize' }}>
              {stage}
            </option>
          ))}
        </Select>
      </HStack>

      {/* Conditional Rendering based on view state */}
      {view === 'list' ? (
        <Box
          ref={parentRef}
          h="700px" // Define a fixed height for the scroll container
          overflow="auto"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
        >
          {/* A single large div to create the total scrollable height */}
          <Box h={`${rowVirtualizer.getTotalSize()}px`} w="100%" position="relative">
            {/* Map over the virtual items, not the whole array */}
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const candidate = filteredCandidates[virtualItem.index];
              return (
                <Box
                  key={virtualItem.key}
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h={`${virtualItem.size}px`}
                  transform={`translateY(${virtualItem.start}px)`}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                >
                  <Heading size="sm">{candidate.name}</Heading>
                  <Text color="gray.600">{candidate.email}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      ) : (
        <KanbanBoard initialCandidates={allCandidates} />
      )}
    </Box>
  );
};