"use client";

import { deleteArchiveRecord } from "@/actions/archive";
import { useRouter } from "next/navigation";
import styles from "./archiveId.module.css";

export default function DeleteRecordButton({ id, name }: { id: string, name: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm(`"${name}" adlı arxiv qeydini həmişəlik silmək istədiyinizə əminsiniz?`)) {
      const res = await deleteArchiveRecord(id);
      if (res?.error) {
        alert(res.error);
      } else {
        router.push("/archive");
      }
    }
  };

  return (
    <button onClick={handleDelete} className={`${styles.btn} ${styles.deleteBtn}`}>
      🗑️ Sil
    </button>
  );
}
