// src/App.tsx
import { ChakraProvider, extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
import { Layout } from './components/Layout';
import JobDetailPage from './pages/JobDetailPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import AssessmentBuilderPage from './pages/AssessmentBuilderPage';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};
const theme = extendTheme({ config });

const router = createBrowserRouter([
  {
    element: <Layout><Outlet /></Layout>, // Wrap all pages in the Layout
    children: [
      { path: "/", element: <JobsPage /> },
      { path: "/jobs", element: <JobsPage /> },
      { path: "/jobs/:jobId", element: <JobDetailPage /> },
      { path: "/candidates", element: <CandidatesPage /> },
      { path: "/candidates/:candidateId", element: <CandidateProfilePage /> },
      { path: "/jobs/:jobId/assessment", element: <AssessmentBuilderPage /> },
    ],
  },
]);

function App() {
  return (
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
}

export default App;