import type { UserRecord } from "@/domain/User";

type Action = "user:create" | "user:view" | "user:update" | "user:delete";

type Context = { ownerEmail?: string; [k: string]: any };

// Simple RBAC + ABAC: roles gate, then attribute checks.
export function can(
  user: UserRecord | null | undefined,
  action: Action,
  ctx: Context = {}
): boolean {
  if (!user) return false;
  const role = user.role;
  if (role === "admin") return true;

  switch (action) {
    case "user:create":
      return role === "manager";
    case "user:view":
      return role === "manager" || user.email === ctx.ownerEmail;
    case "user:update":
    case "user:delete":
      // ABAC: allow if acting on self, or same department
      if (user.email === ctx.ownerEmail) return true;
      if (role === "manager") {
        const myDept = user.attributes?.department;
        const targetDept = ctx.targetDepartment ?? myDept; // may be provided from resource attributes
        return !!myDept && myDept === targetDept;
      }
      return false;
    default:
      return false;
  }
}
