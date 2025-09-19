import { useState, useEffect } from 'react';
import {
    Box, Heading, Text, Spinner, useToast, Button, HStack, Icon, Input, Select, VStack, Tag, TagLabel, TagCloseButton, Wrap, WrapItem, Container, Stack, Divider
} from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Job } from '../api/db';
import { useNavigate } from 'react-router-dom';
import { FiTag } from "react-icons/fi";

function SortableJobItem({ job, onArchiveToggle, onClick, onEdit }: { job: Job; onArchiveToggle: (job: Job) => void; onClick: () => void; onEdit: () => void; }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id! });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style}>
            <HStack
                p={4}
                bg="#FFFFFF"
                borderLeft="4px solid #D4A373"
                borderRadius="md"
                mb={4}
                boxShadow={isDragging ? "0 12px 32px 0 rgba(212,163,115,0.18), 0 2px 8px 0 rgba(0,0,0,0.10)" : "0 6px 18px rgba(0,0,0,0.06)"}
                align="start"
                transition="box-shadow 0.25s cubic-bezier(.4,2,.6,1), transform 0.18s"
                _hover={{
                    boxShadow: "0 12px 32px 0 rgba(212,163,115,0.18), 0 2px 8px 0 rgba(0,0,0,0.10)",
                    transform: "translateY(-2px) scale(1.012)",
                    bg: "#FEFAE0"
                }}
                _active={{
                    boxShadow: "0 16px 40px 0 rgba(212,163,115,0.22), 0 4px 16px 0 rgba(0,0,0,0.12)",
                    transform: "scale(0.98)"
                }}
            >
                <Icon as={DragHandleIcon} cursor="grab" color="#6c757d" {...attributes} {...listeners} />
                <Box flex="1" onClick={onClick} cursor="pointer">
                    <Heading size="md" color="#232323">{job.title}</Heading>
                    <Text color="#6c757d" fontSize="sm">Status: <Text as="span" color={job.status === 'active' ? '#2a7e2a' : '#6c757d'} fontWeight="semibold">{job.status}</Text></Text>
                    {job.tags && job.tags.length > 0 && (
                        <HStack wrap="wrap" spacing={2} mt={3}>
                            {job.tags.slice(0, 3).map(tag => (
                                <Tag key={tag} size="sm" bg="#E9EDC9" color="#232323" borderRadius="md" fontWeight="medium">
                                    <TagLabel>{tag}</TagLabel>
                                </Tag>
                            ))}
                            {job.tags.length > 3 && (
                                <Text fontSize="xs" color="#6c757d">
                                    +{job.tags.length - 3} more
                                </Text>
                            )}
                        </HStack>
                    )}
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button size="sm" variant="ghost" color="#232323" onClick={onEdit} _hover={{ bg: '#FAEDCD' }}>Edit</Button>
                    <Button size="sm" variant="outline" borderColor="#D4A373" color="#232323" onClick={() => onArchiveToggle(job)} _hover={{ bg: '#E9EDC9' }}>{job.status === 'active' ? 'Archive' : 'Unarchive'}</Button>
                </Stack>
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

    if (isLoading) return (<VStack justify="center" h="50vh"><Spinner size="xl" color="#D4A373" /></VStack>);

    return (
        <Container maxW="container.xl" py={8}>
        <Box bg="#FEFAE0" p={6} borderRadius="xl" boxShadow="0 8px 32px rgba(212,163,115,0.08)">
            <HStack justify="space-between" mb={6}>
                <Heading color="#232323">Jobs Board</Heading>
                <Button bg="#D4A373" color="#232323" _hover={{ bg: '#CCD5AE' }} onClick={() => navigate('/jobs/new')}>Create Job</Button>
            </HStack>
            <HStack mb={6} spacing={4}>
                <Input placeholder="Search title, slug, or tags..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} bg="white" borderRadius="md" />
                <Select placeholder="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} bg="white" borderRadius="md">
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </Select>
                    <Button
                        onClick={() => setShowTagPanel(v => !v)}
                        leftIcon={<FiTag />}
                        bgGradient={showTagPanel ? "linear(to-r, #D4A373, #E9EDC9)" : "linear(to-r, #FAEDCD, #E9EDC9)"}
                        color="#232323"
                        fontWeight="bold"
                        borderRadius="full"
                        px={8}
                        py={3}
                        fontSize="md"
                        boxShadow={showTagPanel ? "0 4px 16px rgba(212,163,115,0.18)" : "0 2px 8px rgba(0,0,0,0.06)"}
                        borderWidth={showTagPanel ? 2 : 1}
                        borderColor={showTagPanel ? "#D4A373" : "#E9EDC9"}
                        letterSpacing="wide"
                        transition="all 0.22s cubic-bezier(.4,2,.6,1)"
                        _hover={{
                            bgGradient: "linear(to-r, #E9EDC9, #D4A373)",
                            color: "#232323",
                            boxShadow: "0 6px 24px rgba(212,163,115,0.16)",
                            transform: "translateY(-2px) scale(1.04)"
                        }}
                        _active={{
                            bgGradient: "linear(to-r, #D4A373, #E9EDC9)",
                            color: "#232323",
                            boxShadow: "0 2px 8px rgba(212,163,115,0.10)",
                            transform: "scale(0.98)"
                        }}
                        shadow={showTagPanel ? "md" : undefined}
                    >
                        {`Tags Filter${tagFilter.length ? ` (${tagFilter.length})` : ''}`}
                    </Button>
            </HStack>
            {showTagPanel && (
                <Box borderWidth="1px" borderRadius="xl" p={6} bg="#FFFFFF" mb={6} boxShadow="0 8px 24px rgba(0,0,0,0.06)" borderColor="#E9EDC9">
                    <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={1}>
                            <Heading size="md" color="#232323">Filter by Tags</Heading>
                            <Text fontSize="sm" color="#6c757d">
                                Select tags to filter jobs. {ALL_TAGS.length} tags available.
                            </Text>
                        </VStack>
                        <HStack spacing={2}>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                color="#232323"
                                onClick={() => setTagFilter([])}
                                isDisabled={tagFilter.length === 0}
                            >
                                Clear All
                            </Button>
                            <Button 
                                size="sm" 
                                bg="#D4A373"
                                color="#232323"
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
                        borderColor="#E9EDC9"
                        _focus={{ borderColor: "#D4A373", boxShadow: "0 0 0 1px #D4A37344" }}
                    />
                    
                    {tagFilter.length > 0 && (
                        <Box mb={4} p={3} bg="#FEFAE0" borderRadius="lg" border="1px" borderColor="#E9EDC9">
                            <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm" fontWeight="medium" color="#232323">
                                    Selected Tags ({tagFilter.length})
                                </Text>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    color="#232323"
                                    onClick={() => setTagFilter([])}
                                >
                                    Clear All
                                </Button>
                            </HStack>
                            <Wrap spacing={2}>
                                {tagFilter.map(tag => (
                                    <WrapItem key={tag}>
                                        <Tag 
                                            borderRadius="full" 
                                            size="md"
                                            bg="#D4A373"
                                            color="#232323"
                                        >
                                            <TagLabel>{tag}</TagLabel>
                                            <TagCloseButton 
                                                color="#232323"
                                                _hover={{ bg: "#D4A373" }}
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
                                                bg={isSelected ? '#D4A373' : undefined}
                                                color={isSelected ? '#232323' : '#232323'}
                                                borderRadius="full"
                                                fontWeight="medium"
                                                _hover={{ 
                                                    transform: "translateY(-1px)",
                                                    boxShadow: "md",
                                                    bg: isSelected ? '#D4A373' : '#E9EDC9'
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
                                <Text color="#6c757d" fontSize="sm">
                                    No tags found matching "{tagSearch}"
                                </Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
            {jobs.length === 0 && (
                <VStack py={20} spacing={4} borderWidth="1px" borderRadius="md" bg="#FFFFFF" boxShadow="sm" p={8}>
                    <Heading size="md" color="#232323">No jobs found</Heading>
                    <Text color="#6c757d">Try adjusting search or filters.</Text>
                    <HStack>
                        <Button onClick={() => setSearchFilter('')} bg="#E9EDC9" _hover={{ bg: '#CCD5AE' }}>Clear Search</Button>
                        <Button onClick={() => setStatusFilter('')} bg="#E9EDC9" _hover={{ bg: '#CCD5AE' }}>Clear Status</Button>
                        <Button onClick={() => setTagFilter([])} bg="#E9EDC9" _hover={{ bg: '#CCD5AE' }}>Clear Tags</Button>
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
            <Divider my={6} borderColor="#E9EDC9" />
            <HStack mt={6} justify="center" spacing={6}>
                <Button onClick={() => setCurrentPage(p => p - 1)} isDisabled={currentPage === 1} bg="#FAEDCD" _hover={{ bg: '#E9EDC9' }}>Previous</Button>
                <Text fontWeight="bold" color="#232323">Page {currentPage} of {totalPages}</Text>
                <Button onClick={() => setCurrentPage(p => p + 1)} isDisabled={currentPage >= totalPages} bg="#FAEDCD" _hover={{ bg: '#E9EDC9' }}>Next</Button>
            </HStack>
            </Box>
            {/* Editor modal removed in favor of dedicated editor routes */}
        </Container>

    );
}