import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditForm from "./EditForm";

export default async function EditArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const record = await prisma.archiveRecord.findUnique({
    where: { id },
    include: { media: true }
  });

  if (!record) return notFound();

  return <EditForm record={record} />;
}
