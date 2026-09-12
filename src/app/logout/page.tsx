"use client";
import Link from "next/link";
import { useEffect } from "react";
import { XaadirLogo } from "@/components/brand/XaadirLogo";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LogoutPage() { const {signOut}=useAuth(); useEffect(()=>{signOut()},[signOut]); return <main className="logout-page"><XaadirLogo /><section><h1>You&apos;re signed out</h1><p>Your local demo session has been cleared.</p><div><Link href="/login">Sign in again</Link></div></section></main>; }
