"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { requireAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/security";

function readRole(value: FormDataEntryValue | null): AdminRole {
  return value === "ADMIN" ? "ADMIN" : "STAFF";
}

function redirectWithMessage(type: "success" | "error", message: string) {
  redirect(`/admin/usuarios?${type}=${encodeURIComponent(message)}`);
}

export async function createAdminUserAction(formData: FormData) {
  await requireAdminRole("ADMIN");

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = readRole(formData.get("role"));

  if (!name || !email || password.length < 8) {
    redirectWithMessage("error", "Informe nome, e-mail e uma senha com pelo menos 8 caracteres.");
  }

  try {
    await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
        isActive: true,
        mustChangePassword: true
      }
    });
  } catch {
    redirectWithMessage("error", "Nao foi possivel criar o usuario. Confira se o e-mail ja nao existe.");
  }

  revalidatePath("/admin/usuarios");
  redirectWithMessage("success", "Usuario criado.");
}

export async function updateAdminUserRoleAction(formData: FormData) {
  const currentAdmin = await requireAdminRole("ADMIN");
  const userId = String(formData.get("userId") || "");
  const role = readRole(formData.get("role"));

  if (!userId) redirectWithMessage("error", "Usuario invalido.");
  if (userId === currentAdmin.id && role !== "ADMIN") {
    redirectWithMessage("error", "Voce nao pode remover seu proprio acesso de administrador.");
  }

  await prisma.adminUser.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/usuarios");
  redirectWithMessage("success", "Permissao atualizada.");
}

export async function updateAdminUserPasswordAction(formData: FormData) {
  await requireAdminRole("ADMIN");
  const userId = String(formData.get("userId") || "");
  const password = String(formData.get("password") || "");

  if (!userId || password.length < 8) {
    redirectWithMessage("error", "A nova senha precisa ter pelo menos 8 caracteres.");
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      failedLoginAttempts: 0,
      lockedUntil: null,
      mustChangePassword: true
    }
  });
  revalidatePath("/admin/usuarios");
  redirectWithMessage("success", "Senha atualizada.");
}

export async function toggleAdminUserActiveAction(formData: FormData) {
  const currentAdmin = await requireAdminRole("ADMIN");
  const userId = String(formData.get("userId") || "");
  const isActive = formData.get("isActive") === "true";

  if (!userId) redirectWithMessage("error", "Usuario invalido.");
  if (userId === currentAdmin.id && !isActive) {
    redirectWithMessage("error", "Voce nao pode desativar seu proprio usuario.");
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: { isActive, failedLoginAttempts: 0, lockedUntil: null }
  });
  revalidatePath("/admin/usuarios");
  redirectWithMessage("success", isActive ? "Usuario ativado." : "Usuario desativado.");
}
