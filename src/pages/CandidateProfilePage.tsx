// src/pages/CandidateProfilePage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Spinner, Text, VStack, Textarea, List, ListItem } from '@chakra-ui/react';
import { type Candidate } from '../api/db';
import { Popover, PopoverTrigger, PopoverContent, PopoverBody } from '@chakra-ui/react';

// Hardcoded list of users for mentions
const MENTION_SUGGESTIONS = ['Alice', 'Bob', 'Charlie (Hiring Manager)'];


const CandidateProfilePage = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);


  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNote(text);
    // Show suggestions if the user types '@'
    if (text.endsWith('@')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    // Append the selected name and a space
    setNote(prev => prev + name + ' ');
    setShowSuggestions(false);
  };

  useEffect(() => {
    Promise.all([
      fetch(`/candidates/${candidateId}`).then(res => res.json()),
      fetch(`/candidates/${candidateId}/timeline`).then(res => res.json())
    ]).then(([candidateData, timelineData]) => {
      setCandidate(candidateData);
      setTimeline(timelineData);
      setLoading(false);
    });
  }, [candidateId]);
  
  if (loading) return <Spinner />;
  if (!candidate) return <Text>Candidate not found.</Text>;

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading>{candidate.name}</Heading>
        <Text>{candidate.email}</Text>
        <Text>Status: {candidate.stage}</Text>
      </Box>
      
      <Box>
        <Heading size="lg" mb={4}>Timeline</Heading>
        <List spacing={3}>
          {timeline.map((item, index) => (
            <ListItem key={index}>
              <Text fontWeight="bold">{item.event} - {new Date(item.date).toLocaleDateString()}</Text>
              <Text fontSize="sm" color="gray.600">{item.notes}</Text>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box>
        <Heading size="lg" mb={4}>Notes</Heading>
        {/* NEW: Popover for @mention suggestions */}
        <Popover isOpen={showSuggestions} placement="top-start" isLazy>
          <PopoverTrigger>
            <Textarea 
              placeholder="Add a note... Type @ to mention a user."
              value={note}
              onChange={handleNoteChange}
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <List spacing={2}>
                {MENTION_SUGGESTIONS.map(name => (
                  <ListItem 
                    key={name} 
                    cursor="pointer" 
                    _hover={{ bg: 'gray.100' }}
                    p={2}
                    borderRadius="md"
                    onClick={() => handleSuggestionClick(name)}
                  >
                    {name}
                  </ListItem>
                ))}
              </List>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </VStack>
  );
};
export default CandidateProfilePage;