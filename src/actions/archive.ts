"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function createArchiveRecord(prevState: any, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Yalnız daxil olmuş istifadəçilər qeyd əlavə edə bilər." };
    }

    const firstName = (formData.get("firstName") as string) || "Naməlum";
    const lastName = (formData.get("lastName") as string) || "";
    const fatherName = formData.get("fatherName") as string;
    const birthPlace = formData.get("birthPlace") as string;
    const birthDateStr = formData.get("birthDate") as string;
    const missingDateStr = formData.get("missingDate") as string;
    const currentCity = formData.get("currentCity") as string;
    const missingLocation = formData.get("missingLocation") as string;
    const phoneNumbers = formData.get("phoneNumbers") as string;
    const idCardDetails = formData.get("idCardDetails") as string;
    const relatives = formData.get("relatives") as string;
    const notes = formData.get("notes") as string;
    const status = (formData.get("status") as string) || "SEARCHING";
    
    // File upload handle
    const medias: { fileUrl: string; type: string }[] = [];
    
    const saveFiles = async (files: File[], type: "IMAGE" | "DOCUMENT") => {
      if (files && files.length > 0) {
        for (const file of files) {
          if (file.size === 0 || !file.name || file.name === "undefined") continue;
          
          const buffer = Buffer.from(await file.arrayBuffer());
          const hash = crypto.randomBytes(8).toString("hex");
          const ext = path.extname(file.name);
          const fileName = `${hash}-${Date.now()}${ext}`;
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          
          await fs.mkdir(uploadDir, { recursive: true });
          await fs.writeFile(path.join(uploadDir, fileName), buffer);
          
          medias.push({ fileUrl: `/uploads/${fileName}`, type });
        }
      }
    };

    const images = formData.getAll("images") as File[];
    const documents = formData.getAll("documents") as File[];
    
    await saveFiles(images, "IMAGE");
    await saveFiles(documents, "DOCUMENT");

    await prisma.archiveRecord.create({
      data: {
        firstName,
        lastName,
        fatherName: fatherName || null,
        birthDate: birthDateStr || null,
        birthPlace: birthPlace || null,
        missingDate: missingDateStr || null,
        currentCity: currentCity || null,
        missingLocation: missingLocation || null,
        phoneNumbers: phoneNumbers || null,
        idCardDetails: idCardDetails || null,
        relatives: relatives || null,
        notes: notes || null,
        status,
        createdById: session.user.id,
        media: medias.length > 0 ? {
          create: medias
        } : undefined
      }
    });

  } catch (error) {
    console.error("Error creating record:", error);
    return { error: "Məlumatları saxlayarkən xəta baş verdi." };
  }

  // Next.js Redirect throws an error internally, so it must be outside the try/catch
  revalidatePath("/");
  revalidatePath("/archive");
  redirect("/archive");
}

export async function updateArchiveRecord(id: string, prevState: any, formData: FormData) {
  try {
    const firstName = (formData.get("firstName") as string) || "Naməlum";
    const lastName = (formData.get("lastName") as string) || "";
    const fatherName = formData.get("fatherName") as string;
    const birthPlace = formData.get("birthPlace") as string;
    const birthDateStr = formData.get("birthDate") as string;
    const missingDateStr = formData.get("missingDate") as string;
    const currentCity = formData.get("currentCity") as string;
    const missingLocation = formData.get("missingLocation") as string;
    const phoneNumbers = formData.get("phoneNumbers") as string;
    const idCardDetails = formData.get("idCardDetails") as string;
    const relatives = formData.get("relatives") as string;
    const notes = formData.get("notes") as string;
    const status = formData.get("status") as string;
    
    // File upload handle
    const medias: { fileUrl: string; type: string }[] = [];
    
    const saveFiles = async (files: File[], type: "IMAGE" | "DOCUMENT") => {
      if (files && files.length > 0) {
        for (const file of files) {
          if (file.size === 0 || !file.name || file.name === "undefined") continue;
          
          const buffer = Buffer.from(await file.arrayBuffer());
          const hash = crypto.randomBytes(8).toString("hex");
          const ext = path.extname(file.name);
          const fileName = `${hash}-${Date.now()}${ext}`;
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          
          await fs.mkdir(uploadDir, { recursive: true });
          await fs.writeFile(path.join(uploadDir, fileName), buffer);
          
          medias.push({ fileUrl: `/uploads/${fileName}`, type });
        }
      }
    };

    const images = formData.getAll("images") as File[];
    const documents = formData.getAll("documents") as File[];
    
    await saveFiles(images, "IMAGE");
    await saveFiles(documents, "DOCUMENT");

    // Update existing media notes
    const mediaNotes: { id: string, note: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("mediaNote_")) {
        const mId = key.replace("mediaNote_", "");
        mediaNotes.push({ id: mId, note: value as string });
      }
    }

    if (mediaNotes.length > 0) {
      for (const mNote of mediaNotes) {
        await prisma.media.update({
          where: { id: mNote.id },
          data: { note: mNote.note || null }
        });
      }
    }

    await prisma.archiveRecord.update({
      where: { id },
      data: {
        firstName,
        lastName,
        fatherName: fatherName || null,
        birthDate: birthDateStr || null,
        birthPlace: birthPlace || null,
        missingDate: missingDateStr || null,
        currentCity: currentCity || null,
        missingLocation: missingLocation || null,
        phoneNumbers: phoneNumbers || null,
        idCardDetails: idCardDetails || null,
        relatives: relatives || null,
        notes: notes || null,
        status: status || undefined,
        media: medias.length > 0 ? {
          create: medias
        } : undefined
      }
    });

  } catch (error) {
    console.error("Error updating record:", error);
    return { error: "Məlumatları yeniləyərkən xəta baş verdi." };
  }

  revalidatePath("/");
  revalidatePath(`/archive/${id}`);
  revalidatePath("/archive");
  redirect(`/archive/${id}`);
}

export async function deleteMedia(mediaId: string, archiveId: string) {
  try {
    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) return;

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), "public", media.fileUrl);
      await fs.unlink(filePath);
    } catch (e) {
      console.error("Fayl silinərkən xəta (ola bilsin yoxdur):", e);
    }

    // Delete from DB
    await prisma.media.delete({
      where: { id: mediaId }
    });

    revalidatePath(`/archive/${archiveId}`);
    revalidatePath(`/archive/${archiveId}/edit`);
    return { success: true };
  } catch (error) {
    console.error("Media silinmədi:", error);
    return { error: "Fayl silinərkən xəta baş verdi." };
  }
}

export async function deleteArchiveRecord(id: string) {
  try {
    const record = await prisma.archiveRecord.findUnique({
      where: { id },
      include: { media: true }
    });

    if (!record) return { error: "Qeyd tapılmadı." };

    // Delete all associated files from filesystem
    for (const media of record.media) {
      try {
        const filePath = path.join(process.cwd(), "public", media.fileUrl);
        await fs.unlink(filePath);
      } catch (e) {
        console.warn("Fayl artıq silinib və ya yoxdur:", media.fileUrl);
      }
    }

    // Delete record (cascades to Media in DB due to schema onDelete: Cascade)
    await prisma.archiveRecord.delete({
      where: { id }
    });

    revalidatePath("/");
    revalidatePath("/archive");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete record:", error);
    return { error: "Qeyd silinərkən xəta baş verdi." };
  }
}
export async function getAnalyticsData() {
  try {
    const rawRecords = await prisma.archiveRecord.findMany({
      select: {
        createdAt: true,
        currentCity: true,
        birthPlace: true,
        missingLocation: true,
      }
    });

    // Helper for top aggregation
    const getTopData = (field: 'currentCity' | 'birthPlace' | 'missingLocation') => {
      const counts: Record<string, number> = {};
      rawRecords.forEach(r => {
        const val = r[field] || "Naməlum";
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    };

    const cityData = getTopData('currentCity');
    const birthPlaceData = getTopData('birthPlace');
    const missingLocationData = getTopData('missingLocation');

    // 2. Aylıq statistika (Son 6 ay)
    const monthlyData: Record<string, number> = {};
    const months = ["Yan", "Fev", "Mar", "Apr", "May", "İyun", "İyul", "Avq", "Sen", "Okt", "Noy", "Dek"];
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = `${months[d.getMonth()]}`;
      monthlyData[monthLabel] = 0;
    }

    rawRecords.forEach(r => {
      const d = r.createdAt;
      const monthLabel = `${months[d.getMonth()]}`;
      if (monthlyData[monthLabel] !== undefined) {
        monthlyData[monthLabel]++;
      }
    });

    const trendData = Object.entries(monthlyData).map(([name, count]) => ({ name, count }));

    // 3. Status üzrə paylanma
    const statusCounts = await prisma.archiveRecord.groupBy({
      by: ['status'],
      _count: true
    });

    const statusData = statusCounts.map(s => ({
      name: s.status === "SEARCHING" ? "Axtarılır" : 
            s.status === "FOUND" ? "Tapılıb" : 
            s.status === "DECEASED" ? "Vəfat edib" : "Digər",
      value: s._count
    }));

    return { cityData, trendData, statusData, birthPlaceData, missingLocationData };
  } catch (error) {
    console.error("Analytics error:", error);
    return { cityData: [], trendData: [], statusData: [], birthPlaceData: [], missingLocationData: [] };
  }
}

export async function aiSearchArchive(query: string) {
  try {
    const q = query.toLowerCase();
    
    // 1. Açar sözlərin analizi (Basic AI logic/Pattern matching)
    // Şəhərlər, adlar və ya tarixlər axtarılır
    const allRecords = await prisma.archiveRecord.findMany({
      include: { media: true }
    });

    const scores = allRecords.map(record => {
      let score = 0;
      const fullText = `
        ${record.firstName} ${record.lastName} ${record.fatherName} 
        ${record.birthPlace} ${record.currentCity} ${record.missingLocation} 
        ${record.notes} ${record.relatives} ${record.phoneNumbers}
      `.toLowerCase();

      // Query-ni hissələrə bölək
      const words = q.split(/\s+/).filter(w => w.length > 2);
      
      words.forEach(word => {
        if (fullText.includes(word)) {
          score += 2;
          // Əgər tam sözdürsə daha çox xal
          if (new RegExp(`\\b${word}\\b`).test(fullText)) score += 3;
        }
      });

      // Xüsusi hallar (məs: "Bakıda")
      if (q.includes("bakı") && (record.currentCity?.toLowerCase().includes("bakı") || record.birthPlace?.toLowerCase().includes("bakı"))) score += 5;
      if (q.includes("itkin") && record.missingLocation) score += 2;

      return { ...record, score };
    });

    // Xala görə sıralama və yalnız xalı olanları saxlamaq
    return scores
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

  } catch (error) {
    console.error("AI Search error:", error);
    return [];
  }
}

export async function parseExcelArchive(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { error: "Fayl seçilməyib." };

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    if (data.length === 0) return { error: "Excel faylı boşdur." };

    const records: any[] = [];
    const duplicates: any[] = [];

    for (const row of data) {
      const record = {
        firstName: String(row["Ad"] || row["firstName"] || "").trim(),
        lastName: String(row["Soyad"] || row["lastName"] || "").trim(),
        fatherName: String(row["Ata adı"] || row["fatherName"] || "").trim(),
        birthPlace: String(row["Doğum yeri"] || row["birthPlace"] || "").trim(),
        currentCity: String(row["Şəhər"] || row["currentCity"] || "").trim(),
        missingLocation: String(row["İtkin yeri"] || row["missingLocation"] || "").trim(),
        phoneNumbers: String(row["Telefon"] || row["phoneNumbers"] || "").trim(),
        idCardDetails: String(row["ŞV məlumatları"] || row["idCardDetails"] || "").trim(),
        relatives: String(row["Qohumlar"] || row["relatives"] || "").trim(),
        notes: String(row["Qeydlər"] || row["notes"] || "").trim(),
      };

      if (!record.firstName) continue;

      // Check for potential duplicate in DB
      const existing = await prisma.archiveRecord.findFirst({
        where: {
          firstName: record.firstName,
          lastName: record.lastName || null,
          fatherName: record.fatherName || null,
        }
      });

      if (existing) {
        duplicates.push({ ...record, existingId: existing.id });
      } else {
        records.push(record);
      }
    }

    return { success: true, records, duplicates };
  } catch (error) {
    console.error("Excel parse error:", error);
    return { error: "Excel faylı oxunarkən xəta baş verdi." };
  }
}

export async function confirmImportArchive(data: { records: any[], skipDuplicates: boolean }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "İcazə yoxdur." };

    const toInsert = data.records.map(r => ({
      ...r,
      createdById: session.user.id,
      // Handle empty strings as null for optional fields
      lastName: r.lastName || null,
      fatherName: r.fatherName || null,
      birthPlace: r.birthPlace || null,
      currentCity: r.currentCity || null,
      missingLocation: r.missingLocation || null,
      phoneNumbers: r.phoneNumbers || null,
      idCardDetails: r.idCardDetails || null,
      relatives: r.relatives || null,
      notes: r.notes || null,
    }));

    if (toInsert.length > 0) {
      await prisma.archiveRecord.createMany({
        data: toInsert
      });
    }

    revalidatePath("/");
    revalidatePath("/archive");
    return { success: true, count: toInsert.length };
  } catch (error) {
    console.error("Import error:", error);
    return { error: "Məlumatlar bazaya yazılarkən xəta baş verdi." };
  }
}

export async function getFilteredRecords(field: string, value: string) {
  try {
    const allowedFields = ['status', 'currentCity', 'birthPlace', 'missingLocation'];
    if (!allowedFields.includes(field)) return [];

    let whereClause: any = {};
    
    if (value === "Naməlum") {
      whereClause[field] = null;
    } else {
      whereClause[field] = {
        equals: value,
        mode: field === 'status' ? undefined : 'insensitive'
      };
    }

    const records = await prisma.archiveRecord.findMany({
      where: whereClause,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { media: true }
    });

    return records;
  } catch (error) {
    console.error("Filter fetch error:", error);
    return [];
  }
}



