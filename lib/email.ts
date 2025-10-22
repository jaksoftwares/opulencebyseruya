import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export async function sendOrderNotificationEmail(orderData: OrderEmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Opulence by Seruya <orders@opulencebyseruya.co.ke>',
      to: ['opulenceseruya@gmail.com'],
      subject: `New Order Received - ${orderData.orderNumber}`,
      html: generateOrderEmailHTML(orderData),
    });

    if (error) {
      console.error('Error sending order notification email:', error);
      throw error;
    }

    console.log('Order notification email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send order notification email:', error);
    throw error;
  }
}

export async function sendCustomerOrderConfirmationEmail(orderData: OrderEmailData) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Opulence by Seruya <orders@opulencebyseruya.co.ke>',
      to: [orderData.customerEmail],
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html: generateCustomerOrderEmailHTML(orderData),
    });

    if (error) {
      console.error('Error sending customer order confirmation email:', error);
      throw error;
    }

    console.log('Customer order confirmation email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send customer order confirmation email:', error);
    throw error;
  }
}

function generateOrderEmailHTML(order: OrderEmailData): string {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${item.unit_price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">KES ${item.total_price.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order - ${order.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🛍️ New Order Received!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Order #${order.orderNumber}</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; padding: 30px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">📋 Order Details</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong style="color: #374151;">Order Number:</strong><br>
              <span style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${order.orderNumber}</span>
            </div>
            <div>
              <strong style="color: #374151;">Payment Method:</strong><br>
              <span style="text-transform: capitalize;">${order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div>
              <strong style="color: #374151;">Order Date:</strong><br>
              ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
            </div>
            <div>
              <strong style="color: #374151;">Total Amount:</strong><br>
              <span style="font-size: 18px; font-weight: bold; color: #059669;">KES ${order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">👤 Customer Information</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <strong style="color: #374151;">Name:</strong><br>
                ${order.customerName}
              </div>
              <div>
                <strong style="color: #374151;">Phone:</strong><br>
                ${order.customerPhone}
              </div>
              <div style="grid-column: span 2;">
                <strong style="color: #374151;">Email:</strong><br>
                <a href="mailto:${order.customerEmail}" style="color: #3b82f6;">${order.customerEmail}</a>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">📍 Delivery Information</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <div>
              <strong style="color: #374151;">Delivery Address:</strong><br>
              ${order.deliveryAddress}<br>
              ${order.deliveryCity}
            </div>
            ${order.notes ? `
            <div style="margin-top: 15px;">
              <strong style="color: #374151;">Order Notes:</strong><br>
              <em style="color: #6b7280;">${order.notes}</em>
            </div>
            ` : ''}
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">🛒 Order Items</h2>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Product</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 18px;">💰 Order Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Subtotal:</span>
            <span>KES ${order.subtotal.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Delivery Fee:</span>
            <span>KES ${order.deliveryFee.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #166534; border-top: 2px solid #bbf7d0; padding-top: 10px; margin-top: 10px;">
            <span>Total:</span>
            <span>KES ${order.total.toLocaleString()}</span>
          </div>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">⚡ Next Steps</h3>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            <li>Contact the customer to confirm the order</li>
            <li>Process payment if M-Pesa was selected</li>
            <li>Prepare items for delivery</li>
            <li>Update order status in the admin dashboard</li>
          </ul>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>This order was placed through the Opulence by Seruya online store.</p>
          <p>Need help? Contact us at <a href="mailto:opulenceseruya@gmail.com" style="color: #3b82f6;">opulenceseruya@gmail.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCustomerOrderEmailHTML(order: OrderEmailData): string {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">KES ${item.unit_price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">KES ${item.total_price.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - ${order.orderNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Thank you for shopping with Opulence by Seruya</p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; padding: 30px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
          <h2 style="margin: 0 0 10px 0; color: #166534; font-size: 24px;">✅ Your Order is Confirmed</h2>
          <p style="margin: 0; color: #166534; font-size: 16px;">Order #${order.orderNumber}</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">📋 Order Details</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong style="color: #374151;">Order Number:</strong><br>
              <span style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${order.orderNumber}</span>
            </div>
            <div>
              <strong style="color: #374151;">Payment Method:</strong><br>
              <span style="text-transform: capitalize;">${order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div>
              <strong style="color: #374151;">Order Date:</strong><br>
              ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
            </div>
            <div>
              <strong style="color: #374151;">Total Amount:</strong><br>
              <span style="font-size: 18px; font-weight: bold; color: #059669;">KES ${order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">📍 Delivery Information</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <div>
              <strong style="color: #374151;">Delivery Address:</strong><br>
              ${order.deliveryAddress}<br>
              ${order.deliveryCity}
            </div>
            ${order.notes ? `
            <div style="margin-top: 15px;">
              <strong style="color: #374151;">Order Notes:</strong><br>
              <em style="color: #6b7280;">${order.notes}</em>
            </div>
            ` : ''}
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">🛒 Order Items</h2>
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Product</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #166534; font-size: 18px;">💰 Order Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Subtotal:</span>
            <span>KES ${order.subtotal.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Delivery Fee:</span>
            <span>KES ${order.deliveryFee.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #166534; border-top: 2px solid #bbf7d0; padding-top: 10px; margin-top: 10px;">
            <span>Total:</span>
            <span>KES ${order.total.toLocaleString()}</span>
          </div>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">🚚 What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #78350f;">
            <li>We'll prepare your order for delivery</li>
            <li>You'll receive updates on your order status</li>
            <li>Delivery typically takes 1-3 business days</li>
            <li>Contact us if you have any questions</li>
          </ul>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📞 Need Help?</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong style="color: #374151;">Phone:</strong><br>
              <a href="tel:+254700000000" style="color: #3b82f6;">+254 700 000 000</a>
            </div>
            <div>
              <strong style="color: #374151;">Email:</strong><br>
              <a href="mailto:opulenceseruya@gmail.com" style="color: #3b82f6;">opulenceseruya@gmail.com</a>
            </div>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>Thank you for choosing Opulence by Seruya!</p>
          <p>We appreciate your business and hope you love your purchase.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}