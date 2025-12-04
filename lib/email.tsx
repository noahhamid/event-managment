import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, code: string) {
  try {
    await resend.emails.send({
      from: "Campus Events <onboarding@resend.dev>",
      to: email,
      subject: "Verify Your Email - Campus Events",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Verify Your Email</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="letter-spacing: 8px; color: #4f46e5; margin: 0;">${code}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending verification email:", error)
  }
}

export async function sendPasswordResetEmail(email: string, resetCode: string) {
  try {
    await resend.emails.send({
      from: "Campus Events <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password - Campus Events",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Reset Your Password</h2>
          <p>Your password reset code is:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="letter-spacing: 8px; color: #4f46e5; margin: 0;">${resetCode}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 30 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending password reset email:", error)
  }
}
