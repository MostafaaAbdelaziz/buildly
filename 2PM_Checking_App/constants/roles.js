export const ROLES = {
  MANAGER: "manager",
  FOREMAN: "foreman",
  SUBCONTRACTOR: "subcontractor",
};

export function isValidRole(role) {
  if (!role || typeof role !== "string") return false;
  return Object.values(ROLES).includes(role);
}

