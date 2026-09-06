import Razorpay from "razorpay";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const subscription = await razorpay.subscriptions.create({
      plan_id: "plan_TYkimGWeJo3WeW",
      total_count: 1200,
      quantity: 1,
      customer_notify: true
    });

    return res.status(200).json({
      success: true,
      subscriptionId: subscription.id,
      planId: subscription.plan_id,
      status: subscription.status
    });

  } catch (error) {
    console.error("Razorpay subscription error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create subscription"
    });
  }
}