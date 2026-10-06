import type { RoleConfig } from '@/components/marketing-pr/components/layout/Sidebar';
import { GraduationCap } from 'lucide-react';
import type { ReactNode } from 'react';

const roleDescriptions: Record<string, string> = {
  'marketing-head': 'Monitor team work, review submissions, and coordinate Marketing & PR activities',
  'digital': 'Create Website, Social Media, SEO, and Ad Campaign tasks',
  'content': 'Create Prospectus, Brochures, and Newsletters tasks',
  'events': 'Create Education Fairs, School Partnerships, and Open Days tasks',
};

export function CoverPage({
  roles,
  onSelectRole,
  sidebarCollapsed,
}: {
  roles: RoleConfig[];
  onSelectRole: (roleId: string) => void;
  sidebarCollapsed: boolean;
}) {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="flex flex-col items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Marketing & PR</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl mx-auto">
              Role-based task workflow for campaign creation, assignment, tracking, approvals, and reporting across marketing, content, digital, and events teams.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider text-center mb-4">Select Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${role.color}`}>
                {cloneIcon(role.icon, 24)}
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">{role.id === 'content' ? 'Content / Brand Team' : role.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{roleDescriptions[role.id]}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function cloneIcon(icon: ReactNode, size: number): ReactNode {
  // The icons from roleConfigs are lucide-react elements with size={18};
  // we re-render with a larger size for the cover page.
  // We use a type assertion to access the type prop for cloning.
  const iconEl = icon as React.ReactElement<{ size?: number }>;
  if (iconEl.props && typeof iconEl.props.size === 'number') {
    const { type, props } = iconEl;
    const Comp = type as React.ComponentType<{ size?: number } & Record<string, unknown>>;
    return <Comp {...props} size={size} />;
  }
  return icon;
}
