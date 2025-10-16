import { NextRequest, NextResponse } from "next/server"
import { sendPaymentFailureEmail } from "@/lib/smtp"

export async function POST(request: NextRequest) {
  try {
    // Parse JSON with error handling
    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      console.error('JSON parsing error in payment failure:', parseError)
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 })
    }

    const { userEmail, userName, orderData, errorMessage } = requestData

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    if (!errorMessage) {
      return NextResponse.json({ error: 'Error message is required' }, { status: 400 })
    }

    // Ensure orderData has required fields with fallbacks
    const safeOrderData = {
      order_number: orderData?.order_number || 'N/A',
      total_amount: orderData?.total_amount || orderData?.total || 'N/A',
      ...orderData
    }

    // Send payment failure email
    try {
      const emailSent = await sendPaymentFailureEmail(userEmail, userName, safeOrderData, errorMessage)
      
      if (emailSent) {
        console.log('Payment failure email sent successfully to:', userEmail)
        return NextResponse.json({
          success: true,
          message: 'Payment failure notification sent successfully'
        })
      } else {
        console.error('Failed to send payment failure email to:', userEmail)
        return NextResponse.json({
          success: false,
          message: 'Failed to send payment failure notification'
        }, { status: 500 })
      }
    } catch (emailError) {
      console.error('Error sending payment failure email:', emailError)
      return NextResponse.json({
        success: false,
        message: 'Failed to send payment failure notification',
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in payment failure notification:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
