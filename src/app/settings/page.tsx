import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import styles from "../archive/new/new.module.css";
import AdminForm from "./AdminForm";
import UserList from "./UserList";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  // Only ADMIN can view this page
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const rawUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  // Serialize dates for Client Component (format on server to avoid hydration mismatch)
  const users = rawUsers.map(u => ({
    ...u,
    createdAt: u.createdAt.toLocaleDateString("az-AZ") // format on server
  }));

  return (
    <div className={styles.container} style={{ maxWidth: '1000px', display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
      
      <div style={{ flex: 1 }}>
        <div className={styles.header}>
          <h1 className={styles.title}>İşçilər və Rollar</h1>
          <p className={styles.subtitle}>Sistemə giriş icazəsi olan əməkdaşların siyahısı.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <UserList 
            initialUsers={users} 
            currentUserId={session.user.id} 
          />
        </div>
      </div>

      <div style={{ width: '400px', position: 'sticky', top: '32px' }}>
        <AdminForm />
      </div>

    </div>
  );
}
