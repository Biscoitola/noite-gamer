import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createPublicToken, hashToken, verifyPassword } from "@/lib/security";

const cookieName = "ng_admin_session";

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.isActive || (admin.lockedUntil && admin.lockedUntil > new Date())) return false;
  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) {
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: { increment: 1 },
        lockedUntil: admin.failedLoginAttempts >= 4 ? new Date(Date.now() + 15 * 60_000) : null
      }
    });
    return false;
  }
  const token = createPublicToken();
  await prisma.systemSetting.upsert({
    where: { key: `session:${hashToken(token)}` },
    update: { value: { adminId: admin.id, createdAt: new Date().toISOString() } },
    create: { key: `session:${hashToken(token)}`, value: { adminId: admin.id, createdAt: new Date().toISOString() } }
  });
  const jar = await cookies();
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null } });
  return true;
}

export async function logoutAdmin() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await prisma.systemSetting.deleteMany({ where: { key: `session:${hashToken(token)}` } });
  jar.delete(cookieName);
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const session = await prisma.systemSetting.findUnique({ where: { key: `session:${hashToken(token)}` } });
  const value = session?.value as { adminId?: string } | undefined;
  if (!value?.adminId) return null;
  return prisma.adminUser.findUnique({ where: { id: value.adminId } });
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
