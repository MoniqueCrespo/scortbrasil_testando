import { BrazilState, City } from "@/types/location";
import { supabase } from "@/integrations/supabase/client";

export const brazilStates: BrazilState[] = [
  { code: 'SP', name: 'São Paulo', slug: 'sao-paulo' },
  { code: 'RJ', name: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
  { code: 'MG', name: 'Minas Gerais', slug: 'minas-gerais' },
  { code: 'RS', name: 'Rio Grande do Sul', slug: 'rio-grande-do-sul' },
  { code: 'PR', name: 'Paraná', slug: 'parana' },
  { code: 'SC', name: 'Santa Catarina', slug: 'santa-catarina' },
  { code: 'BA', name: 'Bahia', slug: 'bahia' },
  { code: 'PE', name: 'Pernambuco', slug: 'pernambuco' },
  { code: 'CE', name: 'Ceará', slug: 'ceara' },
  { code: 'DF', name: 'Distrito Federal', slug: 'distrito-federal' },
  { code: 'GO', name: 'Goiás', slug: 'goias' },
  { code: 'AM', name: 'Amazonas', slug: 'amazonas' },
  { code: 'ES', name: 'Espírito Santo', slug: 'espirito-santo' },
  { code: 'PA', name: 'Pará', slug: 'para' },
  { code: 'MT', name: 'Mato Grosso', slug: 'mato-grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul', slug: 'mato-grosso-do-sul' },
  { code: 'PB', name: 'Paraíba', slug: 'paraiba' },
  { code: 'RN', name: 'Rio Grande do Norte', slug: 'rio-grande-do-norte' },
  { code: 'AL', name: 'Alagoas', slug: 'alagoas' },
  { code: 'MA', name: 'Maranhão', slug: 'maranhao' },
  { code: 'PI', name: 'Piauí', slug: 'piaui' },
  { code: 'SE', name: 'Sergipe', slug: 'sergipe' },
  { code: 'RO', name: 'Rondônia', slug: 'rondonia' },
  { code: 'AC', name: 'Acre', slug: 'acre' },
  { code: 'AP', name: 'Amapá', slug: 'amapa' },
  { code: 'RR', name: 'Roraima', slug: 'roraima' },
  { code: 'TO', name: 'Tocantins', slug: 'tocantins' },
];

export const cities: City[] = [
  // São Paulo
  { id: 'sp-capital', name: 'São Paulo', slug: 'sao-paulo', state: 'SP' },
  { id: 'sp-campinas', name: 'Campinas', slug: 'campinas', state: 'SP' },
  { id: 'sp-santos', name: 'Santos', slug: 'santos', state: 'SP' },
  { id: 'sp-sbc', name: 'São Bernardo do Campo', slug: 'sao-bernardo-do-campo', state: 'SP' },
  { id: 'sp-guarulhos', name: 'Guarulhos', slug: 'guarulhos', state: 'SP' },
  { id: 'sp-osasco', name: 'Osasco', slug: 'osasco', state: 'SP' },
  { id: 'sp-sorocaba', name: 'Sorocaba', slug: 'sorocaba', state: 'SP' },
  
  // Rio de Janeiro
  { id: 'rj-capital', name: 'Rio de Janeiro', slug: 'rio-de-janeiro', state: 'RJ' },
  { id: 'rj-niteroi', name: 'Niterói', slug: 'niteroi', state: 'RJ' },
  { id: 'rj-sao-goncalo', name: 'São Gonçalo', slug: 'sao-goncalo', state: 'RJ' },
  { id: 'rj-duque-de-caxias', name: 'Duque de Caxias', slug: 'duque-de-caxias', state: 'RJ' },
  { id: 'rj-nova-iguacu', name: 'Nova Iguaçu', slug: 'nova-iguacu', state: 'RJ' },
  
  // Minas Gerais
  { id: 'mg-bh', name: 'Belo Horizonte', slug: 'belo-horizonte', state: 'MG' },
  { id: 'mg-uberlandia', name: 'Uberlândia', slug: 'uberlandia', state: 'MG' },
  { id: 'mg-contagem', name: 'Contagem', slug: 'contagem', state: 'MG' },
  { id: 'mg-juiz-de-fora', name: 'Juiz de Fora', slug: 'juiz-de-fora', state: 'MG' },
  
  // Rio Grande do Sul
  { id: 'rs-poa', name: 'Porto Alegre', slug: 'porto-alegre', state: 'RS' },
  { id: 'rs-caxias', name: 'Caxias do Sul', slug: 'caxias-do-sul', state: 'RS' },
  { id: 'rs-pelotas', name: 'Pelotas', slug: 'pelotas', state: 'RS' },
  { id: 'rs-canoas', name: 'Canoas', slug: 'canoas', state: 'RS' },
  
  // Paraná
  { id: 'pr-curitiba', name: 'Curitiba', slug: 'curitiba', state: 'PR' },
  { id: 'pr-londrina', name: 'Londrina', slug: 'londrina', state: 'PR' },
  { id: 'pr-maringa', name: 'Maringá', slug: 'maringa', state: 'PR' },
  { id: 'pr-foz', name: 'Foz do Iguaçu', slug: 'foz-do-iguacu', state: 'PR' },
  
  // Bahia
  { id: 'ba-salvador', name: 'Salvador', slug: 'salvador', state: 'BA' },
  { id: 'ba-feira', name: 'Feira de Santana', slug: 'feira-de-santana', state: 'BA' },
  { id: 'ba-vitoria', name: 'Vitória da Conquista', slug: 'vitoria-da-conquista', state: 'BA' },
  
  // Distrito Federal
  { id: 'df-brasilia', name: 'Brasília', slug: 'brasilia', state: 'DF' },
  
  // Ceará
  { id: 'ce-fortaleza', name: 'Fortaleza', slug: 'fortaleza', state: 'CE' },
  { id: 'ce-caucaia', name: 'Caucaia', slug: 'caucaia', state: 'CE' },
  
  // Pernambuco
  { id: 'pe-recife', name: 'Recife', slug: 'recife', state: 'PE' },
  { id: 'pe-jaboatao', name: 'Jaboatão dos Guararapes', slug: 'jaboatao-dos-guararapes', state: 'PE' },
  
  // Santa Catarina
  { id: 'sc-floripa', name: 'Florianópolis', slug: 'florianopolis', state: 'SC' },
  { id: 'sc-joinville', name: 'Joinville', slug: 'joinville', state: 'SC' },
  { id: 'sc-blumenau', name: 'Blumenau', slug: 'blumenau', state: 'SC' },
];

// Cache de cidades do banco de dados
let cachedCities: City[] = [];

// Inicializar cidades do banco
export const initializeCities = async () => {
  try {
    const { data, error } = await supabase
      .from('cities_seo')
      .select('id, city_name, city_slug, state_code, is_neighborhood, parent_city_slug')
      .eq('is_active', true);
    
    if (error) throw error;
    
    cachedCities = (data || []).map(city => ({
      id: city.id,
      name: city.city_name,
      slug: city.city_slug,
      state: city.state_code,
      isNeighborhood: city.is_neighborhood || false,
      parentCitySlug: city.parent_city_slug || undefined
    }));
    
    console.log(`[locations] Carregadas ${cachedCities.length} localizações (cidades + bairros) do banco`);
  } catch (error) {
    console.error('[locations] Erro ao carregar cidades:', error);
    cachedCities = cities;
  }
};

export const getCitiesByState = (stateCode: string): City[] => {
  const allCities = cachedCities.length > 0 ? cachedCities : cities;
  return allCities.filter(city => city.state === stateCode);
};

export const getStateBySlug = (slug: string): BrazilState | undefined => {
  return brazilStates.find(state => state.slug === slug);
};

// Buscar estado por código/sigla (ex: "RJ", "SP")
export const getStateByCode = (code: string): BrazilState | undefined => {
  return brazilStates.find(state => state.code.toLowerCase() === code.toLowerCase());
};

export const getCityBySlug = (slug: string, stateCode: string): City | undefined => {
  const allCities = cachedCities.length > 0 ? cachedCities : cities;
  return allCities.find(city => city.slug === slug && city.state === stateCode);
};

// Bairros por cidade (para filtro dinâmico)
export const neighborhoodsByCity: Record<string, string[]> = {
  // São Paulo
  'sao-paulo': [
    'Jardins', 'Moema', 'Vila Mariana', 'Pinheiros', 'Itaim Bibi',
    'Vila Madalena', 'Brooklin', 'República', 'Consolação', 'Augusta',
    'Vila Olímpia', 'Santana', 'Tatuapé', 'Perdizes', 'Centro',
    'Bela Vista', 'Santa Cecília', 'Mooca', 'Alto de Pinheiros', 'Tucuruvi'
  ],
  
  // Rio de Janeiro - Capital (ordenados por popularidade)
  'rio-de-janeiro': [
    'Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Recreio dos Bandeirantes',
    'Botafogo', 'Flamengo', 'Tijuca', 'Centro', 'Lapa',
    'São Conrado', 'Gávea', 'Jardim Botânico', 'Leblon', 'Leme',
    'Urca', 'Laranjeiras', 'Santa Teresa', 'Jacarepaguá', 'Bangu',
    'Campo Grande', 'Joá', 'Humaitá', 'Cosme Velho', 'Alto da Boa Vista',
    'Cinelândia'
  ],
  
  // Belo Horizonte
  'belo-horizonte': [
    'Savassi', 'Lourdes', 'Funcionários', 'Santo Agostinho', 'Buritis',
    'Mangabeiras', 'Belvedere', 'Serra', 'Anchieta', 'Cidade Jardim',
    'Castelo', 'Prado', 'Santa Lúcia', 'Carmo', 'São Pedro',
    'Gutierrez', 'Santa Efigênia', 'Centro', 'Luxemburgo', 'Sion'
  ],
  
  // Brasília
  'brasilia': [
    'Asa Sul', 'Asa Norte', 'Lago Sul', 'Lago Norte', 'Sudoeste',
    'Noroeste', 'Park Way', 'Águas Claras', 'Taguatinga', 'Ceilândia',
    'Samambaia', 'Guará', 'Cruzeiro', 'Octogonal', 'Jardim Botânico'
  ],
  
  // Salvador
  'salvador': [
    'Barra', 'Ondina', 'Rio Vermelho', 'Graça', 'Vitória',
    'Pituba', 'Itaigara', 'Caminho das Árvores', 'Horto Florestal', 'Costa Azul',
    'Armação', 'Patamares', 'Piatã', 'Itapuã', 'Stella Maris',
    'Pelourinho', 'Centro', 'Comércio', 'Brotas', 'Jardim Armação'
  ],
  
  // Curitiba
  'curitiba': [
    'Batel', 'Bigorrilho', 'Água Verde', 'Cabral', 'Ecoville',
    'Juvevê', 'Champagnat', 'Mercês', 'Ahú', 'Centro',
    'Cristo Rei', 'Alto da XV', 'Jardim Social', 'Rebouças', 'Seminário'
  ],
  
  // Porto Alegre
  'porto-alegre': [
    'Moinhos de Vento', 'Bela Vista', 'Mont\'Serrat', 'Petrópolis', 'Três Figueiras',
    'Auxiliadora', 'Rio Branco', 'Higienópolis', 'Boa Vista', 'Centro',
    'Cidade Baixa', 'Menino Deus', 'Santana', 'Independência', 'Floresta'
  ],
  
  // Recife
  'recife': [
    'Boa Viagem', 'Pina', 'Espinheiro', 'Parnamirim', 'Graças',
    'Aflitos', 'Tamarineira', 'Casa Forte', 'Ilha do Leite', 'Derby',
    'Madalena', 'Torre', 'Jaqueira', 'Boa Vista', 'Centro'
  ],
  
  // Fortaleza
  'fortaleza': [
    'Meireles', 'Aldeota', 'Varjota', 'Cocó', 'Dionísio Torres',
    'Mucuripe', 'Papicu', 'Praia de Iracema', 'Centro', 'Fátima',
    'Joaquim Távora', 'Cidade dos Funcionários', 'Edson Queiroz', 'Dunas', 'Guararapes'
  ],
  
  // Manaus
  'manaus': [
    'Adrianópolis', 'Vieiralves', 'Ponta Negra', 'Parque 10', 'Chapada',
    'Nossa Senhora das Graças', 'Flores', 'Aleixo', 'Centro', 'Cidade Nova'
  ],
  
  // Florianópolis
  'florianopolis': [
    'Jurerê Internacional', 'Lagoa da Conceição', 'Canasvieiras', 'Ingleses', 'Campeche',
    'Cachoeira do Bom Jesus', 'Centro', 'Agronômica', 'Trindade', 'Córrego Grande',
    'Daniela', 'Barra da Lagoa'
  ],
  
  // Goiânia
  'goiania': [
    'Setor Bueno', 'Setor Oeste', 'Setor Marista', 'Setor Sul', 'Setor Central',
    'Setor Aeroporto', 'Alto da Glória', 'Jardim Goiás', 'Park Lozandes', 'Setor Nova Suíça'
  ],
  
  // Niterói
  'niteroi': [
    'Icaraí', 'Santa Rosa', 'Centro', 'São Francisco', 'Ingá',
    'Piratininga', 'Itaipu', 'Camboinhas', 'Charitas', 'Jurujuba'
  ],
  
  // Duque de Caxias
  'duque-de-caxias': [
    'Centro', 'Jardim Primavera', 'Parque Duque', 'Campos Elíseos',
    'Vila São Luís', 'Gramacho', 'Saracuruna', 'Imbariê'
  ],
  
  // São Gonçalo
  'sao-goncalo': [
    'Alcântara', 'Neves', 'Centro', 'Zé Garoto', 'Colubandê',
    'Mutuá', 'Mutondo', 'Porto Novo', 'Arsenal', 'Jardim Catarina'
  ],
  
  // Campinas
  'campinas': [
    'Cambuí', 'Centro', 'Taquaral', 'Barão Geraldo', 'Guanabara',
    'Jardim Chapadão', 'Vila Nova'
  ],
  
  // Default (quando não tem cidade específica ou é nível de estado)
  'default': [
    'Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste', 'Zona Leste'
  ]
};

// Função helper para pegar bairros de uma cidade
export const getNeighborhoodsByCity = (citySlug: string | undefined): string[] => {
  if (!citySlug) return neighborhoodsByCity.default;
  return neighborhoodsByCity[citySlug] || neighborhoodsByCity.default;
};

// Normalizar string para slug (remover acentos e espaços)
export const normalizeToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
};

// Buscar bairro por slug em qualquer cidade do estado
export const getNeighborhoodBySlug = (slug: string, stateCode: string): { neighborhood: string; city: City } | undefined => {
  const stateCities = getCitiesByState(stateCode);
  
  for (const city of stateCities) {
    const neighborhoods = getNeighborhoodsByCity(city.slug);
    const neighborhood = neighborhoods.find(n => normalizeToSlug(n) === slug);
    
    if (neighborhood) {
      return { neighborhood, city };
    }
  }
  
  return undefined;
};

// Mapeamento de estados vizinhos geograficamente
export const neighboringStates: Record<string, string[]> = {
  'SP': ['RJ', 'MG', 'PR', 'MS'],
  'RJ': ['SP', 'MG', 'ES'],
  'MG': ['SP', 'RJ', 'ES', 'BA', 'GO', 'MS'],
  'RS': ['SC', 'PR'],
  'PR': ['SP', 'SC', 'RS', 'MS'],
  'SC': ['PR', 'RS'],
  'BA': ['SE', 'AL', 'PE', 'PI', 'MG', 'ES', 'GO', 'TO'],
  'PE': ['PB', 'CE', 'AL', 'BA', 'PI'],
  'CE': ['RN', 'PB', 'PE', 'PI'],
  'DF': ['GO', 'MG'],
  'GO': ['DF', 'MG', 'MS', 'MT', 'TO', 'BA'],
  'AM': ['RR', 'RO', 'AC', 'PA'],
  'ES': ['RJ', 'MG', 'BA'],
  'PA': ['AM', 'RR', 'AP', 'MT', 'TO', 'MA'],
  'MT': ['RO', 'AM', 'PA', 'TO', 'GO', 'MS'],
  'MS': ['MT', 'GO', 'MG', 'SP', 'PR'],
  'PB': ['RN', 'CE', 'PE'],
  'RN': ['CE', 'PB'],
  'AL': ['PE', 'SE', 'BA'],
  'MA': ['PA', 'TO', 'PI'],
  'PI': ['MA', 'CE', 'PE', 'BA', 'TO'],
  'SE': ['AL', 'BA'],
  'RO': ['AC', 'AM', 'MT'],
  'AC': ['AM', 'RO'],
  'AP': ['PA'],
  'RR': ['AM', 'PA'],
  'TO': ['MA', 'PI', 'BA', 'GO', 'MT', 'PA'],
};

export const getNeighboringStates = (stateCode: string): BrazilState[] => {
  const codes = neighboringStates[stateCode] || [];
  return codes.map(code => brazilStates.find(s => s.code === code)).filter(Boolean) as BrazilState[];
};
