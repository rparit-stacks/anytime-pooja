export async function fetchProducts(q?: string) {
  const url = q ? `/api/products?q=${encodeURIComponent(q)}` : "/api/products"
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch products")
  return (await res.json()) as any[]
}

export async function fetchProductById(idOrSlug: string) {
  const res = await fetch(`/api/products/${idOrSlug}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch product")
  return await res.json()
}
