import Bull from "bull";
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
export const emailQueue = new Bull("email-queue", redisUrl);

export async function enqueueEmail(payload: any) {
  await emailQueue.add(payload, { attempts: 3,backoff: 5000 });
}

// worker for emailQueue: send email using nodemailer or third-party provider
emailQueue.process(async (job) => {
  // send email
  const { orderId } = job.data;
  // TODO: integrate with nodemailer/SES etc.
});
