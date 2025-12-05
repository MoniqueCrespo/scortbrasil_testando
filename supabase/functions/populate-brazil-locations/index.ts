import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de códigos UF para estados
const stateMapping: { [key: string]: { code: string; name: string; slug: string } } = {
  '12': { code: 'AC', name: 'Acre', slug: 'acre' },
  '27': { code: 'AL', name: 'Alagoas', slug: 'alagoas' },
  '16': { code: 'AP', name: 'Amapá', slug: 'amapa' },
  '13': { code: 'AM', name: 'Amazonas', slug: 'amazonas' },
  '29': { code: 'BA', name: 'Bahia', slug: 'bahia' },
  '23': { code: 'CE', name: 'Ceará', slug: 'ceara' },
  '53': { code: 'DF', name: 'Distrito Federal', slug: 'distrito-federal' },
  '32': { code: 'ES', name: 'Espírito Santo', slug: 'espirito-santo' },
  '52': { code: 'GO', name: 'Goiás', slug: 'goias' },
  '21': { code: 'MA', name: 'Maranhão', slug: 'maranhao' },
  '51': { code: 'MT', name: 'Mato Grosso', slug: 'mato-grosso' },
  '50': { code: 'MS', name: 'Mato Grosso do Sul', slug: 'mato-grosso-do-sul' },
  '31': { code: 'MG', name: 'Minas Gerais', slug: 'minas-gerais' },
  '15': { code: 'PA', name: 'Pará', slug: 'para' },
  '25': { code: 'PB', name: 'Paraíba', slug: 'paraiba' },
  '41': { code: 'PR', name: 'Paraná', slug: 'parana' },
  '26': { code: 'PE', name: 'Pernambuco', slug: 'pernambuco' },
  '22': { code: 'PI', name: 'Piauí', slug: 'piaui' },
  '33': { code: 'RJ', name: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
  '24': { code: 'RN', name: 'Rio Grande do Norte', slug: 'rio-grande-do-norte' },
  '43': { code: 'RS', name: 'Rio Grande do Sul', slug: 'rio-grande-do-sul' },
  '11': { code: 'RO', name: 'Rondônia', slug: 'rondonia' },
  '14': { code: 'RR', name: 'Roraima', slug: 'roraima' },
  '42': { code: 'SC', name: 'Santa Catarina', slug: 'santa-catarina' },
  '35': { code: 'SP', name: 'São Paulo', slug: 'sao-paulo' },
  '28': { code: 'SE', name: 'Sergipe', slug: 'sergipe' },
  '17': { code: 'TO', name: 'Tocantins', slug: 'tocantins' },
};

// Função para criar slug a partir do nome
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
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

    console.log('🚀 Iniciando importação completa do Brasil - 5.570 municípios...');

    // Buscar dados da API oficial do IBGE (mais confiável que GitHub)
    const url = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';
    console.log('📥 Buscando dados da API do IBGE:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ Erro HTTP:', response.status, response.statusText);
      throw new Error(`Falha ao buscar dados da API IBGE: HTTP ${response.status}`);
    }

    const municipios = await response.json();
    console.log(`📊 Total de municípios encontrados: ${municipios.length}`);

    if (!Array.isArray(municipios) || municipios.length === 0) {
      throw new Error('Dados inválidos ou vazios recebidos');
    }

    let totalCities = 0;
    let totalProcessed = 0;
    const errors: string[] = [];
    const batchSize = 100;

    // Processar em lotes para não sobrecarregar
    for (let i = 0; i < municipios.length; i += batchSize) {
      const batch = municipios.slice(i, i + batchSize);
      const citiesData = [];

      for (const municipio of batch) {
        try {
          // API do IBGE retorna: { id, nome, microrregiao: { mesorregiao: { UF: { id, sigla, nome } } } }
          const codigoUf = String(municipio.microrregiao?.mesorregiao?.UF?.id);
          const ufSigla = municipio.microrregiao?.mesorregiao?.UF?.sigla;
          const ufNome = municipio.microrregiao?.mesorregiao?.UF?.nome;
          const state = stateMapping[codigoUf];

          if (!state) {
            const errorMsg = `Estado não mapeado - Código: ${codigoUf}, Sigla: ${ufSigla}, Nome: ${ufNome}, Município: ${municipio.nome} (ID: ${municipio.id})`;
            errors.push(errorMsg);
            console.warn(`⚠️ ${errorMsg}`);
            continue;
          }

          const citySlug = createSlug(municipio.nome);
          
          // Validar dados antes de inserir
          if (!citySlug || citySlug.length < 2) {
            const errorMsg = `Slug inválido para município: ${municipio.nome} (gerou: "${citySlug}")`;
            errors.push(errorMsg);
            console.warn(`⚠️ ${errorMsg}`);
            continue;
          }

          citiesData.push({
            state_code: state.code,
            state_name: state.name,
            city_name: municipio.nome,
            city_slug: citySlug,
            meta_title: `Acompanhantes em ${municipio.nome} - ${state.code} | HotBrazil`,
            meta_description: `Encontre as melhores acompanhantes em ${municipio.nome}, ${state.name}. Anúncios verificados e atualizados. Confira agora!`,
            canonical_url: `/acompanhantes/${state.slug}/${citySlug}`,
            is_active: true
          });

          totalProcessed++;
        } catch (err: any) {
          const errorMsg = `Erro processando município ${municipio.nome} (ID: ${municipio.id}): ${err.message}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Inserir lote
      if (citiesData.length > 0) {
        const { data, error } = await supabaseClient
          .from('cities_seo')
          .upsert(citiesData, {
            onConflict: 'city_slug,state_code'
          })
          .select('city_name, state_code');

        if (error) {
          const errorMsg = `Erro ao inserir lote ${i / batchSize + 1}: ${error.message} | Código: ${error.code} | Detalhes: ${error.details}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
          
          // Tentar inserir um por um para identificar problema específico
          console.log(`🔍 Tentando inserção individual para identificar município problemático...`);
          for (const city of citiesData) {
            const { error: individualError } = await supabaseClient
              .from('cities_seo')
              .upsert([city], {
                onConflict: 'city_slug,state_code'
              });
            
            if (individualError) {
              const detailError = `Município problemático: ${city.city_name} (${city.state_code}) - Slug: "${city.city_slug}" | Erro: ${individualError.message}`;
              errors.push(detailError);
              console.error(`❌ ${detailError}`);
            } else {
              totalCities++;
            }
          }
        } else {
          totalCities += citiesData.length;
          console.log(`✅ Lote ${i / batchSize + 1}/${Math.ceil(municipios.length / batchSize)} processado: ${citiesData.length} cidades (Total: ${totalCities})`);
        }
      }
    }

    const statesCount = new Set(municipios.map((m: any) => String(m.microrregiao?.mesorregiao?.UF?.id))).size;

    console.log(`✨ Importação concluída!`);
    console.log(`📍 Total processado: ${totalProcessed} municípios`);
    console.log(`💾 Total inserido: ${totalCities} cidades`);
    console.log(`🏛️ Estados: ${statesCount}`);
    
    if (errors.length > 0) {
      console.warn(`⚠️ Erros encontrados: ${errors.length}`);
      errors.slice(0, 5).forEach(err => console.warn(`  - ${err}`));
    }

    return new Response(
      JSON.stringify({
        success: totalCities > 0, // Sucesso se pelo menos algumas cidades foram inseridas
        message: totalCities > 0 
          ? `População do Brasil concluída! ${totalCities} cidades inseridas de ${totalProcessed} processadas.`
          : 'Nenhuma cidade foi inserida.',
        totalCities,
        totalStates: statesCount,
        totalProcessed,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        totalErrors: errors.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: totalCities > 0 ? 200 : 500, // Retorna 200 se inseriu algo, 500 só se falhou completamente
      }
    );

  } catch (error: any) {
    console.error('❌ Erro fatal na importação:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Falha na importação: ${error.message}`,
        errorType: error.name,
        details: error.toString(),
        stack: error.stack?.split('\n').slice(0, 5) // Primeiras 5 linhas do stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
