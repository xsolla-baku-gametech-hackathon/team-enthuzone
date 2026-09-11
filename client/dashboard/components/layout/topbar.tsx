"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { request } from "@/lib/api/platform";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function Topbar() {