import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { TherapistDirectory } from "./pages/therapist-directory";
import { PatientDashboard } from "./pages/patient-dashboard";
import { TherapistDashboard } from "./pages/therapist-dashboard";
import { AdminDashboard } from "./pages/admin-dashboard";
import { BookingPage } from "./pages/booking-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import { SymptomScreening } from "./pages/symptom-screening";
import { ScreeningResults } from "./pages/screening-results";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/screening",
    Component: SymptomScreening,
  },
  {
    path: "/screening/results",
    Component: ScreeningResults,
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