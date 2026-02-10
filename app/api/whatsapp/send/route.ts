import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

const WHATSAPP_API_URL = `${config.whatsapp.baseUrl}/${config.whatsapp.apiVersion}`;

interface SendMessageBody {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  message: string;
  templateName?: string;
  templateParams?: string[];
}

// POST /api/whatsapp/send - Send WhatsApp message
export async function POST(request: NextRequest) {
  try {
    const body: SendMessageBody = await request.json();
    const {
      phoneNumberId,
      accessToken,
      to,
      message,
      templateName,
      templateParams,
    } = body;

    if (!phoneNumberId || !accessToken || !to) {
      return NextResponse.json(
        { error: "Missing required fields: phoneNumberId, accessToken, to" },
        { status: 400 },
      );
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = to.replace(/[\s+-]/g, "");

    let messagePayload;

    if (templateName) {
      // Send template message
      messagePayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: templateParams?.length
            ? [
                {
                  type: "body",
                  parameters: templateParams.map((param) => ({
                    type: "text",
                    text: param,
                  })),
                },
              ]
            : [],
        },
      };
    } else if (message) {
      // Send text message
      messagePayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      };
    } else {
      return NextResponse.json(
        { error: "Either message or templateName is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(messagePayload),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API Error:", data);
      return NextResponse.json(
        { error: "Failed to send message", details: data.error },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
      data,
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
