"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function createUser(prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const displayName = formData.get("displayName") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!username || !password || !role) {
      return { error: "Xahiş olunur, bütün xanaları doldurun." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return { error: "Bu istifadəçi adı artıq mövcuddur!" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        displayName: displayName || null,
        passwordHash,
        role
      }
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("User creation failed:", error);
    return { error: "Sistem xətası baş verdi. İstifadəçi yaradıla bilmədi." };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id === id) {
      throw new Error("Öz hesabınızı silə bilməzsiniz!");
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) return;
    
    // Prevent deleting the only ADMIN
    if (userToDelete.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        throw new Error("Sistemdə ən az 1 Admin olmalıdır. Silə bilməzsiniz.");
      }
    }
    
    await prisma.user.delete({ where: { id } });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { error: error.message || "İstifadəçi silinmədi." };
  }
}

export async function updateUser(id: string, prevState: any, formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const displayName = formData.get("displayName") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    const data: any = {
      username,
      displayName: displayName || null,
      role
    };

    if (password && password.trim() !== "") {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("User update failed:", error);
    return { error: "Yenilənmə zamanı xəta baş verdi." };
  }
}

export async function changeOwnPassword(prevState: any, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "İcazə yoxdur. Xahiş olunur yenidən daxil olun." };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: "Xahiş olunur, bütün xanaları doldurun." };
    }

    if (newPassword !== confirmPassword) {
      return { error: "Yeni şifrə və təkrarı eyni deyil." };
    }

    if (newPassword.length < 6) {
      return { error: "Yeni şifrə ən az 6 simvol olmalıdır." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return { error: "İstifadəçi tapılmadı." };
    }

    const isCorrectPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCorrectPassword) {
      return { error: "Köhnə şifrə yanlışdır." };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash }
    });

    return { success: true };
  } catch (error) {
    console.error("Change password failed:", error);
    return { error: "Şifrə dəyişdirilərkən sistem xətası baş verdi." };
  }
}
