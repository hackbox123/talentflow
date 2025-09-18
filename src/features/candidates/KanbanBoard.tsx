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
  // Update candidates when initialCandidates prop changes (for search filtering)
  useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);
  // State to hold the candidate being dragged, for the DragOverlay
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const toast = useToast();

  // Optimized sensors with better drag detection and reduced sensitivity
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { 
        distance: 5, // Reduced activation distance for faster response
        delay: 0 // No delay in drag start
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ['Space'],
        cancel: ['Escape'],
        end: ['Space']
      }
    })
  );

  // Optimized filtering and grouping with memoization
  const candidatesByStage = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    const filteredCandidates = searchTerm 
      ? candidates.filter(c => 
          c.name.toLowerCase().includes(searchTermLower) ||
          c.email.toLowerCase().includes(searchTermLower)
        )
      : candidates;
    
    return STAGES.reduce((grouped, stage) => {
      grouped[stage] = filteredCandidates.filter(c => c.stage === stage);
      return grouped;
    }, {} as Record<string, Candidate[]>);
  }, [candidates, searchTerm]);


  // Optimized drag-and-drop handler with useCallback
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    // If dropped over nothing, do nothing
    if (!over) return;
    
    const activeCandidateId = active.id;
    // Determine the destination stage robustly with multiple fallbacks
    let newStage: any = undefined;
    const overData = over.data?.current as any;
    // 1) If dropping over a column container
    if (overData && overData.type === 'container') {
      newStage = over.id;
    }
    // 2) If dropping over a card inside a column
    if (!newStage && overData && overData.sortable && overData.sortable.containerId) {
      newStage = overData.sortable.containerId;
    }
    // 3) Fallback: sometimes stage is stored on data
    if (!newStage && overData && overData.stage) {
      newStage = overData.stage;
    }
    // 4) Final fallback: if over.id is a known stage string
    if (!newStage && typeof over.id === 'string') {
      newStage = over.id;
    }
    // Validate stage
    if (!STAGES.includes(newStage)) {
      // Invalid target; ignore the drop
      return;
    }
    
    // The candidate that was dragged - find in the full candidate list
    const draggedCandidate = candidates.find(c => c.id === activeCandidateId);
    if (!draggedCandidate) return;
    
    // If the stage hasn't changed, do nothing
    if (draggedCandidate.stage === newStage) return;

    // Optimistic update with minimal re-renders
    const originalCandidates = [...candidates];
    const updatedCandidates = candidates.map(c => 
      c.id === activeCandidateId ? { ...c, stage: newStage } : c
    );
    setCandidates(updatedCandidates);
    
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
      // Also notify parent to revert
      if (onCandidatesChange) {
        onCandidatesChange(originalCandidates);
      }
    }
  }, [candidates, toast, onCandidatesChange]);

  const handleDragStart = useCallback((event: any) => {
    const candidate = event.active.data.current?.candidate;
    if (candidate) setActiveCandidate(candidate);
  }, []);

  // When dropping over another card, ensure the `over` carries a container id
  // dnd-kit provides it via over.data.current.sortable.containerId when SortableContext has an id

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