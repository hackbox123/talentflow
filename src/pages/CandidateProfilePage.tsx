// src/pages/CandidateProfilePage.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Spinner, Text, VStack, Textarea, List, ListItem, HStack, Tag, TagLabel, Button } from '@chakra-ui/react';
import { type Candidate, type Job, type Timeline } from '../api/db';
import { Link as RouterLink } from 'react-router-dom';

function getStageColor(stage?: string): string {
  switch (stage) {
    case 'applied': return 'blue.500';
    case 'screen': return 'purple.500';
    case 'tech': return 'orange.500';
    case 'offer': return 'green.500';
    case 'hired': return 'teal.500';
    case 'rejected': return 'red.500';
    default: return 'gray.500';
  }
}

function getStageColorScheme(stage?: string): string {
  switch (stage) {
    case 'applied': return 'blue';
    case 'screen': return 'purple';
    case 'tech': return 'orange';
    case 'offer': return 'green';
    case 'hired': return 'teal';
    case 'rejected': return 'red';
    default: return 'gray';
  }
}

// Hardcoded list of users for mentions
const MENTION_SUGGESTIONS = [
  'Alice Johnson (HR Manager)',
  'Bob Smith (Tech Lead)', 
  'Charlie Brown (Hiring Manager)',
  'Diana Prince (Recruiter)',
  'Eve Wilson (Team Lead)'
];

const CandidateProfilePage = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNote(text);
    setCursorPosition(e.target.selectionStart);

    // Find the word the cursor is currently on
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const words = textBeforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];
    
    // Check if current word starts with '@' and extract the query
    if (currentWord.startsWith('@')) {
      const query = currentWord.slice(1); // Remove the '@'
      setMentionQuery(query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionQuery('');
    }
  };

  const handleSuggestionClick = (name: string) => {
    const textBeforeCursor = note.slice(0, cursorPosition);
    const textAfterCursor = note.slice(cursorPosition);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('@')) {
      // Replace the partial @mention with the full name
      words[words.length - 1] = `@${name}`;
      const newText = words.join(' ') + ' ' + textAfterCursor;
      setNote(newText);
    }
    
    setShowSuggestions(false);
    setMentionQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Filter suggestions based on the query
  const filteredSuggestions = MENTION_SUGGESTIONS.filter(name =>
    name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  useEffect(() => {
    const initializeData = async () => {
      try {
        // First, ensure timeline is initialized for all candidates
        await fetch('/candidates/initialize-timeline', { method: 'POST' });
        
        // Then fetch candidate data
        const [candidateData, timelineData] = await Promise.all([
          fetch(`/candidates/${candidateId}`).then(res => res.json()),
          fetch(`/candidates/${candidateId}/timeline`).then(res => res.json())
        ]);

        setCandidate(candidateData);
        setTimeline(timelineData);

        // Fetch associated job data if available
        if (candidateData?.jobId) {
          try {
            const jobRes = await fetch(`/jobs/${candidateData.jobId}`);
            if (jobRes.ok) {
              const jobData = await jobRes.json();
              setJob(jobData);
            }
          } catch {}
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [candidateId]);
  
  if (loading) return <Spinner />;
  if (!candidate) return <Text>Candidate not found.</Text>;

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading>{candidate.name}</Heading>
        <Text>{candidate.email}</Text>
        <Text>Status: {candidate.stage}</Text>
        {job && (
          <Box mt={3}>
            <HStack spacing={3} align="center">
              <Text color="gray.600">Applied for:</Text>
              <Button as={RouterLink} to={`/jobs/${job.id}`} size="sm" variant="link" colorScheme="blue">
                {job.title}
              </Button>
              <HStack spacing={1}>
                {job.tags.slice(0, 3).map(t => (
                  <Tag key={t} size="sm" colorScheme="blue" variant="subtle">
                    <TagLabel>{t}</TagLabel>
                  </Tag>
                ))}
              </HStack>
            </HStack>
          </Box>
        )}
      </Box>
      
      <Box>
        <Heading size="lg" mb={4}>Timeline</Heading>
        <List spacing={3}>
          {timeline.map((item, index) => (
            <ListItem key={index} display="flex" alignItems="flex-start" p={3} borderLeft="4px solid" 
              borderLeftColor={getStageColor(item.stage)}
              bg="gray.50"
              borderRadius="md"
              mb={2}
            >
              <Box flex={1}>
                <HStack spacing={2} mb={1}>
                  <Text fontWeight="bold">{item.event}</Text>
                  <Tag size="sm" colorScheme={getStageColorScheme(item.stage)}>
                    {item.stage}
                  </Tag>
                </HStack>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  {new Date(item.date).toLocaleString()}
                </Text>
                {item.notes && (
                  <Text fontSize="sm" color="gray.700">{item.notes}</Text>
                )}
              </Box>
            </ListItem>
          ))}
          {timeline.length === 0 && (
            <Text color="gray.500" fontSize="sm">No timeline events yet.</Text>
          )}
        </List>
      </Box>

      <Box>
        <Heading size="lg" mb={4}>Notes</Heading>
        <VStack align="stretch" spacing={2}>
          <Textarea 
            ref={textareaRef}
            placeholder="Add a note... Type @ to mention a user."
            value={note}
            onChange={handleNoteChange}
            minH="120px"
          />
          
          {/* Inline suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              bg="white"
              boxShadow="md"
              maxH="200px"
              overflowY="auto"
              zIndex={10}
            >
              <List spacing={0}>
                {filteredSuggestions.map(name => (
                  <ListItem 
                    key={name} 
                    cursor="pointer" 
                    _hover={{ bg: 'blue.50' }}
                    p={3}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    onClick={() => handleSuggestionClick(name)}
                  >
                    <Text fontWeight="medium">{name}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {showSuggestions && filteredSuggestions.length === 0 && mentionQuery && (
            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              bg="white"
              p={3}
            >
              <Text color="gray.500" fontSize="sm">No users found for "@{mentionQuery}"</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  );
};
export default CandidateProfilePage;