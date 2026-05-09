Mental Health Platform (MHP) is a centralized web-based directory and tele-therapy platform. It bridges the gap between individuals seeking mental health support and licensed psychologists/psychiatrists across Nepal. It allows users to find therapists based on language, specialty, and budget, book appointments, pay locally, and conduct secure video sessions all in one place.

How It Works: The Three User Journeys
To build this, you will implement Role-Based Access Control (RBAC). This means the system will look and behave differently depending on who logs in.

1. The Patient (Help-Seeker)
Onboarding: Registers anonymously or with an email.
Discovery: Browses a directory of verified therapists. They can filter the list by:
Specialty: (e.g., Depression, Anxiety, Relationship Issues)
Language: (e.g., Nepali, English, Newari, Maithili)
Price Range: (per 45-minute session)
Action: Selects an available time slot on the therapist's calendar, pays securely using a local gateway (eSewa or Khalti), and receives a booking confirmation.
The Session: At the scheduled time, they log into their dashboard and click a "Join Session" button to enter a secure video call directly in the browser.

2. The Therapist (Provider)
Onboarding: Registers and is required to upload their credentials (e.g., Nepal Medical Council number or clinical psychology degree). They cannot accept patients until verified.
Profile Management: Sets their hourly rate, writes a bio, and checks off their areas of expertise.
Schedule Management: Uses a calendar interface to block out their available working hours.
The Session: Views a list of upcoming appointments. They join the same secure video room as the patient. They also have a private text area on their screen to type session notes that only they can see.

3. The Super Administrator (You / The System Owner)
Verification Workflow: The most critical job. The admin reviews uploaded credentials and clicks "Approve" to make a therapist's profile visible to the public.
Platform Management: Can ban users, remove therapists, and view platform statistics (e.g., total appointments booked, total revenue generated).

Key Technical Integrations (What You Will Code)
To make the Mental Health Platform functional and ready for an IT degree defense, you will need to weave together a few specific technologies:

Secure Authentication: Implementing JSON Web Tokens (JWT) so users stay securely logged in, and hashing passwords using a library like Bcrypt so user data is protected.
Relational Database Management: Using PostgreSQL to map out the connections. Example: User A booked Therapist B for Time C and generated Payment Receipt D.
Payment Gateway API: Integrating the official APIs provided by eSewa and Khalti to handle transactions securely without storing credit card info on your own server.
Video Conferencing API: Instead of building a video call system from scratch (which is incredibly difficult), you will embed a service like WebRTC directly into your site. This keeps users on your website rather than forcing them to download Zoom.
Email/SMS Notifications: Using a service like SendGrid (for emails) or Sparrow SMS (for local text messages) to send patients a reminder link 1 hour before their appointment.
