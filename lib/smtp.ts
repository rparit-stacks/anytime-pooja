// SMTP Email Service for Anytime Pooja
// Handles all email communications including order confirmations, OTP, etc.

interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
}

interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('SendEmail called with options:', {
      to: options.to,
      subject: options.subject,
      from: options.from
    })
    
    // Use SMTP credentials from environment variables
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME || '',
        pass: process.env.SMTP_PASSWORD || ''
      }
    }

    // Validate required SMTP configuration
    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      console.error('❌ SMTP credentials not configured properly')
      return false
    }
    
    // Validate email recipients
    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
      console.error('❌ No recipients defined:', options.to)
      return false
    }

    const emailData = {
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html || options.text,
      text: options.text,
      from: options.from || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME || 'noreply@anytimepooja.com',
      replyTo: options.replyTo || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USERNAME || 'noreply@anytimepooja.com'
    }

    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer')
    
    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig)
    
    // Verify connection configuration
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully')
    
    // Send email
    const info = await transporter.sendMail({
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    })
    
    console.log('📧 Email sent successfully:', {
      messageId: info.messageId,
      to: emailData.to,
      subject: emailData.subject
    })
    
    return true
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return false
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const subject = 'Welcome to Anytime Pooja!'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome to Anytime Pooja!</h1>
      <p>Dear ${userName},</p>
      <p>Thank you for joining our spiritual community. We're excited to help you on your spiritual journey.</p>
      <p>Explore our collection of authentic spiritual products, pooja essentials, and sacred items.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://anytimepooja.com/products" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Shop Now
        </a>
      </div>
      <p>Best regards,<br>The Anytime Pooja Team</p>
    </div>
  `
  
  return await sendEmail({
    to: userEmail,
    subject,
    html
  })
}

export async function sendOrderConfirmationEmail(order: any, orderItems: any[]): Promise<boolean> {
  const subject = `Order Confirmation #${order.order_number}`
  const userName = order.first_name ? `${order.first_name} ${order.last_name}` : 'Customer'
  const userEmail = order.email || order.billing_email || order.shipping_email
  
  console.log('Email sending attempt:', {
    order_number: order.order_number,
    userEmail,
    email: order.email,
    billing_email: order.billing_email,
    shipping_email: order.shipping_email,
    userName
  })
  
  // Validate email address
  if (!userEmail) {
    console.error('❌ No email address found in order data:', order)
    return false
  }
  
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name || item.product_name || 'Product'}</strong>
        ${item.id ? `<br><small style="color: #666;">Product ID: ${item.id}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity || 1}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${item.price || item.product_price || 0}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${(item.price || item.product_price || 0) * (item.quantity || 1)}
      </td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Order Confirmation</h1>
      <p>Dear ${userName},</p>
      <p>Thank you for your order! We've received your order and will process it shortly.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> #${order.order_number}</p>
        <p><strong>Customer Name:</strong> ${order.first_name} ${order.last_name}</p>
        <p><strong>Customer Email:</strong> ${order.email}</p>
        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
        <p><strong>Payment Status:</strong> ${order.payment_status}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method || 'Razorpay'}</p>
        <p><strong>Subtotal:</strong> ₹${order.subtotal || order.total_amount}</p>
        <p><strong>Shipping:</strong> ₹${order.shipping_cost || 0}</p>
        <p><strong>Tax:</strong> ₹${order.tax || 0}</p>
        <p><strong>Total Amount:</strong> ₹${order.total_amount}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3>Order Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Shipping Address:</h3>
        <p>${order.shipping_first_name} ${order.shipping_last_name}</p>
        <p>${order.shipping_address_line_1}</p>
        ${order.shipping_address_line_2 ? `<p>${order.shipping_address_line_2}</p>` : ''}
        <p>${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}</p>
        <p>${order.shipping_country}</p>
        ${order.shipping_phone ? `<p>Phone: ${order.shipping_phone}</p>` : ''}
      </div>

      <p>We'll send you a shipping confirmation once your order is dispatched.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The Anytime Pooja Team</p>
    </div>
  `
  
  return await sendEmail({
    to: userEmail,
    subject,
    html
  })
}

export async function sendVerificationEmail(userEmail: string, userName: string, verificationToken: string): Promise<boolean> {
  const subject = 'Verify Your Email - Anytime Pooja'
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Verify Your Email Address</h1>
      <p>Dear ${userName},</p>
      <p>Thank you for registering with Anytime Pooja! Please verify your email address to complete your registration.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Verify Email Address
        </a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This verification link will expire in 24 hours.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
      <p>Best regards,<br>The Anytime Pooja Team</p>
    </div>
  `
  
  return await sendEmail({
    to: userEmail,
    subject,
    html
  })
}

export async function sendPaymentFailureEmail(userEmail: string, userName: string, orderData: any, errorMessage: string): Promise<boolean> {
  const subject = `Payment Failed - Order #${orderData.order_number || 'N/A'}`
  const displayName = userName || 'Customer'
  
  console.log('Payment failure email sending attempt:', {
    userEmail,
    userName,
    order_number: orderData.order_number,
    errorMessage
  })
  
  // Validate email address
  if (!userEmail) {
    console.error('❌ No email address found for payment failure notification')
    return false
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">Payment Failed</h1>
      <p>Dear ${displayName},</p>
      <p>We're sorry to inform you that your payment for order #${orderData.order_number || 'N/A'} could not be processed.</p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #dc2626; margin-top: 0;">Payment Details</h3>
        <p><strong>Order Number:</strong> ${orderData.order_number || 'N/A'}</p>
        <p><strong>Customer Name:</strong> ${orderData.first_name || ''} ${orderData.last_name || ''}</p>
        <p><strong>Customer Email:</strong> ${orderData.email || 'N/A'}</p>
        <p><strong>Amount:</strong> ₹${orderData.total_amount || orderData.total || 'N/A'}</p>
        <p><strong>Payment Method:</strong> ${orderData.payment_method || 'Razorpay'}</p>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <h3 style="color: #0369a1; margin-top: 0;">What's Next?</h3>
        <p>Don't worry! Your order has been saved and you can retry the payment:</p>
        <ul>
          <li>Check your payment method details</li>
          <li>Ensure sufficient funds are available</li>
          <li>Try using a different payment method</li>
          <li>Contact your bank if the issue persists</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout" 
           style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Retry Payment
        </a>
      </div>
      
      <p>If you continue to experience issues, please contact our support team.</p>
      <p>Best regards,<br>The Anytime Pooja Team</p>
    </div>
  `
  
  return await sendEmail({
    to: userEmail,
    subject,
    html
  })
}

export async function sendOTPEmail(userEmail: string, otpCode: string, purpose: string = 'registration'): Promise<boolean> {
  const subject = purpose === 'login' ? 'Login OTP - Anytime Pooja' : 'Verification OTP - Anytime Pooja'
  const purposeText = purpose === 'login' ? 'login to your account' : 'verify your email address'
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Your Verification Code</h1>
      <p>Dear User,</p>
      <p>Use the following OTP to ${purposeText}:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f8f9fa; border: 2px solid #007bff; border-radius: 10px; padding: 20px; display: inline-block;">
          <h2 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otpCode}</h2>
        </div>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        This OTP is valid for 5 minutes only. Do not share this code with anyone.
      </p>
      
      <p style="color: #666; font-size: 14px;">
        If you didn't request this OTP, please ignore this email.
      </p>
      
      <p>Best regards,<br>The Anytime Pooja Team</p>
    </div>
  `
  
  return await sendEmail({
    to: userEmail,
    subject,
    html
  })
}

export async function sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
  const subject = 'Password Reset Request'
  const resetUrl = `https://anytimepooja.com/reset-password?token=${resetToken}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Password Reset Request</h1>
      <p>You requested a password reset for your Anytime Pooja account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Anytime Pooja Team</p>
    </div>
  `
  
  return await sendEmail({
    to: userEmail,
    subject,
    html
  })
}

export async function sendPaymentFailedEmail(userEmail: string, userName: string, orderData: any, errorMessage: string): Promise<boolean> {
  const subject = 'Payment Failed - Anytime Pooja'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc3545;">Payment Failed</h1>
      <p>Dear ${userName},</p>
      <p>We're sorry to inform you that your payment for order could not be processed successfully.</p>
      
      <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
        <h3 style="color: #721c24; margin-top: 0;">Payment Details:</h3>
        <p><strong>Error:</strong> ${errorMessage}</p>
        <p><strong>Amount:</strong> ₹${orderData.total}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>What you can do:</h3>
        <ul>
          <li>Check your payment method details</li>
          <li>Ensure you have sufficient funds</li>
          <li>Try a different payment method</li>
          <li>Contact our support team for assistance</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://anytimepooja.com/checkout" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Retry Payment
        </a>
      </div>

      <p>If you continue to experience issues, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Anytime Pooja Team</p>
    </div>
  `
  
  return await sendEmail({
    to: userEmail,
    subject,
    html
  })
}
