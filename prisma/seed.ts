import { PrismaClient, UserRole, BookingStatus, InvoiceStatus, TrainingLevel } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to generate random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to pick random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate invoice number
function generateInvoiceNumber(date: Date, index: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `INV-${year}${month}-${String(index).padStart(3, "0")}`;
}

// Sample data
const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Oliver", "Isabella", "William", "Sophia", "James", "Mia", "Benjamin", "Charlotte", "Lucas", "Amelia", "Henry", "Harper", "Alexander", "Evelyn", "Sebastian", "Abigail", "Jack", "Emily", "Aiden", "Elizabeth", "Matthew", "Sofia", "Samuel", "Avery", "David"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];
const cities = ["Mill Valley", "Sausalito", "Tiburon", "Corte Madera", "Larkspur", "San Rafael", "Kentfield", "Ross", "Fairfax", "San Anselmo"];
const streets = ["Oak Street", "Pine Avenue", "Maple Lane", "Cedar Road", "Elm Court", "Birch Way", "Willow Drive", "Redwood Boulevard", "Sequoia Place", "Cypress Circle"];
const dogNames = ["Max", "Bella", "Charlie", "Luna", "Cooper", "Daisy", "Buddy", "Sadie", "Rocky", "Molly", "Bear", "Bailey", "Duke", "Maggie", "Tucker", "Sophie", "Jack", "Chloe", "Oliver", "Penny", "Zeus", "Zoey", "Toby", "Lola", "Finn", "Ruby", "Murphy", "Rosie", "Leo", "Lily", "Louie", "Gracie", "Bentley", "Stella", "Milo", "Roxy", "Bruno", "Coco", "Oscar", "Ellie", "Winston", "Nala", "Teddy", "Piper", "Gus", "Millie", "Archie", "Winnie", "Rex", "Scout"];
const breeds = ["Golden Retriever", "Labrador Retriever", "German Shepherd", "French Bulldog", "Poodle", "Beagle", "Australian Shepherd", "Cavalier King Charles Spaniel", "Dachshund", "Border Collie", "Siberian Husky", "Shih Tzu", "Boston Terrier", "Pembroke Welsh Corgi", "Cocker Spaniel", "Bernese Mountain Dog", "Boxer", "Maltese", "Vizsla", "Weimaraner", "Mixed Breed", "Labradoodle", "Goldendoodle", "Cockapoo", "Pomsky"];

async function main() {
  console.log("🌱 Seeding database with 2 years of historical data...\n");

  // Clean up existing data in correct order (respecting foreign keys)
  console.log("Cleaning up existing data...");
  await prisma.lessonProgress.deleteMany({});
  await prisma.tierPurchase.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.serviceRecord.deleteMany({});
  await prisma.bookingDog.deleteMany({});
  await prisma.bookingRequest.deleteMany({});
  await prisma.dog.deleteMany({});
  await prisma.clientProfile.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.emailRecipient.deleteMany({});
  await prisma.emailCampaign.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { not: UserRole.ADMIN } } });
  console.log("  ✓ Cleaned up existing data");

  // Create or update admin user
  console.log("\nCreating admin user...");
  const admin = await prisma.user.upsert({
    where: { email: "samantha@magicpaws.com" },
    update: { name: "Samantha Merlin" },
    create: {
      email: "samantha@magicpaws.com",
      name: "Samantha Merlin",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // Create service types
  console.log("\nCreating service types...");
  const serviceTypes = [
    {
      name: "Private Training",
      slug: "training",
      description: "One-on-one training sessions tailored to your dog's specific needs and your family's goals.",
      basePrice: 140.00,
      priceUnit: "PER_HOUR" as const,
      duration: 60,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Day Hike",
      slug: "day-hike",
      description: "Group hikes for well-socialized dogs on beautiful Marin trails. 4-hour adventure.",
      basePrice: 55.00,
      priceUnit: "PER_SESSION" as const,
      duration: 240,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Boarding",
      slug: "boarding",
      description: "Your dog stays in a loving home environment while you're away.",
      basePrice: 100.00,
      priceUnit: "PER_DAY" as const,
      duration: null,
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Grooming",
      slug: "grooming",
      description: "Professional grooming service for your dog.",
      basePrice: 50.00,
      priceUnit: "PER_SESSION" as const,
      duration: 60,
      isActive: true,
      sortOrder: 4,
    },
  ];

  // Delete old service types and create fresh ones
  await prisma.serviceType.deleteMany({});
  const createdServices: Awaited<ReturnType<typeof prisma.serviceType.create>>[] = [];
  for (const service of serviceTypes) {
    const svc = await prisma.serviceType.create({ data: service });
    createdServices.push(svc);
    console.log(`  ✓ Service: ${svc.name} ($${svc.basePrice})`);
  }

  const trainingService = createdServices.find(s => s.slug === "training")!;
  const hikeService = createdServices.find(s => s.slug === "day-hike")!;
  const boardingService = createdServices.find(s => s.slug === "boarding")!;
  const groomingService = createdServices.find(s => s.slug === "grooming")!;

  // Create 25 clients with varying join dates over 2 years
  console.log("\nCreating clients...");
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const now = new Date();

  const createdClients: { user: any; profile: any; dogs: any[] }[] = [];
  const usedEmails = new Set<string>();
  const usedDogNames = new Set<string>();

  for (let i = 0; i < 25; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

    // Ensure unique email
    let counter = 1;
    while (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@example.com`;
      counter++;
    }
    usedEmails.add(email);

    const joinDate = randomDate(twoYearsAgo, now);

    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        role: UserRole.CLIENT,
        emailVerified: joinDate,
        createdAt: joinDate,
      },
    });

    const profile = await prisma.clientProfile.create({
      data: {
        userId: user.id,
        phone: `(415) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        address: `${Math.floor(Math.random() * 999) + 1} ${randomItem(streets)}`,
        city: randomItem(cities),
        state: "CA",
        zipCode: `949${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`,
        emergencyContact: `${randomItem(firstNames)} ${lastName}`,
        emergencyPhone: `(415) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
        createdAt: joinDate,
      },
    });

    // Create 1-3 dogs per client
    const numDogs = Math.floor(Math.random() * 3) + 1;
    const dogs: any[] = [];

    for (let j = 0; j < numDogs; j++) {
      let dogName = randomItem(dogNames);
      // Ensure somewhat unique dog names (allow some duplicates across clients)
      let attempts = 0;
      while (usedDogNames.has(`${profile.id}-${dogName}`) && attempts < 10) {
        dogName = randomItem(dogNames);
        attempts++;
      }
      usedDogNames.add(`${profile.id}-${dogName}`);

      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - Math.floor(Math.random() * 12) - 1);
      birthDate.setMonth(Math.floor(Math.random() * 12));

      const dog = await prisma.dog.create({
        data: {
          clientId: profile.id,
          name: dogName,
          breed: randomItem(breeds),
          birthDate,
          weight: Math.floor(Math.random() * 80) + 10,
          gender: Math.random() > 0.5 ? "MALE" : "FEMALE",
          isNeutered: Math.random() > 0.2,
          trainingLevel: randomItem([TrainingLevel.NONE, TrainingLevel.BASIC, TrainingLevel.INTERMEDIATE, TrainingLevel.ADVANCED]),
          goodWithOtherDogs: Math.random() > 0.15,
          goodWithChildren: Math.random() > 0.1,
          isActive: true,
        },
      });
      dogs.push(dog);
    }

    createdClients.push({ user, profile, dogs });
    console.log(`  ✓ Client: ${user.name} (${dogs.length} dog${dogs.length > 1 ? "s" : ""}) - joined ${joinDate.toLocaleDateString()}`);
  }

  // Create bookings and invoices spread over 2 years
  console.log("\nCreating 2 years of bookings and invoices...");

  let invoiceCounter = 1;
  const monthlyInvoiceCounters: Record<string, number> = {};

  // Generate bookings for each month over the past 2 years
  const startDate = new Date(twoYearsAgo);
  startDate.setDate(1);

  let totalBookings = 0;
  let totalInvoices = 0;

  while (startDate < now) {
    const monthKey = `${startDate.getFullYear()}-${startDate.getMonth()}`;
    monthlyInvoiceCounters[monthKey] = 0;

    const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    const isCurrentMonth = startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
    const isPastMonth = startDate < new Date(now.getFullYear(), now.getMonth(), 1);

    // Generate 15-30 bookings per month (busier in summer)
    const isSummer = startDate.getMonth() >= 5 && startDate.getMonth() <= 8;
    const numBookings = Math.floor(Math.random() * 15) + (isSummer ? 25 : 15);

    for (let i = 0; i < numBookings; i++) {
      const client = randomItem(createdClients);
      // Only use clients who had joined by this date
      if (new Date(client.user.createdAt) > monthEnd) continue;

      const dog = randomItem(client.dogs);
      const service = randomItem(createdServices);

      const bookingDate = randomDate(startDate, monthEnd > now ? now : monthEnd);
      const hour = Math.floor(Math.random() * 4) + 8;
      const minute = Math.random() > 0.5 ? 0 : 30;
      const requestedTime = `${hour}:${minute === 0 ? "00" : "30"} AM`;

      // Create confirmedTime as a DateTime (same day, specific time)
      const confirmedTimeDate = new Date(bookingDate);
      confirmedTimeDate.setHours(hour, minute, 0, 0);

      // Determine status based on date
      let status: BookingStatus;
      let confirmedDate: Date | null = null;
      let confirmedTime: Date | null = null;

      if (isPastMonth) {
        // Past bookings: mostly completed, some cancelled/no-show
        const rand = Math.random();
        if (rand < 0.85) status = BookingStatus.COMPLETED;
        else if (rand < 0.92) status = BookingStatus.CANCELLED;
        else status = BookingStatus.NO_SHOW;
        confirmedDate = bookingDate;
        confirmedTime = confirmedTimeDate;
      } else if (isCurrentMonth) {
        // Current month: mix of completed, confirmed, pending
        const rand = Math.random();
        if (bookingDate < now) {
          if (rand < 0.9) status = BookingStatus.COMPLETED;
          else status = BookingStatus.NO_SHOW;
          confirmedDate = bookingDate;
          confirmedTime = confirmedTimeDate;
        } else {
          if (rand < 0.7) {
            status = BookingStatus.CONFIRMED;
            confirmedDate = bookingDate;
            confirmedTime = confirmedTimeDate;
          } else {
            status = BookingStatus.PENDING;
          }
        }
      } else {
        // Future (shouldn't happen with our date logic, but just in case)
        status = Math.random() > 0.3 ? BookingStatus.CONFIRMED : BookingStatus.PENDING;
        if (status === BookingStatus.CONFIRMED) {
          confirmedDate = bookingDate;
          confirmedTime = confirmedTimeDate;
        }
      }

      // Calculate duration for boarding (1-7 days)
      let duration = service.duration;
      let totalPrice = Number(service.basePrice);

      if (service.slug === "boarding") {
        const days = Math.floor(Math.random() * 7) + 1;
        duration = days * 24 * 60; // Convert to minutes
        totalPrice = Number(service.basePrice) * days;
      }

      const booking = await prisma.bookingRequest.create({
        data: {
          clientId: client.profile.id,
          serviceTypeId: service.id,
          status,
          requestedDate: bookingDate,
          requestedTime,
          confirmedDate,
          confirmedTime,
          duration,
          notes: Math.random() > 0.7 ? randomItem([
            "Please use back gate",
            "Dog is nervous around loud noises",
            "Call when arriving",
            "Dog needs medication at noon",
            "Please bring treats",
            "Dog doesn't like other dogs",
            "First time client",
            "Referred by a friend",
          ]) : null,
          createdAt: new Date(bookingDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          dogs: {
            create: { dogId: dog.id }
          }
        },
      });

      totalBookings++;

      // Create invoice for completed bookings
      if (status === BookingStatus.COMPLETED && isPastMonth) {
        monthlyInvoiceCounters[monthKey]++;
        const invoiceNumber = generateInvoiceNumber(bookingDate, monthlyInvoiceCounters[monthKey]);

        // Most invoices are paid, some sent, few overdue
        const rand = Math.random();
        let invoiceStatus: InvoiceStatus;
        let amountPaid = 0;
        let paidAt = null;

        if (rand < 0.88) {
          invoiceStatus = InvoiceStatus.PAID;
          amountPaid = totalPrice;
          paidAt = new Date(bookingDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
        } else if (rand < 0.95) {
          invoiceStatus = InvoiceStatus.SENT;
        } else {
          invoiceStatus = InvoiceStatus.OVERDUE;
        }

        await prisma.invoice.create({
          data: {
            clientId: client.profile.id,
            invoiceNumber,
            status: invoiceStatus,
            periodStart: bookingDate,
            periodEnd: bookingDate,
            subtotal: totalPrice,
            tax: 0,
            total: totalPrice,
            amountPaid,
            paidAt,
            dueDate: new Date(bookingDate.getTime() + 30 * 24 * 60 * 60 * 1000),
            issueDate: bookingDate,
            createdAt: bookingDate,
            items: {
              create: {
                description: `${service.name} - ${dog.name}`,
                quantity: service.slug === "boarding" ? Math.ceil(duration! / (24 * 60)) : 1,
                unitPrice: Number(service.basePrice),
                total: totalPrice,
              }
            }
          }
        });

        totalInvoices++;
      }
    }

    // Move to next month
    startDate.setMonth(startDate.getMonth() + 1);
  }

  console.log(`  ✓ Created ${totalBookings} bookings`);
  console.log(`  ✓ Created ${totalInvoices} invoices`);

  // Create some upcoming bookings (next 2 weeks)
  console.log("\nCreating upcoming bookings...");
  let upcomingCount = 0;

  for (let i = 0; i < 20; i++) {
    const client = randomItem(createdClients);
    const dog = randomItem(client.dogs);
    const service = randomItem(createdServices);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 14) + 1);

    const hour = Math.floor(Math.random() * 4) + 8;
    const minute = Math.random() > 0.5 ? 0 : 30;
    const status = Math.random() > 0.3 ? BookingStatus.CONFIRMED : BookingStatus.PENDING;
    const requestedTime = `${hour}:${minute === 0 ? "00" : "30"} AM`;

    const confirmedTimeDate = new Date(futureDate);
    confirmedTimeDate.setHours(hour, minute, 0, 0);

    await prisma.bookingRequest.create({
      data: {
        clientId: client.profile.id,
        serviceTypeId: service.id,
        status,
        requestedDate: futureDate,
        requestedTime,
        confirmedDate: status === BookingStatus.CONFIRMED ? futureDate : null,
        confirmedTime: status === BookingStatus.CONFIRMED ? confirmedTimeDate : null,
        duration: service.duration,
        dogs: {
          create: { dogId: dog.id }
        }
      },
    });
    upcomingCount++;
  }
  console.log(`  ✓ Created ${upcomingCount} upcoming bookings`);

  // Summary stats
  console.log("\n📊 Seed Summary:");
  console.log(`   • 1 admin user`);
  console.log(`   • ${createdClients.length} clients`);
  console.log(`   • ${createdClients.reduce((sum, c) => sum + c.dogs.length, 0)} dogs`);
  console.log(`   • ${totalBookings + upcomingCount} total bookings`);
  console.log(`   • ${totalInvoices} invoices`);
  console.log(`   • 4 service types`);

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
