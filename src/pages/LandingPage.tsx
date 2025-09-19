import { Box, Button, Container, Heading, Text, VStack, HStack, Image } from '@chakra-ui/react';
import talentflowLogo from '../assets/talentflow.svg';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <Box
      minH="100vh"
      py={{ base: 12, md: 20 }}
      bgGradient="linear(to-br, #FEFAE0 60%, #E9EDC9 100%)"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
    width: '100%',
    height: '100%',
        opacity: 0.08,
        zIndex: 0,
      }}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 10 }} position="relative" zIndex={1}>
        <HStack spacing={{ base: 0, md: 16 }} align="center" justify="center" minH="70vh" flexDir={{ base: 'column', md: 'row' }}>
          <VStack spacing={8} align="start" maxW="lg">
            <Box mb={2}>
              <Image
                src={talentflowLogo}
                alt="TalentFlow Logo"
                boxSize={{ base: '80px', md: '110px' }}
                borderRadius="2xl"
                boxShadow="0 8px 32px rgba(212,163,115,0.18)"
                bg="#fff"
                p={2}
                style={{ animation: 'float 3.5s ease-in-out infinite' }}
              />
            </Box>
            <Heading
              as="h1"
              size="2xl"
              fontWeight="extrabold"
              color="#232323"
              letterSpacing="tight"
              textAlign="left"
              lineHeight={1.1}
              mb={2}
            >
              The Modern Hiring Platform
            </Heading>
            <Text fontSize="xl" color="#6c757d" maxW="2xl" textAlign="left">
              Streamline your hiring process with beautiful, intuitive tools for jobs, candidates, and assessments.
            </Text>
            <HStack spacing={6} pt={2}>
              <Button
                size="lg"
                px={10}
                py={7}
                fontWeight="bold"
                fontSize="xl"
                bg="#D4A373"
                color="#232323"
                borderRadius="xl"
                boxShadow="0 8px 32px rgba(212,163,115,0.16)"
                _hover={{ bg: '#CCD5AE', transform: 'translateY(-3px) scale(1.04)' }}
                onClick={() => navigate('/jobs')}
              >
                Explore Jobs
              </Button>
              <Button
                size="lg"
                px={10}
                py={7}
                fontWeight="bold"
                fontSize="xl"
                variant="outline"
                borderColor="#D4A373"
                color="#232323"
                borderRadius="xl"
                _hover={{ bg: '#FAEDCD', borderColor: '#D4A373', color: '#232323' }}
                onClick={() => navigate('/candidates')}
              >
                Meet Candidates
              </Button>
            </HStack>
            <Text fontSize="md" color="#6c757d" pt={4} textAlign="left">
              Trusted by hiring teams worldwide — start building high-quality candidate flows in minutes.
            </Text>
          </VStack>
          <Box display={{ base: 'none', md: 'block' }} flex="1" alignSelf="stretch" h="100%">
            <Box
              h="100%"
              minH="340px"
              borderRadius="3xl"
              bgGradient="linear(to-br, #E9EDC9 60%, #FEFAE0 100%)"
              boxShadow="0 12px 40px rgba(212,163,115,0.10)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              overflow="hidden"
            >
              <Image
                src={talentflowLogo}
                alt="TalentFlow Illustration"
                boxSize="220px"
                borderRadius="2xl"
                opacity={0.92}
                style={{ animation: 'float 3.5s ease-in-out infinite' }}
              />
            </Box>
          </Box>
        </HStack>
      </Container>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </Box>
  );
}
