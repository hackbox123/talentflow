// src/App.tsx
import { ChakraProvider, extendTheme, type ThemeConfig, Box } from '@chakra-ui/react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import JobsPage from './pages/JobsPage';
import JobEditorPage from './pages/JobEditorPage';
import CandidatesPage from './pages/CandidatesPage';
import { Layout } from './components/Layout';
import JobDetailPage from './pages/JobDetailPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import AssessmentBuilderPage from './pages/AssessmentBuilderPage';
import CandidateAssessmentPage from './pages/CandidateAssessmentPage';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Palette tokens based on provided colors
const colors = {
  brand: {
    50: '#FEFAE0',
    100: '#FAEDCD',
    200: '#E9EDC9',
    300: '#CCD5AE',
    400: '#D4A373'
  }
};

const theme = extendTheme({
  config,
  colors,
  styles: {
    global: {
      body: {
        bg: 'brand.50',
        color: '#232323',
        WebkitFontSmoothing: 'antialiased'
      },
      a: { color: 'brand.400' }
    }
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'md'
      },
      variants: {
        solid: {
          bg: '#D4A373',
          color: '#232323',
          _hover: { bg: '#CCD5AE' }
        }
      }
    }
  }
});

import LandingPage from './pages/LandingPage';

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> }, // Landing page without Layout
  {
    element: <Layout><Outlet /></Layout>, // Wrap other pages in the Layout
    children: [
      { path: "/jobs", element: <JobsPage /> },
      { path: "/jobs/new", element: <JobEditorPage /> },
      { path: "/jobs/:jobId/edit", element: <JobEditorPage /> },
      { path: "/jobs/:jobId", element: <JobDetailPage /> },
      { path: "/candidates", element: <CandidatesPage /> },
      { path: "/candidates/:candidateId", element: <CandidateProfilePage /> },
      { path: "/jobs/:jobId/assessment", element: <AssessmentBuilderPage /> },
      { path: "/jobs/:jobId/livepreview", element: <CandidateAssessmentPage /> },
    ],
  },
]);

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="brand.50">
        <RouterProvider router={router} />
      </Box>
    </ChakraProvider>
  );
}

export default App;