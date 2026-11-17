import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import screenshot from "@/docs/screenshot.png";
import calendarShot from "@/docs/screens/calendar.png";
import historyShot from "@/docs/screens/history.png";
import weightShot from "@/docs/screens/weight.png";
import { CheckIcon, GITHUB_URL, GitHubIcon, PrimaryButton } from "./ui";

// Public landing page for people who want their own Fitapp. The proxy lets
// everyone see it without the password. It has no database calls, so
// Next.js builds it once as a static page.

const SETUP_URL = "/welcome/setup";

export const metadata: Metadata = {
  title: "Fitapp: see your real calorie deficit",
  description:
    "Fitapp puts what your Apple Watch burned next to what you ate, so you see your real calorie deficit every day. Free, open source, and your data stays in your own database.",
};

// An example day for the equation in "the problem" section.
const EXAMPLE_DAY = { active: 512, resting: 1478, eaten: 1602 };

const STEPS = [
  {
    title: "Wear your Apple Watch",
    text: "Nothing new to learn. Your Watch already records the calories you burn, moving and resting.",
  },
  {
    title: "It syncs every night",
    text: "An Apple Shortcut sends your day to Fitapp at 23:00. Once it's set up, it runs on its own.",
  },
  {
    title: "Log what you eat",
    text: "Save a food once with its values per 100 g, then log it by grams for breakfast, lunch or dinner.",
  },
];

// Screens without an image show a placeholder until the screenshot is added.
const SCREENS: { title: string; text: string; image: StaticImageData | null }[] = [
  {
    title: "Today",
    text: "Burned, eaten and what's left, with your carbs, protein and fat.",
    image: screenshot,
  },
  {
    title: "Calendar",
    text: "Tap any day to see what you ate and burned.",
    image: calendarShot,
  },
  {
    title: "History",
    text: "Every meal of the month, plus month-by-month totals.",
    image: historyShot,
  },
  {
    title: "Weight",
    text: "Morning and evening weigh-ins, side by side.",
    image: weightShot,
  },
];

const EXTRAS = ["Light and dark mode", "Installs on your home screen", "Daily goals you set yourself"];

const PRIVACY = [
  {
    title: "Your own copy",
    text: "Fitapp runs on your own free Vercel account. There's no shared server and no sign-up with me.",
  },
  {
    title: "Your own database",
    text: "Your meals, weight and Apple Watch data are stored in your own free Neon database.",
  },
  {
    title: "No ads, no tracking",
    text: "No analytics, no ads and nothing is sold. Nobody sees your data but you.",
  },
  {
    title: "Locked with your password",
    text: "Only you can open your Fitapp. The Watch sync has its own secret key.",
  },
];

const NEEDS = [
  "An iPhone and an Apple Watch",
  "A free GitHub account (it keeps your copy of the code)",
  "A free Vercel account (it runs the app)",
  "A free Neon account (it stores your data)",
  "About 15 minutes",
];

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. Fitapp is free and open source, and the free plans of Vercel and Neon are more than enough for one person.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. You'll copy a few settings from one website to another, and the setup guide walks you through every step.",
  },
  {
    q: "Is it in the App Store?",
    a: "No. It's a web app you add to your home screen from Safari. It then opens full screen, just like an app.",
  },
  {
    q: "Why don't the numbers update live?",
    a: "Apple Health data stays on your iPhone, so the Shortcut sends it to Fitapp once a night. You can also tap the Shortcut any time to sync right away.",
  },
  {
    q: "Can I use it without an Apple Watch?",
    a: "You can still log food and follow your calories and macros, but burned calories will show 0. The deficit needs the Watch.",
  },
  {
    q: "Does it work on Android?",
    a: "Not the Watch sync. It uses Apple Health and Apple Shortcuts, which only exist on iPhone. Food logging works in any browser.",
  },
];

export default function Welcome() {
  // max width 1168px = 1120px of content + 24px padding on each side (sm:px-6)
  return (
    <main className="mx-auto flex w-full max-w-[1168px] flex-1 flex-col gap-24 px-4 pt-[calc(env(safe-area-inset-top)+20px)] pb-12 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-display text-lg font-semibold">
          <Image src="/icon-192.png" alt="" width={28} height={28} className="rounded-lg" />
          Fitapp
        </span>
        <nav aria-label="Main" className="flex items-center gap-6 text-sm font-medium">
          {/* the text links only fit next to each other from tablet width up */}
          <a href="#how-it-works" className="hidden text-foreground/75 hover:text-foreground sm:block">
            How it works
          </a>
          <a href="#privacy" className="hidden text-foreground/75 hover:text-foreground sm:block">
            Privacy
          </a>
          <a href="#faq" className="hidden text-foreground/75 hover:text-foreground sm:block">
            FAQ
          </a>
          <Link href="/login" className="glass-pill px-4 py-2 font-semibold text-mint-ink">
            Log in
          </Link>
        </nav>
      </header>

      {/* Hero. isolate keeps the blurry glow circles (-z-10) inside this
          section, so they sit behind the text but above the page gradient. */}
      <section className="relative isolate -mt-12 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-6">
        {/* only from tablet width up: on a phone the glow gets clipped into a visible box */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden md:block">
          <div className="absolute top-10 right-0 size-[480px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--mint)_28%,transparent),transparent_70%)]" />
          <div className="absolute right-1/4 bottom-0 size-[380px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--peach)_24%,transparent),transparent_70%)]" />
        </div>

        <div className="flex flex-col items-start gap-5">
          <span className="glass-pill flex items-center gap-2 px-3 py-1 text-xs font-semibold text-mint-ink">
            <span aria-hidden className="size-2 rounded-full bg-mint" />
            Free for iPhone and Apple Watch
          </span>

          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-[64px]">
            Calories in,
            <br />
            calories out,
            <br />
            <span className="text-mint-ink">at a glance.</span>
          </h1>

          <p className="max-w-[500px] text-base leading-relaxed text-foreground/75 lg:text-[17px]">
            Fitapp puts what your Apple Watch burned next to what you ate, so you see
            your real calorie deficit every day. Your own copy, your own data.
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <PrimaryButton href="#get-started">Get your own Fitapp</PrimaryButton>
            <a href="#how-it-works" className="glass-pill px-5 py-3 text-sm font-semibold">
              How it works
            </a>
          </div>

          <p className="text-xs text-foreground/70">Free · No ads · Your data stays yours</p>
        </div>

        <HeroPhone />
      </section>

      {/* The problem */}
      <section aria-labelledby="why-title" className="flex flex-col items-center gap-8 text-center">
        <SectionTitle id="why-title" eyebrow="Why Fitapp" center>
          Your Move ring only tells half the story
        </SectionTitle>
        <p className="max-w-[640px] text-base leading-relaxed text-foreground/75">
          The Move ring counts only the calories you burn by moving. Your body burns
          far more just by being alive. Food apps don&apos;t know either number, so they
          guess. Fitapp adds both from your Watch and subtracts what you ate.
        </p>

        <div
          role="img"
          aria-label={`Example day: ${EXAMPLE_DAY.active} active plus ${EXAMPLE_DAY.resting} resting, minus ${EXAMPLE_DAY.eaten} eaten, equals a deficit of ${EXAMPLE_DAY.active + EXAMPLE_DAY.resting - EXAMPLE_DAY.eaten} kcal`}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          <EquationTile label="Active" value={EXAMPLE_DAY.active} />
          <Operator>+</Operator>
          <EquationTile label="Resting" value={EXAMPLE_DAY.resting} />
          <Operator>−</Operator>
          <EquationTile label="Eaten" value={EXAMPLE_DAY.eaten} tone="text-peach-ink" />
          <Operator>=</Operator>
          <EquationTile
            label="Deficit"
            value={EXAMPLE_DAY.active + EXAMPLE_DAY.resting - EXAMPLE_DAY.eaten}
            tone="text-mint-ink"
            highlight
          />
        </div>
        <p className="-mt-4 text-xs text-foreground/70">An example day, in kcal</p>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-it-works-title" id="how-it-works" className="scroll-mt-8">
        <SectionTitle id="how-it-works-title" eyebrow="How it works">
          Three steps, and two of them are automatic
        </SectionTitle>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="glass flex flex-col gap-3 rounded-3xl p-6">
              <span className="flex size-9 items-center justify-center rounded-full bg-mint-ink font-display text-base font-semibold text-white dark:text-background">
                {i + 1}
              </span>
              <h3 className="font-display text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-foreground/75">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Screens */}
      <section aria-labelledby="screens-title" id="screens" className="scroll-mt-8">
        <SectionTitle id="screens-title" eyebrow="Inside the app">
          Everything you need, nothing you don&apos;t
        </SectionTitle>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {SCREENS.map((s) => (
            <li key={s.title} className="flex flex-col gap-3">
              <PhoneShot image={s.image} title={s.title} />
              <div className="px-1">
                <h3 className="font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <ul className="mt-8 flex flex-wrap gap-2">
          {EXTRAS.map((extra) => (
            <li key={extra} className="glass-pill flex items-center gap-2 px-4 py-2 text-sm font-medium">
              <CheckIcon />
              {extra}
            </li>
          ))}
        </ul>
      </section>

      {/* Privacy */}
      <section
        aria-labelledby="privacy-title"
        id="privacy"
        className="scroll-mt-8 rounded-[2rem] bg-[#23332d] px-6 py-10 text-[#eaf3ef] sm:px-10 sm:py-12 dark:bg-white/8"
      >
        <p className="text-[10.5px] font-semibold tracking-[0.06em] text-[#8fe0c7] uppercase">
          Privacy
        </p>
        <h2 id="privacy-title" className="mt-1 max-w-[560px] font-display text-2xl font-semibold sm:text-3xl">
          Your health data, in your own database
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVACY.map((p) => (
            <li key={p.title} className="flex flex-col gap-2">
              <LockIcon />
              <h3 className="font-display text-base font-semibold">{p.title}</h3>
              <p className="text-sm leading-relaxed text-[#b8cbc3]">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* What you need + call to action */}
      <section
        aria-labelledby="get-started-title"
        id="get-started"
        className="glass grid scroll-mt-8 gap-8 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-2 lg:items-center"
      >
        <div className="flex flex-col items-start gap-4">
          <SectionTitle id="get-started-title" eyebrow="Get started">
            Ready to see your real deficit?
          </SectionTitle>
          <p className="max-w-[460px] text-base leading-relaxed text-foreground/75">
            Set up your own Fitapp once, and it takes care of itself after that. The
            setup guide walks you through every step.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <PrimaryButton href={SETUP_URL}>Get your own Fitapp</PrimaryButton>
            <Link href="/login" className="text-sm font-semibold text-mint-ink hover:underline">
              Already set up? Log in
            </Link>
          </div>
        </div>

        <div>
          <p className="eyebrow">What you need</p>
          <ul className="mt-3 flex flex-col gap-2">
            {NEEDS.map((need) => (
              <li
                key={need}
                className="flex items-center gap-3 rounded-2xl bg-glass-strong px-4 py-3 text-sm font-medium"
              >
                <CheckIcon />
                {need}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" id="faq" className="scroll-mt-8">
        <SectionTitle id="faq-title" eyebrow="FAQ">
          Questions you might have
        </SectionTitle>
        <div className="mt-8 grid gap-3 md:grid-cols-2 md:items-start">
          {FAQ.map((item) => (
            <details key={item.q} className="group glass rounded-3xl px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint-ink transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-track pt-6 text-sm text-foreground/70">
        <p>Fitapp is free and open source. Made by Karin.</p>
        <a href={GITHUB_URL} className="flex items-center gap-2 font-semibold text-mint-ink hover:underline">
          <GitHubIcon />
          Source on GitHub
        </a>
      </footer>
    </main>
  );
}

// The tilted phone with small glass cards floating around it. The cards are
// examples of what the app shows, not live data (this page never reads the database).
function HeroPhone() {
  return (
    <div className="relative mx-auto h-[470px] w-full max-w-[360px] sm:h-[540px] lg:max-w-[520px]">
      <div className="glass absolute top-0 left-1/2 w-[220px] -translate-x-1/2 rotate-3 rounded-[38px] p-2 shadow-[0_30px_60px_-20px_var(--shadow)] sm:w-[255px]">
        <Image
          src={screenshot}
          alt="Fitapp's Today screen: calories eaten against the daily goal, a week strip, and carbs, protein and fat rings"
          sizes="255px"
          priority
          className="rounded-[31px]"
        />
      </div>

      <FloatingCard className="top-28 left-0 flex-col gap-0.5 lg:left-6">
        <span className="eyebrow">Deficit today</span>
        <span className="font-display text-2xl font-semibold text-mint-ink">412 kcal</span>
      </FloatingCard>

      <FloatingCard className="top-64 right-0 items-center gap-2.5 lg:right-4">
        <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
          <circle cx="20" cy="20" r="15" fill="none" stroke="var(--track)" strokeWidth="5" />
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="none"
            stroke="var(--peach)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="62 95"
            transform="rotate(-90 20 20)"
          />
        </svg>
        <span className="flex flex-col">
          <span className="eyebrow">Protein</span>
          <span className="font-display text-base font-semibold">65g of 100g</span>
        </span>
      </FloatingCard>

      <FloatingCard className="bottom-8 left-2 items-center gap-2 rounded-full! px-3.5 py-2.5 text-[13px] font-semibold sm:bottom-12 sm:left-6">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--mint-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
        Apple Watch synced at 23:00
      </FloatingCard>
    </div>
  );
}

function FloatingCard({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`glass-bar absolute flex rounded-[20px] px-4 py-3 shadow-[0_14px_30px_-12px_var(--shadow)] ${className}`}
    >
      {children}
    </div>
  );
}

// One screen in the "Inside the app" tour, in a glass phone frame.
// The 1170 / 2532 ratio is the size of an iPhone screenshot.
function PhoneShot({ image, title }: { image: StaticImageData | null; title: string }) {
  return (
    <div className="glass rounded-[28px] p-1.5 shadow-[0_20px_40px_-20px_var(--shadow)]">
      {image ? (
        <Image
          src={image}
          alt={`Fitapp's ${title} screen`}
          sizes="(min-width: 1024px) 270px, 45vw"
          className="rounded-[22px]"
        />
      ) : (
        <div className="flex aspect-[1170/2532] items-center justify-center rounded-[22px] bg-glass-strong text-center text-xs text-foreground/60">
          {title} screenshot
          <br />
          coming soon
        </div>
      )}
    </div>
  );
}

function EquationTile({
  label,
  value,
  tone,
  highlight,
}: {
  label: string;
  value: number;
  tone?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex min-w-[96px] flex-col items-center gap-0.5 rounded-3xl px-4 py-3 sm:min-w-[120px] sm:px-5 sm:py-4 ${
        highlight ? "glass-bar ring-2 ring-mint/40" : "glass"
      }`}
    >
      <span className="eyebrow">{label}</span>
      <span className={`font-display text-2xl font-semibold tabular-nums sm:text-3xl ${tone ?? ""}`}>
        {value.toLocaleString("en")}
      </span>
    </div>
  );
}

function Operator({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden className="font-display text-2xl font-semibold text-foreground/50">
      {children}
    </span>
  );
}

function SectionTitle({
  id,
  eyebrow,
  center,
  children,
}: {
  id: string;
  eyebrow: string;
  center?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={center ? "flex flex-col items-center" : undefined}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-1 max-w-[640px] font-display text-2xl font-semibold text-balance sm:text-3xl">
        {children}
      </h2>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="#8fe0c7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="10" width="16" height="11" rx="3" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
