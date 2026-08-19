"use client";

import dynamic from "next/dynamic";

const LoginView = dynamic(
  () => import("@/components/auth/LoginView").then((module) => module.LoginView),
  {
    ssr: false,
  },
);

export default function LoginPage() {
  return <LoginView />;
}
