// Edge Function para redirects 301 de URLs antigas (slug completo) para novas (sigla)
// Exemplo: /acompanhantes/rio-de-janeiro/rio-de-janeiro → /acompanhantes/rj/rio-de-janeiro

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de slugs de estado para siglas
const STATE_SLUG_TO_CODE: Record<string, string> = {
  'acre': 'AC',
  'alagoas': 'AL',
  'amapa': 'AP',
  'amazonas': 'AM',
  'bahia': 'BA',
  'ceara': 'CE',
  'distrito-federal': 'DF',
  'espirito-santo': 'ES',
  'goias': 'GO',
  'maranhao': 'MA',
  'mato-grosso': 'MT',
  'mato-grosso-do-sul': 'MS',
  'minas-gerais': 'MG',
  'para': 'PA',
  'paraiba': 'PB',
  'parana': 'PR',
  'pernambuco': 'PE',
  'piaui': 'PI',
  'rio-de-janeiro': 'RJ',
  'rio-grande-do-norte': 'RN',
  'rio-grande-do-sul': 'RS',
  'rondonia': 'RO',
  'roraima': 'RR',
  'santa-catarina': 'SC',
  'sao-paulo': 'SP',
  'sergipe': 'SE',
  'tocantins': 'TO',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    console.log('[url-redirector] Checking path:', path);
    
    // Detectar se é URL com slug completo: /acompanhantes/[slug-completo]/...
    const pathMatch = path.match(/^\/acompanhantes\/([a-z-]+)(\/.*)?$/);
    
    if (!pathMatch) {
      // Não é URL de acompanhantes ou já está no formato correto
      return new Response(null, {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const [, stateParam, restOfPath] = pathMatch;
    
    // Se stateParam tem 2 caracteres, já é uma sigla - não precisa redirect
    if (stateParam.length === 2) {
      console.log('[url-redirector] Already using abbreviation, no redirect needed');
      return new Response(null, {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Verificar se stateParam é um slug de estado conhecido
    const stateCode = STATE_SLUG_TO_CODE[stateParam];
    
    if (!stateCode) {
      console.log('[url-redirector] Unknown state slug:', stateParam);
      return new Response(null, {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Construir nova URL com sigla
    const newPath = `/acompanhantes/${stateCode.toLowerCase()}${restOfPath || ''}`;
    const newUrl = `${url.origin}${newPath}${url.search}`;
    
    console.log('[url-redirector] Redirecting:', path, '→', newPath);
    
    // Retornar redirect 301 (permanente)
    return new Response(null, {
      status: 301,
      headers: {
        ...corsHeaders,
        'Location': newUrl,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 ano
      },
    });
    
  } catch (error) {
    console.error('[url-redirector] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
