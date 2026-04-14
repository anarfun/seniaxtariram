import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const firstNames = ["Samir", "Aysel", "Elnur", "Leyla", "Rauf", "Nigar", "Vüqar", "Günel", "Tural", "Zaur", "Fidan", "Murad", "Arzu", "Elvin", "Səidə"];
const lastNames = ["Məmmədov", "Əliyeva", "Hüseynov", "Quliyeva", "Həsənov", "İbrahimova", "Rüstəmov", "Abbasova", "Səfərov", "Mehdiyev", "Kərimova", "Orucov", "Məlikova", "Sultanov", "Bağırova"];
const cities = ["Bakı", "Gəncə", "Sumqayıt", "Mingəçevir", "Lənkəran", "Şəki", "Naxçıvan", "Qəbələ", "Şuşa", "Xaçmaz", "Bərdə", "Sabirabad", "Masallı", "İsmayıllı", "Zaqatala"];
const statuses = ["SEARCHING", "SEARCHING", "SEARCHING", "FOUND", "FOUND", "DECEASED", "OTHER"];

async function main() {
  console.log('Seeding random records...');
  
  // Get an existing user for createdById
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found to associate records with. Please register first.');
    return;
  }

  for (let i = 0; i < 15; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const birthYear = 1970 + Math.floor(Math.random() * 40);
    const missingYear = 2010 + Math.floor(Math.random() * 14);
    
    // Choose random formats for dates to test flexibility
    const dateFormats = [
      () => `${Math.floor(Math.random() * 28 + 1)}/${Math.floor(Math.random() * 12 + 1)}/${birthYear}`,
      () => `${birthYear}`,
      () => `01.01.${birthYear}`
    ];
    
    const birthDate = dateFormats[Math.floor(Math.random() * dateFormats.length)]();
    const missingDate = `${Math.floor(Math.random() * 28 + 1)}/${Math.floor(Math.random() * 12 + 1)}/${missingYear}`;

    await prisma.archiveRecord.create({
      data: {
        firstName: fName,
        lastName: lName,
        fatherName: "Ata Adı",
        birthDate: birthDate,
        birthPlace: cities[Math.floor(Math.random() * cities.length)],
        currentCity: city,
        missingDate: missingDate,
        missingLocation: cities[Math.floor(Math.random() * cities.length)],
        status: status,
        createdById: user.id,
        notes: "Sistem tərəfindən avtomatik əlavə edilmiş təsadüfi sınaq məlumatı.",
        relatives: "Qardaşı, Bacısı",
        phoneNumbers: "050-000-00-00"
      }
    });
  }
  
  console.log('Seeded 15 records successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
