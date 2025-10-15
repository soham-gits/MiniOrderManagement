import Bull, { Job } from "bull";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailJobData {
  orderId: string;
  userEmail: string;
}

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const emailQueue = new Bull<EmailJobData>("email-queue", redisUrl);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

emailQueue.process(async (job: Job<EmailJobData>) => {
  const { orderId, userEmail } = job.data;
  await transporter.sendMail({
    from: `"E-Commerce Store" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Order Confirmation - ${orderId}`,
    text: `Your order ${orderId} has been successfully processed!`,
  });
  console.log(`Email sent to ${userEmail} for order ${orderId}`);
});
