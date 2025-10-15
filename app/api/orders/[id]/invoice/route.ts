import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any

    // Get order details
    const orders = await query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    ) as any[]

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]

    // Get order items
    const orderItems = await query(
      `SELECT oi.*, p.image 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    ) as any[]

    // Generate HTML invoice
    const invoiceHtml = generateInvoiceHTML(order, orderItems)

    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${order.order_number}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}

function generateInvoiceHTML(order: any, orderItems: any[]): string {
  const currentDate = new Date().toLocaleDateString('en-IN')
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN')
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${order.order_number}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #059669;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
        }
        .company-tagline {
            color: #666;
            font-size: 14px;
        }
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .invoice-info, .company-info {
            flex: 1;
        }
        .info-section h3 {
            color: #059669;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        .info-section p {
            margin: 5px 0;
            color: #555;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .items-table th {
            background-color: #059669;
            color: white;
            padding: 12px;
            text-align: left;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        .items-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .total-section {
            margin-top: 20px;
            text-align: right;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            padding: 5px 0;
        }
        .total-final {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
            border-top: 2px solid #059669;
            padding-top: 10px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-paid {
            background-color: #d4edda;
            color: #155724;
        }
        .status-confirmed {
            background-color: #cce5ff;
            color: #004085;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-name">Anytime Pooja</div>
            <div class="company-tagline">Your Spiritual Journey Partner</div>
        </div>

        <div class="invoice-title">INVOICE</div>

        <div class="invoice-details">
            <div class="invoice-info">
                <div class="info-section">
                    <h3>Invoice Details</h3>
                    <p><strong>Invoice No:</strong> ${order.order_number}</p>
                    <p><strong>Invoice Date:</strong> ${currentDate}</p>
                    <p><strong>Order Date:</strong> ${orderDate}</p>
                    <p><strong>Payment Status:</strong> <span class="status-badge status-paid">${order.payment_status.toUpperCase()}</span></p>
                    <p><strong>Order Status:</strong> <span class="status-badge status-confirmed">${order.status.toUpperCase()}</span></p>
                </div>
            </div>

            <div class="company-info">
                <div class="info-section">
                    <h3>Anytime Pooja</h3>
                    <p>Spiritual Products & Services</p>
                    <p>Email: help@anytimepooja.in</p>
                    <p>Website: www.anytimepooja.com</p>
                </div>
            </div>
        </div>

        <div class="invoice-details">
            <div class="invoice-info">
                <div class="info-section">
                    <h3>Billing Address</h3>
                    <p><strong>${order.billing_first_name} ${order.billing_last_name}</strong></p>
                    <p>${order.billing_address_line_1}</p>
                    ${order.billing_address_line_2 ? `<p>${order.billing_address_line_2}</p>` : ''}
                    <p>${order.billing_city}, ${order.billing_state} ${order.billing_postal_code}</p>
                    <p>${order.billing_country}</p>
                </div>
            </div>

            <div class="company-info">
                <div class="info-section">
                    <h3>Shipping Address</h3>
                    <p><strong>${order.shipping_first_name} ${order.shipping_last_name}</strong></p>
                    <p>${order.shipping_address_line_1}</p>
                    ${order.shipping_address_line_2 ? `<p>${order.shipping_address_line_2}</p>` : ''}
                    <p>${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}</p>
                    <p>${order.shipping_country}</p>
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${orderItems.map(item => `
                    <tr>
                        <td><strong>${item.product_name}</strong></td>
                        <td>${item.quantity}</td>
                        <td>₹${parseFloat(item.product_price).toFixed(2)}</td>
                        <td>₹${parseFloat(item.total_price).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Shipping:</span>
                <span>₹${parseFloat(order.shipping_cost).toFixed(2)}</span>
            </div>
            <div class="total-row">
                <span>Tax (GST 18%):</span>
                <span>₹${parseFloat(order.tax_amount).toFixed(2)}</span>
            </div>
            <div class="total-row total-final">
                <span>Total Amount:</span>
                <span>₹${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing Anytime Pooja for your spiritual needs!</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>For any queries, please contact us at help@anytimepooja.in</p>
        </div>
    </div>
</body>
</html>
  `
}
