export interface PolicyLinkItem {
  href: string;
  label: string;
  description: string;
}

export const policyLinks: PolicyLinkItem[] = [
  {
    href: "/policies/privacy",
    label: "Privacy Policy",
    description: "How we collect, use, and protect personal data.",
  },
  {
    href: "/policies/terms",
    label: "Terms of Service",
    description: "Rules, responsibilities, and limitations for using DunningDog.",
  },
  {
    href: "/policies/cookies",
    label: "Cookie Policy",
    description: "What cookies we use and how you can control them.",
  },
  {
    href: "/policies/refunds",
    label: "Refund Policy",
    description: "How billing refunds and cancellation requests are handled.",
  },
];
