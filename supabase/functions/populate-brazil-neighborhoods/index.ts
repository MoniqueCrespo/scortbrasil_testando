import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Principais bairros das principais cidades brasileiras
const NEIGHBORHOODS_DATA = [
  // Rio de Janeiro - RJ
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Copacabana" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Ipanema" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Leblon" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Barra da Tijuca" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Botafogo" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Flamengo" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Centro" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Tijuca" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Jacarepaguá" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Recreio dos Bandeirantes" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Campo Grande" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Bangu" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Niterói" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "São Conrado" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Gávea" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Lagoa" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Jardim Botânico" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Humaitá" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Laranjeiras" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Catete" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Glória" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Lapa" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Santa Teresa" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Urca" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Leme" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Arpoador" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Joá" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Itanhangá" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Vargem Pequena" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Vargem Grande" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Recreio" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Grumari" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Praça Seca" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Vila Valqueire" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Madureira" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Cascadura" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Méier" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Todos os Santos" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Engenho Novo" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Engenho de Dentro" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Piedade" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Abolição" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Pilares" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Cachambi" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Ilha do Governador" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Penha" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Vila da Penha" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Bonsucesso" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Ramos" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Olaria" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Realengo" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Padre Miguel" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Guadalupe" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Deodoro" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Irajá" },
  { state_code: "rj", city_slug: "rio-de-janeiro", name: "Pavuna" },

  // São Paulo - SP
  { state_code: "sp", city_slug: "sao-paulo", name: "Pinheiros" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Jardins" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Moema" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Vila Mariana" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Itaim Bibi" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Brooklin" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Morumbi" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Vila Olímpia" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Mooca" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Tatuapé" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Santana" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Centro" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Liberdade" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Bela Vista" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Consolação" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Perdizes" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Lapa" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Butantã" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Santo Amaro" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Campo Belo" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Saúde" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Ipiranga" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Vila Prudente" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Penha" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Tucuruvi" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Casa Verde" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Pompeia" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Vila Madalena" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Alto de Pinheiros" },
  { state_code: "sp", city_slug: "sao-paulo", name: "Sumaré" },

  // Belo Horizonte - MG
  { state_code: "mg", city_slug: "belo-horizonte", name: "Savassi" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Lourdes" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Funcionários" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Centro" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Pampulha" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Buritis" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Belvedere" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Serra" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Barreiro" },
  { state_code: "mg", city_slug: "belo-horizonte", name: "Venda Nova" },

  // Brasília - DF
  { state_code: "df", city_slug: "brasilia", name: "Asa Sul" },
  { state_code: "df", city_slug: "brasilia", name: "Asa Norte" },
  { state_code: "df", city_slug: "brasilia", name: "Lago Sul" },
  { state_code: "df", city_slug: "brasilia", name: "Lago Norte" },
  { state_code: "df", city_slug: "brasilia", name: "Águas Claras" },
  { state_code: "df", city_slug: "brasilia", name: "Taguatinga" },
  { state_code: "df", city_slug: "brasilia", name: "Ceilândia" },
  { state_code: "df", city_slug: "brasilia", name: "Guará" },
  { state_code: "df", city_slug: "brasilia", name: "Sobradinho" },
  { state_code: "df", city_slug: "brasilia", name: "Plano Piloto" },

  // Salvador - BA
  { state_code: "ba", city_slug: "salvador", name: "Barra" },
  { state_code: "ba", city_slug: "salvador", name: "Ondina" },
  { state_code: "ba", city_slug: "salvador", name: "Rio Vermelho" },
  { state_code: "ba", city_slug: "salvador", name: "Itapuã" },
  { state_code: "ba", city_slug: "salvador", name: "Pituba" },
  { state_code: "ba", city_slug: "salvador", name: "Horto Florestal" },
  { state_code: "ba", city_slug: "salvador", name: "Centro" },
  { state_code: "ba", city_slug: "salvador", name: "Pelourinho" },
  { state_code: "ba", city_slug: "salvador", name: "Brotas" },
  { state_code: "ba", city_slug: "salvador", name: "Caminho das Árvores" },

  // Fortaleza - CE
  { state_code: "ce", city_slug: "fortaleza", name: "Meireles" },
  { state_code: "ce", city_slug: "fortaleza", name: "Aldeota" },
  { state_code: "ce", city_slug: "fortaleza", name: "Praia de Iracema" },
  { state_code: "ce", city_slug: "fortaleza", name: "Mucuripe" },
  { state_code: "ce", city_slug: "fortaleza", name: "Varjota" },
  { state_code: "ce", city_slug: "fortaleza", name: "Centro" },
  { state_code: "ce", city_slug: "fortaleza", name: "Messejana" },
  { state_code: "ce", city_slug: "fortaleza", name: "Papicu" },

  // Curitiba - PR
  { state_code: "pr", city_slug: "curitiba", name: "Batel" },
  { state_code: "pr", city_slug: "curitiba", name: "Centro" },
  { state_code: "pr", city_slug: "curitiba", name: "Água Verde" },
  { state_code: "pr", city_slug: "curitiba", name: "Bigorrilho" },
  { state_code: "pr", city_slug: "curitiba", name: "Portão" },
  { state_code: "pr", city_slug: "curitiba", name: "Juvevê" },
  { state_code: "pr", city_slug: "curitiba", name: "Cabral" },
  { state_code: "pr", city_slug: "curitiba", name: "Alto da XV" },

  // Porto Alegre - RS
  { state_code: "rs", city_slug: "porto-alegre", name: "Moinhos de Vento" },
  { state_code: "rs", city_slug: "porto-alegre", name: "Centro" },
  { state_code: "rs", city_slug: "porto-alegre", name: "Bom Fim" },
  { state_code: "rs", city_slug: "porto-alegre", name: "Cidade Baixa" },
  { state_code: "rs", city_slug: "porto-alegre", name: "Petrópolis" },
  { state_code: "rs", city_slug: "porto-alegre", name: "Auxiliadora" },
  { state_code: "rs", city_slug: "porto-alegre", name: "Menino Deus" },
  { state_code: "rs", city_slug: "porto-alegre", name: "Praia de Belas" },

  // Recife - PE
  { state_code: "pe", city_slug: "recife", name: "Boa Viagem" },
  { state_code: "pe", city_slug: "recife", name: "Pina" },
  { state_code: "pe", city_slug: "recife", name: "Piedade" },
  { state_code: "pe", city_slug: "recife", name: "Centro" },
  { state_code: "pe", city_slug: "recife", name: "Boa Vista" },
  { state_code: "pe", city_slug: "recife", name: "Espinheiro" },
  { state_code: "pe", city_slug: "recife", name: "Casa Forte" },
  { state_code: "pe", city_slug: "recife", name: "Graças" },

  // Manaus - AM
  { state_code: "am", city_slug: "manaus", name: "Centro" },
  { state_code: "am", city_slug: "manaus", name: "Adrianópolis" },
  { state_code: "am", city_slug: "manaus", name: "Vieiralves" },
  { state_code: "am", city_slug: "manaus", name: "Parque 10" },
  { state_code: "am", city_slug: "manaus", name: "Aleixo" },
  { state_code: "am", city_slug: "manaus", name: "Chapada" },
];

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[populate-brazil-neighborhoods] Iniciando importação de ${NEIGHBORHOODS_DATA.length} bairros`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Processar em lotes de 50
    const batchSize = 50;
    for (let i = 0; i < NEIGHBORHOODS_DATA.length; i += batchSize) {
      const batch = NEIGHBORHOODS_DATA.slice(i, i + batchSize);
      
      const neighborhoods = batch.map(n => ({
        state_code: n.state_code,
        city_slug: n.city_slug,
        neighborhood_name: n.name,
        neighborhood_slug: createSlug(n.name),
        is_active: true,
      }));

      const { data, error } = await supabaseClient
        .from('neighborhoods')
        .upsert(neighborhoods, {
          onConflict: 'state_code,city_slug,neighborhood_slug',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`[populate-brazil-neighborhoods] Erro no lote ${i}-${i + batchSize}:`, error);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`[populate-brazil-neighborhoods] Lote ${i}-${i + batchSize} importado com sucesso`);
      }
    }

    console.log(`[populate-brazil-neighborhoods] Importação concluída. Importados: ${imported}, Erros: ${errors}`);

    return new Response(
      JSON.stringify({
        success: true,
        imported,
        skipped,
        errors,
        total: NEIGHBORHOODS_DATA.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[populate-brazil-neighborhoods] Erro geral:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
