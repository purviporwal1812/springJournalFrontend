import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import LoginPage from './components/LoginPage.jsx'
import SignupPage from './components/SignupPage.jsx'
import About from './components/About.jsx'
import Error from './components/Error.jsx'
import JournalList from './components/JournalList.jsx'
import Dashboard from './components/Dashboard.jsx'
import UserProfile from './components/UserProfile.jsx'
import JournalEditor from './components/JournalEditor.jsx'
import GoogleCallback from './components/GoogleCallback.jsx'

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />
  },
  {
    path: "/about",
    element: <About />,
    errorElement: <Error />
  },
  {
    path: "/signup",
    element: <SignupPage />,
    errorElement: <Error />
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <Error />
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    errorElement: <Error />
  },
  {
    path: "/journal",
    element: <JournalList/>,
    errorElement: <Error />
  },
  {
    path: "/journal/new",
    element: <JournalEditor/>,
    errorElement: <Error />
  },
  {
    path: "/journal/edit/:id", // New route for editing journals
    element: <JournalEditor/>,
    errorElement: <Error />
  },
  {
    path: "/profile",
    element: <UserProfile/>,
    errorElement: <Error />
  },
  {
    path: "/auth/google/callback",
    element: <GoogleCallback/>,
    errorElement: <Error />
  },
]);

createRoot(document.getElementById('root')).render(
  
    <RouterProvider router={appRouter} />
  
)