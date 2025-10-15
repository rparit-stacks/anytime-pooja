import { createClient } from "@supabase/supabase-js"
// We import your current mock data so the site looks identical
import { products as mockProducts } from "@/lib/mock-products"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY! // use Supabase service role key so inserts succeed under RLS

async function main() {
  const supabase = createClient(url, serviceRole) // use service key
  console.log("[v0] Starting seed with", mockProducts.length, "products")

  // Upsert to avoid duplicates if script re-runs
  const { data, error } = await supabase.from("products").upsert(
    mockProducts.map((p: any) => ({
      id: p.id?.toString() || crypto.randomUUID(),
      name: p.name,
      description: p.description || null,
      image: p.image,
      price: p.price,
      original_price: p.originalPrice ?? null,
      rating: p.rating ?? null,
      reviews: p.reviews ?? null,
      category: p.category ?? null,
      badge: p.badge ?? null,
    })),
    { onConflict: "id" },
  )

  if (error) {
    console.log("[v0] Seed error:", error.message)
    return
  }

  console.log("[v0] Seed complete. Inserted/updated:", data?.length ?? 0)
}

main()
  .then(() => console.log("[v0] Seed finished"))
  .catch((e) => console.log("[v0] Seed failed:", e.message))
