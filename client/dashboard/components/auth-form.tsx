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