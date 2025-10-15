import { NextRequest, NextResponse } from "next/server"
import nodemailer from 'nodemailer'

interface EmailRequest {
  to: string
  subject: string
  html?: string
  text?: string
  from: string
  replyTo?: string
  smtp: {
    host: string
    port: number
    secure: boolean
    username: string
    password: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const emailData: EmailRequest = await request.json()
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: emailData.smtp.host,
      port: emailData.smtp.port,
      secure: emailData.smtp.secure,
      auth: {
        user: emailData.smtp.username,
        pass: emailData.smtp.password
      }
    })

    // Verify connection
    await transporter.verify()

    // Send email
    const info = await transporter.sendMail({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      replyTo: emailData.replyTo
    })

    console.log('Email sent successfully:', info.messageId)
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email sent successfully' 
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
