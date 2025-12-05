import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  profileId: string;
  decision: "approved" | "rejected";
  rejectionReason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { profileId, decision, rejectionReason }: NotificationRequest = await req.json();

    // Get profile and user email
    const { data: profile, error: profileError } = await supabase
      .from("model_profiles")
      .select("name, user_id, profiles!inner(email)")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      throw new Error("Profile not found");
    }

    const userEmail = (profile as any).profiles.email;
    const profileName = profile.name;

    let emailSubject: string;
    let emailHtml: string;

    if (decision === "approved") {
      emailSubject = "✅ Seu anúncio foi aprovado!";
      emailHtml = `
        <h1>Parabéns, ${profileName}!</h1>
        <p>Seu anúncio foi <strong>aprovado</strong> e agora está visível na plataforma.</p>
        <p>Os usuários já podem visualizar seu perfil e entrar em contato com você.</p>
        <p>Continue mantendo seu perfil atualizado para obter melhores resultados!</p>
        <br>
        <p>Atenciosamente,<br>Equipe de Moderação</p>
      `;
    } else {
      emailSubject = "❌ Seu anúncio foi rejeitado";
      emailHtml = `
        <h1>Olá, ${profileName}</h1>
        <p>Infelizmente, seu anúncio foi <strong>rejeitado</strong> pela nossa equipe de moderação.</p>
        <p><strong>Motivo:</strong> ${rejectionReason || "Não especificado"}</p>
        <p>Por favor, revise as informações e fotos do seu perfil e corrija os problemas indicados.</p>
        <p>Você pode editar seu anúncio no painel de anunciante e reenviar para moderação.</p>
        <br>
        <p>Atenciosamente,<br>Equipe de Moderação</p>
      `;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Acompanhantes <onboarding@resend.dev>",
        to: [userEmail],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-moderation-decision:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
