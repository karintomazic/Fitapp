import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon, GITHUB_URL, GitHubIcon, PrimaryButton } from "../ui";
import { SyncKeyGenerator, TimeZoneHint } from "./SetupTools";

// The step-by-step guide behind the "Get your own Fitapp" button. Public like
// /welcome (the proxy skips everything under /welcome), and static.

// The iCloud link to the shared Apple Shortcut, without anyone's address or key.
// TODO: paste the link here once the Shortcut is shared from the iPhone.
const SHORTCUT_URL = "";

// Vercel's "clone" link: it copies the repo into the visitor's GitHub account
// and asks for these settings before the first deploy.
const DEPLOY_URL = `https://vercel.com/new/clone?${new URLSearchParams({
  "repository-url": GITHUB_URL,
  "project-name": "fitapp",
  "repository-name": "fitapp",
  env: "DATABASE_URL,APP_PASSWORD,HEALTH_SYNC_TOKEN,TIMEZONE",
  envDescription: "Your database, your password, your sync key and your time zone.",
  envLink: "https://fitapp-sepia-pi.vercel.app/welcome/setup#deploy",
})}`;

export const metadata: Metadata = {
  title: "Set up your own Fitapp",
  description:
    "Step by step: a free database, your own copy on Vercel, and the Apple Shortcut that syncs your Apple Watch every night.",
};

const SETTINGS: { name: string; value: React.ReactNode }[] = [
  {
    name: "DATABASE_URL",
    value: "The connection string from Neon (step 1).",
  },
  {
    name: "APP_PASSWORD",
    value: "A password you choose. You type it once on your phone to log in.",
  },
  {
    name: "HEALTH_SYNC_TOKEN",
    value: "Your sync key (step 2).",
  },
  {
    name: "TIMEZONE",
    value: (
      <>
        Your time zone, like <code className="font-mono">Europe/London</code>. It decides when
        your day starts.
        <TimeZoneHint />
      </>
    ),
  },
];

const TROUBLE = [
  {
    q: "The Shortcut says “Unauthorized”",
    a: "The sync key in the Shortcut doesn't match HEALTH_SYNC_TOKEN in Vercel. Check for a missing character or an extra space. If you change it in Vercel, redeploy (see below).",
  },
  {
    q: "Burned calories show 0",
    a: "The Shortcut can't read your Health data. On your iPhone open Settings → Health → Data Access & Devices → Shortcuts, and turn on Active Energy and Resting Energy. The Watch also only counts while you wear it.",
  },
  {
    q: "The deploy failed with “isn't a valid time zone”",
    a: "TIMEZONE has a typo. Fix it in Vercel under Settings → Environment Variables, then redeploy.",
  },
  {
    q: "I forgot my password",
    a: "Set a new APP_PASSWORD in Vercel under Settings → Environment Variables, then redeploy.",
  },
  {
    q: "How do I redeploy?",
    a: "Vercel only reads changed settings on a new deploy. Open your project in Vercel, go to Deployments, tap ⋯ next to the newest one and choose Redeploy.",
  },
];

export default function Setup() {
  return (
    <main className="mx-auto flex w-full max-w-[848px] flex-1 flex-col gap-12 px-4 pt-[calc(env(safe-area-inset-top)+20px)] pb-12 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Link href="/welcome" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Image src="/icon-192.png" alt="" width={28} height={28} className="rounded-lg" />
          Fitapp
        </Link>
        <Link href="/login" className="glass-pill px-4 py-2 text-sm font-semibold text-mint-ink">
          Log in
        </Link>
      </header>

      <div className="flex flex-col gap-4">
        <p className="eyebrow">Setup guide</p>
        <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
          Get your own Fitapp
        </h1>
        <p className="max-w-[600px] text-base leading-relaxed text-foreground/75">
          Six steps, about 15 minutes. Do steps 1 to 3 on a computer, and the rest on your
          iPhone. Everything you sign up for is free.
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {["iPhone and Apple Watch", "GitHub account", "Vercel account", "Neon account"].map((need) => (
            <li key={need} className="glass-pill flex items-center gap-2 px-4 py-2 text-sm font-medium">
              <CheckIcon />
              {need}
            </li>
          ))}
        </ul>
      </div>

      <ol className="flex flex-col gap-4">
        <Step n={1} id="database" title="Create your database">
          <p>
            Your data lives in a free Postgres database on Neon, in your own account.
          </p>
          <List>
            <li>
              Sign up at
              <a href="https://neon.tech" className="font-semibold text-mint-ink hover:underline">
                neon.tech
              </a>
              and create a project. Call it Fitapp and pick the region closest to you.
            </li>
            <li>
              On the project dashboard, click <b>Connect</b> and copy the connection string. It
              starts with <code className="font-mono">postgresql://</code>.
            </li>
            <li>Keep it handy. You&apos;ll paste it in step 3.</li>
          </List>
        </Step>

        <Step n={2} id="sync-key" title="Make your sync key">
          <p>
            The Apple Shortcut sends this secret key with your Watch data, so only your iPhone
            can write to your Fitapp. The key is made in your browser and never leaves it.
          </p>
          <SyncKeyGenerator />
          <p className="text-sm text-foreground/70">
            Save it somewhere safe, like your password manager. You need it in step 3 and step 5.
          </p>
        </Step>

        <Step n={3} id="deploy" title="Deploy your copy">
          <p>
            Vercel copies Fitapp into your GitHub account and runs it for you. On the first
            deploy it also creates the tables in your database.
          </p>
          <div className="self-start">
            <PrimaryButton href={DEPLOY_URL}>Deploy to Vercel</PrimaryButton>
          </div>
          <List>
            <li>Sign in with GitHub. If you don&apos;t have an account yet, you can make one there.</li>
            <li>Click <b>Create</b> to make your copy of the code.</li>
            <li>Fill in the four settings below, then click <b>Deploy</b>.</li>
          </List>
          <dl className="flex flex-col gap-2">
            {SETTINGS.map((s) => (
              <div key={s.name} className="rounded-2xl bg-glass-strong px-4 py-3">
                <dt className="font-mono text-sm font-semibold">{s.name}</dt>
                <dd className="mt-0.5 text-sm text-foreground/75">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p>
            It takes about two minutes. When it&apos;s done, Vercel shows your address, something
            like <code className="font-mono">fitapp-yourname.vercel.app</code>. Copy it.
          </p>
        </Step>

        <Step n={4} id="home-screen" title="Add it to your home screen">
          <List>
            <li>
              On your iPhone, open your address in <b>Safari</b>. Chrome can&apos;t add apps to the
              home screen.
            </li>
            <li>Log in with your APP_PASSWORD.</li>
            <li>
              Tap <b>Share</b>, then <b>Add to Home Screen</b>. Fitapp now opens full screen, like
              an app.
            </li>
          </List>
        </Step>

        <Step n={5} id="shortcut" title="Add the Apple Shortcut">
          <p>The Shortcut reads today&apos;s calories from Apple Health and sends them to your Fitapp.</p>
          {SHORTCUT_URL ? (
            <div className="self-start">
              <PrimaryButton href={SHORTCUT_URL}>Get the Shortcut</PrimaryButton>
            </div>
          ) : (
            <p className="glass-pill self-start px-4 py-2 text-sm font-semibold text-foreground/70">
              Shortcut link coming soon
            </p>
          )}
          <List>
            <li>
              Open the link on your iPhone and tap <b>Add Shortcut</b>.
            </li>
            <li>
              It asks two questions: your Fitapp address (like
              <code className="font-mono">https://fitapp-yourname.vercel.app</code>) and your sync
              key.
            </li>
            <li>
              Open the Shortcuts app and tap <b>Fitapp Sync</b> once. Allow access to Health when
              it asks.
            </li>
            <li>Open Fitapp. Your burned calories for today should be there.</li>
          </List>
        </Step>

        <Step n={6} id="automation" title="Sync every night">
          <p>Last step: make the Shortcut run on its own.</p>
          <List>
            <li>
              In the Shortcuts app, open <b>Automation</b> and tap <b>+</b>.
            </li>
            <li>
              Choose <b>Time of Day</b>, set it to <b>23:00</b> and <b>Daily</b>.
            </li>
            <li>
              Choose <b>Run Immediately</b>, so it doesn&apos;t ask you first.
            </li>
            <li>
              Pick <b>Fitapp Sync</b> and tap <b>Done</b>.
            </li>
          </List>
          <p className="text-sm text-foreground/70">
            You can still tap the Shortcut any time during the day to sync right away.
          </p>
        </Step>
      </ol>

      <section aria-labelledby="trouble-title" className="flex flex-col gap-4">
        <div>
          <p className="eyebrow">Troubleshooting</p>
          <h2 id="trouble-title" className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
            Something not working?
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {TROUBLE.map((item) => (
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
        <Link href="/welcome" className="font-semibold text-mint-ink hover:underline">
          ← Back to Fitapp
        </Link>
        <a href={GITHUB_URL} className="flex items-center gap-2 font-semibold text-mint-ink hover:underline">
          <GitHubIcon />
          Source on GitHub
        </a>
      </footer>
    </main>
  );
}

function Step({
  n,
  id,
  title,
  children,
}: {
  n: number;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li id={id} className="glass flex scroll-mt-8 gap-4 rounded-3xl p-5 sm:gap-5 sm:p-7">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-ink font-display text-base font-semibold text-white dark:text-background"
      >
        {n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3 text-base leading-relaxed text-foreground/85">
        <h2 className="pt-1 font-display text-xl font-semibold text-foreground">
          {title}
        </h2>
        {children}
      </div>
    </li>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-mint-ink">{children}</ul>;
}
