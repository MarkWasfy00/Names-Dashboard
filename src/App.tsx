import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import Login from "./pages/login/Login";
import { Toaster } from "@/components/ui/sonner"
import Home from "./pages/home/Home";
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import Admin from "./pages/admin/Admin";
import { ProtectedRoute } from "./components/protected-route";

const queryClient = new QueryClient()
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </NuqsAdapter>
  )
}

export default App
