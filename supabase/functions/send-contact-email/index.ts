import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate field lengths (server-side validation)
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Um ou mais campos excedem o tamanho máximo permitido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send confirmation email to user using Resend API
    const userEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Acompanhantes Premium <onboarding@resend.dev>",
        to: [email],
        subject: "Recebemos sua mensagem!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #E91E63;">Obrigado por entrar em contato, ${name}!</h1>
            <p>Recebemos sua mensagem e retornaremos em breve.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Resumo da sua mensagem:</h3>
              <p><strong>Assunto:</strong> ${subject}</p>
              <p><strong>Mensagem:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <p>Respondemos normalmente em até 24 horas durante dias úteis.</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Atenciosamente,<br>
              <strong>Equipe Acompanhantes Premium</strong>
            </p>
          </div>
        `,
      }),
    });


    // Send notification email to admin using Resend API
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Acompanhantes Premium <onboarding@resend.dev>",
        to: ["contato@acompanhantes.com.br"],
        subject: `Nova mensagem de contato: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #E91E63;">Nova Mensagem de Contato</h1>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Nome:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Assunto:</strong> ${subject}</p>
              <p><strong>Mensagem:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Mensagem recebida em: ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        `,
      }),
    });


    if (!userEmailResponse.ok || !adminEmailResponse.ok) {
      const userError = !userEmailResponse.ok ? await userEmailResponse.text() : null;
      const adminError = !adminEmailResponse.ok ? await adminEmailResponse.text() : null;
      throw new Error(`Erro ao enviar emails: User: ${userError}, Admin: ${adminError}`);
    }

    console.log("Emails sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Mensagem enviada com sucesso" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao enviar email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
