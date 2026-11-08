import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("No DATABASE_URL");
  process.exit(1);
}

const sql = neon(connectionString);

// Check existing users
const existingUsers = await sql.query("SELECT id, name, email, role FROM kiraylink_users");
let landlord = existingUsers.find(u => u.role === "landlord" || u.role === "admin");
if (!landlord) {
  landlord = {
    id: "9e4205b6-3c08-4d94-be5f-abe8add8655f",
    name: "Matiyas Getachew",
    email: "mat@gmail.com"
  };
}

const sampleProperties = [
  {
    id: "prop-bole-arabsa-1",
    title: "1-Bedroom Condominium in Bole Arabsa",
    tagline: "A comfortable home for simple city living",
    description: "A one-bedroom condominium featuring living room, separate kitchen, private bathroom, and balcony. Suitable for individuals or couples looking for a practical home around Arabsa.",
    price: 20000,
    rentPeriod: "month",
    location: "Bole Arabsa",
    neighborhood: "Ayat",
    city: "Addis Ababa",
    propertyType: "Condominium",
    bedrooms: 1,
    bathrooms: 1,
    care: 50,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Private Bathroom", "Kitchen", "Balcony", "Water Supply", "Electricity", "Nearby Shops"],
    featured: true,
    status: "available",
    yearBuilt: 2023,
    furnished: true,
    landlord: {
      id: landlord.id,
      name: landlord.name,
      email: landlord.email,
      phone: "+251 91 100 0000",
      company: "KirayLink Verified Landlord",
      responseTime: "within 2 hours"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "prop-kazanchis-studio-2",
    title: "Studio Apartment in Kazanchis",
    tagline: "A small private space near the city center",
    description: "A compact studio apartment with an open sleeping and living area, a modern kitchen cabinet and a private bathroom. Ideal for students and working professionals.",
    price: 15000,
    rentPeriod: "month",
    location: "Kazanchis",
    neighborhood: "Piassa",
    city: "Addis Ababa",
    propertyType: "Studio Apartment",
    bedrooms: 0,
    bathrooms: 1,
    care: 39,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Private Bathroom", "Kitchen cabinet", "Water Supply", "Electricity", "Public Transport Nearby"],
    featured: false,
    status: "available",
    yearBuilt: 2022,
    furnished: true,
    landlord: {
      id: landlord.id,
      name: landlord.name,
      email: landlord.email,
      phone: "+251 91 100 0000",
      company: "KirayLink Verified Landlord",
      responseTime: "within 2 hours"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "prop-ayat-room-3",
    title: "5x4 Single Room in Ayat",
    tagline: "An affordable room for students and young professionals",
    description: "A simple 5 by 4 meter single room with space for a bed, desk, and personal belongings. Features shared bathroom facilities and quiet neighborhood.",
    price: 6000,
    rentPeriod: "month",
    location: "Ayat Zone 3",
    neighborhood: "CMC and Arabsa",
    city: "Addis Ababa",
    propertyType: "Single Room",
    bedrooms: 0,
    bathrooms: 1,
    care: 17,
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Shared Bathroom", "Water Supply", "Electricity", "Nearby Shops"],
    featured: false,
    status: "available",
    yearBuilt: 2021,
    furnished: false,
    landlord: {
      id: landlord.id,
      name: landlord.name,
      email: landlord.email,
      phone: "+251 91 100 0000",
      company: "KirayLink Verified Landlord",
      responseTime: "within 2 hours"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "prop-jemo-condo-4",
    title: "2-Bedroom Condominium in Jemo 1",
    tagline: "Spacious modern home for a growing family",
    description: "A two bedroom condominium with a large living room, separate modern kitchen, bathroom, and balcony with open city views.",
    price: 35000,
    rentPeriod: "month",
    location: "Jemo 1 Site",
    neighborhood: "Mekanisa and Ayertena",
    city: "Addis Ababa",
    propertyType: "Condominium",
    bedrooms: 2,
    bathrooms: 1,
    care: 73,
    imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Dedicated Water Tank", "Kitchen Cabinet", "Balcony", "24/7 Security", "Compound Parking"],
    featured: true,
    status: "available",
    yearBuilt: 2024,
    furnished: true,
    landlord: {
      id: landlord.id,
      name: landlord.name,
      email: landlord.email,
      phone: "+251 91 100 0000",
      company: "KirayLink Verified Landlord",
      responseTime: "within 2 hours"
    },
    createdAt: new Date().toISOString()
  },
  {
    id: "prop-summit-apt-5",
    title: "3-Bedroom Luxury Apartment in Summit",
    tagline: "Exclusive high-floor residence with premium amenities",
    description: "A stunning 3-bedroom apartment with 2 master suites, expansive open living room, Italian-designed kitchen, private balcony, and backup power generator.",
    price: 85000,
    rentPeriod: "month",
    location: "Summit Condominium Gate 2",
    neighborhood: "Summit",
    city: "Addis Ababa",
    propertyType: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    care: 112,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Backup Generator", "High-Speed Elevator", "24/7 Security", "Private Balcony", "Water Reservoir"],
    featured: true,
    status: "available",
    yearBuilt: 2025,
    furnished: true,
    landlord: {
      id: landlord.id,
      name: landlord.name,
      email: landlord.email,
      phone: "+251 91 100 0000",
      company: "KirayLink Verified Landlord",
      responseTime: "within 2 hours"
    },
    createdAt: new Date().toISOString()
  }
];

for (const prop of sampleProperties) {
  const existing = await sql.query("SELECT id FROM kiraylink_properties WHERE id = $1", [prop.id]);
  if (existing.length === 0) {
    await sql.query(
      "INSERT INTO kiraylink_properties (id, landlord_id, landlord_email, status, is_seed, is_deleted, data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        prop.id,
        prop.landlord.id,
        prop.landlord.email.toLowerCase(),
        prop.status,
        false,
        false,
        JSON.stringify(prop),
        prop.createdAt
      ]
    );
    console.log(`Inserted property: ${prop.title}`);
  } else {
    await sql.query(
      "UPDATE kiraylink_properties SET data = $1, status = $2, is_deleted = false WHERE id = $3",
      [JSON.stringify(prop), prop.status, prop.id]
    );
    console.log(`Updated property: ${prop.title}`);
  }
}

console.log("Seeding verified properties finished successfully.");
