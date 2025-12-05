import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Usar fetch nativo do Deno para chamadas à API do Resend

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data } = await req.json();
    
    if (!type || !to || !data) {
      throw new Error('Missing required fields: type, to, or data');
    }

    let subject = '';
    let html = '';

    switch (type) {
      case 'verification_approved':
        subject = '✅ Verificação Aprovada!';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981;">Parabéns! Sua verificação foi aprovada</h1>
            <p>Olá <strong>${data.model_name}</strong>,</p>
            <p>Temos o prazer de informar que sua solicitação de verificação foi <strong>aprovada</strong>!</p>
            <p>Agora seu perfil possui o selo verificado, aumentando sua credibilidade e visibilidade na plataforma.</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>📍 Perfil:</strong> ${data.model_name}</p>
              <p style="margin: 5px 0 0 0;"><strong>📍 Localização:</strong> ${data.city}, ${data.state}</p>
            </div>
            <p>Continue oferecendo um serviço de qualidade e aproveitando todos os benefícios da nossa plataforma!</p>
            <p style="margin-top: 30px; color: #6b7280;">Atenciosamente,<br>Equipe de Verificação</p>
          </div>
        `;
        break;

      case 'verification_rejected':
        subject = '❌ Verificação Rejeitada';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Verificação Não Aprovada</h1>
            <p>Olá <strong>${data.model_name}</strong>,</p>
            <p>Infelizmente, sua solicitação de verificação não foi aprovada neste momento.</p>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <p style="margin: 0;"><strong>Motivo:</strong></p>
              <p style="margin: 10px 0 0 0;">${data.rejection_reason || 'Não especificado'}</p>
            </div>
            <p>Você pode revisar os documentos e enviar uma nova solicitação quando estiver pronto.</p>
            <p><strong>Dicas para aprovação:</strong></p>
            <ul>
              <li>Certifique-se de que o documento está legível e bem iluminado</li>
              <li>Todas as informações devem estar visíveis</li>
              <li>O documento deve estar dentro da validade</li>
            </ul>
            <p style="margin-top: 30px; color: #6b7280;">Atenciosamente,<br>Equipe de Verificação</p>
          </div>
        `;
        break;

      case 'subscription_expiring':
        subject = '⏰ Sua assinatura premium expira em breve!';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Sua assinatura está próxima do vencimento</h1>
            <p>Olá <strong>${data.model_name}</strong>,</p>
            <p>Este é um lembrete de que sua assinatura do plano <strong>${data.plan_name}</strong> expira em breve.</p>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>📅 Data de Vencimento:</strong> ${new Date(data.end_date).toLocaleDateString('pt-BR')}</p>
              <p style="margin: 5px 0 0 0;"><strong>💳 Plano:</strong> ${data.plan_name}</p>
            </div>
            <p>Para continuar aproveitando todos os benefícios premium, renove sua assinatura antes do vencimento.</p>
            <p><strong>Benefícios Premium:</strong></p>
            <ul>
              <li>✨ Destaque nas buscas</li>
              <li>📈 Maior visibilidade</li>
              <li>🎯 Mais conversões</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')}/planos" style="background: linear-gradient(to right, #ec4899, #d946ef); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Renovar Assinatura
              </a>
            </div>
            <p style="margin-top: 30px; color: #6b7280;">Atenciosamente,<br>Equipe Premium</p>
          </div>
        `;
        break;

      default:
        throw new Error('Invalid email type');
    }

    const { error: emailError } = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Acompanhantes <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    }).then(res => res.ok ? { error: null } : { error: new Error('Failed to send email') });

    if (emailError) {
      console.error('Resend error:', emailError);
      throw emailError;
    }

    console.log(`Email sent successfully: ${type} to ${to}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in send-notification-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
