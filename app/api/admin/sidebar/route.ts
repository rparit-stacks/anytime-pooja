import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    // Default sidebar items - you can store these in database later
    const defaultItems = [
      {
        id: "1",
        label: "Home",
        href: "/",
        icon: "home",
        isActive: true,
        sortOrder: 1,
        isVisible: true
      },
      {
        id: "2", 
        label: "About",
        href: "/about",
        icon: "about",
        isActive: true,
        sortOrder: 2,
        isVisible: true
      },
      {
        id: "3",
        label: "Category",
        href: "#",
        icon: "category", 
        isActive: true,
        sortOrder: 3,
        isVisible: true
      },
      {
        id: "4",
        label: "Cart",
        href: "/cart",
        icon: "cart",
        isActive: true,
        sortOrder: 4,
        isVisible: true
      },
      {
        id: "5",
        label: "Sale",
        href: "/products?category=sale",
        icon: "sale",
        isActive: true,
        sortOrder: 5,
        isVisible: true
      }
    ]

    return NextResponse.json({ items: defaultItems })
  } catch (error) {
    console.error('Error fetching sidebar items:', error)
    return NextResponse.json({ error: 'Failed to fetch sidebar items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    // For now, we'll just return success
    // In a real implementation, you'd save these to a database table
    console.log('Sidebar items updated:', items)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sidebar settings saved successfully' 
    })
  } catch (error) {
    console.error('Error saving sidebar items:', error)
    return NextResponse.json({ error: 'Failed to save sidebar items' }, { status: 500 })
  }
}
