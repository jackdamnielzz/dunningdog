export interface CompetitorFeature {
  name: string;
  dunningdog: string | boolean;
  competitor: string | boolean;
}

export interface CompetitorData {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceRange: string;
  pricingModel: string;
  founded: string;
  features: CompetitorFeature[];
  prosCompetitor: string[];
  consCompetitor: string[];
  whyDunningDog: string[];
  idealFor: string;
}

export const COMPETITORS: Record<string, CompetitorData> = {
  churnkey: {
    slug: "churnkey",
    name: "Churnkey",
    tagline: "Enterprise churn management with ML-powered retries",
    description:
      "Churnkey is an enterprise-focused churn management platform offering dunning, cancel flows, reactivation campaigns, and ML-powered retry logic. It targets mid-to-large SaaS companies with complex needs.",
    priceRange: "$250–$990+/mo",
    pricingModel: "Fixed monthly fee, annual billing",
    founded: "2021",
    features: [
      { name: "Automated dunning emails", dunningdog: true, competitor: true },
      { name: "Pre-dunning (card expiry alerts)", dunningdog: true, competitor: false },
      { name: "Smart retry logic", dunningdog: "Stripe native", competitor: "ML-powered" },
      { name: "Custom email sequences", dunningdog: true, competitor: true },
      { name: "Cancel flow surveys", dunningdog: false, competitor: true },
      { name: "Reactivation campaigns", dunningdog: false, competitor: true },
      { name: "Slack/Discord alerts", dunningdog: true, competitor: "Slack only" },
      { name: "One-click Stripe setup", dunningdog: true, competitor: false },
      { name: "Custom branding", dunningdog: true, competitor: true },
      { name: "REST API access", dunningdog: true, competitor: true },
      { name: "Real-time recovery dashboard", dunningdog: true, competitor: true },
      { name: "CSV export", dunningdog: true, competitor: true },
      { name: "Flat-rate pricing (no take rate)", dunningdog: true, competitor: true },
      { name: "Free trial (no credit card)", dunningdog: true, competitor: false },
      { name: "Soft/hard decline classification", dunningdog: true, competitor: true },
      { name: "White-label payment page", dunningdog: true, competitor: false },
    ],
    prosCompetitor: [
      "ML-powered retry timing optimization",
      "Full churn management suite (cancel flows, reactivation)",
      "Claims up to 89% recovery rate",
      "In-app payment walls and modals",
    ],
    consCompetitor: [
      "Starting at $250/mo — 5x more expensive",
      "Complex setup with longer onboarding",
      "Feature bloat if you only need dunning",
      "No free trial available",
      "No pre-dunning card expiry alerts",
    ],
    whyDunningDog: [
      "80% cheaper: DunningDog starts at $49/mo vs Churnkey's $250/mo",
      "Pre-dunning alerts: Proactively catches expiring cards before they fail",
      "Setup in under 5 minutes with one-click Stripe OAuth",
      "Focused tool: Does payment recovery exceptionally well without feature bloat",
      "Free 7-day trial — no credit card, no sales call required",
      "100% of recovered revenue is yours — zero take rate",
    ],
    idealFor:
      "Churnkey is best for enterprise SaaS companies ($100k+ MRR) that need a full churn management suite including cancel flows and reactivation. DunningDog is the better choice for indie founders and growing SaaS teams who want fast, affordable, focused payment recovery.",
  },

  "churn-buster": {
    slug: "churn-buster",
    name: "Churn Buster",
    tagline: "Dunning and retention for subscription businesses",
    description:
      "Churn Buster is a dunning and retention platform focused on reducing involuntary churn through smart email campaigns and payment retries. They target established subscription businesses.",
    priceRange: "$249+/mo",
    pricingModel: "Fixed monthly fee based on customer count",
    founded: "2014",
    features: [
      { name: "Automated dunning emails", dunningdog: true, competitor: true },
      { name: "Pre-dunning (card expiry alerts)", dunningdog: true, competitor: false },
      { name: "Smart retry logic", dunningdog: "Stripe native", competitor: "ML-powered" },
      { name: "Custom email sequences", dunningdog: true, competitor: true },
      { name: "Cancel flow surveys", dunningdog: false, competitor: true },
      { name: "Slack/Discord alerts", dunningdog: true, competitor: false },
      { name: "One-click Stripe setup", dunningdog: true, competitor: false },
      { name: "Custom branding", dunningdog: true, competitor: true },
      { name: "REST API access", dunningdog: true, competitor: false },
      { name: "Real-time recovery dashboard", dunningdog: true, competitor: true },
      { name: "CSV export", dunningdog: true, competitor: false },
      { name: "Flat-rate pricing (no take rate)", dunningdog: true, competitor: true },
      { name: "Free trial (no credit card)", dunningdog: true, competitor: false },
      { name: "Soft/hard decline classification", dunningdog: true, competitor: true },
      { name: "White-label payment page", dunningdog: true, competitor: false },
      { name: "In-app payment update prompts", dunningdog: false, competitor: true },
    ],
    prosCompetitor: [
      "Established since 2014 — long track record",
      "ML-powered retry timing",
      "In-app payment update modals",
      "ROI guarantee offered",
    ],
    consCompetitor: [
      "Starting at $249/mo — 5x more expensive",
      "No pre-dunning card expiry alerts",
      "No free trial — requires demo call",
      "No API access for custom integrations",
      "No Slack/Discord notifications",
      "No CSV export for analytics",
    ],
    whyDunningDog: [
      "80% cheaper: $49/mo vs $249+/mo",
      "Pre-dunning: Catches expiring cards 14 days before they fail",
      "Instant setup via Stripe OAuth — no demo call needed",
      "Full API access on Scale plan for custom workflows",
      "Real-time Slack/Discord notifications for every recovery event",
      "7-day free trial with no credit card required",
    ],
    idealFor:
      "Churn Buster suits established subscription businesses that want a proven, hands-off solution and don't mind the higher price. DunningDog is ideal for cost-conscious SaaS founders who want the same recovery power at a fraction of the cost with faster setup.",
  },

  "baremetrics-recover": {
    slug: "baremetrics-recover",
    name: "Baremetrics Recover",
    tagline: "Dunning add-on for Baremetrics analytics users",
    description:
      "Baremetrics Recover is a dunning feature bundled as an add-on to the Baremetrics analytics platform. It provides email campaigns, smart retries, and in-app payment reminders for Baremetrics customers.",
    priceRange: "$129+/mo (add-on to Baremetrics subscription)",
    pricingModel: "Add-on to existing Baremetrics plan",
    founded: "2013 (Recover launched ~2017)",
    features: [
      { name: "Automated dunning emails", dunningdog: true, competitor: true },
      { name: "Pre-dunning (card expiry alerts)", dunningdog: true, competitor: false },
      { name: "Smart retry logic", dunningdog: "Stripe native", competitor: true },
      { name: "Custom email sequences", dunningdog: true, competitor: "Limited" },
      { name: "Slack/Discord alerts", dunningdog: true, competitor: false },
      { name: "One-click Stripe setup", dunningdog: true, competitor: false },
      { name: "Custom branding", dunningdog: true, competitor: "Limited" },
      { name: "REST API access", dunningdog: true, competitor: false },
      { name: "Real-time recovery dashboard", dunningdog: true, competitor: true },
      { name: "CSV export", dunningdog: true, competitor: false },
      { name: "Standalone product", dunningdog: true, competitor: false },
      { name: "Flat-rate pricing (no take rate)", dunningdog: true, competitor: true },
      { name: "Free trial (no credit card)", dunningdog: true, competitor: false },
      { name: "Soft/hard decline classification", dunningdog: true, competitor: false },
      { name: "In-app payment reminders", dunningdog: false, competitor: true },
      { name: "SaaS analytics included", dunningdog: false, competitor: true },
    ],
    prosCompetitor: [
      "Bundled with full Baremetrics analytics suite",
      "In-app payment update reminders (paywalls)",
      "Credit card capture forms",
      "Established brand in SaaS analytics",
    ],
    consCompetitor: [
      "Requires Baremetrics subscription ($108+/mo) on top of Recover",
      "Not available as standalone — total cost $237+/mo",
      "No pre-dunning card expiry alerts",
      "Limited email customization",
      "No API access, no Slack/Discord alerts",
      "No soft/hard decline classification",
    ],
    whyDunningDog: [
      "Standalone: No need to buy an analytics suite to get dunning",
      "3-5x cheaper: $49/mo vs $237+/mo total with Baremetrics",
      "Pre-dunning alerts catch card expirations before failures",
      "Full API access, Slack/Discord alerts, and CSV export",
      "Deeper decline intelligence with soft/hard classification",
      "7-day free trial — no bundled upsell required",
    ],
    idealFor:
      "Baremetrics Recover makes sense if you're already a Baremetrics customer and want to add dunning. For everyone else, DunningDog delivers better dunning capabilities at a much lower cost as a standalone tool.",
  },

  "paddle-retain": {
    slug: "paddle-retain",
    name: "Paddle Retain",
    tagline: "Formerly ProfitWell Retain — dunning within Paddle's ecosystem",
    description:
      "Paddle Retain (formerly ProfitWell Retain) is a dunning and retention tool bundled into Paddle's merchant-of-record platform. It offers card retries, pre-dunning, and cancel flows but requires migrating to Paddle.",
    priceRange: "5% take rate + $0.50/transaction",
    pricingModel: "Percentage of revenue (bundled into Paddle fees)",
    founded: "2012 (as ProfitWell)",
    features: [
      { name: "Automated dunning emails", dunningdog: true, competitor: true },
      { name: "Pre-dunning (card expiry alerts)", dunningdog: true, competitor: true },
      { name: "Smart retry logic", dunningdog: "Stripe native", competitor: "ML-powered" },
      { name: "Custom email sequences", dunningdog: true, competitor: "Limited" },
      { name: "Cancel flow surveys", dunningdog: false, competitor: true },
      { name: "Slack/Discord alerts", dunningdog: true, competitor: false },
      { name: "Works with Stripe (no migration)", dunningdog: true, competitor: false },
      { name: "Custom branding", dunningdog: true, competitor: "Paddle branded" },
      { name: "REST API access", dunningdog: true, competitor: "Paddle API" },
      { name: "Real-time recovery dashboard", dunningdog: true, competitor: true },
      { name: "CSV export", dunningdog: true, competitor: false },
      { name: "Flat-rate pricing (no take rate)", dunningdog: true, competitor: false },
      { name: "Free trial (no credit card)", dunningdog: true, competitor: false },
      { name: "Soft/hard decline classification", dunningdog: true, competitor: true },
      { name: "No vendor lock-in", dunningdog: true, competitor: false },
      { name: "Tax handling included", dunningdog: false, competitor: true },
    ],
    prosCompetitor: [
      "Merchant-of-record: Handles tax, compliance, payouts",
      "ML-powered smart retry timing",
      "Cancel flow with discount offers",
      "Bundled with full billing platform",
    ],
    consCompetitor: [
      "5% take rate on ALL revenue — not just recovered",
      "Requires full migration away from Stripe",
      "Complete vendor lock-in to Paddle ecosystem",
      "Limited email sequence customization",
      "No standalone dunning — must adopt entire platform",
      "Paddle-branded checkout experience",
    ],
    whyDunningDog: [
      "No take rate: Flat $49/mo vs 5% of all revenue",
      "Keep Stripe: No migration, no vendor lock-in",
      "At $50k MRR, Paddle costs $2,500/mo vs DunningDog's $49/mo",
      "Full control over branding and customer experience",
      "Setup in 5 minutes — no platform migration needed",
      "Only pay for what you need: focused payment recovery",
    ],
    idealFor:
      "Paddle Retain is for businesses willing to migrate their entire billing stack to Paddle as merchant-of-record. DunningDog is for Stripe-based businesses that want powerful dunning without changing their payment infrastructure or paying a revenue percentage.",
  },

  gravy: {
    slug: "gravy",
    name: "Gravy Solutions",
    tagline: "Human-driven payment recovery with dedicated agents",
    description:
      "Gravy Solutions uses dedicated human recovery agents to contact customers about failed payments via phone and email. They position themselves as a high-touch, enterprise-grade recovery service.",
    priceRange: "Custom pricing (enterprise only)",
    pricingModel: "Custom flat fee or percentage of recovered revenue",
    founded: "2017",
    features: [
      { name: "Automated dunning emails", dunningdog: true, competitor: "Human-sent" },
      { name: "Pre-dunning (card expiry alerts)", dunningdog: true, competitor: false },
      { name: "24/7 automated recovery", dunningdog: true, competitor: false },
      { name: "Custom email sequences", dunningdog: true, competitor: "Agent-managed" },
      { name: "Phone call recovery", dunningdog: false, competitor: true },
      { name: "Dedicated account manager", dunningdog: false, competitor: true },
      { name: "Slack/Discord alerts", dunningdog: true, competitor: false },
      { name: "One-click Stripe setup", dunningdog: true, competitor: false },
      { name: "Self-service dashboard", dunningdog: true, competitor: false },
      { name: "REST API access", dunningdog: true, competitor: false },
      { name: "Instant activation", dunningdog: true, competitor: false },
      { name: "Flat-rate pricing (no take rate)", dunningdog: true, competitor: false },
      { name: "Free trial (no credit card)", dunningdog: true, competitor: false },
      { name: "Soft/hard decline classification", dunningdog: true, competitor: false },
      { name: "No long-term contracts", dunningdog: true, competitor: false },
      { name: "Transparent reporting", dunningdog: true, competitor: "Monthly reports" },
    ],
    prosCompetitor: [
      "Human agents can handle complex recovery conversations",
      "Phone outreach for high-value invoices",
      "Dedicated account manager",
      "White-glove enterprise service",
    ],
    consCompetitor: [
      "Enterprise-only with custom (expensive) pricing",
      "No self-service — requires sales process and contracts",
      "Slow activation (days/weeks vs minutes)",
      "Recovery depends on agent availability (business hours)",
      "No real-time dashboard or API access",
      "No pre-dunning prevention",
      "Typically takes a cut of recovered revenue",
    ],
    whyDunningDog: [
      "Instant setup: Start recovering in 5 minutes, not weeks",
      "24/7 automated recovery — doesn't depend on business hours",
      "Predictable $49/mo flat rate vs expensive custom contracts",
      "Self-service: Full dashboard, API, and real-time alerts",
      "Pre-dunning prevents failures before they happen",
      "No sales call, no contracts — just sign up and go",
    ],
    idealFor:
      "Gravy is designed for large enterprises ($500k+ MRR) that want human-touch recovery and can afford custom pricing. DunningDog is for SaaS founders who want instant, automated, affordable recovery that runs 24/7 without human intervention.",
  },

  "stripe-smart-retries": {
    slug: "stripe-smart-retries",
    name: "Stripe Smart Retries",
    tagline: "Stripe's built-in automatic payment retry logic",
    description:
      "Stripe Smart Retries is Stripe's built-in feature that automatically retries failed payments using ML to optimize timing. It's free and enabled by default, but limited in customization and customer communication.",
    priceRange: "Free (included with Stripe)",
    pricingModel: "Included in Stripe's standard processing fees",
    founded: "2018 (feature launch)",
    features: [
      { name: "Automated payment retries", dunningdog: "Via Stripe", competitor: true },
      { name: "Dunning email sequences", dunningdog: true, competitor: false },
      { name: "Pre-dunning (card expiry alerts)", dunningdog: true, competitor: false },
      { name: "ML-optimized retry timing", dunningdog: "Via Stripe", competitor: true },
      { name: "Custom email sequences", dunningdog: true, competitor: false },
      { name: "Branded recovery emails", dunningdog: true, competitor: false },
      { name: "Slack/Discord alerts", dunningdog: true, competitor: false },
      { name: "Recovery dashboard & analytics", dunningdog: true, competitor: false },
      { name: "REST API access", dunningdog: true, competitor: false },
      { name: "CSV export", dunningdog: true, competitor: false },
      { name: "Soft/hard decline classification", dunningdog: true, competitor: false },
      { name: "Payment update page", dunningdog: true, competitor: false },
      { name: "Customer communication", dunningdog: true, competitor: false },
      { name: "Recovery rate tracking", dunningdog: true, competitor: false },
      { name: "Configurable timing", dunningdog: true, competitor: "Limited" },
      { name: "No additional cost", dunningdog: false, competitor: true },
    ],
    prosCompetitor: [
      "Completely free — included with Stripe",
      "ML-optimized retry timing across Stripe's network",
      "Zero setup — automatically enabled",
      "No additional vendor to manage",
    ],
    consCompetitor: [
      "No customer email communication whatsoever",
      "Customers don't know their payment failed",
      "No branded recovery experience",
      "No visibility into recovery performance",
      "No pre-dunning for expiring cards",
      "Limited retry customization (schedule only)",
      "Recovers ~15-25% of failures vs 50-70% with dunning emails",
      "No way to prompt customers to update payment methods",
    ],
    whyDunningDog: [
      "DunningDog complements Stripe Smart Retries — use both together",
      "Adds customer communication: branded emails with payment update links",
      "Pre-dunning catches expiring cards before they fail",
      "2-3x higher recovery rates: 50-70% vs Stripe's ~15-25% alone",
      "Full visibility: dashboard, analytics, and CSV export",
      "Slack/Discord alerts keep you informed in real-time",
    ],
    idealFor:
      "Stripe Smart Retries is great as a baseline — and you should keep it enabled. But it only handles the retry side. DunningDog adds the critical customer communication layer that turns a 15-25% recovery rate into 50-70%. They work best together.",
  },
};

export const DUNNINGDOG_PRICING = {
  starter: { monthly: 49, annual: 41, mrrCap: "$10k" },
  pro: { monthly: 149, annual: 125, mrrCap: "$50k" },
  scale: { monthly: 199, annual: 169, mrrCap: "$200k" },
};
