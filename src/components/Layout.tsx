// src/components/Layout.tsx
import { Box, Container, HStack, Heading, Link as ChakraLink, IconButton, VStack, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody, useDisclosure } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import { NavLink } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box>
      <Box as="header" bgGradient="linear(to-r, #CCD5AE, #E9EDC9)" py={4} px={{ base: 4, md: 8 }} boxShadow="0 6px 18px rgba(0,0,0,0.06)">
        <HStack justify="space-between" align="center">
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
          {/* Desktop nav */}
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
          {/* Mobile hamburger */}
          <IconButton
            aria-label="Open menu"
            icon={<HamburgerIcon />}
            display={{ base: 'flex', md: 'none' }}
            variant="ghost"
            color="#232323"
            fontSize="2xl"
            onClick={onOpen}
          />
        </HStack>
        {/* Mobile drawer nav */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent bgGradient="linear(to-br, #FEFAE0 60%, #E9EDC9 100%)">
            <DrawerCloseButton mt={2} />
            <DrawerBody>
              <VStack as="nav" spacing={6} mt={12} align="stretch">
                <ChakraLink
                  as={NavLink}
                  to="/jobs"
                  onClick={onClose}
                  _activeLink={{
                    fontWeight: 'bold',
                    color: '#D4A373',
                    borderBottom: '3px solid #D4A373',
                    bg: 'transparent',
                    borderRadius: 0
                  }}
                  color="#232323"
                  fontSize="xl"
                  px={2}
                  py={2}
                  borderRadius="md"
                  transition="all 0.18s"
                  _hover={{ color: '#D4A373', bg: '#FEFAE0' }}
                >
                  Jobs
                </ChakraLink>
                <ChakraLink
                  as={NavLink}
                  to="/candidates"
                  onClick={onClose}
                  _activeLink={{
                    fontWeight: 'bold',
                    color: '#D4A373',
                    borderBottom: '3px solid #D4A373',
                    bg: 'transparent',
                    borderRadius: 0
                  }}
                  color="#232323"
                  fontSize="xl"
                  px={2}
                  py={2}
                  borderRadius="md"
                  transition="all 0.18s"
                  _hover={{ color: '#D4A373', bg: '#FEFAE0' }}
                >
                  Candidates
                </ChakraLink>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
      <Container as="main" maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};