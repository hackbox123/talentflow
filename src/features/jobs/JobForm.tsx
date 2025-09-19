import { Button, FormControl, FormLabel, Input, VStack, FormErrorMessage, Box, HStack, Text, Checkbox, CheckboxGroup, Collapse, Badge, Grid, IconButton } from '@chakra-ui/react';
import { SmallCloseIcon } from '@chakra-ui/icons';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { type Job } from '../../api/db';
import { useState } from 'react';

type FormData = {
    title: string;
    slug: string;
    tags: string[];
};

// Simplified tag categories with most commonly used tags
const TAG_CATEGORIES = {
    'Seniority': [
        'Junior',
        'Mid-level', 
        'Senior',
        'Lead',
        'Manager'
    ],
    'Role': [
        'Frontend',
        'Backend',
        'Full-Stack',
        'Mobile',
        'DevOps',
        'Data Science',
        'QA',
        'Product'
    ],
    'Languages': [
        'JavaScript',
        'TypeScript',
        'Python',
        'Java',
        'Go',
        'C#',
        'Swift'
    ],
    'Frameworks': [
        'React',
        'Node.js',
        'Vue.js',
        'Angular',
        'Django',
        'Spring Boot',
        '.NET'
    ],
    'Platforms': [
        'AWS',
        'Azure',
        'Docker',
        'Kubernetes',
        'iOS',
        'Android'
    ],
    'Databases': [
        'PostgreSQL',
        'MySQL',
        'MongoDB',
        'Redis'
    ],
    'Work Type': [
        'Full-time',
        'Part-time',
        'Contract',
        'Remote'
    ]
};

interface Props {
    job?: Job;
    allJobs: Job[];
    onSubmit: SubmitHandler<FormData>;
    onCancel: () => void;
    isLoading: boolean;
}

export const JobForm = ({ job, allJobs, onSubmit, onCancel, isLoading }: Props) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        defaultValues: job || { title: '', slug: '', tags: [] },
    });
    
    const [selectedTags, setSelectedTags] = useState<string[]>(job?.tags || []);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    
    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };
    
    const handleTagChange = (tags: string[]) => {
        setSelectedTags(tags);
        setValue('tags', tags);
    };
    
    const removeTag = (tagToRemove: string) => {
        const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
        setSelectedTags(updatedTags);
        setValue('tags', updatedTags);
    };
    

    return (
        <Box bg="#FEFAE0" p={6} borderRadius="xl">
            <form id="job-form" onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4} maxW="800px" mx="auto">
                    <Box w="100%" bg="white" p={6} borderRadius="md" boxShadow="0 8px 32px rgba(212,163,115,0.06)">
                        <VStack spacing={4} align="stretch">
                            <FormControl isInvalid={!!errors.title}>
                                <FormLabel htmlFor="title" color="#232323">Job Title</FormLabel>
                                <Input id="title" {...register('title', { required: 'Title is required' })} bg="white" />
                                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                            </FormControl>
                            <FormControl isInvalid={!!errors.slug}>
                                <FormLabel htmlFor="slug" color="#232323">Slug</FormLabel>
                                <Input
                                    id="slug"
                                    {...register('slug', {
                                        required: 'Slug is required',
                                        validate: (value) => {
                                            const otherJobs = job ? allJobs.filter(j => j.id !== job.id) : allJobs;
                                            const isUnique = !otherJobs.some(j => j.slug === value);
                                            return isUnique || 'This slug is already in use.';
                                        }
                                    })}
                                    bg="white"
                                />
                                <FormErrorMessage>{errors.slug?.message}</FormErrorMessage>
                            </FormControl>
                        </VStack>
                    </Box>
                        
                        <FormControl>
                            <FormLabel fontSize="lg" fontWeight="semibold" color="#232323" mt={4}>Job Tags</FormLabel>
                            <Text fontSize="sm" color="#6c757d" mb={4}>
                                Select relevant tags to help categorize and filter this job posting
                            </Text>
                            
                            {/* Selected Tags Display */}
                            {selectedTags.length > 0 && (
                                <Box mb={4} p={3} bg="#E9EDC9" borderRadius="lg" border="1px" borderColor="#CCD5AE">
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" fontWeight="medium" color="#232323">
                                            Selected Tags ({selectedTags.length})
                                        </Text>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            color="#232323"
                                            onClick={() => setSelectedTags([])}
                                        >
                                            Clear All
                                        </Button>
                                    </HStack>
                                    <HStack wrap="wrap" spacing={2}>
                                        {selectedTags.map(tag => (
                                            <Box
                                                key={tag}
                                                bg="#D4A373"
                                                color="#232323"
                                                px={3}
                                                py={1}
                                                borderRadius="full"
                                                fontSize="sm"
                                                fontWeight="medium"
                                                display="flex"
                                                alignItems="center"
                                                gap={2}
                                                shadow="sm"
                                            >
                                                {tag}
                                                <IconButton
                                                    aria-label="Remove tag"
                                                    icon={<SmallCloseIcon />}
                                                    size="xs"
                                                    variant="ghost"
                                                    colorScheme="whiteAlpha"
                                                    onClick={() => removeTag(tag)}
                                                />
                                            </Box>
                                        ))}
                                    </HStack>
                                </Box>
                            )}

                            {/* Tag Categories */}
                            <Box border="1px" borderColor="#E9EDC9" borderRadius="lg" overflow="hidden" bg="#FEFAE0">
                                {Object.entries(TAG_CATEGORIES).map(([category, tags], index) => (
                                    <Box key={category}>
                                        <Button
                                            variant="ghost"
                                            size="md"
                                            onClick={() => toggleCategory(category)}
                                            width="100%"
                                            justifyContent="space-between"
                                            fontWeight="semibold"
                                            color="#232323"
                                            bg={expandedCategories[category] ? "#FAEDCD" : "white"}
                                            _hover={{ bg: "#FAEDCD" }}
                                            borderRadius="none"
                                            borderBottom={index < Object.keys(TAG_CATEGORIES).length - 1 ? "1px" : "none"}
                                            borderColor="#E9EDC9"
                                        >
                                            <HStack spacing={3}>
                                                <Text fontSize="sm" fontWeight="semibold">
                                                    {category}
                                                </Text>
                                                <Badge bg="#CCD5AE" color="#232323" fontSize="xs">
                                                    {tags.length}
                                                </Badge>
                                            </HStack>
                                            <Text fontSize="sm" color="#6c757d">
                                                {expandedCategories[category] ? '▼' : '▶'}
                                            </Text>
                                        </Button>
                                        <Collapse in={expandedCategories[category]}>
                                            <Box p={4} bg="#FEFAE0">
                                                <CheckboxGroup value={selectedTags} onChange={handleTagChange}>
                                                    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
                                                        {tags.map(tag => (
                                                            <Checkbox 
                                                                key={tag} 
                                                                value={tag} 
                                                                size="md"
                                                                colorScheme="green"
                                                                _hover={{ bg: "white", borderRadius: "md" }}
                                                                p={2}
                                                            >
                                                                <Text fontSize="sm" fontWeight="medium">
                                                                    {tag}
                                                                </Text>
                                                            </Checkbox>
                                                        ))}
                                                    </Grid>
                                                </CheckboxGroup>
                                            </Box>
                                        </Collapse>
                                    </Box>
                                ))}
                            </Box>
                        </FormControl>
                    </VStack>
                </form>
            <HStack mt={6} justify="flex-end" maxW="800px" mx="auto">
                <Button type="button" onClick={onCancel} variant="ghost">Cancel</Button>
                <Button bg="#D4A373" color="#232323" type="submit" form="job-form" isLoading={isLoading} _hover={{ bg: '#CCD5AE' }}>Save</Button>
            </HStack>
        </Box>
    );
};