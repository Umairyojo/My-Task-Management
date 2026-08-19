"use client";

import dynamic from "next/dynamic";

const HomeRedirect = dynamic(
  () => import("@/components/auth/HomeRedirect").then((module) => module.HomeRedirect),
  {
    ssr: false,
  },
);

export default function HomePage() {
  return <HomeRedirect />;
}
