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