// src/components/Layout.tsx
import { Box, Container, HStack, Heading, Link as ChakraLink } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box>
      <Box as="header" bgGradient="linear(to-r, #CCD5AE, #E9EDC9)" py={4} px={{ base: 4, md: 8 }} boxShadow="0 6px 18px rgba(0,0,0,0.06)">
        <HStack justify="space-between">
          <ChakraLink as={NavLink} to="/jobs" _hover={{ textDecoration: 'none', color: '#D4A373' }}>
            <Heading
              size="lg"
              color="#232323"
              fontWeight="extrabold"
              letterSpacing="tight"
              cursor="pointer"
              transition="color 0.18s"
              _hover={{ color: '#D4A373' }}
              textShadow="0 2px 8px #E9EDC9"
            >
              TalentFlow
            </Heading>
          </ChakraLink>
          <HStack as="nav" spacing={8} display={{ base: 'none', md: 'flex' }}>
            <ChakraLink
              as={NavLink}
              to="/jobs"
              _activeLink={{
                fontWeight: 'bold',
                color: '#D4A373',
                borderBottom: '3px solid #D4A373',
                bg: 'transparent',
                borderRadius: 0
              }}
              color="#232323"
              fontSize="lg"
              px={2}
              py={1}
              borderRadius="md"
              transition="all 0.18s"
              _hover={{ color: '#D4A373', bg: '#FEFAE0' }}
            >
              Jobs
            </ChakraLink>
            <ChakraLink
              as={NavLink}
              to="/candidates"
              _activeLink={{
                fontWeight: 'bold',
                color: '#D4A373',
                borderBottom: '3px solid #D4A373',
                bg: 'transparent',
                borderRadius: 0
              }}
              color="#232323"
              fontSize="lg"
              px={2}
              py={1}
              borderRadius="md"
              transition="all 0.18s"
              _hover={{ color: '#D4A373', bg: '#FEFAE0' }}
            >
              Candidates
            </ChakraLink>
          </HStack>
        </HStack>
      </Box>
      <Container as="main" maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};