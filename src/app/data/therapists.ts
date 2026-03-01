export type Specialty = 
  | "Depression"
  | "Anxiety"
  | "Relationship Issues"
  | "Trauma & PTSD"
  | "Stress Management"
  | "Family Counseling"
  | "Grief & Loss"
  | "OCD"
  | "Eating Disorders";

export type Language = "Nepali" | "English" | "Newari" | "Maithili" | "Bhojpuri";

export interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: Specialty[];
  languages: Language[];
  pricePerSession: number;
  verified: boolean;
  rating: number;
  totalSessions: number;
  bio: string;
  education: string;
  experience: number;
  imageUrl?: string;
}

export const mockTherapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Anjali Sharma",
    title: "Clinical Psychologist",
    specialties: ["Depression", "Anxiety", "Stress Management"],
    languages: ["Nepali", "English", "Newari"],
    pricePerSession: 1500,
    verified: true,
    rating: 4.8,
    totalSessions: 234,
    bio: "With over 8 years of experience in clinical psychology, I specialize in cognitive behavioral therapy and mindfulness-based approaches. I believe in creating a safe, non-judgmental space for my clients.",
    education: "PhD Clinical Psychology, Tribhuvan University",
    experience: 8,
  },
  {
    id: "2",
    name: "Dr. Ramesh Thapa",
    title: "Psychiatrist",
    specialties: ["Depression", "Anxiety", "OCD"],
    languages: ["Nepali", "English"],
    pricePerSession: 2000,
    verified: true,
    rating: 4.9,
    totalSessions: 456,
    bio: "Board-certified psychiatrist with expertise in treating mood disorders and anxiety. I combine medication management with therapeutic interventions for holistic care.",
    education: "MD Psychiatry, BPKIHS",
    experience: 12,
  },
  {
    id: "3",
    name: "Sita Gurung",
    title: "Licensed Therapist",
    specialties: ["Relationship Issues", "Family Counseling", "Stress Management"],
    languages: ["Nepali", "English"],
    pricePerSession: 1200,
    verified: true,
    rating: 4.7,
    totalSessions: 189,
    bio: "I focus on relationship dynamics and family systems. My approach is empathetic and solution-focused, helping clients navigate life's challenges together.",
    education: "MA Counseling Psychology, KU",
    experience: 6,
  },
  {
    id: "4",
    name: "Dr. Prakash Rai",
    title: "Clinical Psychologist",
    specialties: ["Trauma & PTSD", "Grief & Loss", "Depression"],
    languages: ["Nepali", "English", "Maithili"],
    pricePerSession: 1800,
    verified: true,
    rating: 4.9,
    totalSessions: 312,
    bio: "Specialized in trauma-informed care and EMDR therapy. I work with individuals who have experienced significant loss or traumatic events.",
    education: "PhD Clinical Psychology, Purbanchal University",
    experience: 10,
  },
  {
    id: "5",
    name: "Maya Tamang",
    title: "Counseling Psychologist",
    specialties: ["Anxiety", "Stress Management", "Eating Disorders"],
    languages: ["Nepali", "English"],
    pricePerSession: 1000,
    verified: true,
    rating: 4.6,
    totalSessions: 145,
    bio: "I believe in a holistic approach to mental health, integrating mindfulness and body-positive practices into therapy sessions.",
    education: "MA Psychology, TU",
    experience: 5,
  },
  {
    id: "6",
    name: "Dr. Bijay Shrestha",
    title: "Psychiatrist",
    specialties: ["OCD", "Anxiety", "Depression"],
    languages: ["Nepali", "English", "Newari"],
    pricePerSession: 2200,
    verified: true,
    rating: 4.8,
    totalSessions: 389,
    bio: "Expert in treating obsessive-compulsive disorders and anxiety spectrum conditions. I utilize evidence-based approaches including CBT and ERP.",
    education: "MD Psychiatry, IOM",
    experience: 15,
  },
  {
    id: "7",
    name: "Sunita Adhikari",
    title: "Licensed Therapist",
    specialties: ["Relationship Issues", "Grief & Loss", "Stress Management"],
    languages: ["Nepali", "English", "Bhojpuri"],
    pricePerSession: 1100,
    verified: false,
    rating: 4.5,
    totalSessions: 78,
    bio: "Compassionate therapist focusing on helping individuals navigate life transitions and relationship challenges with resilience.",
    education: "MA Counseling, PU",
    experience: 4,
  },
  {
    id: "8",
    name: "Dr. Kiran Pandey",
    title: "Clinical Psychologist",
    specialties: ["Trauma & PTSD", "Depression", "Family Counseling"],
    languages: ["Nepali", "English", "Maithili"],
    pricePerSession: 1600,
    verified: true,
    rating: 4.7,
    totalSessions: 267,
    bio: "Trauma specialist with a focus on helping families heal together. I create individualized treatment plans for each client's unique needs.",
    education: "PhD Psychology, TU",
    experience: 9,
  },
];
