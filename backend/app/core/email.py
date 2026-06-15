import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
import os
from app.core.config import (
    SMTP_HOST, SMTP_PORT, SMTP_USER, 
    SMTP_PASSWORD, SMTP_FROM_EMAIL
)
import asyncio
from functools import partial

def send_order_confirmation_email(
    recipient_email: str,
    customer_name: str,
    order_number: str,
    order_items: list,
    subtotal: float,
    tax: float,
    shipping_cost: float,
    total: float,
    shipping_address: str,
    shipping_city: str
) -> bool:
    """Send order confirmation email"""
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Order Confirmation - {order_number}"
        msg["From"] = SMTP_FROM_EMAIL
        msg["To"] = recipient_email
        
        # Create HTML email body
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #2c3e50;">Order Confirmation</h2>
                    
                    <p>Dear <strong>{customer_name}</strong>,</p>
                    
                    <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
                    
                    <h3 style="color: #34495e;">Order Details</h3>
                    <p><strong>Order Number:</strong> {order_number}</p>
                    
                    <h3 style="color: #34495e;">Items Ordered</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead style="background-color: #ecf0f1;">
                            <tr>
                                <th style="padding: 10px; text-align: left; border: 1px solid #bdc3c7;">Product</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #bdc3c7;">Quantity</th>
                                <th style="padding: 10px; text-align: right; border: 1px solid #bdc3c7;">Price</th>
                                <th style="padding: 10px; text-align: right; border: 1px solid #bdc3c7;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
        """
        
        for item in order_items:
            html_body += f"""
                            <tr>
                                <td style="padding: 10px; border: 1px solid #bdc3c7;">{item.get('product_name', 'N/A')}</td>
                                <td style="padding: 10px; text-align: center; border: 1px solid #bdc3c7;">{item.get('quantity', 1)}</td>
                                <td style="padding: 10px; text-align: right; border: 1px solid #bdc3c7;">${item.get('product_price', 0):.2f}</td>
                                <td style="padding: 10px; text-align: right; border: 1px solid #bdc3c7;">${item.get('subtotal', 0):.2f}</td>
                            </tr>
            """
        
        html_body += f"""
                        </tbody>
                    </table>
                    
                    <h3 style="color: #34495e;">Order Summary</h3>
                    <table style="width: 100%; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px; text-align: right; width: 50%;"><strong>Subtotal:</strong></td>
                            <td style="padding: 8px; text-align: right; width: 50%;">${subtotal:.2f}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: right;"><strong>Tax:</strong></td>
                            <td style="padding: 8px; text-align: right;">${tax:.2f}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; text-align: right;"><strong>Shipping:</strong></td>
                            <td style="padding: 8px; text-align: right;">${shipping_cost:.2f}</td>
                        </tr>
                        <tr style="border-top: 2px solid #34495e;">
                            <td style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                            <td style="padding: 8px; text-align: right; font-size: 18px; color: #27ae60;"><strong>${total:.2f}</strong></td>
                        </tr>
                    </table>
                    
                    <h3 style="color: #34495e;">Shipping Address</h3>
                    <p>
                        {shipping_address}<br>
                        {shipping_city}
                    </p>
                    
                    <p style="color: #7f8c8d; margin-top: 30px;">
                        If you have any questions about your order, please don't hesitate to contact us.
                    </p>
                    
                    <p style="color: #7f8c8d;">
                        Best regards,<br>
                        <strong>Aircraft Store Team</strong>
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Attach HTML to message
        msg.attach(MIMEText(html_body, "html"))
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

def send_password_reset_email(recipient_email: str, username: str, reset_url: str) -> bool:
    """Send password reset email"""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Reset Your PAF Store Password"
        msg["From"] = SMTP_FROM_EMAIL
        msg["To"] = recipient_email

        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="text-align:center; margin-bottom:24px;">
                        <span style="font-size:32px;">&#9992;</span>
                        <h2 style="color:#c9a84c; margin:8px 0 0;">PAF STORE</h2>
                    </div>
                    <h3 style="color:#1e293b;">Reset Your Password</h3>
                    <p>Hi <strong>{username}</strong>,</p>
                    <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.</p>
                    <div style="text-align:center; margin:32px 0;">
                        <a href="{reset_url}"
                           style="background:linear-gradient(135deg,#c9a84c,#f0c040);color:#0a0e1a;padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:15px;letter-spacing:1px;">
                            RESET PASSWORD
                        </a>
                    </div>
                    <p style="color:#64748b; font-size:13px;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
                    <p style="color:#64748b; font-size:13px;">Or copy this link: <a href="{reset_url}" style="color:#0ea5e9;">{reset_url}</a></p>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                    <p style="color:#94a3b8;font-size:12px;text-align:center;">PAF Store — Official Collectibles</p>
                </div>
            </body>
        </html>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"Error sending reset email: {str(e)}")
        return False


async def send_password_reset_email_async(recipient_email: str, username: str, reset_url: str) -> bool:
    """Send password reset email asynchronously"""
    loop = asyncio.get_event_loop()
    func = partial(send_password_reset_email, recipient_email=recipient_email, username=username, reset_url=reset_url)
    return await loop.run_in_executor(None, func)


async def send_order_confirmation_email_async(
    recipient_email: str,
    customer_name: str,
    order_number: str,
    order_items: list,
    subtotal: float,
    tax: float,
    shipping_cost: float,
    total: float,
    shipping_address: str,
    shipping_city: str
) -> bool:
    """Send order confirmation email asynchronously"""
    loop = asyncio.get_event_loop()
    func = partial(
        send_order_confirmation_email,
        recipient_email=recipient_email,
        customer_name=customer_name,
        order_number=order_number,
        order_items=order_items,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        total=total,
        shipping_address=shipping_address,
        shipping_city=shipping_city
    )
    return await loop.run_in_executor(None, func)
