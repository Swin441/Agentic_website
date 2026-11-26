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

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PricingScopeItem {
  number: string;
  title: string;
  bestFor: string;
  quotationBasis: string;
  scopeFactors: string[];
  route: AppRoute;
}

export const CORE_SERVICES: ServiceItem[] = [
  {
    number: '01',
    id: 'ai-agents',
    title: 'AI Agents',
    summary:
      'Trained digital assistants that reply to customer enquiries on your website and WhatsApp, qualify leads, and book appointments around the clock.',
    outcome: 'No enquiry waits overnight or gets lost during busy desk hours.',
    route: '/services/ai-agents',
    deliverables: [
      'Website & WhatsApp enquiry handling',
      'Lead qualification & structured intake',
      'Appointment & demo slot scheduling',
      'Clean handoff to your team when needed',
    ],
  },
  {
    number: '02',
    id: 'whatsapp-automation',
    title: 'WhatsApp Automation',
    summary:
      'Structured WhatsApp Business workflows for instant brochure sharing, admission or showroom follow-ups, booking confirmations, and fee or dispatch reminders.',
    outcome: 'Consistent WhatsApp replies and reminders without manual chat chasing.',
    route: '/services/automation',
    deliverables: [
      'Official WhatsApp Business API workflow setup',
      'Automated brochure, location & FAQ replies',
      'Scheduled visit, fee & renewal reminders',
      'Staff escalation for custom enquiries',
    ],
  },
  {
    number: '03',
    id: 'business-automation',
    title: 'Business Automation',
    summary:
      'Connect your enquiry forms, Google Sheets, calendars, billing tools, and internal team alerts so routine updates happen automatically.',
    outcome: 'Your staff spends time serving customers instead of copying data between tabs.',
    route: '/services/automation',
    deliverables: [
      'Instant lead routing to sales or front desk',
      'Sheet, CRM & invoice synchronization',
      'Follow-up task & callback triggers',
      'Daily owner summary digests',
    ],
  },
  {
    number: '04',
    id: 'custom-software',
    title: 'Custom Software',
    summary:
      'Focused internal portals, operations dashboards, and management systems built around the exact rules of your coaching centre, clinic, showroom, or distribution desk.',
    outcome: 'Replace scattered spreadsheets and manual registers with one reliable workspace.',
    route: '/services/software',
    deliverables: [
      'Operations & staff management portals',
      'Batch, inventory, queue & order ledgers',
      'Role-based access for owners & teams',
      'Custom reporting & GST-ready exports',
    ],
  },
  {
    number: '05',
    id: 'websites-applications',
    title: 'Websites & Applications',
    summary:
      'Fast, mobile-ready business websites, customer booking portals, and lightweight web or mobile applications built to convert local and regional traffic.',
    outcome: 'Give customers a clear, trustworthy place to explore offerings and book directly.',
    route: '/services/software',
    deliverables: [
      'Conversion-focused business websites',
      'Customer, student & dealer portals',
      'Mobile-friendly booking & catalog flows',
      'Integrated lead capture & tracking',
    ],
  },
  {
    number: '06',
    id: 'ai-integrations',
    title: 'AI Integrations',
    summary:
      'Connect AI capabilities directly into your existing spreadsheets, websites, ERPs, billing tools, and support portals—without replacing systems that already work.',
    outcome: 'Add practical AI assistance inside the tools your team already uses every day.',
    route: '/services/software',
    deliverables: [
      'Document, catalog & SOP lookup assistants',
      'Enquiry summarization into sheets or CRMs',
      'API & webhook bridges to existing software',
      'Human-in-the-loop approval workflows',
    ],
  },
];

export const BUSINESS_PROBLEMS: BusinessProblem[] = [
  {
    number: '01',
    title: 'Missed enquiries after hours',
    description:
      'Parents, patients, showroom visitors, and buyers message on WhatsApp late in the evening or during peak rush—and move on if nobody replies.',
    upgrade: 'AI enquiry agents answer basic questions immediately and book next-day callbacks.',
  },
  {
    number: '02',
    title: 'Manual copy-paste across spreadsheets',
    description:
      'Teams re-type website leads, showroom walk-ins, call notes, fee statuses, and dispatch updates between WhatsApp groups and Excel sheets every day.',
    upgrade: 'Connected automation logs every lead and status change into one clean sheet or portal.',
  },
  {
    number: '03',
    title: 'Inconsistent follow-ups',
    description:
      'Interested prospects ask for a fee structure, quotation, or test-drive/demo slot once, and busy staff forget to follow up three days later.',
    upgrade: 'Scheduled WhatsApp follow-up workflows remind prospects politely and alert staff when they reply.',
  },
  {
    number: '04',
    title: 'Outdated websites and clunky software',
    description:
      'Generic templates or complicated enterprise tools confuse customers and slow down everyday desk work across Guwahati and regional branches.',
    upgrade: 'Simple, fast websites, AI integrations, and custom tools designed around how Indian SMB teams actually work.',
  },
];

export const AI_AGENT_ROLES: AgentCapability[] = [
  {
    number: '01',
    role: 'Front-Desk Reception Agent',
    title: 'Answers common questions & books slots',
    description:
      'Handles timings, branch locations, service lists, fee overviews, and slot availability on WhatsApp or web chat without keeping callers waiting.',
    channels: 'WhatsApp · Website Chat',
    tasks: [
      'Shares accurate brochures, timings, and branch directions',
      'Collects name, phone number, and requirement before booking',
      'Confirms appointment or demo slots against your schedule',
    ],
  },
  {
    number: '02',
    role: 'Admissions & Lead Qualification Agent',
    title: 'Sorts serious enquiries before your team calls',
    description:
      'Asks 2–3 polite, practical questions—such as course interest, product model, budget range, or preferred timing—so staff call prepared.',
    channels: 'WhatsApp · Web Forms · Ad Leads',
    tasks: [
      'Qualifies course, showroom, property, or service requirements',
      'Tags urgency and preferred callback window',
      'Logs structured notes straight to your staff sheet or CRM',
    ],
  },
  {
    number: '03',
    role: 'Follow-Up & Reminder Agent',
    title: 'Keeps bookings and renewals on track',
    description:
      'Sends timely appointment reminders, fee due nudges, and post-visit check-ins so fewer slots or quotations go cold.',
    channels: 'WhatsApp · SMS · Email',
    tasks: [
      'Appointment confirmations 24 hours prior',
      'Gentle fee, renewal, or installment reminders',
      'Rescheduling support with clean human escalation',
    ],
  },
  {
    number: '04',
    role: 'Internal Knowledge Assistant',
    title: 'Helps staff find pricing and policies fast',
    description:
      'Lets your team query product catalogs, showroom stock notes, clinic prep instructions, or SOPs in plain language instead of digging through folders.',
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
    title: 'Lead Capture to Instant WhatsApp Response',
    trigger: 'Website form, social ad lead, or incoming WhatsApp enquiry',
    actions: [
      'Sends an immediate welcome reply with relevant brochure or details',
      'Records contact info in Google Sheets or your CRM',
      'Notifies the assigned staff member with full context',
    ],
    benefit: 'Every incoming enquiry receives an organized response without manual sorting.',
  },
  {
    number: '02',
    title: 'Appointment, Demo & Visit Scheduling',
    trigger: 'Customer selects a consultation, demo class, or showroom visit slot',
    actions: [
      'Creates the calendar booking and shares confirmation details on WhatsApp',
      'Schedules automated reminders before the visit',
      'Alerts the desk if the customer requests a reschedule',
    ],
    benefit: 'Fewer no-shows and less back-and-forth phone tag for front-desk staff.',
  },
  {
    number: '03',
    title: 'Billing, Fee & Dispatch Notifications',
    trigger: 'Invoice generated, fee installment due, or order dispatched',
    actions: [
      'Sends clean payment receipt or LR/dispatch update on WhatsApp',
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
      'Highlights open escalations requiring owner attention',
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
    title: 'Customer-Facing Websites & Apps',
    description:
      'Fast websites and lightweight web or mobile applications where customers can browse offerings, book slots, or track orders cleanly on phones.',
    examples: [
      'Showroom & service flagship websites with lead capture',
      'Student, parent & patient self-service portals',
      'B2B retailer reorder and catalog apps',
    ],
  },
  {
    number: '03',
    title: 'AI Integrations for Existing Tools',
    description:
      'Connect AI summaries, smart enquiry routing, and document search directly into the spreadsheets, CRMs, or billing systems you already use.',
    examples: [
      'Automated chat-to-CRM lead summarization',
      'Catalog & SOP search inside internal team dashboards',
      'Webhook & API bridges between forms, WhatsApp, and ERPs',
    ],
  },
  {
    number: '04',
    title: 'Connected Dashboards & Reporting',
    description:
      'Unified views that bring together enquiries, bookings, collections, and team workload across single or multi-branch operations.',
    examples: [
      'Branch-wise enquiry & follow-up summaries',
      'Staff accountability & pending callback boards',
      'Exportable GST-ready & accounting reports',
    ],
  },
];

export const INDUSTRIES: IndustryItem[] = [
  {
    id: 'coaching',
    number: '01',
    name: 'Coaching Institutes',
    audience: 'Test-prep institutes, skill academies, tuition centres, and training providers',
    bottleneck:
      'Counsellors spend hours answering repeated fee and batch questions while parent follow-ups slip during peak admission seasons.',
    solution:
      'Admissions AI agent on WhatsApp & web, automated demo-class scheduling, and a clean batch & fee portal.',
    workflows: [
      '24/7 course & batch detail responses',
      'Automated demo-class slot booking & reminders',
      'Parent fee reminder & attendance updates',
    ],
  },
  {
    id: 'retailers',
    number: '02',
    name: 'Retailers & Showrooms',
    audience: 'Electronics, automobile, furniture, jewellery, and multi-brand retail showrooms',
    bottleneck:
      'Walk-in quotes, catalogue requests, and festive-season WhatsApp enquiries go cold when showroom staff are busy on the floor.',
    solution:
      'WhatsApp product & showroom assistant, automated callback routing, visit reminders, and clean lead trackers.',
    workflows: [
      'Instant catalogue, pricing-tier & branch location sharing',
      'Showroom visit & test-drive/demo slot booking',
      'Automated post-visit quotation follow-ups',
    ],
  },
  {
    id: 'clinics',
    number: '03',
    name: 'Clinics & Healthcare',
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
    id: 'distributors',
    number: '04',
    name: 'Distributors & Wholesalers',
    audience: 'Regional distributors, stockists, FMCG suppliers, and B2B trading teams',
    bottleneck:
      'Orders arrive over unstructured WhatsApp voice or text messages, causing manual entry errors and delayed dispatch updates.',
    solution:
      'Structured B2B retailer reorder portal, automated LR/dispatch notifications on WhatsApp, and payment follow-up workflows.',
    workflows: [
      'Catalog lookup & structured retailer reorder flow',
      'Automated invoice & dispatch status updates',
      'Credit & payment due date reminders',
    ],
  },
  {
    id: 'realestate',
    number: '05',
    name: 'Real Estate',
    audience: 'Builders, property consultants, commercial leasing teams, and housing projects',
    bottleneck:
      'Property portal and ad leads go cold when site-visit coordination and brochure sharing depend on manual callbacks.',
    solution:
      'Instant brochure & floor-plan assistant, budget/location qualification, and automated site-visit reminders.',
    workflows: [
      'Instant project brochure & map pin delivery',
      'Requirement capture (BHK, budget, timeline)',
      'Site-visit booking & sales advisor handoff',
    ],
  },
  {
    id: 'smbs',
    number: '06',
    name: 'Other Growing SMBs',
    audience: 'CA/legal offices, travel agencies, salons, gyms, service centres, and regional B2B teams',
    bottleneck:
      'Owners handle client onboarding, document collection, renewals, and scheduling manually across calls and chats.',
    solution:
      'High-trust business website, WhatsApp document checklist automation, AI integrations, and client status portals.',
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
    sector: 'Coaching Institutes',
    title: 'Admissions Enquiry & Demo Class Desk',
    summary:
      'An interactive concept showing how a coaching institute handles late-evening WhatsApp enquiries, captures student stream preferences, and books a counselling or demo class automatically.',
    highlights: [
      'Handles student & parent queries cleanly in plain language',
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
      'Clear front-desk handoff for urgent queries',
    ],
    relatedServiceRoute: '/services/automation',
    interactiveScenarioKey: 'clinic',
  },
  {
    id: 'distributor-order-portal',
    kind: 'Product Prototype',
    sector: 'Distributors & Wholesalers',
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
      'We start with a 30-minute conversation (in Guwahati or online) to understand how enquiries, bookings, billing, and follow-ups currently run in your business.',
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
    title: 'Build & Integrate',
    description:
      'We build the AI agent, WhatsApp automation, custom software, or AI integration and connect it cleanly to your website, sheets, or existing tools.',
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

export const BUYER_FAQS: FaqItem[] = [
  {
    question: 'How can AI agents help my business?',
    answer:
      'AI agents answer routine customer questions on your website and WhatsApp immediately, share approved brochures or fee overviews, collect enquiry details, and book appointments or callbacks—so leads do not go unanswered during busy hours or after closing time.',
  },
  {
    question: 'How does WhatsApp automation work?',
    answer:
      'WhatsApp automation connects your official WhatsApp Business workflow with your enquiry forms, calendars, and spreadsheets. When a customer messages or submits a form, the system replies with relevant details, logs their contact record, schedules reminders, and alerts your staff when a human reply is needed.',
  },
  {
    question: 'What does AI implementation cost?',
    answer:
      'Every project is quoted in INR (₹) on a custom basis after a free 30-minute workflow audit. Pricing depends on the scope you choose—such as a single AI enquiry agent, multi-step WhatsApp and sheet automation, or a custom portal—so you only pay for the features your business actually needs.',
  },
  {
    question: 'Are there monthly running charges?',
    answer:
      'Build work is scoped separately from ongoing running costs. Depending on your setup, running costs may include third-party cloud hosting, official WhatsApp Business API messaging charges, AI model API usage, and an optional support or maintenance retainer—all outlined transparently in your quotation before you start.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'Timelines depend on complexity. Focused AI agents or single-workflow WhatsApp automations are prototyped first so your team can test them early, while custom multi-role portals, websites, and deeper software integrations follow a structured milestone schedule agreed during scoping.',
  },
  {
    question: 'Can systems integrate with existing software?',
    answer:
      'Yes. We design AI integrations and automations to work alongside tools your team already uses—such as Google Sheets, Google Calendar, website forms, CRMs, or existing billing and inventory systems via APIs and webhooks—rather than forcing you to replace working software overnight.',
  },
  {
    question: 'How is customer data protected?',
    answer:
      'Private API credentials stay strictly on server-side infrastructure, never in browser code. AI agents respond only from your approved business rules and knowledge base, and enquiry records are stored inside the spreadsheets, portals, or databases designated for your business.',
  },
  {
    question: 'Can a human take over conversations?',
    answer:
      'Yes. Every AI agent and WhatsApp workflow includes clear escalation rules. Whenever a customer asks for custom pricing, medical or legal judgement, urgent support, or a direct callback, the conversation hands off cleanly to your front-desk or sales team with a structured summary.',
  },
  {
    question: 'Do I need technical staff?',
    answer:
      'No. Our systems are built for business owners, counsellors, receptionists, and operations staff. We handle configuration and integration, train your team in plain language, and provide ongoing support so you do not need an in-house IT department.',
  },
  {
    question: 'How do I start?',
    answer:
      'Book a free 30-minute demo through our Contact page. Share how your business currently handles enquiries, WhatsApp messages, and daily records, and we will walk you through a practical setup and custom INR quotation tailored to your workflow.',
  },
];

export const INR_PRICING_SCOPES: PricingScopeItem[] = [
  {
    number: '01',
    title: 'AI Agent & WhatsApp Enquiry Setup',
    bestFor: 'Coaching institutes, clinics, showrooms, and local services missing after-hours leads',
    quotationBasis: 'Custom INR (₹) Quote · Scoped after 30-minute workflow audit',
    scopeFactors: [
      'Channels connected (WhatsApp Business, website chat, or ad lead forms)',
      'Approved FAQ knowledge base & booking rules',
      'Lead logging into Google Sheets or CRM + human handoff triggers',
    ],
    route: '/services/ai-agents',
  },
  {
    number: '02',
    title: 'Business Automation & AI Integrations',
    bestFor: 'Teams spending hours copying data across WhatsApp, sheets, calendars, and billing',
    quotationBasis: 'Custom INR (₹) Quote · Scoped by workflow & integration count',
    scopeFactors: [
      'Number of connected tools, webhooks, and API integrations',
      'Automated follow-up, payment, or dispatch notification flows',
      'Daily owner summary digests & error-handling safeguards',
    ],
    route: '/services/automation',
  },
  {
    number: '03',
    title: 'Custom Software, Portals & Websites',
    bestFor: 'Distributors, multi-branch clinics, academies, and growing SMBs outgrowing spreadsheets',
    quotationBasis: 'Custom INR (₹) Quote · Scoped by user roles & modules',
    scopeFactors: [
      'Public conversion website, customer portal, or internal operations dashboard',
      'User roles, data workflows, and GST-ready reporting exports',
      'Optional ongoing maintenance & hosting plan outlined upfront',
    ],
    route: '/services/software',
  },
];
