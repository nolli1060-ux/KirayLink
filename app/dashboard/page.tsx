import { Suspense } from "react";
import DashboardSession from "./DashboardSession";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardSession />
    </Suspense>
  );
}

