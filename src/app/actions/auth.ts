"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  try {
    // redirect: false evita o fallback do Auth.js para NEXTAUTH_URL/localhost
    // em Server Actions (comum em produção na Vercel).
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      redirect("/login?error=Credenciais inválidas");
    }
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=Credenciais inválidas");
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
