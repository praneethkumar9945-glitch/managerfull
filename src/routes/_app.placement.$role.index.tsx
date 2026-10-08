import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/placement/dashboards";
import type { RoleId } from "@/components/placement/lib/config";

export const Route = createFileRoute("/_app/placement/$role/")({
  component: () => { const { role } = Route.useParams(); return <Dashboard role={role as RoleId} />; },
});
