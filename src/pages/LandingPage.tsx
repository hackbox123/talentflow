import { Box, Button, Container, Heading, Text, VStack, HStack, Image } from '@chakra-ui/react';
import talentflowLogo from '../assets/talentflow.svg';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <Box
      minH="100vh"
      py={{ base: 12, md: 24 }}
      bgGradient="linear(to-br, #FEFAE0 60%, #E9EDC9 100%)"
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: { base: 0.08, md: 0.12 },
        zIndex: 0,
        background: {
          base: 'none',
          md: 'radial-gradient(circle at 80% 20%, #D4A37333 0%, #FEFAE000 60%)',
        },
      }}
    >
      <Container maxW="container.xl" px={{ base: 2, sm: 4, md: 10 }} position="relative" zIndex={1}>
        <Box
          display={{ base: 'flex', md: 'flex' }}
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems="center"
          justifyContent="center"
          minH={{ base: 'auto', md: '75vh' }}
          gap={{ base: 10, md: 24 }}
        >
          {/* Main Card for desktop */}
          <Box
            w="full"
            maxW={{ base: '100%', md: '700px', lg: '760px' }}
            bg={{ base: 'transparent', md: 'white' }}
            boxShadow={{ base: 'none', md: '0 8px 40px rgba(212,163,115,0.10)' }}
            borderRadius={{ base: 'none', md: '3xl' }}
            px={{ base: 0, md: 12, lg: 16 }}
            py={{ base: 0, md: 12, lg: 16 }}
            mr={{ base: 0, md: 0, lg: 4 }}
            mb={{ base: 0, md: 0 }}
            transition="box-shadow 0.3s"
          >
            <VStack spacing={{ base: 6, md: 8 }} align={{ base: 'center', md: 'start' }} maxW={{ base: '100%', md: 'lg' }} w="full">
              <Box mb={2}>
                <Image
                  src={talentflowLogo}
                  alt="TalentFlow Logo"
                  boxSize={{ base: '64px', sm: '80px', md: '110px' }}
                  borderRadius="2xl"
                  boxShadow="0 8px 32px rgba(212,163,115,0.18)"
                  bg="#fff"
                  p={2}
                  style={{ animation: 'float 3.5s ease-in-out infinite' }}
                />
              </Box>
              <Heading
                as="h1"
                fontSize={{ base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' }}
                fontWeight="extrabold"
                color="#232323"
                letterSpacing="tight"
                textAlign={{ base: 'center', md: 'left' }}
                lineHeight={1.1}
                mb={2}
                textShadow={{ base: 'none', md: '0 2px 12px #E9EDC9' }}
              >
                The Modern Hiring Platform
              </Heading>
              <Text fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} color="#6c757d" maxW="2xl" textAlign={{ base: 'center', md: 'left' }}>
                Streamline your hiring process with beautiful, intuitive tools for jobs, candidates, and assessments.
              </Text>
              <HStack spacing={{ base: 0, md: 6 }} pt={2} w="full" flexDir={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }}>
                <Button
                  w={{ base: '100%', md: 'auto' }}
                  size="lg"
                  px={{ base: 0, sm: 10, md: 12 }}
                  py={{ base: 5, sm: 7, md: 8 }}
                  fontWeight="bold"
                  fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                  bg="#D4A373"
                  color="#232323"
                  borderRadius="xl"
                  boxShadow={{ base: '0 8px 32px rgba(212,163,115,0.16)', md: '0 12px 40px rgba(212,163,115,0.18)' }}
                  _hover={{ bg: '#CCD5AE', transform: 'translateY(-3px) scale(1.04)' }}
                  onClick={() => navigate('/jobs')}
                  transition="all 0.2s"
                >
                  Manage Jobs
                </Button>
                <Button
                  w={{ base: '100%', md: 'auto' }}
                  size="lg"
                  px={{ base: 0, sm: 10, md: 12 }}
                  py={{ base: 5, sm: 7, md: 8 }}
                  fontWeight="bold"
                  fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                  variant="outline"
                  borderColor="#D4A373"
                  color="#232323"
                  borderRadius="xl"
                  _hover={{ bg: '#FAEDCD', borderColor: '#D4A373', color: '#232323' }}
                  onClick={() => navigate('/candidates')}
                  transition="all 0.2s"
                >
                  Show Candidates
                </Button>
              </HStack>
              <Text fontSize={{ base: 'sm', sm: 'md' }} color="#6c757d" pt={4} textAlign={{ base: 'center', md: 'left' }}>
                Trusted by hiring teams worldwide — start building high-quality candidate flows in minutes.
              </Text>
            </VStack>
          </Box>
          {/* Illustration side (desktop only: more decorative) */}
          <Box display={{ base: 'flex', md: 'block' }} flex="1" alignSelf="stretch" h="100%" justifyContent="center" alignItems="center" w="full" mt={{ base: 8, md: 0 }}>
            <Box
              h={{ base: '180px', sm: '240px', md: '400px', lg: '480px' }}
              minH={{ base: '180px', sm: '240px', md: '400px', lg: '480px' }}
              borderRadius="3xl"
              bgGradient="linear(to-br, #E9EDC9 60%, #FEFAE0 100%)"
              boxShadow={{ base: '0 12px 40px rgba(212,163,115,0.10)', md: '0 24px 80px rgba(212,163,115,0.16)' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              overflow="hidden"
              w={{ base: '180px', sm: '240px', md: '400px', lg: '480px' }}
              mx={{ base: 'auto', md: 0 }}
              _after={{
                content: '""',
                display: { base: 'none', md: 'block' },
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #D4A37333 0%, #FEFAE000 80%)',
                zIndex: 1,
              }}
            >
              <Image
                src={talentflowLogo}
                alt="TalentFlow Illustration"
                boxSize={{ base: '120px', sm: '180px', md: '260px', lg: '320px' }}
                borderRadius="2xl"
                opacity={0.92}
                style={{ animation: 'float 3.5s ease-in-out infinite' }}
                zIndex={2}
              />
            </Box>
          </Box>
        </Box>
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
