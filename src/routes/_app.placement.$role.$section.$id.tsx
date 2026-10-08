import { createFileRoute } from "@tanstack/react-router";
import { Detail } from "@/components/placement/details";
import type { RoleId } from "@/components/placement/lib/config";

export const Route = createFileRoute("/_app/placement/$role/$section/$id")({
  component: () => { const { role, section, id } = Route.useParams(); return <Detail role={role as RoleId} sectionId={section} id={id} />; },
});
