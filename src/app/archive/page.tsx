import prisma from "@/lib/prisma";
import styles from "./archive.module.css";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import ExcelImport from "@/components/archive/ExcelImport";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ArchiveClientContainer from "@/components/archive/ArchiveClientContainer";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; missingLocation?: string; idCard?: string; phone?: string; status?: string; birthPlace?: string }>;
}) {
  const { q, city, missingLocation, idCard, phone, status, birthPlace } = await searchParams;

  const whereCondition: Prisma.ArchiveRecordWhereInput = {};
  
  if (q) {
    whereCondition.OR = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { fatherName: { contains: q } },
    ];
  }
  
  if (city) {
    whereCondition.currentCity = { contains: city };
  }
  if (missingLocation) {
    whereCondition.missingLocation = { contains: missingLocation };
  }
  if (birthPlace) {
    whereCondition.birthPlace = { contains: birthPlace };
  }
  if (idCard) {
    whereCondition.idCardDetails = { contains: idCard };
  }
  if (phone) {
    whereCondition.phoneNumbers = { contains: phone };
  }
  if (status && status !== "ALL") {
    whereCondition.status = status;
  }

  const records = await prisma.archiveRecord.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
    include: { media: true }
  });

  const session = await getServerSession(authOptions);

  return (
    <div className={styles.container} style={{ marginTop: '24px' }}>
      <ArchiveClientContainer 
        initialRecords={records} 
        showExcel={!!session} 
        activeFilters={{ q, city, missingLocation, idCard, phone, status, birthPlace }}
      />
    </div>
  );
}
