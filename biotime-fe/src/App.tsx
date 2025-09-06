import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Dashboard from './pages/Dashboard';
import AttendanceRecords from './pages/AttendanceRecords';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import EmployeeManagement from './pages/EmployeeManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import Settings from './pages/Settings';
import Layout from './components/layout/DefaultLayout';
import { Toaster } from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      // cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/attendance" element={<AttendanceRecords />} />
              {/* <Route path="/analytics" element={<Analytics />} /> */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/departments" element={<DepartmentManagement />} />
              {/* <Route path="/settings" element={<Settings />} /> */}
            </Routes>
          </Layout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;