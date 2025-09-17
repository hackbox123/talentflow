// src/features/candidates/KanbanBoard.tsx
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Box, HStack, useToast } from '@chakra-ui/react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { type Candidate } from '../../api/db';
import { KanbanColumn } from './KanbanColumn';
import { CandidateCard } from './CandidateCard';

const STAGES: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

interface Props {
  initialCandidates: Candidate[];
  onCandidatesChange?: (candidates: Candidate[]) => void;
  searchTerm?: string;
}

export const KanbanBoard = ({ initialCandidates, onCandidatesChange, searchTerm = '' }: Props) => {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Update candidates when initialCandidates prop changes (for search filtering)
  useEffect(() => {
    console.log('KanbanBoard received new initialCandidates:', initialCandidates.length);
    setCandidates(initialCandidates);
  }, [initialCandidates]);
  // State to hold the candidate being dragged, for the DragOverlay
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const toast = useToast();

  // Optimized sensors for smoother DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 }, // prevent accidental drags
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter candidates by search term and group by stage
  const candidatesByStage = useMemo(() => {
    console.log('Regenerating candidatesByStage with', candidates.length, 'candidates');
    // First filter by search term if provided
    const filteredCandidates = searchTerm 
      ? candidates.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : candidates;
    
    // Then group by stage
    const grouped: Record<string, Candidate[]> = {};
    STAGES.forEach(stage => {
      grouped[stage] = filteredCandidates.filter(c => c.stage === stage);
      console.log(`Stage ${stage}: ${grouped[stage].length} candidates`);
    });
    return grouped;
  }, [candidates, searchTerm, forceUpdate]);


  // Optimized drag-and-drop handler with useCallback
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    // If dropped over nothing, do nothing
    if (!over) return;
    
    const activeCandidateId = active.id;
    // 'over.id' could be a column (stage) or another card. We find the column.
    const newStage = over.data.current?.type === 'container' ? over.id : over.data.current?.sortable.containerId;
    
    // The candidate that was dragged - find in the full candidate list
    const draggedCandidate = candidates.find(c => c.id === activeCandidateId);
    if (!draggedCandidate) return;
    
    // If the stage hasn't changed, do nothing
    if (draggedCandidate.stage === newStage) return;

    // --- OPTIMISTIC UPDATE ---
    const originalCandidates = [...candidates];
    
    // 1. Immediately update the UI
    const updatedCandidates = candidates.map(c => 
      c.id === activeCandidateId ? { ...c, stage: newStage } : c
    );
    console.log('Updating candidate:', draggedCandidate.name, 'to stage:', newStage);
    setCandidates(updatedCandidates);
    setForceUpdate(prev => prev + 1); // Force re-render
    
    // Notify parent component of the change
    if (onCandidatesChange) {
      onCandidatesChange(updatedCandidates);
    }

    try {
      // 2. Make the API call
      const response = await fetch(`/candidates/${activeCandidateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) throw new Error('Failed to update');
      
      toast({
        title: 'Candidate moved!',
        status: 'success',
        duration: 2000,
      });

    } catch (error) {
      // 3. On failure, ROLLBACK and show an error
      toast({
        title: 'Move failed',
        description: 'Could not save change. Reverting.',
        status: 'error',
        duration: 3000,
      });
      setCandidates(originalCandidates);
      setForceUpdate(prev => prev + 1); // Force re-render on rollback
      // Also notify parent to revert
      if (onCandidatesChange) {
        onCandidatesChange(originalCandidates);
      }
    }
  }, [candidates, toast, onCandidatesChange]);

  const handleDragStart = useCallback((event: any) => {
    // When dragging starts, find the candidate and set it as active
    const candidate = event.active.data.current?.candidate;
    if (candidate) {
      setActiveCandidate(candidate);
    }
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box overflowX="auto" py={2}>
        <HStack spacing={4} align="flex-start" minW="1200px">
          {STAGES.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={candidatesByStage[stage] || []}
            />
          ))}
        </HStack>
      </Box>
      {/* This overlay creates the smooth "ghost" card that follows your mouse */}
      <DragOverlay>
        {activeCandidate ? <CandidateCard candidate={activeCandidate} /> : null}
      </DragOverlay>
    </DndContext>
  );
};