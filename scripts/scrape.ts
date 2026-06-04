/**
 * CLI script to run price scraping manually.
 *
 * Usage: npx tsx scripts/scrape.ts "Samsung S25 Ultra"
 */

import { searchAllStores } from "../src/lib/scrapers";
import { connectDB } from "../src/lib/db/mongodb";
import { Product } from "../src/lib/db/models/Product";
import { PriceHistory } from "../src/lib/db/models/PriceHistory";

async function main() {
  const query = process.argv[2];
  if (!query) {
    console.error("Usage: npx tsx scripts/scrape.ts <search query>");
    process.exit(1);
  }

  console.log(`\n🔍 Searching for: "${query}"\n`);

  await connectDB();
  const results = await searchAllStores({ query, maxResults: 5 });

  for (const [store, products] of results) {
    console.log(`\n📦 ${store.toUpperCase()}`);
    console.log("─".repeat(50));

    if (products.length === 0) {
      console.log("  No results found");
      continue;
    }

    for (const product of products) {
      console.log(`  ${product.name}`);
      console.log(`  ₹${product.price.toLocaleString("en-IN")}`);
      console.log(`  Rating: ${product.rating || "N/A"}`);
      console.log(`  ${product.url}`);
      console.log();
    }
  }

  console.log("✅ Done");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
