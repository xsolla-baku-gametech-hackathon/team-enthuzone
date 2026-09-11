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
