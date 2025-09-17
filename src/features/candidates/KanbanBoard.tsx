// src/features/candidates/KanbanBoard.tsx
import { useMemo, useState } from 'react';
import { Box, HStack, useToast } from '@chakra-ui/react';
import { DndContext, type DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { type Candidate } from '../../api/db';
import { KanbanColumn } from './KanbanColumn';
import { CandidateCard } from './CandidateCard';

const STAGES: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

interface Props {
  initialCandidates: Candidate[];
}

export const KanbanBoard = ({ initialCandidates }: Props) => {
  const [candidates, setCandidates] = useState(initialCandidates);
  // State to hold the candidate being dragged, for the DragOverlay
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);
  const toast = useToast();

  // Group candidates by stage using useMemo for performance
  const candidatesByStage = useMemo(() => {
    const grouped: Record<string, Candidate[]> = {};
    STAGES.forEach(stage => {
      grouped[stage] = candidates.filter(c => c.stage === stage);
    });
    return grouped;
  }, [candidates]);


  // The main drag-and-drop handler
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCandidate(null);

    // If dropped over nothing, do nothing
    if (!over) return;
    
    const activeCandidateId = active.id;
    // 'over.id' could be a column (stage) or another card. We find the column.
    const newStage = over.data.current?.type === 'container' ? over.id : over.data.current?.sortable.containerId;
    
    // The candidate that was dragged
    const draggedCandidate = candidates.find(c => c.id === activeCandidateId)!;
    
    // If the stage hasn't changed, do nothing
    if (draggedCandidate.stage === newStage) return;

    // --- OPTIMISTIC UPDATE ---
    const originalCandidates = [...candidates];
    
    // 1. Immediately update the UI
    setCandidates(prev => 
      prev.map(c => 
        c.id === activeCandidateId ? { ...c, stage: newStage } : c
      )
    );

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
    }
  }

  function handleDragStart(event: any) {
    // When dragging starts, find the candidate and set it as active
    const candidate = event.active.data.current?.candidate;
    if (candidate) {
      setActiveCandidate(candidate);
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <HStack spacing={4} align="flex-start">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            candidates={candidatesByStage[stage]}
          />
        ))}
      </HStack>
      {/* This overlay creates the smooth "ghost" card that follows your mouse */}
      <DragOverlay>
        {activeCandidate ? <CandidateCard candidate={activeCandidate} /> : null}
      </DragOverlay>
    </DndContext>
  );
};