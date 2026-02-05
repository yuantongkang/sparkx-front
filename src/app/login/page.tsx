import { headers } from "next/headers";
import { redirect } from "next/navigation";

import LoginForm from "@/components/Auth/LoginForm";
import { getSparkxSessionFromHeaders } from "@/lib/sparkx-session";

export default async function LoginPage() {
  const requestHeaders = await headers();
  const session = getSparkxSessionFromHeaders(requestHeaders);

  if (session) {
    redirect("/projects");
  }

  return <LoginForm />;
}
