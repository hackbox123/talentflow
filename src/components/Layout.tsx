// src/components/Layout.tsx
import { Box, Container, HStack, Heading, Link as ChakraLink } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box>
      <Box as="header" bg="gray.100" py={4} px={8}>
        <HStack justify="space-between">
          <Heading size="md">TalentFlow</Heading>
          <HStack as="nav" spacing={6}>
            {/* Use the _activeLink prop for styling */}
            <ChakraLink
              as={NavLink}
              to="/jobs"
              _activeLink={{
                fontWeight: 'bold',
                textDecoration: 'underline',
              }}
            >
              Jobs
            </ChakraLink>
            <ChakraLink
              as={NavLink}
              to="/candidates"
              _activeLink={{
                fontWeight: 'bold',
                textDecoration: 'underline',
              }}
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