// src/pages/JobsPage.tsx
import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Spinner, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, useToast, Button, HStack,Icon
} from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Job } from '../api/db';
import { JobForm } from '../features/jobs/JobForm';
import { useNavigate } from 'react-router-dom'; // Ensure this path is correct
import { Menu, MenuButton, MenuList, MenuOptionGroup, MenuItemOption } from '@chakra-ui/react';


// A single draggable job item
function SortableJobItem({ job, onArchiveToggle,onClick }: { job: Job; onArchiveToggle: (job: Job) => void; onClick: () => void; }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id! });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    // The main div no longer has the listeners
    <div ref={setNodeRef} style={style} {...attributes}>
      <HStack p={4} bg="white" borderWidth="1px" borderRadius="lg" mb={4} boxShadow="sm">
        
        {/* STEP 1: Create the Drag Handle */}
        {/* The listeners are NOW ONLY on this icon */}
        <Icon 
          as={DragHandleIcon} 
          cursor="grab" 
          color="gray.500"
          {...listeners} 
        />
        
        <Box flex="1" onClick={onClick} cursor="pointer">
          <Heading size="md">{job.title}</Heading>
          <Text color="gray.600" fontSize="sm">Status: {job.status}</Text>
        </Box>
        
        {/* STEP 2: The button's onClick can now be simplified */}
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onArchiveToggle(job)}
        >
          {job.status === 'active' ? 'Archive' : 'Unarchive'}
        </Button>

      </HStack>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingJob, setEditingJob] = useState<Job | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const [tagFilter, setTagFilter] = useState<string[]>([]); // NEW: State for tags
  const ALL_TAGS = ['Full-time', 'Remote', 'Contract', 'Engineering']; // Example tags

  useEffect(() => {
    // Fetch initial jobs
    const params = new URLSearchParams();
    params.append('page', '1'); // Simplified for this example
    if (tagFilter.length > 0) {
      params.append('tags', tagFilter.join(','));
    }
    // ... add other filters like status and search ...
    
    fetch(`/jobs?${params.toString()}`).then(res => res.json()).then(data => {
      setJobs(data.jobs);
      setLoading(false);
    });
  }, [tagFilter]);

  const handleOpenModal = (job?: Job) => {
    setEditingJob(job);
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingJob(undefined);
    onClose();
  };

  // --- LOGIC FOR CREATE/EDIT ---
  const handleFormSubmit = async (formData: { title: string; slug: string; }) => {
    setIsSubmitting(true);
    const isEditing = !!editingJob;
    const url = isEditing ? `/jobs/${editingJob.id}` : '/jobs';
    const method = isEditing ? 'PATCH' : 'POST';

    // For a new job, calculate its order
    const newJobData = isEditing ? formData : { ...formData, order: jobs.length };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobData),
      });

      if (!response.ok) throw new Error('Failed to save the job.');

      if (isEditing) {
        // Update the job in the list
        setJobs(jobs.map(j => (j.id === editingJob.id ? { ...j, ...formData } : j)));
      } else {
        // Add the new job to the list
        const createdJob = await response.json();
        setJobs(prevJobs => [...prevJobs, createdJob]);
      }

      toast({
        title: `Job ${isEditing ? 'updated' : 'created'}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleCloseModal();

    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIC FOR ARCHIVE/UNARCHIVE ---
  const handleArchiveToggle = async (jobToToggle: Job) => {
    console.log('--- handleArchiveToggle called for job: ---', jobToToggle);
    const newStatus = jobToToggle.status === 'active' ? 'archived' : 'active';
    const originalJobs = [...jobs];

    // Optimistic update: change the UI immediately
    setJobs(jobs.map(j => (j.id === jobToToggle.id ? { ...j, status: newStatus } : j)));

    try {
      const response = await fetch(`/jobs/${jobToToggle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Server update failed.');

    } catch (error) {
      // If the API call fails, revert the change and show an error
      toast({
        title: 'Update failed.',
        description: 'Could not update job status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setJobs(originalJobs);
    }
  };

  // --- LOGIC FOR DRAG AND DROP ---
  const handleDragEnd = async (event: DragEndEvent) => {
    // ... your existing handleDragEnd logic goes here ...
  };

  if (loading) return <Spinner />;

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Jobs Board</Heading>
        <Button colorScheme="blue" onClick={() => handleOpenModal()}>Create Job</Button>
      </HStack>
      {/* Add filter UI controls here if you want */}

      {/* NEW: Filter UI for Tags */}
      <HStack mb={4}>
        <Menu closeOnSelect={false}>
          <MenuButton as={Button} colorScheme="gray">
            Filter by Tags
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              title="Tags"
              type="checkbox"
              value={tagFilter}
              onChange={(value) => setTagFilter(value as string[])}
            >
              {ALL_TAGS.map(tag => (
                <MenuItemOption key={tag} value={tag}>{tag}</MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </HStack>
      
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={jobs.map(j => j.id!)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <SortableJobItem key={job.id} job={job} onArchiveToggle={handleArchiveToggle} onClick={() => navigate(`/jobs/${job.id}`)} />
          ))}
        </SortableContext>
      </DndContext>

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingJob ? 'Edit Job' : 'Create New Job'}</ModalHeader>
          <ModalCloseButton />
          <JobForm
            job={editingJob}
            allJobs={jobs}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            isLoading={isSubmitting}
          />
        </ModalContent>
      </Modal>
    </Box>
  );
}