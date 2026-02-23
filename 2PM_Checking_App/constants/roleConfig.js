import { ROLES, DEFAULT_ROLE } from "./roles";

export const ROLE_CONFIG = {
  [ROLES.MANAGER]: {
    key: ROLES.MANAGER,
    label: "Manager",
    homeTitle: "Dashboard – Manager",
    description: "Oversees projects, schedules, and issues.",
    // Example capabilities you can hook into screens:
    canCreateSchedule: true,
    canEditAnySchedule: true,
    canCreateIssue: true,
    canResolveIssue: true,
  },
  [ROLES.FOREMAN]: {
    key: ROLES.FOREMAN,
    label: "Foreman",
    homeTitle: "Dashboard – Foreman",
    description: "Views assigned work and reports issues from the field.",
    canCreateSchedule: false,
    canEditAnySchedule: false,
    canCreateIssue: true,
    canResolveIssue: false,
  },
  [ROLES.SUBCONTRACTOR]: {
    key: ROLES.SUBCONTRACTOR,
    label: "Subcontractor",
    homeTitle: "Dashboard – Subcontractor",
    description: "Views assigned work and reports issues from the field.",
    canCreateSchedule: false,
    canEditAnySchedule: false,
    canCreateIssue: true,
    canResolveIssue: false,
  },
};

export function getRoleConfig(role) {
  const r = role || DEFAULT_ROLE;
  return ROLE_CONFIG[r] || ROLE_CONFIG[DEFAULT_ROLE];
}

