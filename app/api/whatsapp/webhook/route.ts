import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

// GET /api/whatsapp/webhook - Webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Check if this is a verification request from Meta
  if (mode === "subscribe" && token === config.whatsapp.webhookVerifyToken) {
    console.log("WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

// POST /api/whatsapp/webhook - Receive incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log incoming webhook for debugging
    console.log("WhatsApp Webhook Received:", JSON.stringify(body, null, 2));

    // Check if this is a valid WhatsApp webhook
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;

        const value = change.value;
        const messages = value.messages || [];
        const contacts = value.contacts || [];

        for (const message of messages) {
          const from = message.from; // Sender's phone number
          const messageId = message.id;
          const timestamp = message.timestamp;
          const type = message.type;

          // Get contact info
          const contact = contacts.find(
            (c: { wa_id: string }) => c.wa_id === from,
          );
          const contactName = contact?.profile?.name || "Unknown";

          let messageContent = "";

          // Extract message content based on type
          switch (type) {
            case "text":
              messageContent = message.text?.body || "";
              break;
            case "image":
              messageContent = "[Image]";
              break;
            case "document":
              messageContent = `[Document: ${message.document?.filename || "Unknown"}]`;
              break;
            case "audio":
              messageContent = "[Audio]";
              break;
            case "video":
              messageContent = "[Video]";
              break;
            case "location":
              messageContent = `[Location: ${message.location?.latitude}, ${message.location?.longitude}]`;
              break;
            case "button":
              messageContent = message.button?.text || "[Button Response]";
              break;
            case "interactive":
              messageContent =
                message.interactive?.button_reply?.title ||
                message.interactive?.list_reply?.title ||
                "[Interactive Response]";
              break;
            default:
              messageContent = `[${type}]`;
          }

          // TODO: Store message in Firestore
          // TODO: Find or create lead by phone number
          // TODO: Trigger automation rules
          // TODO: Send push notification to user

          console.log("Incoming Message:", {
            from,
            contactName,
            messageId,
            timestamp,
            type,
            content: messageContent,
          });
        }

        // Handle status updates (sent, delivered, read)
        const statuses = value.statuses || [];
        for (const status of statuses) {
          console.log("Message Status Update:", {
            id: status.id,
            status: status.status,
            timestamp: status.timestamp,
            recipientId: status.recipient_id,
          });

          // TODO: Update message status in Firestore
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ success: true });
  }
}
