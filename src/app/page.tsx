import { headers } from "next/headers";

import SparkHomeClient from "@/components/Home/SparkHomeClient";
import { getSparkxSessionFromHeaders } from "@/lib/sparkx-session";

export default async function HomePage() {
  const requestHeaders = await headers();
  const session = getSparkxSessionFromHeaders(requestHeaders);

  return <SparkHomeClient isAuthenticated={Boolean(session)} />;
}
