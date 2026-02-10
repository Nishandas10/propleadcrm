import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { config } from "@/lib/config";

const openai = config.openai.apiKey
  ? new OpenAI({ apiKey: config.openai.apiKey })
  : null;

interface GenerateReplyBody {
  leadName: string;
  leadContext: string;
  messageHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  replyTone?: "professional" | "friendly" | "formal";
  propertyType?: string;
  language?: string;
}

// POST /api/ai/draft-reply - Generate AI draft reply
export async function POST(request: NextRequest) {
  try {
    const body: GenerateReplyBody = await request.json();
    const {
      leadName,
      leadContext,
      messageHistory,
      replyTone = "professional",
      propertyType,
      language = "English",
    } = body;

    if (!openai) {
      // Return a demo response when OpenAI is not configured
      return NextResponse.json({
        success: true,
        reply: getDemoReply(leadName, replyTone),
        isDemo: true,
      });
    }

    const systemPrompt = `You are an AI assistant for a real estate agent in India. 
Your task is to draft WhatsApp reply messages to leads.

Guidelines:
- Keep messages concise and suitable for WhatsApp (under 500 characters)
- Be ${replyTone} in tone
- Use the lead's name when appropriate
- Always include a clear call-to-action
- Focus on scheduling site visits or follow-up calls
- ${propertyType ? `The lead is interested in ${propertyType} properties` : ""}
- Reply in ${language}
- Use relevant emojis sparingly for WhatsApp conversations
- Never make up specific property details, prices, or availability
- Suggest confirming details with the agent`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Lead Context: ${leadContext}\n\nPrevious conversation:\n${messageHistory
          .map((m) => `${m.role === "user" ? "Lead" : "Agent"}: ${m.content}`)
          .join("\n")}\n\nGenerate a reply message for lead "${leadName}".`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: config.openai.model,
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      reply: reply.trim(),
      usage: completion.usage,
    });
  } catch (error) {
    console.error("Error generating AI reply:", error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
      { status: 500 },
    );
  }
}

function getDemoReply(leadName: string, tone: string): string {
  const demoReplies: Record<string, string[]> = {
    professional: [
      `Hi ${leadName}! 👋 Thank you for your interest. I'd love to understand your requirements better. Would you be available for a quick call this week to discuss the properties that match your preferences? Let me know your convenient time.`,
      `Good day ${leadName}! I have some excellent properties that might interest you based on your requirements. Would you like to schedule a site visit this weekend? I can arrange for a tour at your convenience.`,
      `Hello ${leadName}, thank you for reaching out! I've noted down your preferences. Let me share some curated options with you. When would be a good time to discuss these?`,
    ],
    friendly: [
      `Hey ${leadName}! 😊 Great to hear from you! I've got some amazing properties lined up that I think you'll love. Want to check them out this weekend? 🏠`,
      `Hi ${leadName}! Thanks for connecting! I'm excited to help you find your dream home. Let's chat and figure out what works best for you! When are you free?`,
      `Hello ${leadName}! 🙌 So glad you reached out! I have some fantastic options to show you. How about we set up a quick visit? Let me know what works!`,
    ],
    formal: [
      `Dear ${leadName}, Thank you for your enquiry. I would like to schedule a consultation at your earliest convenience to discuss your property requirements in detail. Please advise your available timings.`,
      `Respected ${leadName}, We appreciate your interest in our properties. I shall be pleased to arrange a site visit for you. Kindly confirm your preferred date and time.`,
      `Dear ${leadName}, Thank you for contacting us. We have several properties that may meet your criteria. I request you to kindly provide your convenient time for a detailed discussion.`,
    ],
  };

  const replies = demoReplies[tone] || demoReplies.professional;
  return replies[Math.floor(Math.random() * replies.length)];
}
