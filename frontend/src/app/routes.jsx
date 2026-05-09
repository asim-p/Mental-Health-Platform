import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./pages/landing-page.jsx";
import { TherapistDirectory } from "./pages/therapist-directory.jsx";
import { PatientDashboard } from "./pages/patient-dashboard.jsx";
import { TherapistDashboard } from "./pages/therapist-dashboard.jsx";
import { BookingPage } from "./pages/booking-page.jsx";
import { LoginPage } from "./pages/login-page.jsx";
import { RegisterPage } from "./pages/register-page.jsx";
import { SymptomScreening } from "./pages/symptom-screening.jsx";
import { ScreeningResults } from "./pages/screening-results.jsx";
import { TherapistAvailability } from "./pages/therapist-availability.jsx";
import { TherapistProfileSettings } from "./pages/therapist-profile-settings.jsx";
import { NotFound } from "./pages/not-found.jsx";
import { ProtectedRoute } from "./components/protected-route.jsx";

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
    element: (
      <ProtectedRoute allowedRoles={["PATIENT"]}>
        <BookingPage />
      </ProtectedRoute>
    ),
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
    element: (
      <ProtectedRoute allowedRoles={["PATIENT"]}>
        <PatientDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/therapist",
    element: (
      <ProtectedRoute allowedRoles={["THERAPIST"]}>
        <TherapistDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/therapist/availability",
    element: (
      <ProtectedRoute allowedRoles={["THERAPIST"]}>
        <TherapistAvailability />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/therapist/settings",
    element: (
      <ProtectedRoute allowedRoles={["THERAPIST"]}>
        <TherapistProfileSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
