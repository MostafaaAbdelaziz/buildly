export const ROLES = {
  MANAGER: "manager",
  FOREMAN: "foreman",
  SUBCONTRACTOR: "subcontractor",
};

export const DEFAULT_ROLE = ROLES.FOREMAN;

export function isValidRole(role) {
  if (!role || typeof role !== "string") return false;
  return Object.values(ROLES).includes(role);
}

