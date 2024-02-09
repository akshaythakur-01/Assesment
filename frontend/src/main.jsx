import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import App from "./App"
import Signup from "./components/Signup"
import SignIn from "./components/SignIn"
import Quiz from "./components/Quiz"
import Attempts from "./components/Attempts"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/sign-up",
    element: <Signup />,
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/quiz",
    element: <Quiz />,
  },
  {
    path: "/attempts",
    element: <Attempts />,
  },
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
