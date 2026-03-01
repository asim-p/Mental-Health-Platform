import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { TherapistDirectory } from "./pages/therapist-directory";
import { PatientDashboard } from "./pages/patient-dashboard";
import { TherapistDashboard } from "./pages/therapist-dashboard";
import { AdminDashboard } from "./pages/admin-dashboard";
import { BookingPage } from "./pages/booking-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/therapists",
    Component: TherapistDirectory,
  },
  {
    path: "/book/:therapistId",
    Component: BookingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/dashboard/patient",
    Component: PatientDashboard,
  },
  {
    path: "/dashboard/therapist",
    Component: TherapistDashboard,
  },
  {
    path: "/dashboard/admin",
    Component: AdminDashboard,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
