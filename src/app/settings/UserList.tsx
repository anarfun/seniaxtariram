"use client";

import { useActionState, useState, useEffect } from "react";
import { deleteUser, updateUser } from "@/actions/users";
import { useRouter } from "next/navigation";
import styles from "../archive/new/new.module.css";

interface User {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
  createdAt: string;
}

export default function UserList({ initialUsers, currentUserId }: { initialUsers: User[], currentUserId?: string }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  // We need to handle delete with a client-side confirmation and server action
  const handleDelete = async (id: string, username: string) => {
    if (confirm(`"${username}" adlı istifadəçini silmək istədiyinizə əminsiniz?`)) {
      const res = await deleteUser(id);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {initialUsers.map(u => (
        <div key={u.id}>
          {editingId === u.id ? (
            <EditUserForm 
              user={u} 
              onCancel={() => setEditingId(null)} 
            />
          ) : (
            <div style={{
              background: 'rgba(0,0,0,0.2)', padding: '16px 20px', borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px', color: 'white' }}>
                  {u.displayName || u.username} {u.id === currentUserId && "(Siz)"}
                </div>
                {u.displayName && (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>@{u.username}</div>
                )}
                <div style={{ fontSize: '13px', color: u.role === "ADMIN" ? '#ef4444' : '#3b82f6', marginTop: '4px', fontWeight: '500' }}>
                  {u.role === "ADMIN" ? "Administrator" : "Redaktor"}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginRight: '8px' }}>
                  {u.createdAt}
                </div>
                <button 
                  onClick={() => setEditingId(u.id)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                >
                  ✏️ Redaktə
                </button>
                {u.id !== currentUserId && (
                  <button 
                    onClick={() => handleDelete(u.id, u.username)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    🗑️ Sil
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EditUserForm({ user, onCancel }: { user: User, onCancel: () => void }) {
  const updateWithId = updateUser.bind(null, user.id);
  const [state, formAction, isPending] = useActionState(updateWithId, { error: null, success: false });

  // Fix: use useEffect to avoid setState-in-render error
  useEffect(() => {
    if (state?.success) {
      onCancel();
    }
  }, [state?.success]);

  return (
    <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '20px', borderRadius: '12px', border: '1px solid #3b82f6' }}>
      <form action={formAction} className={styles.form} style={{ gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className={styles.group}>
            <label className={styles.label}>İstifadəçi adı (Login)</label>
            <input type="text" name="username" defaultValue={user.username} required className={styles.input} style={{ padding: '8px 12px' }} />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Tam Ad (zeruri deyil)</label>
            <input type="text" name="displayName" defaultValue={user.displayName || ""} className={styles.input} style={{ padding: '8px 12px' }} />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Yeni Şifrə (Dəyişmirsə boş qoyun)</label>
            <input type="password" name="password" className={styles.input} style={{ padding: '8px 12px' }} />
          </div>
        </div>
        <div className={styles.group}>
          <label className={styles.label}>Rol</label>
          <select name="role" defaultValue={user.role} className={styles.input} style={{ padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <option value="EDITOR">Redaktor</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
        {state?.error && <div style={{ color: '#ef4444', fontSize: '12px' }}>{state.error}</div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="submit" disabled={isPending} className={styles.submitBtn} style={{ padding: '8px 16px', fontSize: '13px' }}>
            {isPending ? "Yadda saxlanılır..." : "Yadda Saxla"}
          </button>
          <button type="button" onClick={onCancel} className={styles.cancelBtn} style={{ padding: '8px 16px', fontSize: '13px' }}>
            Ləğv Et
          </button>
        </div>
      </form>
    </div>
  );
}
