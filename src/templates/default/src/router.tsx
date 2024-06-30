import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
