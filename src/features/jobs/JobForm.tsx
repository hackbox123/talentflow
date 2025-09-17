import { Button, FormControl, FormLabel, Input, VStack, FormErrorMessage, Box, HStack, Text, Checkbox, CheckboxGroup, Stack, Divider, Collapse } from '@chakra-ui/react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { type Job } from '../../api/db';
import { useState } from 'react';

type FormData = {
    title: string;
    slug: string;
    tags: string[];
};

// Comprehensive tag categories
const TAG_CATEGORIES = {
    'Seniority Level': [
        'Intern / Co-op',
        'Junior / Associate', 
        'Mid-level',
        'Senior',
        'Staff / Principal',
        'Lead / Manager',
        'Architect'
    ],
    'Core Discipline': [
        'Frontend Development',
        'Backend Development',
        'Full-Stack Development',
        'Mobile Development',
        'DevOps / SRE',
        'Data Science',
        'Data Engineering',
        'Machine Learning / AI',
        'QA / Test Automation',
        'Cybersecurity',
        'Product Management',
        'UI/UX Design',
        'Cloud Engineering'
    ],
    'Programming Languages': [
        'JavaScript',
        'TypeScript',
        'Python',
        'Java',
        'Go (Golang)',
        'Rust',
        'C#',
        'Kotlin',
        'Swift',
        'PHP',
        'Ruby'
    ],
    'Frameworks & Libraries': [
        'React.js',
        'Node.js',
        'Vue.js',
        'Angular',
        'Next.js',
        'Django',
        'Spring Boot',
        '.NET',
        'Ruby on Rails',
        'Express.js',
        'FastAPI',
        'TensorFlow / PyTorch'
    ],
    'Platforms & Infrastructure': [
        'AWS',
        'Azure',
        'GCP (Google Cloud)',
        'Kubernetes',
        'Docker',
        'Terraform',
        'iOS',
        'Android',
        'Linux'
    ],
    'Databases': [
        'PostgreSQL',
        'MySQL',
        'MongoDB',
        'Redis',
        'Elasticsearch',
        'Snowflake'
    ],
    'Work Style & Logistics': [
        'Full-time',
        'Part-time',
        'Contract / Freelance',
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
                            <FormLabel>Tags</FormLabel>
                            <Text fontSize="sm" color="gray.600" mb={4}>
                                Select relevant tags to help categorize and filter this job posting.
                            </Text>
                            <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" border="1px" borderColor="gray.200" borderRadius="md" p={4}>
                                {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
                                    <Box key={category}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleCategory(category)}
                                            width="100%"
                                            justifyContent="space-between"
                                            fontWeight="semibold"
                                            color="blue.600"
                                        >
                                            {category}
                                            <Text fontSize="xs" color="gray.500">
                                                {expandedCategories[category] ? '▼' : '▶'}
                                            </Text>
                                        </Button>
                                        <Collapse in={expandedCategories[category]}>
                                            <CheckboxGroup value={selectedTags} onChange={handleTagChange}>
                                                <Stack spacing={2} pl={4} mt={2}>
                                                    {tags.map(tag => (
                                                        <Checkbox key={tag} value={tag} size="sm">
                                                            <Text fontSize="sm">{tag}</Text>
                                                        </Checkbox>
                                                    ))}
                                                </Stack>
                                            </CheckboxGroup>
                                        </Collapse>
                                        {Object.keys(TAG_CATEGORIES).indexOf(category) < Object.keys(TAG_CATEGORIES).length - 1 && (
                                            <Divider my={2} />
                                        )}
                                    </Box>
                                ))}
                            </VStack>
                            {selectedTags.length > 0 && (
                                <Box mt={3}>
                                    <Text fontSize="sm" fontWeight="medium" mb={2}>Selected Tags:</Text>
                                    <HStack wrap="wrap" spacing={2}>
                                        {selectedTags.map(tag => (
                                            <Box
                                                key={tag}
                                                bg="blue.100"
                                                color="blue.800"
                                                px={2}
                                                py={1}
                                                borderRadius="md"
                                                fontSize="xs"
                                                fontWeight="medium"
                                            >
                                                {tag}
                                            </Box>
                                        ))}
                                    </HStack>
                                </Box>
                            )}
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