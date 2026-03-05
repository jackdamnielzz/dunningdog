import {
  Zap,
  Shield,
  BarChart3,
  Clock,
  Mail,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Pain points ── */

export const PAIN_POINTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: CreditCard,
    title: "Expired cards go unnoticed",
    body: "Customers don\u2019t update their payment methods until it\u2019s too late. By then, their subscription has already churned.",
  },
  {
    icon: DollarSign,
    title: "Revenue leaks add up fast",
    body: "A few failed payments per week compound into thousands of dollars in lost ARR. Every missed recovery is money left on the table.",
  },
  {
    icon: Clock,
    title: "Manual follow-up doesn\u2019t scale",
    body: "Chasing failed payments by hand is tedious and error-prone. You have a product to build \u2014 not invoices to manage.",
  },
];

/* ── How it works ── */

export const STEPS: { step: string; icon: LucideIcon; title: string; body: string }[] = [
  {
    step: "1",
    icon: Zap,
    title: "Connect your Stripe account",
    body: "One-click OAuth. No code changes, no webhooks to configure. DunningDog syncs with your subscriptions instantly.",
  },
  {
    step: "2",
    icon: Mail,
    title: "Activate a recovery sequence",
    body: "Choose from proven email templates or build your own. Set timing, tone, and escalation \u2014 we handle the rest.",
  },
  {
    step: "3",
    icon: BarChart3,
    title: "Watch the revenue roll back in",
    body: "Track every recovered dollar, recovery rate, and at-risk subscription from your real-time dashboard.",
  },
];

/* ── Features ── */

export const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: AlertTriangle,
    title: "Pre-dunning alerts",
    body: "Detect expiring cards and payment issues before they fail. Notify customers proactively so they update their details.",
  },
  {
    icon: Mail,
    title: "Smart email sequences",
    body: "Multi-step recovery emails with customizable timing, escalation, and tone. Branded with your logo and colors.",
  },
  {
    icon: BarChart3,
    title: "Recovery dashboard",
    body: "See failed revenue, recovered revenue, and recovery rate at a glance. Export reports as CSV anytime.",
  },
  {
    icon: Zap,
    title: "One-click Stripe setup",
    body: "Connect via OAuth in under 60 seconds. No code changes, no webhook setup, no engineering work required.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    body: "Your Stripe data is encrypted at rest. We never store card numbers. SOC 2 practices built in from day one.",
  },
  {
    icon: TrendingUp,
    title: "ROI you can prove",
    body: "Track every dollar recovered against the cost of your plan. Most teams see 10\u201330x ROI within the first month.",
  },
];

/* ── Stats banner ── */

export const STATS: { value: string; label: string }[] = [
  { value: "68%", label: "Avg. recovery rate" },
  { value: "<5min", label: "Setup time" },
  { value: "10\u201330x", label: "Typical ROI" },
  { value: "$0", label: "To get started" },
];

/* ── Before / After ── */

export const WITHOUT_DUNNINGDOG = [
  "Manually chasing failed payments",
  "Discovering churn weeks later",
  "No visibility into at-risk subscriptions",
  "Revenue silently leaking every month",
];

export const WITH_DUNNINGDOG = [
  "Automated recovery sequences run 24/7",
  "Pre-dunning catches issues before they fail",
  "Real-time dashboard for every subscription",
  "Every recovered dollar tracked and proven",
];

/* ── FAQ ── */

export const FAQS: { q: string; a: string }[] = [
  {
    q: "How does DunningDog connect to Stripe?",
    a: "We use Stripe Connect (OAuth). You click one button, authorize access, and we start syncing your subscription data immediately. No API keys to copy, no webhooks to configure.",
  },
  {
    q: "Will this affect my existing Stripe setup?",
    a: "Not at all. DunningDog is read-only by default \u2014 we monitor events and send recovery emails, but we never modify your Stripe configuration or subscriptions.",
  },
  {
    q: "How quickly will I see results?",
    a: "Most teams recover their first failed payment within the first week. ROI depends on your volume, but businesses with 100+ active subscriptions typically see 10\u201330x return on their plan cost.",
  },
  {
    q: "Can I customize the recovery emails?",
    a: "Yes. You can customize timing, subject lines, body copy, and branding (logo, colors) on Pro and higher plans. Starter includes a proven 3-step default sequence.",
  },
  {
    q: "What happens after the free trial?",
    a: "After 7 days, you pick a plan that fits your MRR. No credit card is required to start, and you can cancel anytime. Your recovery data is preserved if you return later.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. We never store card numbers \u2014 Stripe handles that. We follow SOC 2 security practices and run on enterprise-grade infrastructure.",
  },
];

/* ── Testimonials ── */

export const TESTIMONIALS: { quote: string; name: string; role: string; company: string }[] = [
  {
    quote: "We were losing $2k/month to failed payments and didn\u2019t even realize it. DunningDog recovered 73% of those in the first 30 days.",
    name: "Sarah Chen",
    role: "Founder",
    company: "MetricFlow",
  },
  {
    quote: "Setup took 3 minutes. Within a week we\u2019d already recovered more than a year\u2019s subscription cost. It\u2019s a no-brainer.",
    name: "James Okafor",
    role: "CTO",
    company: "ShipStack",
  },
  {
    quote: "We tried handling dunning manually for months. DunningDog replaced all of that with zero ongoing effort from our team.",
    name: "Maria Lopez",
    role: "Head of Operations",
    company: "FormBase",
  },
];

/* ── FAQ JSON-LD for Google rich snippets ── */

export const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

/* ── Hero dashboard preview data ── */

export const HERO_RECOVERIES = [
  { customer: "alex@startup.io", amount: "$79.00", time: "2h ago" },
  { customer: "team@saasco.com", amount: "$149.00", time: "5h ago" },
];
