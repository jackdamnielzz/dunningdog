import {
  Code2,
  Rocket,
  Package,
  Users,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface UseCaseTestimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export interface UseCaseData {
  slug: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  icon: LucideIcon;
  painPoints: string[];
  benefits: { title: string; description: string }[];
  stats: { value: string; label: string }[];
  testimonial: UseCaseTestimonial;
  faqs: { q: string; a: string }[];
}

export const USE_CASES: Record<string, UseCaseData> = {
  saas: {
    slug: "saas",
    title: "Payment Recovery for SaaS",
    subtitle: "Stop losing MRR to failed subscription payments",
    heroDescription:
      "SaaS businesses lose 5-10% of MRR to failed payments every month. DunningDog automatically recovers that revenue with branded email sequences and pre-dunning alerts — built specifically for Stripe-based SaaS.",
    icon: Code2,
    painPoints: [
      "5-10% of your MRR silently leaks away to failed payments every month",
      "Stripe's built-in retries only recover 15-25% — the rest is lost without customer outreach",
      "Expired cards, insufficient funds, and bank declines happen at unpredictable intervals",
      "Building custom dunning logic takes weeks of engineering time away from your product",
      "No visibility into which customers are at risk or how much revenue you're losing",
    ],
    benefits: [
      {
        title: "Recover 50-70% of failed payments",
        description:
          "Automated email sequences with payment update links recover 2-3x more than Stripe's retries alone.",
      },
      {
        title: "Pre-dunning prevents failures",
        description:
          "Detects expiring cards 14 days in advance and proactively notifies customers before the charge fails.",
      },
      {
        title: "Real-time MRR protection dashboard",
        description:
          "See failed revenue, recovered revenue, at-risk subscriptions, and your recovery rate at a glance.",
      },
      {
        title: "Zero engineering overhead",
        description:
          "One-click Stripe OAuth setup. No webhooks to configure, no code to write, no maintenance burden.",
      },
      {
        title: "Custom branding",
        description:
          "Recovery emails use your company name, logo, and colors. Customers see a professional message from you, not a generic notice.",
      },
      {
        title: "Slack/Discord alerts",
        description:
          "Get notified in real-time when payments fail, recover, or when pre-dunning alerts are sent.",
      },
    ],
    stats: [
      { value: "50-70%", label: "Recovery rate" },
      { value: "10-30x", label: "Typical ROI" },
      { value: "<5 min", label: "Setup time" },
      { value: "$49/mo", label: "Starting price" },
    ],
    testimonial: {
      quote:
        "We were losing $3,200/mo to failed payments and didn't even realize it. DunningDog recovered $2,100 in the first month alone. The ROI is insane.",
      name: "Alex Chen",
      role: "Founder",
      company: "MetricFlow",
    },
    faqs: [
      {
        q: "How does DunningDog work with my SaaS billing?",
        a: "DunningDog connects to your Stripe account via OAuth and monitors all subscription payments. When a payment fails, it automatically starts a recovery email sequence. No changes to your billing code needed.",
      },
      {
        q: "Will my customers know it's from my company?",
        a: "Yes — recovery emails are fully branded with your company name, logo, and accent color (Pro plan and above). Customers see a professional email from you, not a third-party tool.",
      },
      {
        q: "How much MRR can I expect to recover?",
        a: "Most SaaS customers recover 50-70% of failed payment revenue. For a $50k MRR business losing $2,500-$5,000/mo, that's $1,250-$3,500/mo recovered.",
      },
      {
        q: "Does it work with annual subscriptions too?",
        a: "Yes — DunningDog monitors all Stripe subscription payments regardless of billing interval. Monthly, quarterly, and annual charges are all covered.",
      },
    ],
  },

  "indie-hackers": {
    slug: "indie-hackers",
    title: "Payment Recovery for Indie Hackers",
    subtitle: "Every dollar counts when you're bootstrapping",
    heroDescription:
      "As a solo founder or small team, you can't afford to lose revenue to failed payments — or spend hours chasing them manually. DunningDog automates recovery so you can focus on building your product.",
    icon: Rocket,
    painPoints: [
      "You're wearing every hat — billing recovery shouldn't be one of them",
      "A few hundred dollars in failed payments per month adds up to thousands in lost ARR",
      "No time or engineering resources to build custom dunning workflows",
      "Competitors charge $250+/mo — more than some indie products make in revenue",
      "Stripe's default retry logic only recovers a fraction of failures",
    ],
    benefits: [
      {
        title: "Starts at just $49/mo",
        description:
          "Purpose-built for bootstrapped businesses. No enterprise pricing, no take rate on recovered revenue.",
      },
      {
        title: "Setup in under 5 minutes",
        description:
          "Connect your Stripe account with one click. No code, no webhooks, no technical setup. Literally click and go.",
      },
      {
        title: "Pays for itself immediately",
        description:
          "Recover just one $49+ failed payment per month and DunningDog has already paid for itself. Most users see 10-30x ROI.",
      },
      {
        title: "Set it and forget it",
        description:
          "Configure your recovery sequence once and DunningDog runs 24/7. No manual follow-up, no checking spreadsheets.",
      },
      {
        title: "Free 7-day trial",
        description:
          "No credit card required. Try DunningDog risk-free and see real recovery results before paying anything.",
      },
      {
        title: "Built for Stripe",
        description:
          "If you're on Stripe (and most indie hackers are), DunningDog works out of the box. No payment processor migration needed.",
      },
    ],
    stats: [
      { value: "$49/mo", label: "Starting price" },
      { value: "5 min", label: "Setup time" },
      { value: "10-30x", label: "Typical ROI" },
      { value: "7 days", label: "Free trial" },
    ],
    testimonial: {
      quote:
        "I was manually emailing customers about failed payments every week. DunningDog does it automatically and recovers way more. Should have set this up months ago.",
      name: "Jordan Park",
      role: "Solo Founder",
      company: "ShipStack",
    },
    faqs: [
      {
        q: "Is DunningDog worth it for a small product?",
        a: "If you have paying subscribers, yes. Even at $5k MRR, you're likely losing $250-$500/mo to failed payments. DunningDog at $49/mo pays for itself by recovering just one of those.",
      },
      {
        q: "Do I need any technical setup?",
        a: "No. Connect your Stripe account with one click (OAuth), enable a recovery sequence, and you're done. Zero code, zero webhooks, zero engineering time.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes — no contracts, no commitment. Cancel from your dashboard whenever you want. Your recovery sequences will stop at the end of your billing period.",
      },
      {
        q: "How is this different from building my own dunning emails?",
        a: "DunningDog gives you a proven multi-step email sequence, decline intelligence, pre-dunning alerts, and a recovery dashboard — all for $49/mo. Building this yourself would take weeks and ongoing maintenance.",
      },
    ],
  },

  "subscription-boxes": {
    slug: "subscription-boxes",
    title: "Payment Recovery for Subscription Boxes",
    subtitle: "Keep subscribers active and shipments on track",
    heroDescription:
      "Failed payments in subscription box businesses don't just lose revenue — they disrupt fulfillment, waste inventory, and create customer service headaches. DunningDog recovers payments before they impact operations.",
    icon: Package,
    painPoints: [
      "Failed payments disrupt fulfillment schedules and inventory planning",
      "Customers miss shipments they were expecting, leading to complaints and cancellations",
      "Physical product businesses have tighter margins — every lost subscriber hits harder",
      "Seasonal peaks (holidays, launches) amplify the impact of payment failures",
      "Manual recovery takes time your operations team doesn't have",
    ],
    benefits: [
      {
        title: "Recover before fulfillment deadlines",
        description:
          "Configurable timing means recovery emails go out immediately, giving customers time to update before the next shipment cutoff.",
      },
      {
        title: "Keep subscribers in the loop",
        description:
          "Branded emails explain exactly what happened and provide a one-click link to update their payment method.",
      },
      {
        title: "Pre-dunning for card expirations",
        description:
          "Catch expiring cards 14 days before renewal. Customers update proactively, avoiding missed boxes entirely.",
      },
      {
        title: "Reduce support tickets",
        description:
          "Automated recovery means fewer 'where's my box?' emails and less time spent on billing issues.",
      },
      {
        title: "Recovery dashboard",
        description:
          "Track at-risk subscribers, failed payments, and recovery rates to forecast fulfillment more accurately.",
      },
      {
        title: "Works with any Stripe billing setup",
        description:
          "Whether you use Stripe Subscriptions, invoices, or payment links — DunningDog monitors them all.",
      },
    ],
    stats: [
      { value: "50-70%", label: "Recovery rate" },
      { value: "14 days", label: "Pre-dunning window" },
      { value: "<5 min", label: "Setup time" },
      { value: "24/7", label: "Automated recovery" },
    ],
    testimonial: {
      quote:
        "We used to lose 30+ subscribers every month to failed payments. DunningDog cut that by more than half. Our fulfillment team loves it because forecasting is way more predictable now.",
      name: "Sarah Mitchell",
      role: "Operations Lead",
      company: "CrateJoy Plus",
    },
    faqs: [
      {
        q: "Can I set recovery emails to go out before my fulfillment cutoff?",
        a: "Yes — you control the timing of each step in your recovery sequence. Set immediate emails for time-sensitive renewals so customers can update before your shipping deadline.",
      },
      {
        q: "Does DunningDog handle physical product subscriptions?",
        a: "DunningDog works with any Stripe subscription, including physical product boxes. It monitors the payment layer — the type of product doesn't matter.",
      },
      {
        q: "How does pre-dunning help subscription boxes specifically?",
        a: "Pre-dunning alerts customers about expiring cards 14 days before renewal. For subscription boxes, this means the card gets updated before the fulfillment cycle, avoiding missed shipments entirely.",
      },
      {
        q: "Can I brand the recovery emails with my box company's look?",
        a: "Yes — on Pro and Scale plans, recovery emails include your company name, logo, and brand colors. Customers see a professional message from your brand.",
      },
    ],
  },

  "membership-sites": {
    slug: "membership-sites",
    title: "Payment Recovery for Membership Sites",
    subtitle: "Keep members active and revenue flowing",
    heroDescription:
      "Membership sites depend on recurring revenue. When a member's payment fails, they lose access — and you lose revenue. DunningDog keeps members paying and accessing your content without interruption.",
    icon: Users,
    painPoints: [
      "Members lose access to content they're paying for when payments fail",
      "Confusion leads to support tickets: 'Why can't I log in?'",
      "Community engagement drops when active members are involuntarily removed",
      "Re-acquiring a churned member costs 5-7x more than retaining them",
      "Payment failures spike after card reissuance events (bank mergers, fraud waves)",
    ],
    benefits: [
      {
        title: "Keep members engaged",
        description:
          "Fast recovery means members maintain access to your content, courses, and community without disruption.",
      },
      {
        title: "Branded member communication",
        description:
          "Recovery emails match your brand and clearly explain the issue with a one-click fix. No confusion, no support tickets.",
      },
      {
        title: "Pre-dunning prevents access gaps",
        description:
          "Alert members about expiring cards before their renewal fails. They update proactively and never lose access.",
      },
      {
        title: "Protect community value",
        description:
          "Every lost member reduces the value of your community for remaining members. Recovery protects your network effects.",
      },
      {
        title: "Works with gated content platforms",
        description:
          "DunningDog works at the Stripe payment layer, so it's compatible with any membership platform that uses Stripe for billing.",
      },
      {
        title: "Multi-tier membership support",
        description:
          "Whether you have one membership level or ten, DunningDog monitors all subscription payments equally.",
      },
    ],
    stats: [
      { value: "50-70%", label: "Member recovery rate" },
      { value: "5-7x", label: "Cost to re-acquire vs retain" },
      { value: "$49/mo", label: "Starting price" },
      { value: "0", label: "Code changes needed" },
    ],
    testimonial: {
      quote:
        "Our members were confused when their access got revoked after a failed payment. DunningDog sends them a branded email with a fix link before they even notice. Support tickets dropped 40%.",
      name: "David Kim",
      role: "Community Manager",
      company: "FormBase Pro",
    },
    faqs: [
      {
        q: "Will DunningDog work with my membership platform?",
        a: "If your membership platform uses Stripe for billing (most do), DunningDog works with it. It connects at the payment layer via Stripe OAuth, regardless of your frontend platform.",
      },
      {
        q: "Can recovery emails explain that the member's access is at risk?",
        a: "Yes — the email content clearly communicates that the payment failed and provides a direct link to update their payment method, so members can fix it before losing access.",
      },
      {
        q: "How fast does DunningDog respond to a failed payment?",
        a: "Instantly. DunningDog receives Stripe webhook events in real-time, so the first recovery email can be sent within minutes of a failed charge.",
      },
      {
        q: "Is this worth it for a small membership site?",
        a: "If you have recurring members on Stripe, yes. Even recovering 2-3 members per month at $20-50 each more than pays for the $49/mo Starter plan.",
      },
    ],
  },

  agencies: {
    slug: "agencies",
    title: "Payment Recovery for Agencies",
    subtitle: "Protect recurring retainer revenue across all clients",
    heroDescription:
      "Agencies running on retainer billing can't afford revenue gaps. DunningDog automatically recovers failed client payments and alerts you to at-risk accounts before they become collection problems.",
    icon: Briefcase,
    painPoints: [
      "Failed retainer payments create awkward client conversations",
      "Chasing payments manually strains client relationships",
      "Multiple clients means multiple potential failures every billing cycle",
      "Late payments cascade into cash flow problems for your agency",
      "No visibility into which client accounts are at risk of payment failure",
    ],
    benefits: [
      {
        title: "Automated client payment recovery",
        description:
          "Professional, branded emails handle the awkward conversation for you. Clients update their payment method without you chasing them.",
      },
      {
        title: "Protect client relationships",
        description:
          "Recovery emails are polite, branded, and professional. Clients see a system notification, not a personal demand — preserving the relationship.",
      },
      {
        title: "At-risk account alerts",
        description:
          "Get Slack or Discord notifications when a client's payment fails or their card is about to expire. Stay ahead of issues.",
      },
      {
        title: "Pre-dunning for retainers",
        description:
          "Know which clients have expiring cards before the next billing cycle. Reach out proactively or let DunningDog handle it.",
      },
      {
        title: "Cash flow protection",
        description:
          "Faster recovery means more predictable cash flow. See exactly how much is at risk and how much has been recovered.",
      },
      {
        title: "White-label option",
        description:
          "On the Scale plan, payment update pages are fully white-labeled. Clients see your agency brand throughout the recovery flow.",
      },
    ],
    stats: [
      { value: "50-70%", label: "Recovery rate" },
      { value: "24/7", label: "Automated recovery" },
      { value: "$49/mo", label: "Starting price" },
      { value: "100%", label: "Revenue is yours" },
    ],
    testimonial: {
      quote:
        "Chasing clients for failed payments was the worst part of running an agency. DunningDog handles it automatically and professionally. Two retainer clients were recovered last month that we would have lost.",
      name: "Mike Torres",
      role: "Agency Director",
      company: "Pixel & Code",
    },
    faqs: [
      {
        q: "Can I use DunningDog for client retainer billing?",
        a: "Yes — if you bill clients via Stripe subscriptions, DunningDog monitors those payments. When a retainer payment fails, it automatically starts a recovery sequence.",
      },
      {
        q: "Will clients know I'm using a recovery tool?",
        a: "Recovery emails are fully branded with your agency name and logo (Pro plan). Clients see a professional payment update notice from your agency, not from DunningDog.",
      },
      {
        q: "Can I get notified when a client's payment fails?",
        a: "Yes — Slack and Discord notifications are available on Pro and Scale plans. Get real-time alerts for failed payments, successful recoveries, and expiring cards.",
      },
      {
        q: "What if I manage billing for multiple businesses?",
        a: "Each Stripe account connects as a separate DunningDog workspace. If you manage multiple Stripe accounts, each gets its own recovery dashboard and sequences.",
      },
    ],
  },
};
