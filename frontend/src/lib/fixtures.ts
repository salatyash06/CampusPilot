import type { Announcement, ChatResponse, Faq, Resource } from "./types";

/**
 * Demo fixtures. Every entry here is sample content for demonstration only —
 * it is never presented as official university information.
 */

export const topics = [
  {
    id: "admissions",
    title: "Admissions",
    blurb: "Applications, documents and enrolment steps.",
    question: "What documents do I need for enrolment?",
  },
  {
    id: "fees",
    title: "Fees",
    blurb: "Payment windows, instalments and receipts.",
    question: "How do I pay my semester fees in instalments?",
  },
  {
    id: "courses",
    title: "Courses",
    blurb: "Registration, credits and electives.",
    question: "How many credits do I need each semester?",
  },
  {
    id: "exams",
    title: "Exams",
    blurb: "Eligibility, re-evaluation and results.",
    question: "What is the attendance requirement to sit an exam?",
  },
  {
    id: "timetable",
    title: "Timetable",
    blurb: "Class schedules and room changes.",
    question: "Where can I find my class timetable?",
  },
  {
    id: "facilities",
    title: "Facilities",
    blurb: "Library, labs, hostel and transport.",
    question: "What are the library opening hours?",
  },
] as const;

export const suggestedQuestions = [
  "How do I apply for a hostel room?",
  "What is the fee refund policy?",
  "How do I request a bonafide certificate?",
  "When does course registration close?",
];

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: "Course registration window opens",
    body: "Sample notice: elective registration is open for two weeks from the start of term.",
    date: "Sample date",
  },
  {
    id: "a2",
    title: "Library extended hours during exams",
    body: "Sample notice: the central library stays open later through the exam period.",
    date: "Sample date",
  },
  {
    id: "a3",
    title: "Campus shuttle route update",
    body: "Sample notice: an additional evening shuttle serves the north residences.",
    date: "Sample date",
  },
];

export const resources: Resource[] = [
  {
    id: "r1",
    title: "Academic calendar",
    description: "Sample overview of term dates, holidays and exam weeks.",
    group: "Academic",
    category: "Calendar",
    location: "Registrar's office",
  },
  {
    id: "r2",
    title: "Course catalogue",
    description: "Sample listing of core subjects, electives and credit weights.",
    group: "Academic",
    category: "Courses",
    location: "Department office",
  },
  {
    id: "r3",
    title: "Exam regulations",
    description: "Sample summary of eligibility, conduct and re-evaluation rules.",
    group: "Academic",
    category: "Exams",
    location: "Examination cell",
  },
  {
    id: "r4",
    title: "Scholarship guidance",
    description: "Sample outline of merit and need-based support and how to apply.",
    group: "Academic",
    category: "Funding",
    location: "Student finance desk",
  },
  {
    id: "r5",
    title: "Library services",
    description: "Sample details on borrowing limits, study rooms and digital access.",
    group: "Campus",
    category: "Library",
    location: "Central library",
  },
  {
    id: "r6",
    title: "Hostel handbook",
    description: "Sample room allocation, visitor and mess information.",
    group: "Campus",
    category: "Housing",
    location: "Hostel administration",
  },
  {
    id: "r7",
    title: "Student wellbeing",
    description: "Sample counselling, health centre and peer support information.",
    group: "Campus",
    category: "Wellbeing",
    location: "Student services",
  },
  {
    id: "r8",
    title: "Campus transport",
    description: "Sample shuttle routes, passes and parking guidance.",
    group: "Campus",
    category: "Transport",
    location: "Facilities office",
  },
];

export const faqs: Faq[] = [
  {
    id: "f1",
    category: "Admissions",
    question: "What documents are usually required at enrolment?",
    answer:
      "Sample answer: most institutions ask for identity proof, previous transcripts, a transfer certificate and passport photographs. Confirm the exact list with the admissions office.",
  },
  {
    id: "f2",
    category: "Admissions",
    question: "Can I defer my admission to the next intake?",
    answer:
      "Sample answer: deferral is often possible with a written request before the term starts, and may depend on programme capacity.",
  },
  {
    id: "f3",
    category: "Fees",
    question: "Are instalment plans available?",
    answer:
      "Sample answer: many programmes allow two or three instalments per term, usually with a request submitted before the first due date.",
  },
  {
    id: "f4",
    category: "Fees",
    question: "How do I get a payment receipt?",
    answer:
      "Sample answer: receipts are typically issued through the student portal shortly after payment is processed.",
  },
  {
    id: "f5",
    category: "Exams",
    question: "What happens if I miss an exam?",
    answer:
      "Sample answer: a documented reason such as illness usually allows a supplementary attempt, subject to approval.",
  },
  {
    id: "f6",
    category: "Courses",
    question: "Can I change an elective after registration?",
    answer:
      "Sample answer: elective changes are commonly allowed during an add/drop window at the start of term.",
  },
  {
    id: "f7",
    category: "Facilities",
    question: "How do I book a study room?",
    answer:
      "Sample answer: study rooms are usually booked at the library desk or through the library system, in fixed time slots.",
  },
  {
    id: "f8",
    category: "Timetable",
    question: "Where are room changes announced?",
    answer:
      "Sample answer: changes are normally posted on the department noticeboard and the student portal.",
  },
];

const demoAnswers: {
  match: RegExp;
  answer: string;
  sources: ChatResponse["sources"];
}[] = [
  {
    match: /fee|payment|instal|refund/i,
    answer:
      "**Fees — demo answer.**\n\nTypical fee handling at a university looks like this:\n\n- Fees are due before the term begins, with a short grace period.\n- Instalment plans are requested in writing before the first due date.\n- Receipts appear in the student portal after processing.\n\nThis is sample guidance, not an official policy. Confirm amounts and dates with the student finance desk.",
    sources: [
      {
        id: 1,
        title: "Fees overview (sample)",
        excerpt: "Sample text describing due dates, instalment requests and receipt issuing.",
      },
      {
        id: 2,
        title: "Refund guidance (sample)",
        excerpt: "Sample text describing how withdrawal timing affects refunds.",
      },
    ],
  },
  {
    match: /exam|result|re-?eval|attendance/i,
    answer:
      "**Exams — demo answer.**\n\nCommon exam rules include:\n\n1. A minimum attendance threshold to be eligible.\n2. Identity documents required at the hall.\n3. A re-evaluation request window after results.\n\nThis is sample guidance only; the examination cell holds the authoritative rules.",
    sources: [
      {
        id: 1,
        title: "Exam regulations (sample)",
        excerpt: "Sample text on eligibility, conduct and re-evaluation requests.",
      },
    ],
  },
  {
    match: /course|credit|elective|register/i,
    answer:
      "**Courses — demo answer.**\n\nRegistration usually works like this:\n\n- Core subjects are assigned automatically.\n- Electives are chosen during the registration window.\n- An add/drop period follows the start of term.\n\nSample content — check the course catalogue for your programme.",
    sources: [
      {
        id: 1,
        title: "Course catalogue (sample)",
        excerpt: "Sample listing of core subjects, electives and credit weights.",
      },
    ],
  },
  {
    match: /library|hostel|transport|facility|facilities|room|shuttle/i,
    answer:
      "**Facilities — demo answer.**\n\nCampus services commonly include a central library with study rooms, hostel accommodation with an allocation process, and shuttle transport between campuses.\n\nSample content — timings and availability vary by campus.",
    sources: [
      {
        id: 1,
        title: "Library services (sample)",
        excerpt: "Sample text on borrowing limits, study rooms and digital access.",
      },
      {
        id: 2,
        title: "Campus transport (sample)",
        excerpt: "Sample text on shuttle routes, passes and parking.",
      },
    ],
  },
  {
    match: /admission|enrol|document|apply|certificate/i,
    answer:
      "**Admissions — demo answer.**\n\nEnrolment typically requires identity proof, previous transcripts and photographs. Certificate requests such as a bonafide letter are usually raised with the registrar and take a few working days.\n\nSample content only.",
    sources: [
      {
        id: 1,
        title: "Enrolment checklist (sample)",
        excerpt: "Sample list of documents collected at enrolment.",
      },
    ],
  },
  {
    match: /timetable|schedule|class/i,
    answer:
      "**Timetable — demo answer.**\n\nClass schedules are normally published before the term starts and updated on the student portal when rooms change.\n\nSample content only.",
    sources: [
      {
        id: 1,
        title: "Timetable notes (sample)",
        excerpt: "Sample text on publication and room-change announcements.",
      },
    ],
  },
];

export function demoChatResponse(message: string): ChatResponse {
  const hit = demoAnswers.find((entry) => entry.match.test(message));
  if (!hit) {
    return {
      answer:
        "I don't have a demo document covering that question.\n\nIn demo mode CampusPilot only answers from a small set of sample topics: admissions, fees, courses, exams, timetable and facilities. Connect a backend to answer from real content.",
      sources: [],
      mode: "no-match",
    };
  }
  return { answer: hit.answer, sources: hit.sources, mode: "local-ai" };
}
