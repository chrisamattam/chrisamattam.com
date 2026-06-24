export type Milestone = {
  period: string;        // "2020", "Jun – Jul 2022", etc.
  title: string;         // role / what happened
  org: string;           // organisation
  description: string;   // one line
  linkedin?: string;     // organisation LinkedIn page
  website?: string;      // organisation website
  logo?: string;         // local logo path; falls back to a monogram tile
  monogram?: string;     // 1–3 chars used when no logo file
};

// Reverse chronological — most recent first
export const journey: Milestone[] = [
  {
    period: "Jul 2025 – May 2026",
    title: "Associate Product Manager",
    org: "Butter Money",
    description:
      "Built a business-rules engine (+47% conversion), launched the ButterAccess B2B portal (60% partner scale-up), and shipped a 0→1 LOS MVP that cut onboarding from 3 hours to 20 minutes.",
    linkedin: "https://www.linkedin.com/company/buttermoneyapp/",
    website: "https://butter.money/",
    logo: "/images/orgs/butter-money.png",
  },
  {
    period: "Aug – Dec 2024",
    title: "R&D Intern — L-CVD Reactor Design & CFD Simulation",
    org: "Hind High Vacuum (HHV)",
    description: "Ran computational fluid-dynamics simulations for advanced vacuum systems.",
    linkedin: "https://www.linkedin.com/company/hhv-ltd/",
    website: "https://hhvadvancedtech.com/",
    logo: "/images/orgs/hhv.png",
  },
  {
    period: "2024",
    title: "Graduated — B.E. Mechanical Engineering",
    org: "BITS Pilani",
    description: "Completed the degree.",
    linkedin: "https://www.linkedin.com/school/birla-institute-of-technology-and-science-pilani/",
    website: "https://www.bits-pilani.ac.in/",
    logo: "/images/college-logo.png",
  },
  {
    period: "2023 – 2024",
    title: "Team ThriveForce",
    org: "BITS Pilani",
    description: "Raised ₹30 lakhs in sponsorships; placed 2nd internationally at IIT Bombay Tech Fest 2024.",
    linkedin: "https://www.linkedin.com/company/team-thriveforce/",
    logo: "/images/orgs/thriveforce.png",
  },
  {
    period: "Jul 2023 – Jan 2024",
    title: "Technical Product Management Intern",
    org: "Schneider Electric",
    description: "User & market research for a €200M/yr vertical; BOM optimisation drove a 4% profit lift.",
    linkedin: "https://www.linkedin.com/company/schneider-electric/",
    website: "https://www.se.com/",
    logo: "/images/orgs/schneider.png",
  },
  {
    period: "2022 – 2024",
    title: "Member",
    org: "Corroboration & Review Committee, BITS Pilani",
    description: "Selected from 1,000+ students to audit the Student Union's finances.",
    linkedin: "https://www.linkedin.com/company/corroboration-and-review-committee-bits-pilani",
    logo: "/images/orgs/crc.png",
  },
  {
    period: "Jun – Jul 2022",
    title: "Business Analyst Intern",
    org: "Sriram Automall (SAMIL)",
    description: "Business analysis for India's largest used-vehicle auction marketplace.",
    linkedin: "https://www.linkedin.com/company/shriramautomall/",
    website: "https://www.samil.in/",
    logo: "/images/orgs/samil.png",
  },
  {
    period: "2020",
    title: "Started B.E. Mechanical Engineering",
    org: "BITS Pilani",
    description: "Began undergrad at one of India's top engineering institutes.",
    linkedin: "https://www.linkedin.com/school/birla-institute-of-technology-and-science-pilani/",
    website: "https://www.bits-pilani.ac.in/",
    logo: "/images/college-logo.png",
  },
];
