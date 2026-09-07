import crypto from "crypto";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(
        /\\n/g,
        "\n"
      )
    })
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const webhookSecret =
      process.env.RZP_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RZP_WEBHOOK_SECRET is missing."
      );

      return res.status(500).json({
        success: false,
        error: "Webhook secret is not configured."
      });
    }

    const signature =
      req.headers["x-razorpay-signature"];

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: "Missing Razorpay signature."
      });
    }

    // Get request body
    const rawBody =
      typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);

    // Verify Razorpay webhook signature
    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          webhookSecret
        )
        .update(rawBody)
        .digest("hex");

    if (signature !== expectedSignature) {
      console.error(
        "Invalid Razorpay webhook signature."
      );

      return res.status(400).json({
        success: false,
        error: "Invalid webhook signature."
      });
    }

    // Parse event
    const event =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body;

    console.log(
      "Razorpay webhook received:",
      event.event
    );

    // =================================================
    // SUBSCRIPTION CHARGED = PAYMENT SUCCESSFUL
    // =================================================

    if (
      event.event ===
      "subscription.charged"
    ) {
      const subscription =
        event.payload?.subscription?.entity;

      if (!subscription) {
        console.error(
          "Subscription data missing."
        );

        return res.status(400).json({
          success: false,
          error:
            "Subscription data missing."
        });
      }

      const firebaseUid =
        subscription.notes?.firebase_uid;

      if (!firebaseUid) {
        console.error(
          "Firebase UID not found in Razorpay subscription notes.",
          subscription.id
        );

        return res.status(400).json({
          success: false,
          error:
            "Firebase UID not found."
        });
      }

      // Update Firebase user to Premium
      await db
        .collection("users")
        .doc(firebaseUid)
        .set(
          {
            subscriptionStatus: "premium",
            razorpaySubscriptionId:
              subscription.id,
            premiumActivatedAt:
              new Date(),
            updatedAt:
              new Date()
          },
          {
            merge: true
          }
        );

      console.log(
        "PREMIUM ACTIVATED for Firebase UID:",
        firebaseUid
      );
    }

    // =================================================
    // SUBSCRIPTION CANCELLED
    // =================================================

    if (
      event.event ===
      "subscription.cancelled"
    ) {
      const subscription =
        event.payload?.subscription?.entity;

      const firebaseUid =
        subscription?.notes?.firebase_uid;

      if (firebaseUid) {
        await db
          .collection("users")
          .doc(firebaseUid)
          .set(
            {
              subscriptionStatus:
                "cancelled",
              updatedAt:
                new Date()
            },
            {
              merge: true
            }
          );

        console.log(
          "Subscription cancelled for:",
          firebaseUid
        );
      }
    }

    // =================================================
    // SUBSCRIPTION COMPLETED
    // =================================================

    if (
      event.event ===
      "subscription.completed"
    ) {
      console.log(
        "Subscription completed."
      );
    }

    // =================================================
    // SUBSCRIPTION AUTHENTICATED
    // =================================================

    if (
      event.event ===
      "subscription.authenticated"
    ) {
      console.log(
        "Subscription authenticated."
      );
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error(
      "Webhook error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Webhook processing failed."
    });
  }
}
