import React from 'react';
import { createHashRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';

// Pages
import Teach from './pages/Teach';
import Practice from './pages/Practice';
import Reward from './pages/Reward';
import Exam from './pages/Exam';
import Ask from './pages/Ask';
import History from './pages/History';
import Profile from './pages/Profile';
import Remedial from './pages/Remedial';

const router = createHashRouter([
  {
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      { path: "/", element: <Teach /> },
      { path: "/practice", element: <Practice /> },
      { path: "/reward", element: <Reward /> },
      { path: "/exam", element: <Exam /> },
      { path: "/ask", element: <Ask /> },
      { path: "/history", element: <History /> },
      { path: "/remedial", element: <Remedial /> },
      { path: "/profile", element: <Profile /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;