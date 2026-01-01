import { PrismaClient, UserRole, BookingStatus, InvoiceStatus, TrainingLevel } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Update old service types with wrong slugs to new values
  console.log("Updating old service types...");
  await prisma.serviceType.updateMany({
    where: { slug: "hiking" },
    data: { slug: "day-hike", name: "Day Hike", isActive: true }
  });
  await prisma.serviceType.updateMany({
    where: { slug: "grooming-nails" },
    data: { slug: "grooming", name: "Grooming", basePrice: 50.00, duration: 60, isActive: true }
  });

  // Delete existing invoices to avoid duplicate invoice number errors
  console.log("Cleaning up old invoices...");
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});

  // Create admin user
  console.log("Creating admin user...");
  const admin = await prisma.user.upsert({
    where: { email: "samantha@magicpaws.com" },
    update: {},
    create: {
      email: "samantha@magicpaws.com",
      name: "Samantha Merlin",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // Create sample clients
  console.log("\nCreating sample clients...");

  const clients = [
    {
      email: "john.smith@example.com",
      name: "John Smith",
      phone: "(415) 555-1234",
      city: "Mill Valley",
      address: "123 Mill Valley Ave",
      emergencyContact: "Jane Smith",
      emergencyPhone: "(415) 555-1235",
      notes: "Prefers morning appointments",
    },
    {
      email: "sarah.johnson@example.com",
      name: "Sarah Johnson",
      phone: "(415) 555-2345",
      city: "Mill Valley",
      address: "456 Throckmorton Ave",
      emergencyContact: "Mike Johnson",
      emergencyPhone: "(415) 555-2346",
      notes: "Has two dogs, often books together",
    },
    {
      email: "michael.chen@example.com",
      name: "Michael Chen",
      phone: "(415) 555-3456",
      city: "Mill Valley",
      address: "789 Cascade Dr",
      emergencyContact: "Lisa Chen",
      emergencyPhone: "(415) 555-3457",
      notes: "New client, referred by Sarah Johnson",
    },
    {
      email: "alice.thompson@example.com",
      name: "Alice Thompson",
      phone: "(415) 555-4567",
      city: "Sausalito",
      address: "101 Bridgeway",
      emergencyContact: "Tom Thompson",
      emergencyPhone: "(415) 555-4568",
      notes: "Works from home, flexible schedule",
    },
    {
      email: "bob.martinez@example.com",
      name: "Bob Martinez",
      phone: "(415) 555-5678",
      city: "San Rafael",
      address: "202 Fourth Street",
      emergencyContact: "Maria Martinez",
      emergencyPhone: "(415) 555-5679",
      notes: "Weekend appointments preferred",
    },
    {
      email: "carol.williams@example.com",
      name: "Carol Williams",
      phone: "(415) 555-6789",
      city: "Tiburon",
      address: "303 Main Street",
      emergencyContact: "David Williams",
      emergencyPhone: "(415) 555-6790",
      notes: "Has elderly dog, needs gentle handling",
    },
  ];

  const createdClients = [];
  for (const clientData of clients) {
    const user = await prisma.user.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        email: clientData.email,
        name: clientData.name,
        role: UserRole.CLIENT,
        emailVerified: new Date(),
        clientProfile: {
          create: {
            phone: clientData.phone,
            city: clientData.city,
            address: clientData.address,
            emergencyContact: clientData.emergencyContact,
            emergencyPhone: clientData.emergencyPhone,
            notes: clientData.notes,
          },
        },
        notificationPreference: {
          create: {
            bookingReminders: true,
            bookingUpdates: true,
            invoiceNotifications: true,
            marketingEmails: true,
            trainingUpdates: true,
          },
        },
      },
      include: { clientProfile: true },
    });
    createdClients.push(user);
    console.log(`  ✓ Client: ${user.name}`);
  }

  // Create sample dogs
  console.log("\nCreating sample dogs...");
  const dogData = [
    {
      name: "Max",
      breed: "Golden Retriever",
      weight: 70,
      temperament: "Very friendly, loves treats. Working on leash reactivity.",
      medicalConditions: "No known allergies",
      trainingLevel: TrainingLevel.INTERMEDIATE,
      clientId: createdClients[0].clientProfile!.id,
    },
    {
      name: "Luna",
      breed: "Australian Shepherd",
      weight: 45,
      temperament: "High energy, very smart. Needs lots of mental stimulation.",
      dietaryNeeds: "Sensitive stomach - no chicken treats",
      trainingLevel: TrainingLevel.BASIC,
      clientId: createdClients[1].clientProfile!.id,
    },
    {
      name: "Cooper",
      breed: "Labrador Mix",
      weight: 65,
      temperament: "Calm, well-trained. Good with other dogs.",
      medicalConditions: "Hip dysplasia - avoid jumping",
      trainingLevel: TrainingLevel.ADVANCED,
      clientId: createdClients[1].clientProfile!.id,
    },
    {
      name: "Bella",
      breed: "French Bulldog",
      weight: 25,
      temperament: "Sweet but stubborn. Food motivated.",
      medicalConditions: "Brachycephalic - monitor in heat",
      trainingLevel: TrainingLevel.BASIC,
      clientId: createdClients[2].clientProfile!.id,
    },
    {
      name: "Buddy",
      breed: "Beagle",
      weight: 28,
      temperament: "Friendly and curious. Strong prey drive.",
      medicalConditions: "None",
      trainingLevel: TrainingLevel.BASIC,
      clientId: createdClients[3].clientProfile!.id,
    },
    {
      name: "Daisy",
      breed: "Poodle Mix",
      weight: 35,
      temperament: "Intelligent, eager to please. Good with kids.",
      dietaryNeeds: "Grain-free diet",
      trainingLevel: TrainingLevel.INTERMEDIATE,
      clientId: createdClients[3].clientProfile!.id,
    },
    {
      name: "Rocky",
      breed: "German Shepherd",
      weight: 85,
      temperament: "Protective, loyal. Needs confident handling.",
      medicalConditions: "Allergies to grass",
      trainingLevel: TrainingLevel.INTERMEDIATE,
      clientId: createdClients[4].clientProfile!.id,
    },
    {
      name: "Molly",
      breed: "Senior Labrador",
      weight: 60,
      temperament: "Gentle, patient. Low energy.",
      medicalConditions: "Arthritis - needs joint supplements",
      trainingLevel: TrainingLevel.ADVANCED,
      clientId: createdClients[5].clientProfile!.id,
    },
  ];

  const createdDogs = [];
  for (const data of dogData) {
    const dog = await prisma.dog.create({
      data: {
        name: data.name,
        breed: data.breed,
        weight: data.weight,
        temperament: data.temperament,
        medicalConditions: data.medicalConditions,
        dietaryNeeds: data.dietaryNeeds,
        trainingLevel: data.trainingLevel,
        client: { connect: { id: data.clientId } },
      },
    });
    createdDogs.push(dog);
    console.log(`  ✓ Dog: ${dog.name} (${dog.breed})`);
  }

  // Create service types
  console.log("\nCreating service types...");
  const serviceTypes = [
    {
      name: "Private Dog Training",
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

  const createdServices = [];
  for (const service of serviceTypes) {
    const svc = await prisma.serviceType.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
    createdServices.push(svc);
    console.log(`  ✓ Service: ${svc.name}`);
  }

  // Create booking requests
  console.log("\nCreating booking requests...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  // Confirmed booking for Max
  const booking1 = await prisma.bookingRequest.create({
    data: {
      client: { connect: { id: createdClients[0].clientProfile!.id } },
      serviceType: { connect: { id: createdServices[0].id } },
      status: BookingStatus.CONFIRMED,
      requestedDate: tomorrow,
      requestedTime: "morning",
      notes: "Working on leash reactivity, bring high-value treats",
      confirmedDate: tomorrow,
      confirmedTime: tomorrow,
      dogs: {
        create: { dogId: createdDogs[0].id },
      },
    },
    include: { dogs: { include: { dog: true } } },
  });
  console.log(`  ✓ Booking: ${booking1.dogs[0].dog.name} - ${booking1.status}`);

  // Pending booking for Luna
  const booking2 = await prisma.bookingRequest.create({
    data: {
      client: { connect: { id: createdClients[1].clientProfile!.id } },
      serviceType: { connect: { id: createdServices[0].id } },
      status: BookingStatus.PENDING,
      requestedDate: nextWeek,
      requestedTime: "afternoon",
      notes: "First session - behavior assessment",
      dogs: {
        create: { dogId: createdDogs[1].id },
      },
    },
    include: { dogs: { include: { dog: true } } },
  });
  console.log(`  ✓ Booking: ${booking2.dogs[0].dog.name} - ${booking2.status}`);

  // Confirmed nail trim for Bella
  const booking3 = await prisma.bookingRequest.create({
    data: {
      client: { connect: { id: createdClients[2].clientProfile!.id } },
      serviceType: { connect: { id: createdServices[3].id } },
      status: BookingStatus.CONFIRMED,
      requestedDate: nextWeek,
      requestedTime: "afternoon",
      notes: "Nail trim, dog can be anxious",
      confirmedDate: nextWeek,
      confirmedTime: nextWeek,
      dogs: {
        create: { dogId: createdDogs[3].id },
      },
    },
    include: { dogs: { include: { dog: true } } },
  });
  console.log(`  ✓ Booking: ${booking3.dogs[0].dog.name} - ${booking3.status}`);

  // Pending training for Buddy (Alice's dog)
  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  const booking4 = await prisma.bookingRequest.create({
    data: {
      client: { connect: { id: createdClients[3].clientProfile!.id } },
      serviceType: { connect: { id: createdServices[0].id } },
      status: BookingStatus.PENDING,
      requestedDate: inTwoDays,
      requestedTime: "morning",
      notes: "Buddy has strong prey drive, need help with recall",
      dogs: {
        create: { dogId: createdDogs[4].id },
      },
    },
    include: { dogs: { include: { dog: true } } },
  });
  console.log(`  ✓ Booking: ${booking4.dogs[0].dog.name} - ${booking4.status}`);

  // Rejected booking for Rocky (Bob's dog) - schedule conflict
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const booking5 = await prisma.bookingRequest.create({
    data: {
      client: { connect: { id: createdClients[4].clientProfile!.id } },
      serviceType: { connect: { id: createdServices[2].id } },
      status: BookingStatus.REJECTED,
      requestedDate: lastWeek,
      requestedTime: "all day",
      notes: "Need boarding for the weekend",
      rejectionReason: "Fully booked for that weekend. Suggested alternative dates.",
      dogs: {
        create: { dogId: createdDogs[6].id },
      },
    },
    include: { dogs: { include: { dog: true } } },
  });
  console.log(`  ✓ Booking: ${booking5.dogs[0].dog.name} - ${booking5.status}`);

  // Completed booking for Molly (Carol's dog)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const booking6 = await prisma.bookingRequest.create({
    data: {
      client: { connect: { id: createdClients[5].clientProfile!.id } },
      serviceType: { connect: { id: createdServices[3].id } },
      status: BookingStatus.COMPLETED,
      requestedDate: twoWeeksAgo,
      requestedTime: "afternoon",
      notes: "Gentle nail trim for senior dog",
      confirmedDate: twoWeeksAgo,
      confirmedTime: twoWeeksAgo,
      dogs: {
        create: { dogId: createdDogs[7].id },
      },
    },
    include: { dogs: { include: { dog: true } } },
  });
  console.log(`  ✓ Booking: ${booking6.dogs[0].dog.name} - ${booking6.status}`);

  // Cancelled booking
  const booking7 = await prisma.bookingRequest.create({
    data: {
      client: { connect: { id: createdClients[3].clientProfile!.id } },
      serviceType: { connect: { id: createdServices[0].id } },
      status: BookingStatus.CANCELLED,
      requestedDate: lastWeek,
      requestedTime: "afternoon",
      notes: "Training session for Daisy",
      adminNotes: "Client cancelled due to illness",
      dogs: {
        create: { dogId: createdDogs[5].id },
      },
    },
    include: { dogs: { include: { dog: true } } },
  });
  console.log(`  ✓ Booking: ${booking7.dogs[0].dog.name} - ${booking7.status}`);

  // Create past service records with invoice
  console.log("\nCreating service records and invoice...");
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  lastMonth.setDate(1);

  const lastMonthEnd = new Date(lastMonth);
  lastMonthEnd.setMonth(lastMonthEnd.getMonth() + 1);
  lastMonthEnd.setDate(0);

  // Invoice 1: PAID - John Smith (Max)
  const invoice1 = await prisma.invoice.create({
    data: {
      client: { connect: { id: createdClients[0].clientProfile!.id } },
      invoiceNumber: `INV-${lastMonth.getFullYear()}${String(lastMonth.getMonth() + 1).padStart(2, "0")}-001`,
      status: InvoiceStatus.PAID,
      periodStart: lastMonth,
      periodEnd: lastMonthEnd,
      subtotal: 280.00,
      tax: 0,
      total: 280.00,
      amountPaid: 280.00,
      dueDate: new Date(lastMonthEnd.getTime() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(lastMonthEnd.getTime() + 15 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            description: "Private Dog Training - Max",
            quantity: 2,
            unitPrice: 140.00,
            total: 280.00,
          },
        ],
      },
    },
  });
  console.log(`  ✓ Invoice: ${invoice1.invoiceNumber} (${invoice1.status})`);

  // Invoice 2: SENT - Alice Thompson (Buddy & Daisy)
  const invoice2 = await prisma.invoice.create({
    data: {
      client: { connect: { id: createdClients[3].clientProfile!.id } },
      invoiceNumber: `INV-${lastMonth.getFullYear()}${String(lastMonth.getMonth() + 1).padStart(2, "0")}-002`,
      status: InvoiceStatus.SENT,
      periodStart: lastMonth,
      periodEnd: lastMonthEnd,
      subtotal: 195.00,
      tax: 0,
      total: 195.00,
      amountPaid: 0,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            description: "Private Dog Training - Buddy",
            quantity: 1,
            unitPrice: 140.00,
            total: 140.00,
          },
          {
            description: "Day Hike - Daisy",
            quantity: 1,
            unitPrice: 55.00,
            total: 55.00,
          },
        ],
      },
    },
  });
  console.log(`  ✓ Invoice: ${invoice2.invoiceNumber} (${invoice2.status})`);

  // Invoice 3: OVERDUE - Bob Martinez (Rocky)
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const invoice3 = await prisma.invoice.create({
    data: {
      client: { connect: { id: createdClients[4].clientProfile!.id } },
      invoiceNumber: `INV-${twoMonthsAgo.getFullYear()}${String(twoMonthsAgo.getMonth() + 1).padStart(2, "0")}-003`,
      status: InvoiceStatus.OVERDUE,
      periodStart: twoMonthsAgo,
      periodEnd: new Date(twoMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 140.00,
      tax: 0,
      total: 140.00,
      amountPaid: 0,
      dueDate: new Date(twoMonthsAgo.getTime() + 45 * 24 * 60 * 60 * 1000),
      notes: "Payment reminder sent on " + new Date(twoMonthsAgo.getTime() + 50 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      items: {
        create: [
          {
            description: "Private Dog Training - Rocky",
            quantity: 1,
            unitPrice: 140.00,
            total: 140.00,
          },
        ],
      },
    },
  });
  console.log(`  ✓ Invoice: ${invoice3.invoiceNumber} (${invoice3.status})`);

  // Invoice 4: PARTIAL - Carol Williams (Molly)
  const invoice4 = await prisma.invoice.create({
    data: {
      client: { connect: { id: createdClients[5].clientProfile!.id } },
      invoiceNumber: `INV-${lastMonth.getFullYear()}${String(lastMonth.getMonth() + 1).padStart(2, "0")}-004`,
      status: InvoiceStatus.PARTIAL,
      periodStart: lastMonth,
      periodEnd: lastMonthEnd,
      subtotal: 60.00,
      tax: 0,
      total: 60.00,
      amountPaid: 20.00,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: "Partial payment received, remaining balance due",
      items: {
        create: [
          {
            description: "Nail Trim - Molly",
            quantity: 2,
            unitPrice: 20.00,
            total: 40.00,
          },
          {
            description: "Grooming supplies",
            quantity: 1,
            unitPrice: 20.00,
            total: 20.00,
          },
        ],
      },
    },
  });
  console.log(`  ✓ Invoice: ${invoice4.invoiceNumber} (${invoice4.status})`);

  // Invoice 5: DRAFT - Sarah Johnson (Luna & Cooper)
  const invoice5 = await prisma.invoice.create({
    data: {
      client: { connect: { id: createdClients[1].clientProfile!.id } },
      invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-005`,
      status: InvoiceStatus.DRAFT,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subtotal: 250.00,
      tax: 0,
      total: 250.00,
      amountPaid: 0,
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            description: "Private Dog Training - Luna",
            quantity: 1,
            unitPrice: 140.00,
            total: 140.00,
          },
          {
            description: "Day Hike - Luna & Cooper",
            quantity: 2,
            unitPrice: 55.00,
            total: 110.00,
          },
        ],
      },
    },
  });
  console.log(`  ✓ Invoice: ${invoice5.invoiceNumber} (${invoice5.status})`);

  // Create content tiers with modules and lessons
  console.log("\nCreating training content...");

  const foundationTier = await prisma.contentTier.upsert({
    where: { slug: "foundation" },
    update: {},
    create: {
      name: "Foundation",
      slug: "foundation",
      description: "Essential training basics for new dog parents. Learn commands, house training, and socialization.",
      price: 29.00,
      sortOrder: 1,
      isActive: true,
      modules: {
        create: [
          {
            title: "Getting Started",
            slug: "getting-started",
            description: "Set up for success with your new training journey",
            sortOrder: 1,
            isPublished: true,
            lessons: {
              create: [
                {
                  title: "Welcome to Foundation Training",
                  slug: "welcome",
                  description: "Introduction to positive reinforcement and what to expect",
                  youtubeVideoId: "dQw4w9WgXcQ",
                  videoDuration: 480,
                  sortOrder: 1,
                  isPublished: true,
                },
                {
                  title: "Setting Up Your Training Space",
                  slug: "training-space",
                  description: "Essential equipment and environment setup",
                  youtubeVideoId: "dQw4w9WgXcQ",
                  videoDuration: 360,
                  sortOrder: 2,
                  isPublished: true,
                },
              ],
            },
          },
          {
            title: "Basic Commands",
            slug: "basic-commands",
            description: "Master the essential commands every dog should know",
            sortOrder: 2,
            isPublished: true,
            lessons: {
              create: [
                {
                  title: "Teaching Sit",
                  slug: "sit",
                  description: "The foundation of all commands",
                  youtubeVideoId: "dQw4w9WgXcQ",
                  videoDuration: 600,
                  sortOrder: 1,
                  isPublished: true,
                },
                {
                  title: "Teaching Down",
                  slug: "down",
                  description: "A calming command for everyday use",
                  youtubeVideoId: "dQw4w9WgXcQ",
                  videoDuration: 720,
                  sortOrder: 2,
                  isPublished: true,
                },
                {
                  title: "Teaching Stay",
                  slug: "stay",
                  description: "Building impulse control",
                  youtubeVideoId: "dQw4w9WgXcQ",
                  videoDuration: 900,
                  sortOrder: 3,
                  isPublished: true,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`  ✓ Tier: ${foundationTier.name}`);

  const intermediateTier = await prisma.contentTier.upsert({
    where: { slug: "intermediate" },
    update: {},
    create: {
      name: "Intermediate",
      slug: "intermediate",
      description: "Real-world training skills. Advanced leash manners, recall, and impulse control.",
      price: 49.00,
      sortOrder: 2,
      isActive: true,
      modules: {
        create: [
          {
            title: "Leash Skills",
            slug: "leash-skills",
            description: "Master walking without pulling",
            sortOrder: 1,
            isPublished: true,
            lessons: {
              create: [
                {
                  title: "Understanding Leash Pressure",
                  slug: "leash-pressure",
                  description: "Why dogs pull and how to change it",
                  youtubeVideoId: "dQw4w9WgXcQ",
                  videoDuration: 600,
                  sortOrder: 1,
                  isPublished: true,
                },
                {
                  title: "Loose Leash Walking",
                  slug: "loose-leash",
                  description: "Step-by-step training process",
                  youtubeVideoId: "dQw4w9WgXcQ",
                  videoDuration: 900,
                  sortOrder: 2,
                  isPublished: true,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`  ✓ Tier: ${intermediateTier.name}`);

  const advancedTier = await prisma.contentTier.upsert({
    where: { slug: "advanced" },
    update: {},
    create: {
      name: "Advanced",
      slug: "advanced",
      description: "Master-level training. Off-leash reliability, behavior modification, and more.",
      price: 79.00,
      sortOrder: 3,
      isActive: true,
      modules: {
        create: [
          {
            title: "Off-Leash Freedom",
            slug: "off-leash",
            description: "Building reliable off-leash obedience",
            sortOrder: 1,
            isPublished: true,
            lessons: {
              create: [
                {
                  title: "Prerequisites for Off-Leash",
                  slug: "prerequisites",
                  description: "Is your dog ready? Assessment checklist",
                  youtubeVideoId: "dQw4w9WgXcQ",
                  videoDuration: 480,
                  sortOrder: 1,
                  isPublished: true,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`  ✓ Tier: ${advancedTier.name}`);

  // Create a sample email campaign draft
  console.log("\nCreating sample email campaign...");
  const campaign = await prisma.emailCampaign.create({
    data: {
      name: "New Year 2025 Promo",
      subject: "New Year Training Special - 20% Off First Session!",
      content: `
        <h1>Happy New Year from Magic Paws!</h1>
        <p>Start the new year right with professional dog training.</p>
        <p>Book your first session in January and receive <strong>20% off</strong>!</p>
        <p>Whether you have a new puppy or want to refine your dog's skills, we're here to help.</p>
        <p>Best,<br>Samantha</p>
      `,
      status: "DRAFT",
      targetAll: true,
      targetRoles: [],
    },
  });
  console.log(`  ✓ Campaign draft: ${campaign.name}`);

  console.log("\n✅ Seeding complete!");
  console.log("\n📝 Test accounts (use magic link login):");
  console.log("   Admin: samantha@magicpaws.com");
  console.log("\n   Clients:");
  console.log("   - john.smith@example.com (Max)");
  console.log("   - sarah.johnson@example.com (Luna, Cooper)");
  console.log("   - michael.chen@example.com (Bella)");
  console.log("   - alice.thompson@example.com (Buddy, Daisy)");
  console.log("   - bob.martinez@example.com (Rocky)");
  console.log("   - carol.williams@example.com (Molly)");
  console.log("\n📊 Test data summary:");
  console.log("   - 6 clients with profiles");
  console.log("   - 8 dogs");
  console.log("   - 7 bookings (various statuses)");
  console.log("   - 5 invoices (PAID, SENT, OVERDUE, PARTIAL, DRAFT)");
  console.log("   - 3 training content tiers");
  console.log("   - 1 email campaign draft");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
