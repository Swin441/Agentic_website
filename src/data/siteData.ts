import type {AppRoute} from '../router/RouterContext';

export interface ServiceItem {
  number: string;
  id: string;
  title: string;
  summary: string;
  outcome: string;
  route: AppRoute;
  deliverables: string[];
}

export interface BusinessProblem {
  number: string;
  title: string;
  description: string;
  upgrade: string;
}

export interface AgentCapability {
  number: string;
  role: string;
  title: string;
  description: string;
  channels: string;
  tasks: string[];
}

export interface AutomationCategory {
  number: string;
  title: string;
  trigger: string;
  actions: string[];
  benefit: string;
}

export interface SoftwareCapability {
  number: string;
  title: string;
  description: string;
  examples: string[];
}

export interface IndustryItem {
  id: string;
  number: string;
  name: string;
  audience: string;
  bottleneck: string;
  solution: string;
  workflows: string[];
}

export interface DemoItem {
  id: string;
  kind: 'Concept Demo' | 'Product Prototype';
  sector: string;
  title: string;
  summary: string;
  highlights: string[];
  imageUrl?: string;
  relatedServiceRoute: AppRoute;
  interactiveScenarioKey: 'coaching' | 'clinic' | 'distribution' | 'realestate';
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  deliverable: string;
}

export const CORE_SERVICES: ServiceItem[] = [
  {
    number: '01',
    id: 'ai-agents',
    title: 'AI Agents',
    summary:
      'Trained digital assistants that reply to customer enquiries on WhatsApp and your website, qualify leads, and book appointments around the clock.',
    outcome: 'No enquiry waits overnight or gets lost during busy desk hours.',
    route: '/services/ai-agents',
    deliverables: [
      'WhatsApp & website enquiry handling',
      'Lead qualification & structured intake',
      'Appointment & demo slot scheduling',
      'Clean handoff to your team when needed',
    ],
  },
  {
    number: '02',
    id: 'automation',
    title: 'Business Automation',
    summary:
      'Connect your enquiry forms, WhatsApp messages, Google Sheets, billing tools, and team reminders so repetitive updates happen automatically.',
    outcome: 'Your staff spends time serving customers instead of copying data between tabs.',
    route: '/services/automation',
    deliverables: [
      'Instant lead routing to sales or front desk',
      'Automated follow-up & payment reminders',
      'Sheet, CRM, and invoice synchronization',
      'Daily owner summary digests',
    ],
  },
  {
    number: '03',
    id: 'custom-software',
    title: 'Custom Software',
    summary:
      'Focused internal portals, operations dashboards, and management systems built around the exact rules of your business.',
    outcome: 'Replace scattered spreadsheets and manual registers with one reliable workspace.',
    route: '/services/software',
    deliverables: [
      'Operations & staff management portals',
      'Batch, inventory, or booking ledgers',
      'Role-based access for owners & teams',
      'Custom reporting exports',
    ],
  },
  {
    number: '04',
    id: 'web-apps',
    title: 'Websites & Applications',
    summary:
      'Fast, mobile-ready business websites, customer booking portals, and lightweight web or mobile applications built to convert local traffic.',
    outcome: 'Give customers a clear, credible place to understand your offer and book directly.',
    route: '/services/software',
    deliverables: [
      'Conversion-focused business websites',
      'Customer & student self-service portals',
      'Mobile-friendly booking & catalog flows',
      'Integrated lead capture & tracking',
    ],
  },
];

export const BUSINESS_PROBLEMS: BusinessProblem[] = [
  {
    number: '01',
    title: 'Missed enquiries after hours',
    description:
      'Parents, patients, and buyers message on WhatsApp late in the evening or during peak rush—and move on to another business if nobody replies.',
    upgrade: 'AI enquiry agents answer basic questions immediately and book next-day callbacks.',
  },
  {
    number: '02',
    title: 'Manual copy-paste across spreadsheets',
    description:
      'Teams re-type website leads, call notes, fee statuses, and order updates between WhatsApp groups and Excel sheets every day.',
    upgrade: 'Connected automation logs every lead and status change into one clean sheet or portal.',
  },
  {
    number: '03',
    title: 'Inconsistent follow-ups',
    description:
      'Interested prospects ask for a fee structure or quotation once, and busy staff forget to follow up three days later.',
    upgrade: 'Scheduled follow-up workflows remind prospects politely and alert staff only when they reply.',
  },
  {
    number: '04',
    title: 'Outdated websites and clunky software',
    description:
      'Generic templates or complicated enterprise tools confuse customers and slow down everyday desk work.',
    upgrade: 'Simple, fast websites and custom tools designed around how Indian SMB teams actually work.',
  },
];

export const AI_AGENT_ROLES: AgentCapability[] = [
  {
    number: '01',
    role: 'Front-Desk Reception Agent',
    title: 'Answers common questions & books slots',
    description:
      'Handles timings, location, service list, fee overview, and slot availability on WhatsApp or web chat without keeping callers waiting.',
    channels: 'WhatsApp · Website Chat',
    tasks: [
      'Shares accurate brochures, timings, and branch directions',
      'Collects name, phone number, and requirement before booking',
      'Confirms appointment slots against your schedule',
    ],
  },
  {
    number: '02',
    role: 'Admissions & Lead Qualification Agent',
    title: 'Sorts serious enquiries before your team calls',
    description:
      'Asks 2–3 polite, practical questions—such as course interest, budget range, or preferred batch—so counsellors call prepared.',
    channels: 'WhatsApp · Web Forms · Ad Leads',
    tasks: [
      'Qualifies course, property, or service requirements',
      'Tags urgency and preferred callback window',
      'Logs structured notes straight to your staff sheet',
    ],
  },
  {
    number: '03',
    role: 'Follow-Up & Reminder Agent',
    title: 'Keeps bookings and renewals on track',
    description:
      'Sends timely appointment reminders, fee due nudges, and post-visit check-ins so fewer slots go vacant.',
    channels: 'WhatsApp · SMS · Email',
    tasks: [
      'Appointment confirmations 24 hours prior',
      'Gentle renewal or installment reminders',
      'Rescheduling support with human escalation',
    ],
  },
  {
    number: '04',
    role: 'Internal Knowledge Assistant',
    title: 'Helps staff find pricing and policies fast',
    description:
      'Lets your team query product catalogs, clinic prep instructions, or SOPs in plain language instead of digging through folders.',
    channels: 'Internal Web Portal · Team Chat',
    tasks: [
      'Instant lookup across PDFs, price lists, and SOPs',
      'Drafts clean customer replies for staff approval',
      'Consistent answers across branch offices',
    ],
  },
];

export const AUTOMATION_CATEGORIES: AutomationCategory[] = [
  {
    number: '01',
    title: 'Lead Capture to Instant Response',
    trigger: 'Website form, Facebook/Google Ad, or WhatsApp enquiry',
    actions: [
      'Sends an immediate welcome reply with relevant brochure or details',
      'Records contact info in Google Sheets or your CRM',
      'Notifies the assigned staff member with full context',
    ],
    benefit: 'Every incoming enquiry receives an organized response without manual sorting.',
  },
  {
    number: '02',
    title: 'Appointment & Demo Scheduling',
    trigger: 'Customer selects a consultation or visit slot',
    actions: [
      'Creates the calendar booking and shares confirmation details',
      'Schedules automated reminders before the visit',
      'Alerts the desk if the customer requests a reschedule',
    ],
    benefit: 'Fewer no-shows and less back-and-forth phone tag for front-desk staff.',
  },
  {
    number: '03',
    title: 'Billing, Fee & Order Notifications',
    trigger: 'Invoice generated, installment due, or order dispatched',
    actions: [
      'Sends clean payment receipt or dispatch update on WhatsApp',
      'Logs payment status against the customer record',
      'Flags overdue follow-ups for accounts review',
    ],
    benefit: 'Clearer communication with customers and fewer manual reminder calls.',
  },
  {
    number: '04',
    title: 'Owner Daily Operations Digest',
    trigger: 'End-of-day schedule (e.g., 8:00 PM IST)',
    actions: [
      'Summarizes new enquiries, confirmed bookings, and pending follow-ups',
      'Highlights open support escalations requiring owner attention',
      'Delivers one concise summary without opening five separate apps',
    ],
    benefit: 'Complete visibility across daily operations in one brief evening check.',
  },
];

export const SOFTWARE_CAPABILITIES: SoftwareCapability[] = [
  {
    number: '01',
    title: 'Business Operations Portals',
    description:
      'Replace fragile multi-tab spreadsheets with structured web portals built around your exact daily workflow.',
    examples: [
      'Coaching batch, attendance, and fee tracking portals',
      'Clinic patient queue and follow-up boards',
      'Distributor dealer order and dispatch trackers',
    ],
  },
  {
    number: '02',
    title: 'Customer-Facing Web & Mobile Apps',
    description:
      'Clean interfaces where your customers can browse offerings, book slots, view documents, or track order progress.',
    examples: [
      'Student & parent resource portals',
      'Appointment booking & digital intake web apps',
      'B2B retailer reorder portals',
    ],
  },
  {
    number: '03',
    title: 'High-Trust Business Websites',
    description:
      'Fast, structured websites designed to explain what you do clearly on mobile phones and turn visitors into qualified enquiries.',
    examples: [
      'Service business & agency flagship sites',
      'Multi-branch clinic & diagnostic websites',
      'Real estate project showcase & lead capture pages',
    ],
  },
  {
    number: '04',
    title: 'Connected Dashboards & Reporting',
    description:
      'Unified views that bring together enquiries, bookings, collections, and team workload from your existing tools.',
    examples: [
      'Branch-wise enquiry & conversion summaries',
      'Staff follow-up accountability boards',
      'Exportable GST-ready & accounting reports',
    ],
  },
];

export const INDUSTRIES: IndustryItem[] = [
  {
    id: 'coaching',
    number: '01',
    name: 'Coaching & Education',
    audience: 'Test-prep institutes, skill academies, tuition centres, and training providers',
    bottleneck:
      'Counsellors spend hours answering repeated fee/batch questions while parent follow-ups slip during admission seasons.',
    solution:
      'Admissions AI agent on WhatsApp & web, automated demo-class scheduling, and a simple batch & fee portal.',
    workflows: [
      '24/7 course & batch detail responses',
      'Automated demo-class slot booking & reminders',
      'Parent fee reminder & attendance updates',
    ],
  },
  {
    id: 'clinics',
    number: '02',
    name: 'Clinics & Healthcare Services',
    audience: 'Dental clinics, diagnostic centres, specialty practices, and polyclinics',
    bottleneck:
      'Front desks juggle ringing phones, walk-in patients, report enquiries, and missed follow-up appointments.',
    solution:
      'WhatsApp appointment assistant, automated visit reminders, report-ready notifications, and clean reception queue software.',
    workflows: [
      'Doctor availability & slot booking via chat',
      'Pre-visit instructions & reminder messages',
      'Diagnostic report ready alerts & post-visit check-ins',
    ],
  },
  {
    id: 'retail',
    number: '03',
    name: 'Retail & Distribution',
    audience: 'Wholesale distributors, regional stockists, multi-outlet retail stores, and D2C brands',
    bottleneck:
      'Orders arrive over unstructured WhatsApp voice/text messages, leading to manual entry errors and delayed dispatch updates.',
    solution:
      'Structured B2B order intake portal, automated stock & dispatch notifications, and payment follow-up workflows.',
    workflows: [
      'Catalog lookup & structured retailer reorder flow',
      'Automated invoice & LR/dispatch status updates',
      'Credit & payment due date reminders',
    ],
  },
  {
    id: 'realestate',
    number: '04',
    name: 'Real Estate Businesses',
    audience: 'Builders, property consultants, commercial leasing teams, and housing projects',
    bottleneck:
      'Property portal leads go cold when site-visit coordination and brochure sharing depend on manual callbacks.',
    solution:
      'Instant brochure & floor-plan assistant, budget/location qualification, and automated site-visit reminders.',
    workflows: [
      'Instant project brochure & location pin delivery',
      'Requirement capture (BHK, budget, timeline)',
      'Site-visit booking & sales advisor handoff',
    ],
  },
  {
    id: 'services',
    number: '05',
    name: 'Professional & Local Services',
    audience: 'CA/legal firms, architectural studios, salons, gyms, repair networks, and B2B agencies',
    bottleneck:
      'Owners handle client onboarding, document collection, and scheduling manually across calls and chats.',
    solution:
      'Professional booking website, document checklist automation, and client status portals.',
    workflows: [
      'Consultation intake & document checklist reminders',
      'Service renewal & annual maintenance alerts',
      'Clean client request & status portal',
    ],
  },
];

export const CONCEPT_DEMOS: DemoItem[] = [
  {
    id: 'coaching-admission-desk',
    kind: 'Concept Demo',
    sector: 'Coaching & Education',
    title: 'Admissions Enquiry & Demo Class Desk',
    summary:
      'An interactive concept showing how a coaching institute handles late-evening WhatsApp enquiries, captures student stream preferences, and books a counselling or demo class automatically.',
    highlights: [
      'Handles Hindi/English student & parent queries cleanly',
      'Logs lead details directly into an admissions tracker',
      'Sends automated demo-class reminders prior to session',
    ],
    imageUrl: '/src/assets/images/demo_coaching_portal_1795632511868.jpg',
    relatedServiceRoute: '/services/ai-agents',
    interactiveScenarioKey: 'coaching',
  },
  {
    id: 'clinic-appointment-flow',
    kind: 'Concept Demo',
    sector: 'Clinics & Healthcare',
    title: 'Multi-Doctor Appointment & Reminder Flow',
    summary:
      'A prototype workflow demonstrating how clinics reduce reception phone congestion by letting patients check doctor timings, reserve slots, and receive automated visit reminders.',
    highlights: [
      'Doctor-wise slot selection without long call holds',
      'Automated 24-hour and morning-of visit reminders',
      'Clear front-desk handoff for emergency queries',
    ],
    relatedServiceRoute: '/services/automation',
    interactiveScenarioKey: 'clinic',
  },
  {
    id: 'distributor-order-portal',
    kind: 'Product Prototype',
    sector: 'Retail & Distribution',
    title: 'Dealer Reorder & Dispatch Status Portal',
    summary:
      'A custom web portal prototype built for regional distributors to replace scattered chat orders with a clean SKU reorder sheet and automated WhatsApp dispatch notifications.',
    highlights: [
      'Mobile-friendly SKU selection for retail partners',
      'Automatic order confirmation & ledger sync',
      'Scheduled payment & dispatch status updates',
    ],
    relatedServiceRoute: '/services/software',
    interactiveScenarioKey: 'distribution',
  },
  {
    id: 'realestate-site-visit',
    kind: 'Concept Demo',
    sector: 'Real Estate',
    title: 'Project Qualification & Site-Visit Coordinator',
    summary:
      'A concept demonstration of instant lead qualification for residential projects—sharing floor plans, capturing budget preferences, and scheduling weekend site visits.',
    highlights: [
      'Instant brochure & map pin delivery on enquiry',
      'Structured buyer qualification before advisor callback',
      'Calendar sync for weekend site-visit coordination',
    ],
    relatedServiceRoute: '/services/ai-agents',
    interactiveScenarioKey: 'realestate',
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Workflow Audit',
    description:
      'We start with a 30-minute conversation to understand how enquiries, bookings, billing, and follow-ups currently run in your business.',
    deliverable: 'Clear map of bottlenecks worth automating first',
  },
  {
    number: '02',
    title: 'Focused Prototype',
    description:
      'Instead of months of abstract planning, we configure a working prototype around your real business scenarios so your team can test it early.',
    deliverable: 'Interactive demo with your real services & rules',
  },
  {
    number: '03',
    title: 'Build & Connect',
    description:
      'We build the AI agent, automation workflow, or custom software and connect it cleanly to your WhatsApp, website, sheets, or existing tools.',
    deliverable: 'Tested production system ready for daily use',
  },
  {
    number: '04',
    title: 'Team Handover & Support',
    description:
      'We train your front-desk and operations staff in plain language and stay available to refine responses and workflows as your business grows.',
    deliverable: 'Staff walkthrough & ongoing practical support',
  },
];
