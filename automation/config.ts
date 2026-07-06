export type BookFormat = "Kindle" | "Audible" | "Physical";

export interface PurchaseSource {
  id: string;
  label: string;
  format: BookFormat;
  gmailQuery: string;
}

export interface KeeperConfig {
  processedLabel: string;
  downtimeThresholdDays: number;
  liveLinkRetries: number;
  liveLinkTimeoutMs: number;
  coverSourcesOrder: string[];
  purchaseSources: PurchaseSource[];
  /** Compiled site-knowledge doc must stay under this (chatbot corpus budget). */
  knowledgeTokenBudget: number;
}

export const config: KeeperConfig = {
  processedLabel: "website-processed",
  downtimeThresholdDays: 7,
  liveLinkRetries: 3,
  liveLinkTimeoutMs: 10000,
  knowledgeTokenBudget: 25000,
  coverSourcesOrder: ["google-books", "itunes", "open-library", "duckduckgo"],
  purchaseSources: [
    {
      id: "amazon-kindle",
      label: "Amazon Kindle",
      format: "Kindle",
      gmailQuery: 'from:(digital-no-reply@amazon.in OR digital-no-reply@amazon.com) subject:(Kindle OR "digital order")',
    },
    {
      id: "audible",
      label: "Audible",
      format: "Audible",
      gmailQuery: 'from:(donotreply@audible.com OR account@audible.in OR no-reply@audible.com)',
    },
    {
      id: "amazon-physical",
      label: "Amazon (physical)",
      format: "Physical",
      gmailQuery: 'from:(order-update@amazon.in OR auto-confirm@amazon.in OR shipment-tracking@amazon.in) subject:(ordered OR shipped OR delivered)',
    },
    {
      id: "other-retailers",
      label: "Other book retailers",
      format: "Physical",
      gmailQuery: 'from:(kobo.com OR play.google.com OR apple.com) subject:(book OR order OR receipt)',
    },
  ],
};
