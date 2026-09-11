"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Layers3, Check, AlertCircle } from "lucide-react";
import { request } from "@/lib/api/platform";

export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState({
    email: "",
    password: "",
    confirm: "",
    name: "",
    surname: "",
    organizationName: "",
    location: "",
    businessDescription: "",
    remember: true,
  });

  const titles = [
    "Your organization starts here",
    "A little about you",
    "Where are you based?",
    "Tell us about your studio",
    "Ready to build better games?",
  ];

  function getLimits(key: string): { min?: number; max: number } {
    switch (key) {
      case "name":
        return { min: 2, max: 120 };
      case "surname":
        return { min: 1, max: 120 };
      case "organizationName":
        return { min: 2, max: 120 };
      case "password":
        return { min: register ? 12 : 1, max: 128 };
      case "confirm":
        return { min: register ? 12 : 1, max: 128 };
      case "location":
        return { min: 1, max: 200 };
      case "businessDescription":
        return { min: 1, max: 2000 };
      case "email":
      default:
        return { min: 1, max: 254 };
    }
  }

  function validateField(key: string, value: string, currentData = data): string {
    const trimmed = (value || "").trim();
    const limits = getLimits(key);

    if (key === "email") {
      if (!trimmed) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return "Please enter a valid email address";
      }
      if (trimmed.length > limits.max) {
        return `Email must not exceed ${limits.max} characters`;
      }
    }

    if (key === "password") {
      if (!value) return "Password is required";
      if (register && value.length < 12) {
        return "Password must contain at least 12 characters";
      }
      if (value.length > limits.max) {
        return `Password must contain at most ${limits.max} characters`;
      }
    }

    if (key === "confirm" && register) {
      if (!value) return "Please confirm your password";
      if (value !== currentData.password) {
        return "Passwords must match";
      }
    }

    if (key === "name") {
      if (!trimmed) return "First name is required";
      if (trimmed.length < 2) return "First name must contain at least 2 characters";
      if (trimmed.length > limits.max) {
        return `First name must contain at most ${limits.max} characters`;
      }
    }

    if (key === "surname") {
      if (!trimmed) return "Surname is required";
      if (trimmed.length > limits.max) {
        return `Surname must contain at most ${limits.max} characters`;
      }
    }

    if (key === "organizationName") {
      if (!trimmed) return "Organization name is required";
      if (trimmed.length < 2) return "Organization name must contain at least 2 characters";
      if (trimmed.length > limits.max) {
        return `Organization name must contain at most ${limits.max} characters`;
      }
    }

    if (key === "location") {
      if (!trimmed) return "Country / city is required";
      if (trimmed.length > limits.max) {
        return `Location must contain at most ${limits.max} characters`;
      }
    }

    if (key === "businessDescription") {
      if (!trimmed) return "Business description is required";
      if (trimmed.length > limits.max) {
        return `Description must contain at most ${limits.max} characters`;
      }
    }

    return "";
  }

  function handleFieldChange(key: keyof typeof data, value: string) {
    const updated = { ...data, [key]: value };
    setData(updated);

    // Live validation if this field currently has an error displayed
    if (fieldErrors[key]) {
      const err = validateField(key, value, updated);
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (!err) delete next[key];
        else next[key] = err;
        return next;
      });
      if (!err && error === fieldErrors[key]) {
        setError("");
      }
    }

    // If typing password, re-check confirm live if confirm has an error
    if (key === "password" && data.confirm && fieldErrors.confirm) {
      if (value === data.confirm) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.confirm;
          return next;
        });
      }
    }
  }

  function validateCurrentStep(currentStep: number): boolean {
    const stepErrors: Record<string, string> = {};

    if (!register) {
      const emailErr = validateField("email", data.email);
      const passErr = validateField("password", data.password);
      if (emailErr) stepErrors.email = emailErr;
      if (passErr) stepErrors.password = passErr;
    } else {
      if (currentStep === 0) {
        const emailErr = validateField("email", data.email);
        const passErr = validateField("password", data.password);
        const confErr = validateField("confirm", data.confirm);
        if (emailErr) stepErrors.email = emailErr;
        if (passErr) stepErrors.password = passErr;
        if (confErr) stepErrors.confirm = confErr;
      } else if (currentStep === 1) {
        const nameErr = validateField("name", data.name);
        const surnameErr = validateField("surname", data.surname);
        const orgErr = validateField("organizationName", data.organizationName);
        if (nameErr) stepErrors.name = nameErr;
        if (surnameErr) stepErrors.surname = surnameErr;
        if (orgErr) stepErrors.organizationName = orgErr;
      } else if (currentStep === 2) {
        const locErr = validateField("location", data.location);
        if (locErr) stepErrors.location = locErr;
      } else if (currentStep === 3) {
        const descErr = validateField("businessDescription", data.businessDescription);
        if (descErr) stepErrors.businessDescription = descErr;
      }
    }

    setFieldErrors((prev) => ({ ...prev, ...stepErrors }));

    const errorKeys = Object.keys(stepErrors);
    if (errorKeys.length > 0) {
      setError(stepErrors[errorKeys[0]]);
      return false;
    }

    setError("");
    return true;
  }

  function field(
    key: keyof typeof data,
    label: string,
    type = "text",
    showCount = false
  ) {
    const limits = getLimits(key);
    const fieldError = fieldErrors[key];
    const val = String(data[key]);

    return (
      <label className="grid gap-2 text-sm font-medium" key={key}>
        <div className="flex items-center justify-between">
          <span>{label}</span>
          {showCount && limits.max && (
            <span
              className={`text-xs ${
                val.length > limits.max
                  ? "text-critical font-bold"
                  : val.length >= limits.max * 0.9
                  ? "text-high"
                  : "text-muted"
              }`}
            >
              {val.length}/{limits.max}
            </span>
          )}
        </div>
        <input
          className={`field transition-colors ${
            fieldError
              ? "!border-critical ring-1 !ring-critical/40 focus:!border-critical"
              : ""
          }`}
          value={val}
          type={type}
          maxLength={limits.max}
          onChange={(e) => handleFieldChange(key, e.target.value)}
          onBlur={() => {
            const err = validateField(key, val);
            setFieldErrors((prev) => {
              const next = { ...prev };
              if (!err) delete next[key];
              else next[key] = err;
              return next;
            });
          }}
          autoComplete={
            key === "password"
              ? register
                ? "new-password"
                : "current-password"
              : key === "email"
              ? "email"
              : "off"
          }
        />
        {fieldError && (
          <p className="flex items-center gap-1.5 text-xs text-critical font-normal mt-0.5">
            <AlertCircle size={13} className="shrink-0" />
            <span>{fieldError}</span>
          </p>
        )}
      </label>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate current step before advancing or completing
    if (!validateCurrentStep(step)) {
      return;
    }

    if (register && step < 4) {
      setStep(step + 1);
      setError("");
      return;
    }

    setBusy(true);
    try {
      if (register) {
        await request("/session/register", {
          email: data.email.trim(),
          password: data.password,
          name: data.name.trim(),
          organizationName: data.organizationName.trim(),
        });
        await request(
          "/platform/profile",
          {
            surname: data.surname.trim(),
            location: data.location.trim(),
            businessDescription: data.businessDescription.trim(),
          },
          "PUT"
        );
      } else {
        await request("/session/login", {
          email: data.email.trim(),
          password: data.password,
          remember: data.remember,
        });
      }
      router.push("/");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-stage">
      <div className="auth-orb" aria-hidden="true" />
      <section className="glass relative mx-auto w-full max-w-xl rounded-2xl p-6 sm:p-10">
        <Layers3 className="mb-6 text-accent" size={32} />
        <p className="eyebrow">PLAYER ISSUE INTELLIGENCE</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {register ? titles[step] : "Welcome back."}
        </h1>
        <p className="mt-3 text-muted">
          Your players have a story. Turn it into a better game.
        </p>

        {register && (
          <div className="my-6 flex gap-2" aria-label={`Step ${step + 1} of 5`}>
            {titles.map((t, i) => (
              <span
                key={t}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? "bg-accent" : "bg-line"
                }`}
              />
            ))}
          </div>
        )}

        <form onSubmit={submit} className="mt-7 grid gap-5" noValidate>
          {(!register || step === 0) && (
            <>
              {field("email", "Organization email", "email")}
              <div className="relative">
                {field("password", "Password", visible ? "text" : "password")}
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-9 text-muted hover:text-text transition-colors"
                  aria-label={visible ? "Hide password" : "Show password"}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {register && (
                <>
                  {field(
                    "confirm",
                    "Confirm password",
                    visible ? "text" : "password"
                  )}

                  {/* Real-time Password Requirements Checklist */}
                  <div className="grid gap-1.5 rounded-lg bg-surface-sunken/60 border border-line/40 p-3 text-xs">
                    <span className="font-semibold text-text-muted mb-0.5">
                      Password requirements:
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                          data.password.length >= 12
                            ? "bg-accent/20 text-accent"
                            : "bg-surface text-muted"
                        }`}
                      >
                        {data.password.length >= 12 ? <Check size={11} /> : "•"}
                      </span>
                      <span
                        className={
                          data.password.length >= 12
                            ? "text-text font-medium"
                            : "text-muted"
                        }
                      >
                        At least 12 characters ({data.password.length}/12)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                          data.confirm && data.confirm === data.password
                            ? "bg-accent/20 text-accent"
                            : "bg-surface text-muted"
                        }`}
                      >
                        {data.confirm && data.confirm === data.password ? (
                          <Check size={11} />
                        ) : (
                          "•"
                        )}
                      </span>
                      <span
                        className={
                          data.confirm && data.confirm === data.password
                            ? "text-text font-medium"
                            : "text-muted"
                        }
                      >
                        Passwords match
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {register && step === 1 && (
            <>
              {field("name", "First name", "text", true)}
              {field("surname", "Surname", "text", true)}
              {field("organizationName", "Organization name", "text", true)}
            </>
          )}

          {register && step === 2 && (
            <label className="grid gap-2 text-sm font-medium">
              <div className="flex items-center justify-between">
                <span>Country / city</span>
                <span className="text-xs text-muted">
                  {data.location.length}/200
                </span>
              </div>
              <input
                className={`field transition-colors ${
                  fieldErrors.location
                    ? "!border-critical ring-1 !ring-critical/40 focus:!border-critical"
                    : ""
                }`}
                maxLength={200}
                list="locations"
                value={data.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                onBlur={() => {
                  const err = validateField("location", data.location);
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    if (!err) delete next.location;
                    else next.location = err;
                    return next;
                  });
                }}
              />
              {fieldErrors.location && (
                <p className="flex items-center gap-1.5 text-xs text-critical font-normal mt-0.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{fieldErrors.location}</span>
                </p>
              )}
              <datalist id="locations">
                {[
                  "Azerbaijan / Baku",
                  "Türkiye / Istanbul",
                  "United Kingdom / London",
                  "United States / New York",
                  "Germany / Berlin",
                  "Japan / Tokyo",
                ].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </datalist>
              <span className="text-xs text-muted">
                Choose a suggestion or enter your country and city.
              </span>
            </label>
          )}

          {register && step === 3 && (
            <label className="grid gap-2 text-sm font-medium">
              <div className="flex items-center justify-between">
                <span>What is your business about?</span>
                <span className="text-xs text-muted">
                  {data.businessDescription.length}/2000
                </span>
              </div>
              <textarea
                className={`field min-h-32 transition-colors ${
                  fieldErrors.businessDescription
                    ? "!border-critical ring-1 !ring-critical/40 focus:!border-critical"
                    : ""
                }`}
                maxLength={2000}
                value={data.businessDescription}
                onChange={(e) =>
                  handleFieldChange("businessDescription", e.target.value)
                }
                onBlur={() => {
                  const err = validateField(
                    "businessDescription",
                    data.businessDescription
                  );
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    if (!err) delete next.businessDescription;
                    else next.businessDescription = err;
                    return next;
                  });
                }}
              />
              {fieldErrors.businessDescription && (
                <p className="flex items-center gap-1.5 text-xs text-critical font-normal mt-0.5">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{fieldErrors.businessDescription}</span>
                </p>
              )}
            </label>
          )}

          {register && step === 4 && (
            <dl className="grid gap-3 rounded-xl bg-surface-sunken p-5 text-sm">
              {[
                ["Organization", data.organizationName],
                ["Email", data.email],
                ["Name", `${data.name} ${data.surname}`.trim()],
                ["Location", data.location],
                ["About", data.businessDescription],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted">{k}</dt>
                  <dd className="mt-1 break-words font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          )}

          {!register && (
            <div className="flex justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) =>
                    setData({ ...data, remember: e.target.checked })
                  }
                />{" "}
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={async () => {
                  try {
                    await request("/session/forgot-password", {
                      email: data.email,
                    });
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg bg-critical-surface p-3 text-sm text-critical border border-critical/30"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="flex gap-3">
            {register && step > 0 && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setStep(step - 1);
                  setError("");
                }}
              >
                Back
              </button>
            )}
            <button disabled={busy} className="primary flex-1">
              {busy
                ? "Please wait…"
                : register