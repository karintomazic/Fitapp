import { getProfile } from "@/lib/goals";
import { ThemeToggle } from "@/components/ThemeToggle";
import { saveProfile } from "../actions";
import { DECIMAL_PATTERN } from "@/lib/parseDecimal";
import { logout } from "../login/actions";

export const dynamic = "force-dynamic";

type SettingsFieldProps = {
  name: string;
  label: string;
  unit?: string;
  defaultValue: string | number | null;
  type?: "text" | "whole" | "decimal";
  required?: boolean;
};

function SettingsField({
  name,
  label,
  unit,
  defaultValue,
  type = "whole",
  required = false,
}: SettingsFieldProps) {
  let inputMode: "numeric" | "decimal" | undefined;
  if (type === "whole") {
    inputMode = "numeric";
  } else if (type === "decimal") {
    inputMode = "decimal";
  }

  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="eyebrow">
        {label}
        {unit && <span className="normal-case"> ({unit})</span>}
      </span>
      <input
        name={name}
        type={type === "whole" ? "number" : "text"}
        inputMode={inputMode}
        pattern={type === "decimal" ? DECIMAL_PATTERN : undefined}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="field w-full"
      />
    </label>
  );
}

export default async function Settings({
  searchParams,
}: PageProps<"/settings">) {
  const resolvedSearchParams = await searchParams;
  const isSaved = resolvedSearchParams.saved === "1";
  const hasGoalError = resolvedSearchParams.error === "goals";

  const profile = await getProfile();

  // carbs and protein have 4 kcal per gram, fat has 9
  const macroKcal =
    profile.carbsGoal * 4 + profile.proteinGoal * 4 + profile.fatGoal * 9;

  let message = null;
  if (hasGoalError) {
    message = (
      <p className="rounded-2xl bg-peach/15 px-4 py-3 text-sm font-medium text-peach-ink">
        Fill in all four daily goals with a number above 0.
      </p>
    );
  } else if (isSaved) {
    message = (
      <p className="rounded-2xl bg-mint/15 px-4 py-3 text-sm font-medium text-mint-ink">
        Settings saved.
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pt-[calc(env(safe-area-inset-top)+24px)] pb-32">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      {message}

      <section className="glass rounded-3xl p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Appearance</h2>
        <ThemeToggle />
      </section>

      <form action={saveProfile} className="flex flex-col gap-5">
        <section className="glass rounded-3xl p-4">
          <h2 className="mb-3 font-display text-base font-semibold">Profile</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <SettingsField
                name="name"
                label="Name"
                type="text"
                defaultValue={profile.name}
              />
            </div>
            <SettingsField name="age" label="Age" defaultValue={profile.age} />
            <SettingsField
              name="heightCm"
              label="Height"
              unit="cm"
              type="decimal"
              defaultValue={profile.heightCm}
            />
            <SettingsField
              name="goalWeightKg"
              label="Goal weight"
              unit="kg"
              type="decimal"
              defaultValue={profile.goalWeightKg}
            />
          </div>
        </section>

        <section className="glass rounded-3xl p-4">
          <h2 className="font-display text-base font-semibold">Daily goals</h2>
          <p className="mt-1 mb-3 text-xs text-muted">
            Used for the calorie bar, macro rings and calendar.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <SettingsField
                name="kcalGoal"
                label="Calories"
                unit="kcal"
                defaultValue={profile.kcalGoal}
                required
              />
            </div>
            <SettingsField
              name="carbsGoal"
              label="Carbs"
              unit="g"
              defaultValue={profile.carbsGoal}
              required
            />
            <SettingsField
              name="proteinGoal"
              label="Protein"
              unit="g"
              defaultValue={profile.proteinGoal}
              required
            />
            <SettingsField
              name="fatGoal"
              label="Fat"
              unit="g"
              defaultValue={profile.fatGoal}
              required
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            Your saved macros add up to{" "}
            <span className="font-semibold text-foreground">
              {macroKcal.toLocaleString("en")} kcal
            </span>{" "}
            a day.
          </p>
        </section>

        <button type="submit" className="btn-primary">
          Save settings
        </button>
      </form>

      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-full border border-peach/40 px-4 py-2.5 text-sm font-semibold text-peach-ink"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
