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
  VStack,
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
  const [kanbanCandidates, setKanbanCandidates] = useState<Candidate[]>([]);

  // Fetch candidates when the stage filter changes (applies to both views)
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const query = stageFilter ? `?stage=${stageFilter}` : '';
      try {
        const res = await fetch(`/candidates${query}`);
        if (!res.ok) throw new Error('Failed to fetch candidates');
        const data = await res.json();
        setAllCandidates(data);
        setKanbanCandidates(data); // Initialize kanban candidates
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

  // No need for separate kanban filtering - KanbanBoard will handle it internally

  // Handle candidate changes from KanbanBoard
  const handleKanbanCandidatesChange = (updatedCandidates: Candidate[]) => {
    console.log('Parent received updated candidates:', updatedCandidates.length);
    setKanbanCandidates(updatedCandidates);
    setAllCandidates(updatedCandidates); // Also update the main list
  };

  // Update kanban candidates when allCandidates changes (from API fetch)
  useEffect(() => {
    setKanbanCandidates(allCandidates);
  }, [allCandidates]);

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
        <Spinner size="xl" color="#D4A373" />
      </VStack>
    );
  }

  return (
    <Box bg="#FEFAE0" minH="80vh" p={6} borderRadius="xl">
      <Box maxW="container.xl" mx="auto">
        <HStack justify="space-between" mb={4}>
          <Heading color="#232323">Candidates ({filteredCandidates.length})</Heading>
          <Button
            bg="#D4A373"
            color="#232323"
            _hover={{ bg: '#CCD5AE' }}
            onClick={() => setView(view === 'list' ? 'kanban' : 'list')}
          >
            Switch to {view === 'list' ? 'Kanban View' : 'List View'}
          </Button>
        </HStack>

        {/* Filter Controls */}
        <HStack mb={6} spacing={4}>
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="white"
            borderRadius="md"
            _placeholder={{ color: '#adb5bd' }}
          />
          <Select
            placeholder="Filter by stage"
            value={stageFilter}
            onChange={(e) => {
              setSearchTerm(''); // Clear search when changing stage filter
              setStageFilter(e.target.value);
            }}
            bg="white"
            borderRadius="md"
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
            borderRadius="md"
            bg="white"
            border="1px solid"
            borderColor="#E9EDC9"
            boxShadow="0 6px 20px rgba(0,0,0,0.04)"
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
                    borderColor="#E9EDC9"
                    onClick={() => navigate(`/candidates/${candidate.id}`)}
                    cursor="pointer"
                    _hover={{ bg: '#FEFAE0' }}
                  >
                    <Heading size="sm" color="#232323">{candidate.name}</Heading>
                    <Text color="#6c757d">{candidate.email}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <KanbanBoard 
            key={`kanban-${kanbanCandidates.length}-${searchTerm}`}
            initialCandidates={kanbanCandidates} 
            onCandidatesChange={handleKanbanCandidatesChange}
            searchTerm={searchTerm}
          />
        )}
      </Box>
    </Box>
  );
}