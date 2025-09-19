import { Box, Button, Container, Heading, Text, VStack, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <Box bg="#FEFAE0" minH="100vh" py={0}>
      <Container maxW="container.xl" py={24} px={{ base: 4, md: 10 }}>
        <VStack spacing={10} align="center" textAlign="center">
          <Box
            bgGradient="linear(to-br, #CCD5AE, #E9EDC9)"
            borderRadius="2xl"
            boxShadow="0 8px 32px 0 #D4A37344"
            p={{ base: 8, md: 16 }}
            w="full"
            maxW="3xl"
          >
            <Heading
              as="h1"
              size="2xl"
              fontWeight="extrabold"
              color="#232323"
              mb={4}
              letterSpacing="tight"
              textShadow="0 2px 8px #FAEDCD"
            >
              Welcome to TalentFlow
            </Heading>
            <Text fontSize="xl" color="#6c757d" mb={8}>
              The modern platform for managing jobs, candidates, and assessments. Streamline your hiring process with a beautiful, intuitive interface.
            </Text>
            <HStack justify="center" spacing={6}>
              <Button
                size="lg"
                px={10}
                py={7}
                fontWeight="extrabold"
                fontSize="xl"
                bg="#D4A373"
                color="#232323"
                borderRadius="xl"
                boxShadow="0 4px 24px 0 #CCD5AE88"
                _hover={{ bg: '#CCD5AE', color: '#232323', boxShadow: '0 8px 32px 0 #D4A37388', transform: 'scale(1.04)' }}
                _active={{ bg: '#D4A373', color: '#232323', transform: 'scale(0.98)' }}
                transition="all 0.2s cubic-bezier(.4,0,.2,1)"
                onClick={() => navigate('/jobs')}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                px={10}
                py={7}
                fontWeight="extrabold"
                fontSize="xl"
                variant="outline"
                borderColor="#D4A373"
                color="#232323"
                borderRadius="xl"
                _hover={{ bg: '#FAEDCD', color: '#232323' }}
                _active={{ bg: '#D4A373', color: '#232323' }}
                transition="all 0.2s cubic-bezier(.4,0,.2,1)"
                onClick={() => navigate('/candidates')}
              >
                View Candidates
              </Button>
            </HStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
