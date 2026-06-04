/**
 * Seed script to populate initial store configurations.
 *
 * Usage: npx tsx scripts/seed.ts
 */

import { connectDB } from "../src/lib/db/mongodb";
import { Store } from "../src/lib/db/models/Store";

const stores = [
  {
    name: "Amazon India",
    slug: "amazon",
    baseUrl: "https://www.amazon.in",
    searchUrl: "https://www.amazon.in/s?k={query}",
    logoUrl: "/logos/amazon.svg",
    isActive: true,
    scrapeInterval: 3600,
  },
  {
    name: "Flipkart",
    slug: "flipkart",
    baseUrl: "https://www.flipkart.com",
    searchUrl: "https://www.flipkart.com/search?q={query}",
    logoUrl: "/logos/flipkart.svg",
    isActive: true,
    scrapeInterval: 3600,
  },
  {
    name: "Croma",
    slug: "croma",
    baseUrl: "https://www.croma.com",
    searchUrl: "https://www.croma.com/searchBanner/?q={query}",
    logoUrl: "/logos/croma.svg",
    isActive: true,
    scrapeInterval: 7200,
  },
  {
    name: "Reliance Digital",
    slug: "reliance_digital",
    baseUrl: "https://www.reliancedigital.in",
    searchUrl: "https://www.reliancedigital.in/search?q={query}",
    logoUrl: "/logos/reliance.svg",
    isActive: true,
    scrapeInterval: 7200,
  },
  {
    name: "Vijay Sales",
    slug: "vijay_sales",
    baseUrl: "https://www.vijaysales.com",
    searchUrl: "https://www.vijaysales.com/search?q={query}",
    logoUrl: "/logos/vijaysales.svg",
    isActive: true,
    scrapeInterval: 7200,
  },
  {
    name: "Tata Cliq",
    slug: "tata_cliq",
    baseUrl: "https://www.tatacliq.com",
    searchUrl: "https://www.tatacliq.com/search/?searchCategory=all&text={query}",
    logoUrl: "/logos/tatacliq.svg",
    isActive: true,
    scrapeInterval: 7200,
  },
  {
    name: "JioMart",
    slug: "jiomart",
    baseUrl: "https://www.jiomart.com",
    searchUrl: "https://www.jiomart.com/search/{query}",
    logoUrl: "/logos/jiomart.svg",
    isActive: true,
    scrapeInterval: 7200,
  },
];

async function main() {
  console.log("🌱 Seeding stores...\n");
  await connectDB();

  for (const store of stores) {
    await Store.findOneAndUpdate({ slug: store.slug }, store, { upsert: true });
    console.log(`  ✅ ${store.name}`);
  }

  console.log("\n✅ Seed complete");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
