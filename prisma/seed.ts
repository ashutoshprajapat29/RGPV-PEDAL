import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding RGPV Bhopal campus bicycle fleet data with Cycle Stand locations...");

  // Clean existing data
  await prisma.booking.deleteMany();
  await prisma.bikeImage.deleteMany();
  await prisma.bike.deleteMany();

  const bikes = [
    {
      name: "Hero Lectro C6E Electric Cycle",
      brand: "Hero Lectro",
      model: "C6E",
      type: "Electric",
      frameSize: "M",
      gearCount: 7,
      isElectric: true,
      batteryRangeKm: 35,
      hourlyRate: 20.0,
      securityDeposit: 100.0,
      status: "AVAILABLE",
      description: "Comfortable smart electric bicycle with throttle & 3-level pedal assist. Perfect for quick commutes between RGPV Main Gate, Academic Blocks, and Hostels without breaking a sweat.",
      location: "RGPV Main Gate Cycle Stand",
      images: [
        {
          url: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80",
          isPrimary: true,
          caption: "Hero Lectro E-Cycle profile",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80",
          isPrimary: false,
          caption: "Handlebar with electric mode LED switch",
          sortOrder: 1,
        },
      ],
    },
    {
      name: "Firefox Target 21-Speed MTB",
      brand: "Firefox",
      model: "Target 29",
      type: "Mountain",
      frameSize: "L",
      gearCount: 21,
      isElectric: false,
      batteryRangeKm: null,
      hourlyRate: 15.0,
      securityDeposit: 50.0,
      status: "AVAILABLE",
      description: "21-speed Shimano geared mountain bike with front suspension fork and dual disc brakes. Sturdy frame handles campus gradients and uneven trails smoothly.",
      location: "UIT Academic Block Cycle Stand",
      images: [
        {
          url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
          isPrimary: true,
          caption: "Firefox Target side profile",
          sortOrder: 0,
        },
        {
          url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=1200&q=80",
          isPrimary: false,
          caption: "Front suspension & disc rotor",
          sortOrder: 1,
        },
      ],
    },
    {
      name: "Hercules Roadeo A50 Hardtail",
      brand: "Hercules",
      model: "Roadeo A50",
      type: "Mountain",
      frameSize: "M",
      gearCount: 21,
      isElectric: false,
      batteryRangeKm: null,
      hourlyRate: 12.0,
      securityDeposit: 50.0,
      status: "AVAILABLE",
      description: "Lightweight aluminum alloy frame, aggressive sport geometry, and Shimano Easy-fire shifters. Popular choice for students travelling across the sprawling RGPV green campus.",
      location: "Central Library Cycle Stand",
      images: [
        {
          url: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1200&q=80",
          isPrimary: true,
          caption: "Hercules Roadeo sporty profile",
          sortOrder: 0,
        },
      ],
    },
    {
      name: "Avon City Roadster (Single Speed)",
      brand: "Avon",
      model: "Campus Easy",
      type: "City",
      frameSize: "M",
      gearCount: 1,
      isElectric: false,
      batteryRangeKm: null,
      hourlyRate: 8.0,
      securityDeposit: 30.0,
      status: "AVAILABLE",
      description: "Low-maintenance, highly reliable single-speed campus cycle with comfort saddle, front metal basket, and full chain guard. Ideal for easy, economical rides.",
      location: "Hostel Cluster Cycle Stand",
      images: [
        {
          url: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=1200&q=80",
          isPrimary: true,
          caption: "Single speed roadster with basket",
          sortOrder: 0,
        },
      ],
    },
    {
      name: "Hero Sprint Pro Next Hybrid",
      brand: "Hero",
      model: "Sprint Pro",
      type: "Hybrid",
      frameSize: "M",
      gearCount: 7,
      isElectric: false,
      batteryRangeKm: null,
      hourlyRate: 10.0,
      securityDeposit: 40.0,
      status: "AVAILABLE",
      description: "Fast-rolling 700c hybrid bike with 7 Shimano gears and rigid fork. Excellent for fast transit between departments and campus sports ground.",
      location: "Sports Complex Cycle Stand",
      images: [
        {
          url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
          isPrimary: true,
          caption: "Hybrid commuter setup",
          sortOrder: 0,
        },
      ],
    },
  ];

  for (const b of bikes) {
    const { images, ...bikeData } = b;
    await prisma.bike.create({
      data: {
        ...bikeData,
        images: {
          create: images,
        },
      },
    });
  }

  console.log("RGPV fleet seeding with Cycle Stands completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
