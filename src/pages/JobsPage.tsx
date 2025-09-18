import { useState, useEffect } from 'react';
import {
    Box, Heading, Text, Spinner, useToast, Button, HStack, Icon, Input, Select, VStack, Tag, TagLabel, TagCloseButton, Wrap, WrapItem
} from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Job } from '../api/db';
import { useNavigate } from 'react-router-dom';
import { FiTag } from "react-icons/fi";

function SortableJobItem({ job, onArchiveToggle, onClick, onEdit }: { job: Job; onArchiveToggle: (job: Job) => void; onClick: () => void; onEdit: () => void; }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id! });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style}>
            <HStack p={4} bg="white" borderWidth="1px" borderRadius="lg" mb={4} boxShadow="sm">
                <Icon as={DragHandleIcon} cursor="grab" color="gray.400" {...attributes} {...listeners} />
                <Box flex="1" onClick={onClick} cursor="pointer">
                    <Heading size="md">{job.title}</Heading>
                    <Text color="gray.600" fontSize="sm">Status: {job.status}</Text>
                    {job.tags && job.tags.length > 0 && (
                        <HStack wrap="wrap" spacing={1} mt={2}>
                            {job.tags.slice(0, 3).map(tag => (
                                <Box
                                    key={tag}
                                    bg="blue.100"
                                    color="blue.800"
                                    px={2}
                                    py={1}
                                    borderRadius="sm"
                                    fontSize="xs"
                                    fontWeight="medium"
                                >
                                    {tag}
                                </Box>
                            ))}
                            {job.tags.length > 3 && (
                                <Text fontSize="xs" color="gray.500">
                                    +{job.tags.length - 3} more
                                </Text>
                            )}
                        </HStack>
                    )}
                </Box>
                <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => onArchiveToggle(job)}>{job.status === 'active' ? 'Archive' : 'Unarchive'}</Button>
            </HStack>
        </div>
    );
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();
    const navigate = useNavigate();
    const [searchFilter, setSearchFilter] = useState('');
    const [debouncedSearchFilter, setDebouncedSearchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [tagFilter, setTagFilter] = useState<string[]>([]);
    const [showTagPanel, setShowTagPanel] = useState(false);
    const [tagSearch, setTagSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 10;
    
    // Curated list of most commonly used tags
    const ALL_TAGS = [
        // Seniority Level
        'Junior', 'Mid-level', 'Senior', 'Lead', 'Manager',
        // Core Discipline
        'Frontend', 'Backend', 'Full-Stack', 'Mobile', 'DevOps', 'Data Science', 'QA', 'Product',
        // Programming Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'C#', 'Swift',
        // Frameworks & Libraries
        'React', 'Node.js', 'Vue.js', 'Angular', 'Django', 'Spring Boot', '.NET',
        // Platforms & Infrastructure
        'AWS', 'Azure', 'Docker', 'Kubernetes', 'iOS', 'Android',
        // Databases
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
        // Work Style & Logistics
        'Full-time', 'Part-time', 'Contract', 'Remote'
    ];

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchFilter(searchFilter);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchFilter]);

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('pageSize', PAGE_SIZE.toString());
            if (debouncedSearchFilter) params.append('search', debouncedSearchFilter);
            if (statusFilter) params.append('status', statusFilter);
            if (tagFilter.length > 0) params.append('tags', tagFilter.join(','));
            try {
                const response = await fetch(`/jobs?${params.toString()}`);
                const data = await response.json();
                setJobs(data.jobs);
                setTotalPages(Math.ceil(data.totalCount / PAGE_SIZE));
            } catch (error) {
                toast({ title: 'Failed to fetch jobs', status: 'error', isClosable: true });
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, [currentPage, debouncedSearchFilter, statusFilter, tagFilter, toast]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchFilter, statusFilter, tagFilter]);

    

    const handleArchiveToggle = async (jobToToggle: Job) => {
        const newStatus = jobToToggle.status === 'active' ? 'archived' : 'active';
        const originalJobs = [...jobs];
        setJobs(jobs.map(j => (j.id === jobToToggle.id ? { ...j, status: newStatus } : j)));
        try {
            const response = await fetch(`/jobs/${jobToToggle.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
            if (!response.ok) throw new Error('Server update failed.');
        } catch (error) {
            toast({ title: 'Update failed.', description: 'Could not update job status.', status: 'error', duration: 3000, isClosable: true });
            setJobs(originalJobs);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const originalJobs = [...jobs];
            const oldIndex = jobs.findIndex((j) => j.id === active.id);
            const newIndex = jobs.findIndex((j) => j.id === over.id);
            
            // Get the order values for the API call
            const fromOrder = jobs[oldIndex].order;
            const toOrder = jobs[newIndex].order;
            
            setJobs(arrayMove(jobs, oldIndex, newIndex));
            try {
                const response = await fetch(`/jobs/${active.id}/reorder`, { 
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fromOrder, toOrder })
                });
                if (!response.ok) throw new Error('Failed to reorder');
            } catch (error) {
                toast({ title: 'Error', description: "Couldn't save the new order. Reverting.", status: 'error', duration: 3000, isClosable: true, });
                setJobs(originalJobs);
            }
        }
    };

    if (isLoading) return (<VStack justify="center" h="50vh"><Spinner size="xl" /></VStack>);

    return (
        <>
        <Box>
            <HStack justify="space-between" mb={6}>
                <Heading>Jobs Board</Heading>
                <Button colorScheme="blue" onClick={() => navigate('/jobs/new')}>Create Job</Button>
            </HStack>
            <HStack mb={6} spacing={4}>
                <Input placeholder="Search title, slug, or tags..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
                <Select placeholder="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </Select>
                    <Button
                        onClick={() => setShowTagPanel(v => !v)}
                        leftIcon={<FiTag />}
                        bg="blue.500"
                        color="white"
                        fontWeight="medium"
                        borderRadius="md"
                        px={8}
                        py={3}
                        boxShadow="md"
                        _hover={{
                            bg: "blue.600",
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                        }}
                        _active={{
                            bg: "blue.700",
                            transform: "scale(0.98)",
                        }}
                        transition="all 0.2s ease-in-out"
                    >
                        {`Tags Filter${tagFilter.length ? ` (${tagFilter.length})` : ''}`}
                    </Button>
            </HStack>
            {showTagPanel && (
                <Box borderWidth="1px" borderRadius="xl" p={6} bg="white" mb={6} boxShadow="lg" borderColor="blue.100">
                    <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={1}>
                            <Heading size="md" color="gray.800">Filter by Tags</Heading>
                            <Text fontSize="sm" color="gray.600">
                                Select tags to filter jobs. {ALL_TAGS.length} tags available.
                            </Text>
                        </VStack>
                        <HStack spacing={2}>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                colorScheme="blue"
                                onClick={() => setTagFilter([])}
                                isDisabled={tagFilter.length === 0}
                            >
                                Clear All
                            </Button>
                            <Button 
                                size="sm" 
                                colorScheme="blue"
                                onClick={() => setShowTagPanel(false)}
                            >
                                Done
                            </Button>
                        </HStack>
                    </HStack>
                    
                    <Input
                        placeholder="Search tags..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        mb={4}
                        size="md"
                        borderColor="gray.300"
                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                    />
                    
                    {tagFilter.length > 0 && (
                        <Box mb={4} p={3} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                            <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm" fontWeight="medium" color="blue.700">
                                    Selected Tags ({tagFilter.length})
                                </Text>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => setTagFilter([])}
                                >
                                    Clear All
                                </Button>
                            </HStack>
                            <Wrap spacing={2}>
                                {tagFilter.map(tag => (
                                    <WrapItem key={tag}>
                                        <Tag 
                                            colorScheme="blue" 
                                            borderRadius="full" 
                                            size="md"
                                            bg="blue.500"
                                            color="white"
                                        >
                                            <TagLabel>{tag}</TagLabel>
                                            <TagCloseButton 
                                                color="white"
                                                _hover={{ bg: "blue.600" }}
                                                onClick={() => setTagFilter(prev => prev.filter(t => t !== tag))} 
                                            />
                                        </Tag>
                                    </WrapItem>
                                ))}
                            </Wrap>
                        </Box>
                    )}
                    
                    <Box maxH="320px" overflowY="auto" pr={2}>
                        <Wrap spacing={2}>
                            {ALL_TAGS.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()))
                                .map(tag => {
                                    const isSelected = tagFilter.includes(tag);
                                    return (
                                        <WrapItem key={tag}>
                                            <Button
                                                size="sm"
                                                variant={isSelected ? 'solid' : 'outline'}
                                                colorScheme="blue"
                                                borderRadius="full"
                                                fontWeight="medium"
                                                _hover={{ 
                                                    transform: "translateY(-1px)",
                                                    boxShadow: "md"
                                                }}
                                                transition="all 0.2s"
                                                onClick={() => setTagFilter(prev => isSelected ? prev.filter(t => t !== tag) : [...prev, tag])}
                                            >
                                                {tag}
                                            </Button>
                                        </WrapItem>
                                    );
                                })}
                        </Wrap>
                        {ALL_TAGS.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase())).length === 0 && (
                            <Box textAlign="center" py={8}>
                                <Text color="gray.500" fontSize="sm">
                                    No tags found matching "{tagSearch}"
                                </Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
            {jobs.length === 0 && (
                <VStack py={20} spacing={4} borderWidth="1px" borderRadius="md" bg="white">
                    <Heading size="md">No jobs found</Heading>
                    <Text color="gray.600">Try adjusting search or filters.</Text>
                    <HStack>
                        <Button onClick={() => setSearchFilter('')}>Clear Search</Button>
                        <Button onClick={() => setStatusFilter('')}>Clear Status</Button>
                        <Button onClick={() => setTagFilter([])}>Clear Tags</Button>
                    </HStack>
                </VStack>
            )}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={jobs.map(j => j.id!)} strategy={verticalListSortingStrategy}>
                    {jobs.map((job) => (
                        <SortableJobItem
                            key={job.id}
                            job={job}
                            onArchiveToggle={handleArchiveToggle}
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            onEdit={() => navigate(`/jobs/${job.id}/edit`)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            <HStack mt={6} justify="center">
                <Button onClick={() => setCurrentPage(p => p - 1)} isDisabled={currentPage === 1}>Previous</Button>
                <Text fontWeight="bold">Page {currentPage} of {totalPages}</Text>
                <Button onClick={() => setCurrentPage(p => p + 1)} isDisabled={currentPage >= totalPages}>Next</Button>
            </HStack>
            </Box>
            {/* Editor modal removed in favor of dedicated editor routes */}
            </>
        
    );
}