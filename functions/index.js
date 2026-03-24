const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const ALL_ACCESS_BUNDLES = [
  "business-domain", "personal-domain", "hormozi", "robbins",
  "sullivan", "fladlien", "kennedy", "brunson"
];

exports.beehiivPayment = onRequest({ region: "us-central1" }, async (req, res) => {
  // Only accept POST
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const body = req.body || {};
    const email = body.subscriber_email || body.email || "";
    const bundleId = req.headers["x-bundle-id"] || "";

    if (!email) {
      console.error("No email in payload:", JSON.stringify(body).substring(0, 300));
      res.status(400).json({ error: "No email in payload" });
      return;
    }

    if (!bundleId) {
      console.error("No X-Bundle-Id header");
      res.status(400).json({ error: "No X-Bundle-Id header" });
      return;
    }

    const bundlesToUnlock = bundleId === "all-access" ? ALL_ACCESS_BUNDLES : [bundleId];

    const userRef = db.collection("users").doc(email);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // Merge bundles with existing
      const data = userDoc.data();
      const existing = data.unlocked_bundles || ["free"];
      const merged = [...new Set([...existing, ...bundlesToUnlock])];

      await userRef.update({
        unlocked_bundles: merged,
        last_purchase: new Date().toISOString(),
        last_purchase_bundle: bundleId
      });

      console.log(`Updated ${email}: added ${bundleId}, total bundles: ${merged.join(", ")}`);
    } else {
      // Create new user
      await userRef.set({
        email,
        unlocked_bundles: ["free", ...bundlesToUnlock],
        first_visit: new Date().toISOString(),
        last_visit: new Date().toISOString(),
        last_purchase: new Date().toISOString(),
        last_purchase_bundle: bundleId,
        visits: 0,
        completed_frameworks: []
      });

      console.log(`Created ${email} with bundle: ${bundleId}`);
    }

    res.status(200).json({
      success: true,
      email,
      bundle: bundleId,
      bundles_unlocked: bundlesToUnlock
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
