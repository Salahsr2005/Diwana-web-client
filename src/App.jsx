import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Layout, RequireAuth } from "./routes/layout/layout"
import HomePage from "./routes/homePage/homePage"
import ListPage from "./routes/listPage/listPage"
import SinglePage from "./routes/singlePage/singlePage"
import ProfilePage from "./routes/profilePage/profilePage"
import Login from "./routes/login/login"
import Register from "./routes/register/register"
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage"
import NewPostPage from "./routes/newPostPage/newPostPage"
import UsersPage from "./routes/userPage/usersPage"
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders"
import ErrorBoundary from "./components/error-boundary/ErrorBoundary"
import NetworkError from "./components/network-error/NetworkError"

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/",
          element: <HomePage />,
          errorElement: <NetworkError />,
        },
        {
          path: "/list",
          element: <ListPage />,
          loader: listPageLoader,
          errorElement: <NetworkError />,
        },
        {
          path: "/users",
          element: <UsersPage />,
          errorElement: <NetworkError />,
        },
        {
          path: "/:id",
          element: <SinglePage />,
          loader: singlePageLoader,
          errorElement: <NetworkError />,
        },
        {
          path: "/login",
          element: <Login />,
          errorElement: <NetworkError />,
        },
        {
          path: "/register",
          element: <Register />,
          errorElement: <NetworkError />,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/profile",
          element: <ProfilePage />,
          loader: profilePageLoader,
          errorElement: <NetworkError />,
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
          errorElement: <NetworkError />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
          errorElement: <NetworkError />,
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}

export default App
