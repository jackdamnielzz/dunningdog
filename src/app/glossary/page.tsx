import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Recovery & Dunning Glossary | DunningDog",
  description:
    "Learn the key terms behind dunning, payment recovery, and SaaS subscription billing. From decline codes to involuntary churn, understand every concept that impacts your recurring revenue.",
};

interface GlossaryTerm {
  name: string;
  slug: string;
  definition: string;
  link?: { label: string; href: string };
}

const glossaryTerms: GlossaryTerm[] = [
  {
    name: "Account Updater",
    slug: "account-updater",
    definition:
      "A card network service (offered by Visa and Mastercard) that automatically updates expired or replaced card details on file. Account updater reduces involuntary churn by ensuring recurring charges continue to process even when a customer receives a new card number or expiration date.",
  },
  {
    name: "Annual Recurring Revenue (ARR)",
    slug: "annual-recurring-revenue",
    definition:
      "The total predictable revenue a subscription business expects to earn over a twelve-month period. ARR is calculated by multiplying MRR by 12 and is a key metric investors and operators use to gauge business health and growth trajectory.",
  },
  {
    name: "Card Decline",
    slug: "card-decline",
    definition:
      "When a payment processor or issuing bank rejects a charge attempt on a credit or debit card. Declines can be soft (temporary) or hard (permanent) and are accompanied by a decline code that explains the reason for rejection.",
  },
  {
    name: "Churn Rate",
    slug: "churn-rate",
    definition:
      "The percentage of subscribers who stop paying for a service within a given period. Churn rate includes both voluntary churn (intentional cancellations) and involuntary churn (failed payments). Reducing churn is critical for sustainable SaaS growth.",
  },
  {
    name: "Decline Code",
    slug: "decline-code",
    definition:
      "A specific alphanumeric code returned by the card network or issuing bank that explains why a payment was rejected. Common decline codes include 'insufficient_funds', 'card_expired', and 'do_not_honor'. Understanding decline codes helps tailor the right recovery strategy for each failure.",
  },
  {
    name: "Dunning",
    slug: "dunning",
    definition:
      "The process of systematically communicating with customers whose payments have failed in order to recover the outstanding revenue. Dunning typically involves a sequence of emails, in-app notifications, and payment retry attempts spaced over days or weeks.",
    link: { label: "How DunningDog automates dunning", href: "/" },
  },
  {
    name: "Failed Payment",
    slug: "failed-payment",
    definition:
      "A subscription charge that was rejected by the payment processor, issuing bank, or card network. Failed payments are the primary cause of involuntary churn and can result from expired cards, insufficient funds, fraud flags, or network errors.",
    link: {
      label: "Recover failed payments automatically",
      href: "/solutions/involuntary-churn",
    },
  },
  {
    name: "Hard Decline",
    slug: "hard-decline",
    definition:
      "A permanent payment failure where the issuing bank definitively refuses the transaction. Common reasons include a stolen or lost card, a closed account, or a card flagged for fraud. Hard declines should not be retried automatically; instead, the customer must update their payment method.",
  },
  {
    name: "Involuntary Churn",
    slug: "involuntary-churn",
    definition:
      "Customer loss that occurs because of a payment failure rather than an intentional decision to cancel. Involuntary churn is responsible for 20-40% of total churn in most SaaS businesses and is largely preventable with proper dunning and payment recovery processes.",
    link: {
      label: "Eliminate involuntary churn",
      href: "/solutions/involuntary-churn",
    },
  },
  {
    name: "MRR (Monthly Recurring Revenue)",
    slug: "monthly-recurring-revenue",
    definition:
      "The total predictable revenue a subscription business earns each month from active subscribers. MRR is the foundational metric for SaaS businesses and is directly impacted by churn, expansion revenue, and payment recovery performance.",
  },
  {
    name: "Net Revenue Retention",
    slug: "net-revenue-retention",
    definition:
      "A metric that measures the percentage of recurring revenue retained from existing customers over a period, accounting for expansion (upgrades), contraction (downgrades), and churn. An NRR above 100% indicates a business is growing revenue from its existing customer base even before acquiring new customers.",
  },
  {
    name: "Payment Recovery",
    slug: "payment-recovery",
    definition:
      "The end-to-end process of recovering revenue lost to failed subscription payments. Payment recovery encompasses dunning emails, smart retries, payment method update prompts, and pre-dunning outreach. Effective recovery can reclaim 50-70% of failed payment revenue.",
    link: { label: "See DunningDog recovery rates", href: "/" },
  },
  {
    name: "Payment Retry",
    slug: "payment-retry",
    definition:
      "The act of automatically re-attempting a failed payment charge after a period of time. Retry timing matters: retrying too soon after a soft decline wastes attempts, while waiting too long risks the subscription being canceled. Optimized retry schedules can significantly improve recovery rates.",
  },
  {
    name: "Pre-Dunning",
    slug: "pre-dunning",
    definition:
      "The practice of proactively contacting customers before a payment failure occurs. Pre-dunning typically involves notifying customers about expiring cards, insufficient balance warnings, or upcoming renewal reminders so they can update their payment details in advance.",
    link: {
      label: "Set up pre-dunning with DunningDog",
      href: "/solutions/pre-dunning",
    },
  },
  {
    name: "Recovery Rate",
    slug: "recovery-rate",
    definition:
      "The percentage of failed payments that are successfully collected after the initial charge attempt fails. Recovery rate is the primary performance metric for any dunning system. Industry benchmarks range from 30-50% without optimization and 50-70% or higher with dedicated recovery tooling.",
  },
  {
    name: "Revenue Leakage",
    slug: "revenue-leakage",
    definition:
      "Revenue that is lost due to billing failures, process gaps, or configuration errors rather than customer intent. In subscription businesses, the most common source of revenue leakage is failed payments that go unrecovered, but it can also include pricing errors, missed upgrades, or uncollected overages.",
  },
  {
    name: "Smart Retries",
    slug: "smart-retries",
    definition:
      "An approach to payment retry scheduling that uses data analysis or machine learning to determine the optimal time to re-attempt a failed charge. Smart retries consider factors like the decline code, day of week, time of day, and historical success rates to maximize the probability of a successful charge.",
  },
  {
    name: "Soft Decline",
    slug: "soft-decline",
    definition:
      "A temporary payment failure where the charge might succeed if retried later. Common causes include insufficient funds, temporary holds, or generic processing errors. Soft declines are the most recoverable type of failed payment and benefit significantly from well-timed retry strategies.",
  },
  {
    name: "Subscription Billing",
    slug: "subscription-billing",
    definition:
      "A recurring payment model where customers are charged at regular intervals (monthly, annually, etc.) for ongoing access to a product or service. Subscription billing requires infrastructure for plan management, proration, invoicing, tax calculation, and crucially, handling payment failures through dunning.",
  },
  {
    name: "Voluntary Churn",
    slug: "voluntary-churn",
    definition:
      "Customer loss that occurs when a subscriber intentionally decides to cancel their subscription. Unlike involuntary churn, voluntary churn reflects a deliberate choice driven by factors like dissatisfaction, budget constraints, or switching to a competitor. Reducing voluntary churn requires product and retention strategies rather than payment recovery.",
  },
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getTermsByLetter(): Map<string, GlossaryTerm[]> {
  const map = new Map<string, GlossaryTerm[]>();
  for (const term of glossaryTerms) {
    const letter = term.name[0].toUpperCase();
    const existing = map.get(letter) ?? [];
    existing.push(term);
    map.set(letter, existing);
  }
  return map;
}

const faqItems = [
  {
    question: "What is dunning?",
    answer:
      "Dunning is the process of communicating with customers whose payments have failed in order to recover the outstanding revenue. It typically involves automated email sequences, in-app notifications, and payment retry attempts designed to prompt the customer to update their payment method or resolve the billing issue.",
  },
  {
    question: "What is the difference between hard and soft declines?",
    answer:
      "A soft decline is a temporary payment failure (like insufficient funds) that may succeed if retried later. A hard decline is a permanent failure (like a closed account or stolen card) where the customer must provide a new payment method. Effective dunning systems treat these differently — retrying soft declines and prompting payment updates for hard declines.",
  },
  {
    question: "What is involuntary churn and how can it be prevented?",
    answer:
      "Involuntary churn occurs when customers are lost due to payment failures rather than a deliberate decision to cancel. It accounts for 20-40% of total churn in most SaaS businesses. It can be prevented through dunning emails, smart payment retries, pre-dunning notifications about expiring cards, and providing easy payment update flows.",
  },
  {
    question: "What is a good recovery rate for failed payments?",
    answer:
      "Without dedicated recovery tooling, most businesses recover 30-50% of failed payments through basic retries. With optimized dunning sequences, smart retry timing, and pre-dunning outreach, recovery rates of 50-70% or higher are achievable. The exact rate depends on your customer base, payment methods, and the sophistication of your recovery process.",
  },
  {
    question: "What is pre-dunning?",
    answer:
      "Pre-dunning is the practice of proactively contacting customers before a payment failure occurs. This includes notifying customers about expiring credit cards, sending upcoming renewal reminders, and alerting them to potential billing issues. Pre-dunning is one of the most effective ways to reduce involuntary churn because it prevents failures from happening in the first place.",
  },
];

export default function GlossaryPage() {
  const termsByLetter = getTermsByLetter();
  const activeLetters = new Set(termsByLetter.keys());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Payment Recovery &amp; Dunning Glossary
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600">
            Every term you need to understand dunning, subscription billing, and
            payment recovery. Whether you&apos;re optimizing your churn rate or
            setting up smart retries, this glossary has you covered.
          </p>
        </div>
      </section>

      {/* Alphabet quick-jump */}
      <nav
        aria-label="Alphabet navigation"
        className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-1 px-4 py-3 sm:px-6">
          {alphabet.map((letter) => {
            const isActive = activeLetters.has(letter);
            return isActive ? (
              <a
                key={letter}
                href={`#${letter}`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-accent-700 transition-colors hover:bg-accent-50"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-zinc-300"
              >
                {letter}
              </span>
            );
          })}
        </div>
      </nav>

      {/* Glossary terms */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {alphabet.map((letter) => {
            const terms = termsByLetter.get(letter);
            if (!terms) return null;
            return (
              <div key={letter} id={letter} className="mb-12 scroll-mt-20">
                <h2 className="mb-4 border-b border-zinc-200 pb-2 text-2xl font-bold text-zinc-900">
                  {letter}
                </h2>
                <div className="grid gap-4">
                  {terms.map((term) => (
                    <div
                      key={term.slug}
                      id={term.slug}
                      className="scroll-mt-20 rounded-lg border border-zinc-200 p-5"
                    >
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {term.name}
                      </h3>
                      <p className="mt-2 leading-relaxed text-zinc-600">
                        {term.definition}
                      </p>
                      {term.link && (
                        <a
                          href={term.link.href}
                          className="mt-3 inline-flex items-center text-sm font-medium text-accent-600 hover:text-accent-700"
                        >
                          {term.link.label}
                          <svg
                            className="ml-1 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ section */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-lg border border-zinc-200 bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 font-medium text-zinc-900">
                  {item.question}
                  <svg
                    className="ml-2 h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-zinc-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
