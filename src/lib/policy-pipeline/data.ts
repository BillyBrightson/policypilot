export interface SourceControl {
  id: string;
  title: string;
  text: string;
  tags: string[];
}

export interface PolicySourceDocument {
  id: string;
  name: string;
  jurisdiction: string;
  industries: string[];
  policyTypes: string[];
  excerpt: string;
  controls: SourceControl[];
}

export const PUBLIC_SOURCE_LIBRARY: PolicySourceDocument[] = [
  {
    id: "nist-csf",
    name: "NIST Cybersecurity Framework 2.0",
    jurisdiction: "United States",
    industries: ["technology", "finance", "healthcare", "manufacturing"],
    policyTypes: [
      "Information Security Policy",
      "Incident Response Policy",
      "Acceptable Use Policy",
      "Data Protection Policy",
    ],
    excerpt:
      "NIST CSF 2.0 describes governance, identification, protection, detection, response, and recovery outcomes required for resilient cybersecurity programs.",
    controls: [
      {
        id: "NIST-ID.GV-03",
        title: "Documented security governance",
        text: "Organizations maintain a security governance program that defines policy ownership, review cadences, and accountability at the executive level.",
        tags: ["governance", "policy-management"],
      },
      {
        id: "NIST-PR.AC-01",
        title: "Access control rules",
        text: "Role-based and least-privilege access control rules must be documented, reviewed quarterly, and enforced through technical safeguards.",
        tags: ["access-control", "least-privilege"],
      },
      {
        id: "NIST-RS.MI-01",
        title: "Incident response improvements",
        text: "Incident response plans incorporate lessons learned, scenario testing, and communication requirements for regulators and affected parties.",
        tags: ["incident-response", "testing"],
      },
    ],
  },
  {
    id: "cis-controls-v8",
    name: "CIS Critical Security Controls v8",
    jurisdiction: "Global",
    industries: ["technology", "finance", "retail", "public-sector"],
    policyTypes: [
      "Information Security Policy",
      "Acceptable Use Policy",
      "Incident Response Policy",
    ],
    excerpt:
      "CIS Controls provide prescriptive safeguards for asset inventory, secure configuration, vulnerability management, and awareness education.",
    controls: [
      {
        id: "CIS-04",
        title: "Secure configuration management",
        text: "Policies must define baseline configurations for servers, workstations, and cloud workloads, including hardening and change control expectations.",
        tags: ["configuration", "change-management"],
      },
      {
        id: "CIS-14",
        title: "Security awareness and skills",
        text: "Organizations implement continuous security awareness training that aligns to policy statements about acceptable behavior and reporting duties.",
        tags: ["training", "awareness"],
      },
    ],
  },
  {
    id: "osha-1910",
    name: "OSHA 29 CFR 1910",
    jurisdiction: "United States",
    industries: ["manufacturing", "energy", "construction", "healthcare"],
    policyTypes: ["Health and Safety Policy", "Employee Handbook"],
    excerpt:
      "OSHA regulations outline employer obligations for hazard communication, worker training, incident logging, and workplace inspections.",
    controls: [
      {
        id: "OSHA-1910.1200",
        title: "Hazard communication",
        text: "Employers must maintain written programs describing how hazardous chemicals are labeled, documented, and communicated to employees.",
        tags: ["hazard", "communication"],
      },
      {
        id: "OSHA-1910.38",
        title: "Emergency action planning",
        text: "Policies define evacuation routes, alarm systems, accountability procedures, and responsibilities for medical assistance.",
        tags: ["emergency-response", "safety"],
      },
    ],
  },
  {
    id: "ghana-dpc",
    name: "Ghana Data Protection Commission Guidelines",
    jurisdiction: "Ghana",
    industries: ["finance", "telecom", "public-sector"],
    policyTypes: ["Privacy Policy", "Data Protection Policy"],
    excerpt:
      "The DPC guidance clarifies consent, cross-border transfers, breach notification, and appointment of data protection officers for high-risk processing.",
    controls: [
      {
        id: "GH-DPC-05",
        title: "Data subject rights workflow",
        text: "Controllers document workflows for acknowledging, validating, and fulfilling access, rectification, and objection requests within statutory timelines.",
        tags: ["data-rights", "workflow"],
      },
      {
        id: "GH-DPC-11",
        title: "Cross-border transfer assessment",
        text: "Policies require adequacy assessments, contractual safeguards, and board approval before exporting personal data outside Ghana.",
        tags: ["cross-border", "governance"],
      },
    ],
  },
  {
    id: "ico-guidance",
    name: "UK ICO Accountability Framework",
    jurisdiction: "United Kingdom",
    industries: ["technology", "healthcare", "public-sector"],
    policyTypes: ["Privacy Policy", "Data Protection Policy", "Employee Handbook"],
    excerpt:
      "The ICO accountability framework emphasizes governance reporting, DPIAs, lawful basis documentation, and staff awareness.",
    controls: [
      {
        id: "ICO-A1",
        title: "Leadership accountability",
        text: "Senior leadership must approve privacy policies, receive quarterly compliance reporting, and evidence resource allocation for data protection.",
        tags: ["leadership", "governance"],
      },
      {
        id: "ICO-T3",
        title: "Training and awareness",
        text: "Policies specify onboarding and annual refresher training covering data protection principles, rights, and incident escalation.",
        tags: ["training", "privacy"],
      },
    ],
  },
];

export interface ControlTemplate {
  id: string;
  title: string;
  description: string;
  framework: string;
  policyTypes: string[];
  tags: string[];
}

export const POLICY_CONTROL_TEMPLATES: ControlTemplate[] = [
  {
    id: "CTRL-ACCESS-01",
    title: "Role-based access enforcement",
    description: "Define how identities are provisioned, reviewed quarterly, and revoked when staff separate.",
    framework: "NIST-CSF PR.AC / CIS 5",
    policyTypes: ["Information Security Policy", "Acceptable Use Policy", "Employee Handbook"],
    tags: ["access-control", "identity"],
  },
  {
    id: "CTRL-INCIDENT-02",
    title: "Incident escalation and communication",
    description: "Outline thresholds for incident declaration, responder roles, regulator notifications, and post-incident reporting.",
    framework: "NIST-RS.MI / CIS 17",
    policyTypes: ["Incident Response Policy", "Information Security Policy"],
    tags: ["incident-response"],
  },
  {
    id: "CTRL-PRIVACY-03",
    title: "Data subject rights fulfillment",
    description: "Describe intake channels, validation steps, and service-level targets for privacy rights requests.",
    framework: "Ghana DPC / UK ICO",
    policyTypes: ["Privacy Policy", "Data Protection Policy"],
    tags: ["privacy", "data-rights"],
  },
  {
    id: "CTRL-SAFETY-04",
    title: "Hazard communication",
    description: "Document how employees receive safety data sheets, labeling standards, and training frequency.",
    framework: "OSHA 1910.1200",
    policyTypes: ["Health and Safety Policy", "Employee Handbook"],
    tags: ["safety"],
  },
  {
    id: "CTRL-TRAINING-05",
    title: "Mandatory compliance training",
    description: "Clarify required courses, cadence, tracking responsibilities, and consequences for overdue training.",
    framework: "CIS 14 / ICO-T3",
    policyTypes: ["Employee Handbook", "Information Security Policy", "Data Protection Policy"],
    tags: ["training"],
  },
];

export const POLICY_OUTLINES: Record<string, string[]> = {
  "Privacy Policy": [
    "Purpose & Scope",
    "Lawful Basis and Collection",
    "Use and Sharing",
    "Data Subject Rights",
    "Security & Retention",
    "Governance & Contact",
  ],
  "Data Protection Policy": [
    "Governance",
    "Data Inventory",
    "Processing Principles",
    "Third-Party Management",
    "Incident Management",
    "Continuous Improvement",
  ],
  "Information Security Policy": [
    "Program Overview",
    "Access Control",
    "Asset & Configuration Management",
    "Monitoring & Detection",
    "Incident Response",
    "Awareness & Measurement",
  ],
  "Incident Response Policy": [
    "Objectives",
    "Roles & Responsibilities",
    "Detection & Triage",
    "Containment & Eradication",
    "Communication & Reporting",
    "Lessons Learned",
  ],
  "Acceptable Use Policy": [
    "Scope",
    "Acceptable Behavior",
    "Prohibited Activities",
    "Monitoring & Privacy",
    "Enforcement",
  ],
  "Employee Handbook": [
    "Welcome & Values",
    "Employment Basics",
    "Workplace Conduct",
    "Health, Safety & Wellbeing",
    "Training & Development",
    "Reporting & Discipline",
  ],
  "Health and Safety Policy": [
    "Policy Statement",
    "Roles & Responsibilities",
    "Risk Assessment",
    "Training & Competency",
    "Emergency Response",
    "Auditing & Review",
  ],
};

