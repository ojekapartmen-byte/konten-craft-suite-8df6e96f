import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ScheduledContent {
  id: string;
  title: string;
  platform: string;
  scheduled_at: string;
  caption: string | null;
  hashtags: string[] | null;
  video_url: string | null;
  notification_email: boolean;
  notification_whatsapp: boolean;
  email_address: string | null;
  whatsapp_number: string | null;
}

const platformEmojis: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  facebook: "👍",
  twitter: "𝕏",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { scheduleId } = await req.json();

    if (!scheduleId) {
      throw new Error("scheduleId is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the scheduled content
    const { data: schedule, error: fetchError } = await supabase
      .from("scheduled_content")
      .select("*")
      .eq("id", scheduleId)
      .single();

    if (fetchError || !schedule) {
      throw new Error("Schedule not found");
    }

    const content = schedule as ScheduledContent;
    const results: { email?: boolean; whatsapp?: boolean } = {};

    // Send email notification
    if (content.notification_email && content.email_address) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        console.error("RESEND_API_KEY not configured");
      } else {
        const resend = new Resend(resendApiKey);

        const scheduledDate = new Date(content.scheduled_at);
        const formattedDate = scheduledDate.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        const formattedTime = scheduledDate.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const platformEmoji = platformEmojis[content.platform] || "📱";
        const platformName = content.platform.charAt(0).toUpperCase() + content.platform.slice(1);

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">
              ${platformEmoji} Reminder: Saatnya Posting di ${platformName}!
            </h1>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 10px 0;">${content.title}</h2>
              <p style="color: #666; margin: 0;">
                <strong>Jadwal:</strong> ${formattedDate} pukul ${formattedTime}
              </p>
            </div>

            ${content.caption ? `
              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">Caption:</h3>
                <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; white-space: pre-wrap;">
                  ${content.caption}
                  ${content.hashtags?.length ? `\n\n${content.hashtags.join(" ")}` : ""}
                </div>
              </div>
            ` : ""}

            ${content.video_url ? `
              <div style="margin-bottom: 20px;">
                <a href="${content.video_url}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  📥 Download Video
                </a>
              </div>
            ` : ""}

            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 20px;">
              <p style="color: #999; font-size: 14px; margin: 0;">
                Reminder ini dikirim dari AI Studio Content Scheduler.
              </p>
            </div>
          </div>
        `;

        try {
          const { error: emailError } = await resend.emails.send({
            from: "AI Studio <onboarding@resend.dev>",
            to: [content.email_address],
            subject: `${platformEmoji} Reminder: ${content.title} - Saatnya Posting!`,
            html: emailHtml,
          });

          if (emailError) {
            console.error("Email send error:", emailError);
            results.email = false;
          } else {
            results.email = true;
            console.log("Email sent successfully to:", content.email_address);
          }
        } catch (emailErr) {
          console.error("Email exception:", emailErr);
          results.email = false;
        }
      }
    }

    // WhatsApp notification placeholder
    // For WhatsApp, you'd integrate with Twilio or similar service
    if (content.notification_whatsapp && content.whatsapp_number) {
      // TODO: Implement Twilio WhatsApp integration when TWILIO credentials are provided
      console.log("WhatsApp notification requested for:", content.whatsapp_number);
      results.whatsapp = false; // Not implemented yet
    }

    // Update the schedule to mark reminder as sent
    const { error: updateError } = await supabase
      .from("scheduled_content")
      .update({
        reminder_sent_at: new Date().toISOString(),
        status: "reminded",
      })
      .eq("id", scheduleId);

    if (updateError) {
      console.error("Error updating schedule:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: "Reminder processed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-schedule-reminder:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
