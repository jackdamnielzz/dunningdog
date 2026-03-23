import {
  CreditCard,
  TrendingDown,
  Mail,
  Shield,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SolutionStat {
  value: string;
  label: string;
}

export interface SolutionStep {
  title: string;
  description: string;
}

export interface SolutionData {
  slug: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  icon: LucideIcon;
  problemTitle: string;
  problemDescription: string;
  problemPoints: string[];
  solutionTitle: string;
  solutionDescription: string;
  solutionPoints: { title: string; description: string }[];
  stats: SolutionStat[];
  howItWorks: SolutionStep[];
  faqs: { q: string; a: string }[];
}

export const SOLUTIONS: Record<string, SolutionData> = {
  "failed-payment-recovery": {
    slug: "failed-payment-recovery",
    title: "Failed Payment Recovery",
    subtitle: "Automatically recover revenue from failed subscription payments",
    heroDescription:
      "Failed payments are the #1 cause of involuntary churn. DunningDog detects every failed charge in real-time and runs automated recovery sequences to bring that revenue back.",
    icon: CreditCard,
    problemTitle: "Failed payments silently drain your revenue",
    problemDescription:
      "Every month, 5-10% of subscription payments fail. Without automated recovery, most of that revenue is lost forever.",
    problemPoints: [
      "The average SaaS loses $2,500-$5,000/mo per $50k MRR to failed payments",
      "Stripe's built-in retries only recover 15-25% of failures",
      "Customers often don't know their payment failed until their subscription lapses",
      "Manual follow-up takes hours per week and still misses most cases",
      "Every day without recovery is revenue permanently lost",
    ],
    solutionTitle: "Automated recovery that runs 24/7",
    solutionDescription:
      "DunningDog monitors your Stripe account for failed payments and instantly activates a proven recovery sequence.",
    solutionPoints: [
      {
        title: "Instant detection",
        description:
          "DunningDog catches every failed payment the moment it happens via Stripe webhooks — no delays, no missed charges.",
      },
      {
        title: "Smart email sequences",
        description:
          "Automated, branded recovery emails with direct payment update links. Customizable timing, tone, and escalation.",
      },
      {
        title: "Decline intelligence",
        description:
          "Soft vs. hard decline classification helps you understand which failures are recoverable and adapt your strategy.",
      },
      {
        title: "Recovery dashboard",
        description:
          "Track every recovery attempt, see your recovery rate, and measure exact ROI in a real-time dashboard.",
      },
    ],
    stats: [
      { value: "50-70%", label: "Average recovery rate" },
      { value: "$118B+", label: "Lost to failed payments yearly" },
      { value: "10-30x", label: "Typical ROI" },
      { value: "<5 min", label: "Setup time" },
    ],
    howItWorks: [
      {
        title: "Connect Stripe",
        description:
          "One-click OAuth connects your Stripe account. No code changes, no webhooks to configure.",
      },
      {
        title: "Payment fails",
        description:
          "DunningDog detects the failure instantly and classifies it as a soft or hard decline.",
      },
      {
        title: "Recovery sequence starts",
        description:
          "Branded email sequence with payment update link is sent automatically on your configured schedule.",
      },
      {
        title: "Revenue recovered",
        description:
          "Customer updates their payment method, the invoice succeeds, and you see it in your dashboard.",
      },
    ],
    faqs: [
      {
        q: "How does DunningDog detect failed payments?",
        a: "DunningDog connects to your Stripe account via OAuth and listens for invoice.payment_failed webhook events. Every failed charge is detected in real-time.",
      },
      {
        q: "What's the typical recovery rate?",
        a: "Most DunningDog customers recover 50-70% of failed payments. This is 2-3x higher than Stripe's built-in retries alone, because DunningDog adds customer communication.",
      },
      {
        q: "Does DunningDog work with Stripe Smart Retries?",
        a: "Yes — they're complementary. Keep Stripe Smart Retries enabled for automatic payment retries, and DunningDog adds the email communication layer on top.",
      },
      {
        q: "How quickly can I start recovering payments?",
        a: "Setup takes under 5 minutes. Connect your Stripe account, activate a sequence, and DunningDog starts monitoring immediately.",
      },
    ],
  },

  "involuntary-churn": {
    slug: "involuntary-churn",
    title: "Reduce Involuntary Churn",
    subtitle: "Stop losing subscribers to payment failures they don't even know about",
    heroDescription:
      "Involuntary churn — when customers leave because their payment failed, not because they wanted to cancel — accounts for 20-40% of all SaaS churn. DunningDog eliminates it.",
    icon: TrendingDown,
    problemTitle: "Your best customers are churning without knowing it",
    problemDescription:
      "Involuntary churn is the silent killer of SaaS growth. Customers who love your product leave because of expired cards, insufficient funds, or bank issues.",
    problemPoints: [
      "20-40% of all SaaS churn is involuntary — caused by payment failures, not cancellations",
      "Most customers don't realize their payment failed until their access is revoked",
      "Expired credit cards are the #1 cause, and customers rarely update proactively",
      "Each churned customer costs 5-7x more to replace than to retain",
      "Compounding effect: 3% monthly involuntary churn = 30%+ annual revenue loss",
    ],
    solutionTitle: "Prevent and recover involuntary churn automatically",
    solutionDescription:
      "DunningDog combines proactive pre-dunning alerts with automated recovery sequences to keep your subscribers active.",
    solutionPoints: [
      {
        title: "Pre-dunning prevention",
        description:
          "Detects expiring cards 14 days before they fail and proactively notifies customers to update their payment method.",
      },
      {
        title: "Automated recovery",
        description:
          "When a payment does fail, branded email sequences with direct update links recover 50-70% of at-risk subscriptions.",
      },
      {
        title: "Churn analytics",
        description:
          "See exactly how many subscribers are at risk, how many were recovered, and your involuntary churn rate over time.",
      },
      {
        title: "Zero customer friction",
        description:
          "Customers update their payment method via a secure, branded link — no login required, no support tickets needed.",
      },
    ],
    stats: [
      { value: "20-40%", label: "Of SaaS churn is involuntary" },
      { value: "50-70%", label: "Recovery rate with DunningDog" },
      { value: "5-7x", label: "Cost to acquire vs. retain" },
      { value: "14 days", label: "Early warning for expiring cards" },
    ],
    howItWorks: [
      {
        title: "Monitor subscriptions",
        description:
          "DunningDog continuously scans your active subscriptions for cards approaching expiration.",
      },
      {
        title: "Pre-dunning alerts",
        description:
          "Customers with expiring cards receive a friendly reminder to update their payment method before it fails.",
      },
      {
        title: "Catch failures",
        description:
          "If a payment still fails, DunningDog instantly starts an automated recovery email sequence.",
      },
      {
        title: "Retain the customer",
        description:
          "The customer updates their card via a secure link, the payment succeeds, and their subscription continues uninterrupted.",
      },
    ],
    faqs: [
      {
        q: "What is involuntary churn?",
        a: "Involuntary churn happens when a customer's subscription ends due to a failed payment — not because they chose to cancel. It's caused by expired cards, insufficient funds, or bank declines.",
      },
      {
        q: "How much revenue does involuntary churn cost?",
        a: "For a typical SaaS with $50k MRR, involuntary churn can cost $2,500-$5,000/mo in lost revenue. That's $30k-$60k per year silently leaking away.",
      },
      {
        q: "Can DunningDog prevent involuntary churn before it happens?",
        a: "Yes — DunningDog's pre-dunning feature detects cards expiring within 14 days and proactively notifies customers to update their payment method before the charge fails.",
      },
      {
        q: "How is this different from Stripe's built-in retry logic?",
        a: "Stripe retries the payment automatically, but never contacts the customer. DunningDog adds the communication layer — branded emails with update links — which is why recovery rates jump from 15-25% to 50-70%.",
      },
    ],
  },

  "card-expiration-management": {
    slug: "card-expiration-management",
    title: "Card Expiration Management",
    subtitle: "Catch expiring cards before they cause failed payments",
    heroDescription:
      "Expired credit cards are the #1 cause of failed subscription payments. DunningDog's pre-dunning system detects expiring cards 14 days in advance and prompts customers to update — before the charge fails.",
    icon: Shield,
    problemTitle: "Expired cards are a ticking time bomb",
    problemDescription:
      "Every credit card has an expiration date. When it passes, the next subscription charge fails — and most customers never notice until it's too late.",
    problemPoints: [
      "Credit cards expire every 3-5 years, creating a constant stream of at-risk subscriptions",
      "Card networks sometimes auto-update, but coverage is inconsistent (50-70% of cases)",
      "Customers rarely update their payment method proactively",
      "You lose the customer AND the revenue if no action is taken within the retry window",
      "There's no built-in Stripe feature to alert customers about expiring cards",
    ],
    solutionTitle: "Proactive card expiration alerts",
    solutionDescription:
      "DunningDog scans your subscriptions for expiring cards and sends customers a friendly heads-up before their payment fails.",
    solutionPoints: [
      {
        title: "14-day early detection",
        description:
          "DunningDog identifies cards expiring within 14 days across all your active subscriptions.",
      },
      {
        title: "Automatic notifications",
        description:
          "Customers receive a branded email with a secure link to update their payment method — no login required.",
      },
      {
        title: "At-risk dashboard",
        description:
          "See all subscriptions with expiring cards in one view, along with their MRR contribution.",
      },
      {
        title: "Seamless update flow",
        description:
          "Customers click one link, enter their new card, and their subscription continues with zero interruption.",
      },
    ],
    stats: [
      { value: "#1", label: "Cause of failed payments" },
      { value: "14 days", label: "Advance warning" },
      { value: "50-70%", label: "Card network auto-update gap" },
      { value: "0", label: "Code changes required" },
    ],
    howItWorks: [
      {
        title: "Continuous scanning",
        description:
          "DunningDog monitors all active subscriptions and flags cards expiring within 14 days.",
      },
      {
        title: "Pre-dunning email",
        description:
          "A branded email is sent to the customer with a secure payment update link.",
      },
      {
        title: "Customer updates card",
        description:
          "The customer clicks the link, enters their new card details, and the at-risk flag is cleared.",
      },
      {
        title: "Payment succeeds",
        description:
          "When the next charge runs, it processes successfully on the new card. No failed payment, no churn.",
      },
    ],
    faqs: [
      {
        q: "Does Stripe automatically handle expiring cards?",
        a: "Stripe relies on card network auto-updates (Account Updater), which works in 50-70% of cases. For the rest, the payment simply fails. DunningDog fills this gap by proactively contacting customers.",
      },
      {
        q: "How far in advance does DunningDog detect expiring cards?",
        a: "DunningDog scans for cards expiring within 14 days, giving customers ample time to update their payment method before the next charge.",
      },
      {
        q: "What does the customer experience look like?",
        a: "Customers receive a branded email explaining their card is about to expire, with a secure one-click link to update their payment method. No login required.",
      },
      {
        q: "Does this work alongside Stripe's Account Updater?",
        a: "Yes — they're complementary. Stripe's Account Updater handles cards that banks auto-update. DunningDog catches the ones that slip through by contacting the customer directly.",
      },
    ],
  },

  "dunning-automation": {
    slug: "dunning-automation",
    title: "Dunning Automation",
    subtitle: "Set up automated dunning email sequences in minutes, not weeks",
    heroDescription:
      "Manual dunning is slow, inconsistent, and impossible to scale. DunningDog automates the entire dunning workflow — from detection to recovery — with customizable email sequences that run 24/7.",
    icon: Mail,
    problemTitle: "Manual dunning doesn't scale",
    problemDescription:
      "Most SaaS teams either ignore failed payments or chase them manually with one-off emails. Neither approach works at scale.",
    problemPoints: [
      "Writing and sending dunning emails manually takes hours per week",
      "Inconsistent timing — delayed emails reduce recovery chances dramatically",
      "No personalization or branding in generic payment failure notifications",
      "Building a custom dunning system takes weeks of engineering time",
      "No visibility into what's working — are emails being opened? Are payments recovering?",
    ],
    solutionTitle: "Fully automated dunning sequences",
    solutionDescription:
      "DunningDog handles the entire dunning workflow automatically. Configure your sequence once, and it runs 24/7 without manual intervention.",
    solutionPoints: [
      {
        title: "Multi-step sequences",
        description:
          "Configure up to 20 email steps with custom timing, subject lines, and messaging. From gentle reminders to urgent escalations.",
      },
      {
        title: "Branded emails",
        description:
          "Your company name, logo, and accent color. Customers see a professional email from you — not a generic payment notice.",
      },
      {
        title: "Smart timing",
        description:
          "Set delays from 0 to 720 hours between steps. DunningDog stops the sequence automatically when the payment succeeds.",
      },
      {
        title: "Secure payment links",
        description:
          "Every email includes a unique, expiring payment update link. Customers can update their card without logging in.",
      },
    ],
    stats: [
      { value: "20", label: "Max sequence steps" },
      { value: "24/7", label: "Automated recovery" },
      { value: "<5 min", label: "Setup time" },
      { value: "0", label: "Engineering hours required" },
    ],
    howItWorks: [
      {
        title: "Create your sequence",
        description:
          "Choose the number of steps, set timing between emails, and customize your messaging.",
      },
      {
        title: "Customize branding",
        description:
          "Add your logo, company name, and accent color to make recovery emails look like they come from your brand.",
      },
      {
        title: "Activate and go",
        description:
          "Enable your sequence and DunningDog starts running it automatically for every failed payment.",
      },
      {
        title: "Monitor results",
        description:
          "Track recovery rates, see which steps are most effective, and optimize your sequence over time.",
      },
    ],
    faqs: [
      {
        q: "What is dunning?",
        a: "Dunning is the process of communicating with customers about failed payments and encouraging them to update their payment method. It's named after the historical practice of demanding payment for debts.",
      },
      {
        q: "How many email steps can I configure?",
        a: "The Starter plan supports 3 steps, while Pro and Scale plans support up to 20 steps. Most successful sequences use 3-5 emails over 7-14 days.",
      },
      {
        q: "Can I customize the email content?",
        a: "Yes — you can set custom subject lines and the emails automatically include your company branding (logo, name, accent color). On Pro and Scale plans, you get full email branding customization.",
      },
      {
        q: "What happens when a payment is recovered mid-sequence?",
        a: "DunningDog automatically stops the sequence as soon as the payment succeeds. The customer won't receive any further recovery emails.",
      },
    ],
  },

  "subscription-recovery": {
    slug: "subscription-recovery",
    title: "Subscription Revenue Recovery",
    subtitle: "Recover thousands in lost subscription revenue every month",
    heroDescription:
      "Failed subscription payments represent your most recoverable revenue. DunningDog turns payment failures into recovered revenue with automated sequences and measurable ROI.",
    icon: BarChart3,
    problemTitle: "You're leaving money on the table",
    problemDescription:
      "Every failed payment is revenue you've already earned — from customers who already chose your product. Most of it is recoverable with the right approach.",
    problemPoints: [
      "SaaS businesses lose 5-10% of MRR to failed payments every month",
      "At $50k MRR, that's $2,500-$5,000/mo or $30k-$60k/year lost",
      "Most failures are soft declines (temporary) — highly recoverable with prompt action",
      "Without a recovery tool, you rely on Stripe's 15-25% retry success rate",
      "The longer you wait to act on a failure, the lower the recovery probability",
    ],
    solutionTitle: "Turn payment failures into recovered revenue",
    solutionDescription:
      "DunningDog maximizes your subscription revenue by recovering failed payments quickly and automatically.",
    solutionPoints: [
      {
        title: "Revenue recovery dashboard",
        description:
          "See exactly how much revenue was at risk, how much was recovered, and your recovery rate — across any time period.",
      },
      {
        title: "ROI tracking",
        description:
          "Know your exact return on investment. Most customers see 10-30x ROI within the first month.",
      },
      {
        title: "CSV export",
        description:
          "Export full recovery data for accounting, reporting, or analysis. Filter by date range and status.",
      },
      {
        title: "Multi-channel alerts",
        description:
          "Get Slack or Discord notifications for every recovery event — started, succeeded, or failed.",
      },
    ],
    stats: [
      { value: "10-30x", label: "Typical monthly ROI" },
      { value: "$49/mo", label: "Starting price" },
      { value: "50-70%", label: "Recovery rate" },
      { value: "100%", label: "Recovered revenue is yours" },
    ],
    howItWorks: [
      {
        title: "Connect Stripe",
        description:
          "One-click setup syncs your subscription data and starts monitoring payments.",
      },
      {
        title: "Recover automatically",
        description:
          "DunningDog emails customers with branded payment update links on your configured schedule.",
      },
      {
        title: "Track results",
        description:
          "See every recovery attempt, its status, and the dollars recovered in your dashboard.",
      },
      {
        title: "Measure ROI",
        description:
          "Compare recovered revenue to your DunningDog subscription cost for clear, measurable ROI.",
      },
    ],
    faqs: [
      {
        q: "How much revenue can DunningDog recover?",
        a: "Most customers recover 50-70% of failed payment revenue. For a SaaS with $50k MRR losing $2,500-$5,000/mo, that's $1,250-$3,500/mo recovered.",
      },
      {
        q: "What's the ROI of using DunningDog?",
        a: "At $49/mo and recovering $1,250-$3,500/mo, the typical ROI is 25-70x. Even conservative estimates show 10-30x return on investment.",
      },
      {
        q: "Does DunningDog take a percentage of recovered revenue?",
        a: "No. DunningDog charges a flat monthly fee. Every dollar recovered goes 100% to you — no take rate, no hidden fees.",
      },
      {
        q: "Can I export recovery data?",
        a: "Yes — the dashboard includes full CSV export with filters for date range and recovery status. Useful for financial reporting and analysis.",
      },
    ],
  },

  "pre-dunning": {
    slug: "pre-dunning",
    title: "Pre-Dunning Alerts",
    subtitle: "Prevent payment failures before they happen",
    heroDescription:
      "The best recovery is prevention. DunningDog's pre-dunning system identifies at-risk subscriptions and proactively contacts customers before their payment fails.",
    icon: AlertTriangle,
    problemTitle: "Why recover when you can prevent?",
    problemDescription:
      "Traditional dunning tools only react after a payment fails. By then, you're already in recovery mode and the clock is ticking.",
    problemPoints: [
      "Reactive dunning starts after the damage is done — the payment already failed",
      "Each failed payment risks the customer relationship and increases churn probability",
      "Customers may not see recovery emails in time, especially with spam filters",
      "The recovery window is short — after 7-14 days, most failed payments become unrecoverable",
      "Prevention costs nothing; recovery costs time, emails, and sometimes the customer",
    ],
    solutionTitle: "Proactive prevention, not just recovery",
    solutionDescription:
      "DunningDog identifies at-risk subscriptions before they fail and takes action to prevent the payment failure entirely.",
    solutionPoints: [
      {
        title: "Expiring card detection",
        description:
          "Scans all active subscriptions for credit cards expiring within 14 days.",
      },
      {
        title: "Proactive customer alerts",
        description:
          "Sends branded emails asking customers to update their card before the next charge — preventing the failure entirely.",
      },
      {
        title: "At-risk subscription tracking",
        description:
          "Dashboard view of all subscriptions with expiring cards, including their MRR value.",
      },
      {
        title: "Seamless with recovery",
        description:
          "If a payment still fails despite pre-dunning, the recovery sequence activates automatically as a safety net.",
      },
    ],
    stats: [
      { value: "14 days", label: "Advance warning" },
      { value: "#1", label: "Prevention > recovery" },
      { value: "0", label: "Failed payments prevented" },
      { value: "24/7", label: "Continuous monitoring" },
    ],
    howItWorks: [
      {
        title: "Continuous monitoring",
        description:
          "DunningDog scans your Stripe subscriptions daily for cards approaching expiration.",
      },
      {
        title: "Pre-dunning alert sent",
        description:
          "Customers with expiring cards receive a branded email with a secure payment update link.",
      },
      {
        title: "Customer updates card",
        description:
          "One click, new card details, done. The subscription continues without interruption.",
      },
      {
        title: "Failure prevented",
        description:
          "The next charge succeeds on the new card. No failed payment, no recovery sequence needed, no churn risk.",
      },
    ],
    faqs: [
      {
        q: "What is pre-dunning?",
        a: "Pre-dunning is the practice of contacting customers before their payment fails — typically because their credit card is about to expire. It prevents the failure from happening in the first place.",
      },
      {
        q: "How is pre-dunning different from regular dunning?",
        a: "Regular dunning reacts to a payment that already failed. Pre-dunning is proactive — it identifies at-risk subscriptions and contacts customers before the failure, resulting in better outcomes and customer experience.",
      },
      {
        q: "Does pre-dunning work alongside recovery sequences?",
        a: "Yes — pre-dunning is the first line of defense. If a payment still fails despite the pre-dunning alert, DunningDog's recovery sequence activates automatically as a safety net.",
      },
      {
        q: "Is pre-dunning included in all plans?",
        a: "Yes — pre-dunning card expiry alerts are included in every DunningDog plan, starting from Starter at $49/mo.",
      },
    ],
  },
};
