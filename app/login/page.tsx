import { login } from "./actions";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams.error;

  let message = null;
  if (error === "wrong") {
    message = "That password isn't right. Try again.";
  } else if (error === "setup") {
    message = "No password is set up yet. Add APP_PASSWORD to the environment variables.";
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-5 px-4 py-12">
      <div>
        <h1 className="font-display text-3xl font-semibold">Fitapp</h1>
        <p className="mt-1 text-sm text-muted">Enter your password to continue.</p>
      </div>

      {message && (
        <p className="rounded-2xl bg-peach/15 px-4 py-3 text-sm font-medium text-peach-ink">
          {message}
        </p>
      )}

      <form action={login} className="glass flex flex-col gap-3 rounded-3xl p-4">
        <label className="flex flex-col gap-1">
          <span className="eyebrow">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="field w-full"
          />
        </label>
        <button type="submit" className="btn-primary">
          Log in
        </button>
      </form>
    </div>
  );
}
