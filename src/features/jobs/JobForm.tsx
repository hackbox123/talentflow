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
        <Box>
            <form id="job-form" onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                    <FormControl isInvalid={!!errors.title}>
                        <FormLabel htmlFor="title">Job Title</FormLabel>
                        <Input id="title" {...register('title', { required: 'Title is required' })} />
                        <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                    </FormControl>
                        <FormControl isInvalid={!!errors.slug}>
                            <FormLabel htmlFor="slug">Slug</FormLabel>
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
                            />
                            <FormErrorMessage>{errors.slug?.message}</FormErrorMessage>
                        </FormControl>
                        
                        <FormControl>
                            <FormLabel fontSize="lg" fontWeight="semibold" color="gray.700">Job Tags</FormLabel>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                                Select relevant tags to help categorize and filter this job posting
                            </Text>
                            
                            {/* Selected Tags Display */}
                            {selectedTags.length > 0 && (
                                <Box mb={4} p={3} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" fontWeight="medium" color="blue.700">
                                            Selected Tags ({selectedTags.length})
                                        </Text>
                                        <Button
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="blue"
                                            onClick={() => setSelectedTags([])}
                                        >
                                            Clear All
                                        </Button>
                                    </HStack>
                                    <HStack wrap="wrap" spacing={2}>
                                        {selectedTags.map(tag => (
                                            <Box
                                                key={tag}
                                                bg="blue.500"
                                                color="white"
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
                            <Box border="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden">
                                {Object.entries(TAG_CATEGORIES).map(([category, tags], index) => (
                                    <Box key={category}>
                                        <Button
                                            variant="ghost"
                                            size="md"
                                            onClick={() => toggleCategory(category)}
                                            width="100%"
                                            justifyContent="space-between"
                                            fontWeight="semibold"
                                            color="gray.700"
                                            bg={expandedCategories[category] ? "gray.50" : "white"}
                                            _hover={{ bg: "gray.100" }}
                                            borderRadius="none"
                                            borderBottom={index < Object.keys(TAG_CATEGORIES).length - 1 ? "1px" : "none"}
                                            borderColor="gray.200"
                                        >
                                            <HStack spacing={3}>
                                                <Text fontSize="sm" fontWeight="semibold">
                                                    {category}
                                                </Text>
                                                <Badge colorScheme="blue" variant="subtle" fontSize="xs">
                                                    {tags.length}
                                                </Badge>
                                            </HStack>
                                            <Text fontSize="sm" color="gray.500">
                                                {expandedCategories[category] ? '▼' : '▶'}
                                            </Text>
                                        </Button>
                                        <Collapse in={expandedCategories[category]}>
                                            <Box p={4} bg="gray.50">
                                                <CheckboxGroup value={selectedTags} onChange={handleTagChange}>
                                                    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
                                                        {tags.map(tag => (
                                                            <Checkbox 
                                                                key={tag} 
                                                                value={tag} 
                                                                size="md"
                                                                colorScheme="blue"
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
            <HStack mt={6} justify="flex-end">
                <Button type="button" onClick={onCancel} variant="ghost">Cancel</Button>
                <Button colorScheme="blue" type="submit" form="job-form" isLoading={isLoading}>Save</Button>
            </HStack>
        </Box>
    );
};