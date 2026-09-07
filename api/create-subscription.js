import Razorpay from "razorpay";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    // Check environment variables
    if (
      !process.env.RZP_KEY_ID ||
      !process.env.RZP_KEY_SECRET
    ) {
      console.error("Razorpay environment variables are missing.");

      return res.status(500).json({
        success: false,
        error: "Razorpay configuration is missing on server."
      });
    }

    const { userId, email, name } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "Firebase userId is required."
      });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET
    });

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: "plan_TYkimGWeJo3WeW",
      total_count: 1200,
      quantity: 1,
      customer_notify: 1,

      // IMPORTANT:
      // Webhook uses this Firebase UID
      notes: {
        firebase_uid: userId,
        email: email || "",
        name: name || ""
      }
    });

    console.log("Subscription created:", subscription.id);
    console.log("Firebase UID:", userId);

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
      error:
        error.message ||
        "Unable to create subscription"
    });
  }
}
