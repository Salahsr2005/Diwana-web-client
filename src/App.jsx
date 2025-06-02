import HomePage from "./routes/homePage/homePage"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import ListPage from "./routes/listPage/listPage"
import { Layout, RequireAuth } from "./routes/layout/layout"
import SinglePage from "./routes/singlePage/singlePage"
import ProfilePage from "./routes/profilePage/profilePage"
import Login from "./routes/login/login"
import Register from "./routes/register/register"
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage"
import NewPostPage from "./routes/newPostPage/newPostPage"
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders"
import ComparisonModal from "./components/comparision/ComparisonModal"
import { useComparison } from "./context/ComparisonContext"
import { Toaster } from "react-hot-toast"

function App() {
  const { isComparisonOpen } = useComparison()

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/list",
          element: <ListPage />,
          loader: listPageLoader,
        },
        {
          path: "/:id",
          element: <SinglePage />,
          loader: singlePageLoader,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/profile",
          element: <ProfilePage />,
          loader: profilePageLoader,
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
      ],
    },
  ])

  return (
    <>
      <RouterProvider router={router} />
      {isComparisonOpen && <ComparisonModal />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--card-bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          },
        }}
      />
    </>
  )
}

export default App
