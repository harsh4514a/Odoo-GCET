import nodemailer from 'nodemailer';

// Create transporter with Gmail SMTP settings
// Note: For production, use environment variables for credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '', // Use App Password, not regular password
  },
});

interface WelcomeEmailParams {
  to: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  password: string;
  department: string;
  jobTitle: string;
}

export async function sendWelcomeEmail({
  to,
  firstName,
  lastName,
  employeeId,
  password,
  department,
  jobTitle,
}: WelcomeEmailParams): Promise<boolean> {
  const mailOptions = {
    from: process.env.SMTP_USER || '',
    to,
    subject: '🎉 Welcome to Dayflow HRMS - Your Account Details',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Dayflow</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-top: 20px; margin-bottom: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">
              ✨ Welcome to Dayflow
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">
              Your HR Management System
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 24px;">
              Hello, ${firstName} ${lastName}! 👋
            </h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Congratulations on joining our team! Your account has been successfully created in the Dayflow HRMS system. Below are your login credentials and account details.
            </p>
            
            <!-- Employee Details Card -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <h3 style="color: #7c3aed; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
                📋 Your Employee Details
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 40%;">Employee ID</td>
                  <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${employeeId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Full Name</td>
                  <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Department</td>
                  <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${department}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Job Title</td>
                  <td style="padding: 10px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${jobTitle}</td>
                </tr>
              </table>
            </div>
            
            <!-- Login Credentials Card -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #f59e0b;">
              <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 18px; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
                🔐 Login Credentials
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #92400e; font-size: 14px; width: 40%;">Email</td>
                  <td style="padding: 10px 0; color: #78350f; font-size: 14px; font-weight: 600;">${to}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #92400e; font-size: 14px;">Password</td>
                  <td style="padding: 10px 0; color: #78350f; font-size: 14px; font-weight: 600; font-family: monospace; background: rgba(255,255,255,0.5); padding: 8px 12px; border-radius: 6px;">${password}</td>
                </tr>
              </table>
              
              <p style="color: #92400e; font-size: 12px; margin-top: 15px; margin-bottom: 0;">
                ⚠️ Please change your password after your first login for security purposes.
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth" 
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
                🚀 Login to Dayflow
              </a>
            </div>
            
            <!-- What's Next Section -->
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <h4 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">📌 What's Next?</h4>
              <ul style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Complete your profile information</li>
                <li>Mark your attendance daily</li>
                <li>Apply for leaves when needed</li>
                <li>View your payslips and salary details</li>
              </ul>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background-color: #1e293b; padding: 25px 30px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0;">
              If you have any questions, please contact the HR department.
            </p>
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Dayflow HRMS. All rights reserved.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to Dayflow HRMS!

Hello ${firstName} ${lastName},

Your account has been successfully created. Here are your details:

EMPLOYEE DETAILS:
- Employee ID: ${employeeId}
- Full Name: ${firstName} ${lastName}
- Department: ${department}
- Job Title: ${jobTitle}

LOGIN CREDENTIALS:
- Email: ${to}
- Password: ${password}

Please change your password after your first login for security purposes.

Login at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth

Best regards,
Dayflow HRMS Team
    `,
  };

  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email would be sent (SMTP not configured):');
      console.log('To:', to);
      console.log('Employee:', firstName, lastName);
      console.log('Employee ID:', employeeId);
      console.log('Password:', password);
      return true; // Return true in development without actual SMTP
    }

    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
}
