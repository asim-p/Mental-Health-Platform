import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page.jsx";
import { TherapistDirectory } from "./pages/therapist-directory.jsx";
import { PatientDashboard } from "./pages/patient-dashboard.jsx";
import { TherapistDashboard } from "./pages/therapist-dashboard.jsx";
import { AdminDashboard } from "./pages/admin-dashboard.jsx";
import { BookingPage } from "./pages/booking-page.jsx";
import { LoginPage } from "./pages/login-page.jsx";
import { RegisterPage } from "./pages/register-page.jsx";
import { SymptomScreening } from "./pages/symptom-screening.jsx";
import { ScreeningResults } from "./pages/screening-results.jsx";
import { TherapistAvailability } from "./pages/therapist-availability.jsx";
import { NotFound } from "./pages/not-found.jsx";

import { AboutPage } from "./pages/about-page.jsx";
import { HowItWorksPage } from "./pages/how-it-works-page.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/about",
    Component: AboutPage,
  },
  {
    path: "/how-it-works",
    Component: HowItWorksPage,
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
    path: "/dashboard/therapist/availability",
    Component: TherapistAvailability,
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
