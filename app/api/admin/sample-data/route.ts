import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    // Add sample reviews for testing
    const sampleReviews = [
      {
        product_id: 1,
        user_name: "Priya Sharma",
        user_email: "priya@example.com",
        rating: 5,
        title: "Excellent Quality!",
        comment: "This product exceeded my expectations. The quality is outstanding and it arrived quickly. Highly recommended!",
        is_verified: true,
        is_approved: true
      },
      {
        product_id: 1,
        user_name: "Rajesh Kumar",
        user_email: "rajesh@example.com",
        rating: 4,
        title: "Good Product",
        comment: "Good quality product. Fast delivery and good packaging. Would buy again.",
        is_verified: true,
        is_approved: true
      },
      {
        product_id: 2,
        user_name: "Sunita Patel",
        user_email: "sunita@example.com",
        rating: 5,
        title: "Perfect!",
        comment: "Exactly what I was looking for. Great quality and beautiful design. Very satisfied with my purchase.",
        is_verified: true,
        is_approved: true
      },
      {
        product_id: 2,
        user_name: "Amit Singh",
        user_email: "amit@example.com",
        rating: 4,
        title: "Nice Product",
        comment: "Good product with nice packaging. Delivery was on time. Recommended for others.",
        is_verified: false,
        is_approved: true
      },
      {
        product_id: 3,
        user_name: "Kavita Gupta",
        user_email: "kavita@example.com",
        rating: 5,
        title: "Amazing Quality!",
        comment: "This is one of the best products I've purchased. The craftsmanship is excellent and it looks beautiful.",
        is_verified: true,
        is_approved: true
      }
    ]

    // Insert sample reviews
    for (const review of sampleReviews) {
      const sql = `
        INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, is_verified, is_approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
      await query(sql, [
        review.product_id,
        review.user_name,
        review.user_email,
        review.rating,
        review.title,
        review.comment,
        review.is_verified,
        review.is_approved
      ])
    }

    return NextResponse.json({ 
      success: true, 
      message: `Added ${sampleReviews.length} sample reviews` 
    })
  } catch (error) {
    console.error('Error adding sample data:', error)
    return NextResponse.json({ error: 'Failed to add sample data' }, { status: 500 })
  }
}
