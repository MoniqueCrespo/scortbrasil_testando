import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Estados e cidades principais do Brasil com bairros
// IMPORTANTE: Este script cadastra TODAS as capitais e principais cidades de TODOS os estados
const locationsData = [
  {
    state: { code: 'AC', name: 'Acre', slug: 'acre' },
    cities: [
      { name: 'Rio Branco', slug: 'rio-branco', neighborhoods: ['Centro', 'Bosque', 'Aviário', 'Placas', 'Estação Experimental', 'Cadeia Velha', 'Base'] },
      { name: 'Cruzeiro do Sul', slug: 'cruzeiro-do-sul', neighborhoods: ['Centro', 'Remanso', 'Miritizal'] },
      { name: 'Sena Madureira', slug: 'sena-madureira', neighborhoods: ['Centro', 'Bairro da Praia'] }
    ]
  },
  {
    state: { code: 'AL', name: 'Alagoas', slug: 'alagoas' },
    cities: [
      { name: 'Maceió', slug: 'maceio', neighborhoods: ['Centro', 'Pajuçara', 'Ponta Verde', 'Jatiúca', 'Mangabeiras', 'Cruz das Almas', 'Farol', 'Gruta de Lourdes', 'Jaraguá'] },
      { name: 'Arapiraca', slug: 'arapiraca', neighborhoods: ['Centro', 'Senador Arnon de Melo', 'Baixão'] },
      { name: 'Palmeira dos Índios', slug: 'palmeira-dos-indios', neighborhoods: ['Centro', 'Xingó'] }
    ]
  },
  {
    state: { code: 'AP', name: 'Amapá', slug: 'amapa' },
    cities: [
      { name: 'Macapá', slug: 'macapa', neighborhoods: ['Centro', 'Trem', 'Santa Rita', 'Buritizal', 'Pacoval', 'Beirol', 'Perpétuo Socorro'] },
      { name: 'Santana', slug: 'santana', neighborhoods: ['Centro', 'Fonte Nova'] }
    ]
  },
  {
    state: { code: 'AM', name: 'Amazonas', slug: 'amazonas' },
    cities: [
      { name: 'Manaus', slug: 'manaus', neighborhoods: ['Centro', 'Adrianópolis', 'Aleixo', 'Vieiralves', 'Ponta Negra', 'Flores', 'Parque 10', 'Nossa Senhora das Graças', 'Chapada'] },
      { name: 'Parintins', slug: 'parintins', neighborhoods: ['Centro', 'Francesa'] },
      { name: 'Itacoatiara', slug: 'itacoatiara', neighborhoods: ['Centro', 'Iraci'] },
      { name: 'Manacapuru', slug: 'manacapuru', neighborhoods: ['Centro'] }
    ]
  },
  {
    state: { code: 'BA', name: 'Bahia', slug: 'bahia' },
    cities: [
      { name: 'Salvador', slug: 'salvador', neighborhoods: ['Barra', 'Ondina', 'Rio Vermelho', 'Pituba', 'Itaigara', 'Caminho das Árvores', 'Iguatemi', 'Pelourinho', 'Horto Florestal', 'Costa Azul'] },
      { name: 'Feira de Santana', slug: 'feira-de-santana', neighborhoods: ['Centro', 'Kalilândia', 'Muchila', 'Tomba', 'George Américo', 'Queimadinha'] },
      { name: 'Vitória da Conquista', slug: 'vitoria-da-conquista', neighborhoods: ['Centro', 'Candeias', 'Brasil', 'Recreio'] },
      { name: 'Camaçari', slug: 'camacari', neighborhoods: ['Centro', 'Orla', 'Nova Brasília'] },
      { name: 'Itabuna', slug: 'itabuna', neighborhoods: ['Centro', 'São Caetano', 'Pontalzinho'] },
      { name: 'Juazeiro', slug: 'juazeiro', neighborhoods: ['Centro', 'Piranga', 'João Paulo II'] },
      { name: 'Lauro de Freitas', slug: 'lauro-de-freitas', neighborhoods: ['Centro', 'Vilas do Atlântico', 'Itinga'] }
    ]
  },
  {
    state: { code: 'CE', name: 'Ceará', slug: 'ceara' },
    cities: [
      { name: 'Fortaleza', slug: 'fortaleza', neighborhoods: ['Meireles', 'Aldeota', 'Cocó', 'Praia de Iracema', 'Mucuripe', 'Varjota', 'Papicu', 'Dionísio Torres', 'Fátima'] },
      { name: 'Caucaia', slug: 'caucaia', neighborhoods: ['Centro', 'Cumbuco', 'Icaraí', 'Jurema', 'Tabuba'] },
      { name: 'Juazeiro do Norte', slug: 'juazeiro-do-norte', neighborhoods: ['Centro', 'Triângulo', 'Lagoa Seca', 'João Cabral'] },
      { name: 'Maracanaú', slug: 'maracanau', neighborhoods: ['Centro', 'Jereissati', 'Acaracuzinho'] },
      { name: 'Sobral', slug: 'sobral', neighborhoods: ['Centro', 'Derby', 'Dom Expedito'] }
    ]
  },
  {
    state: { code: 'DF', name: 'Distrito Federal', slug: 'distrito-federal' },
    cities: [
      { name: 'Brasília', slug: 'brasilia', neighborhoods: ['Asa Sul', 'Asa Norte', 'Lago Sul', 'Lago Norte', 'Sudoeste', 'Noroeste', 'Águas Claras', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Plano Piloto', 'Guará'] }
    ]
  },
  {
    state: { code: 'ES', name: 'Espírito Santo', slug: 'espirito-santo' },
    cities: [
      { name: 'Vitória', slug: 'vitoria', neighborhoods: ['Praia do Canto', 'Jardim da Penha', 'Enseada do Suá', 'Mata da Praia', 'Centro', 'Praia de Camburi'] },
      { name: 'Vila Velha', slug: 'vila-velha', neighborhoods: ['Praia da Costa', 'Itapoã', 'Centro', 'Glória', 'Itaparica'] },
      { name: 'Serra', slug: 'serra', neighborhoods: ['Laranjeiras', 'Jacaraípe', 'Colina de Laranjeiras'] },
      { name: 'Cariacica', slug: 'cariacica', neighborhoods: ['Campo Grande', 'Porto de Santana'] },
      { name: 'Cachoeiro de Itapemirim', slug: 'cachoeiro-de-itapemirim', neighborhoods: ['Centro', 'Aquidaban', 'Gilberto Machado'] }
    ]
  },
  {
    state: { code: 'GO', name: 'Goiás', slug: 'goias' },
    cities: [
      { name: 'Goiânia', slug: 'goiania', neighborhoods: ['Setor Bueno', 'Setor Oeste', 'Setor Marista', 'Jardim Goiás', 'Alto da Glória', 'Setor Sul', 'Setor Aeroporto'] },
      { name: 'Aparecida de Goiânia', slug: 'aparecida-de-goiania', neighborhoods: ['Centro', 'Cidade Jardim', 'Papillon Park', 'Expansul'] },
      { name: 'Anápolis', slug: 'anapolis', neighborhoods: ['Centro', 'Jundiaí', 'Jaiara'] },
      { name: 'Rio Verde', slug: 'rio-verde', neighborhoods: ['Centro', 'Setor Sul'] },
      { name: 'Luziânia', slug: 'luziania', neighborhoods: ['Centro', 'Parque Estrela Dalva'] }
    ]
  },
  {
    state: { code: 'MA', name: 'Maranhão', slug: 'maranhao' },
    cities: [
      { name: 'São Luís', slug: 'sao-luis', neighborhoods: ['Renascença', 'Calhau', 'Olho d\'Água', 'Turu', 'Centro', 'Ponta d\'Areia', 'São Francisco'] },
      { name: 'Imperatriz', slug: 'imperatriz', neighborhoods: ['Centro', 'Bacuri', 'Nova Imperatriz'] },
      { name: 'São José de Ribamar', slug: 'sao-jose-de-ribamar', neighborhoods: ['Centro', 'Araçagy'] },
      { name: 'Caxias', slug: 'caxias', neighborhoods: ['Centro', 'Caldeirões'] }
    ]
  },
  {
    state: { code: 'MT', name: 'Mato Grosso', slug: 'mato-grosso' },
    cities: [
      { name: 'Cuiabá', slug: 'cuiaba', neighborhoods: ['Centro', 'Duque de Caxias', 'Popular', 'Goiabeiras', 'CPA', 'Jardim Aclimação', 'Despraiado'] },
      { name: 'Várzea Grande', slug: 'varzea-grande', neighborhoods: ['Centro', 'Cristo Rei', 'Mapim', '23 de Setembro'] },
      { name: 'Rondonópolis', slug: 'rondonopolis', neighborhoods: ['Centro', 'Vila Aurora'] },
      { name: 'Sinop', slug: 'sinop', neighborhoods: ['Centro', 'Setor Comercial'] }
    ]
  },
  {
    state: { code: 'MS', name: 'Mato Grosso do Sul', slug: 'mato-grosso-do-sul' },
    cities: [
      { name: 'Campo Grande', slug: 'campo-grande', neighborhoods: ['Centro', 'Jardim dos Estados', 'Chácara Cachoeira', 'Monte Castelo', 'São Francisco', 'Vila Carlota'] },
      { name: 'Dourados', slug: 'dourados', neighborhoods: ['Centro', 'Jardim América', 'Vila Progresso'] },
      { name: 'Três Lagoas', slug: 'tres-lagoas', neighborhoods: ['Centro', 'Interlagos'] },
      { name: 'Corumbá', slug: 'corumba', neighborhoods: ['Centro', 'Dom Bosco'] }
    ]
  },
  {
    state: { code: 'MG', name: 'Minas Gerais', slug: 'minas-gerais' },
    cities: [
      { name: 'Belo Horizonte', slug: 'belo-horizonte', neighborhoods: ['Savassi', 'Lourdes', 'Funcionários', 'Pampulha', 'Buritis', 'Belvedere', 'Santo Agostinho', 'Mangabeiras', 'Serra'] },
      { name: 'Uberlândia', slug: 'uberlandia', neighborhoods: ['Centro', 'Santa Mônica', 'Fundinho', 'Martins', 'Brasil', 'Tibery'] },
      { name: 'Contagem', slug: 'contagem', neighborhoods: ['Centro', 'Eldorado', 'Industrial', 'Cidade Industrial'] },
      { name: 'Juiz de Fora', slug: 'juiz-de-fora', neighborhoods: ['Centro', 'Jardim Glória', 'Alto dos Passos', 'Manoel Honório'] },
      { name: 'Betim', slug: 'betim', neighborhoods: ['Centro', 'Brasil Industrial', 'Alterosas', 'Citrolândia'] },
      { name: 'Montes Claros', slug: 'montes-claros', neighborhoods: ['Centro', 'Ibituruna', 'Todos os Santos', 'Cidade Nova'] }
    ]
  },
  {
    state: { code: 'PA', name: 'Pará', slug: 'para' },
    cities: [
      { name: 'Belém', slug: 'belem', neighborhoods: ['Nazaré', 'Umarizal', 'Batista Campos', 'Reduto', 'Marco'] }
    ]
  },
  {
    state: { code: 'PB', name: 'Paraíba', slug: 'paraiba' },
    cities: [
      { name: 'João Pessoa', slug: 'joao-pessoa', neighborhoods: ['Manaíra', 'Tambaú', 'Cabo Branco', 'Bessa', 'Altiplano', 'Centro'] }
    ]
  },
  {
    state: { code: 'PR', name: 'Paraná', slug: 'parana' },
    cities: [
      { name: 'Curitiba', slug: 'curitiba', neighborhoods: ['Batel', 'Água Verde', 'Cabral', 'Bigorrilho', 'Centro', 'Ecoville', 'Juvevê'] },
      { name: 'Londrina', slug: 'londrina', neighborhoods: ['Centro', 'Gleba Palhano', 'Higienópolis', 'Lago Parque'] },
      { name: 'Maringá', slug: 'maringa', neighborhoods: ['Centro', 'Zona 7', 'Novo Centro', 'Zona 2'] }
    ]
  },
  {
    state: { code: 'PE', name: 'Pernambuco', slug: 'pernambuco' },
    cities: [
      { name: 'Recife', slug: 'recife', neighborhoods: ['Boa Viagem', 'Pina', 'Setúbal', 'Espinheiro', 'Graças', 'Aflitos', 'Derby'] },
      { name: 'Jaboatão dos Guararapes', slug: 'jaboatao-dos-guararapes', neighborhoods: ['Piedade', 'Candeias', 'Barra de Jangada'] }
    ]
  },
  {
    state: { code: 'PI', name: 'Piauí', slug: 'piaui' },
    cities: [
      { name: 'Teresina', slug: 'teresina', neighborhoods: ['Centro', 'Jóquei', 'Fátima', 'Ilhotas', 'Cabral'] }
    ]
  },
  {
    state: { code: 'RJ', name: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
    cities: [
      { name: 'Rio de Janeiro', slug: 'rio-de-janeiro', neighborhoods: ['Copacabana', 'Ipanema', 'Leblon', 'Barra da Tijuca', 'Botafogo', 'Flamengo', 'Centro', 'Tijuca', 'Recreio', 'Jacarepaguá', 'Campo Grande'] },
      { name: 'Niterói', slug: 'niteroi', neighborhoods: ['Icaraí', 'Santa Rosa', 'Centro', 'Ingá', 'São Francisco', 'Piratininga'] },
      { name: 'Duque de Caxias', slug: 'duque-de-caxias', neighborhoods: ['Centro', 'Jardim Primavera', 'Pilar', 'Jardim 25 de Agosto'] },
      { name: 'Nova Iguaçu', slug: 'nova-iguacu', neighborhoods: ['Centro', 'Austin', 'Da Luz', 'Jardim Nova Era'] },
      { name: 'São Gonçalo', slug: 'sao-goncalo', neighborhoods: ['Centro', 'Alcântara', 'Neves', 'Mutondo'] },
      { name: 'Belford Roxo', slug: 'belford-roxo', neighborhoods: ['Centro', 'Santa Tereza', 'Areia Branca'] },
      { name: 'Campos dos Goytacazes', slug: 'campos-dos-goytacazes', neighborhoods: ['Centro', 'Pelinca', 'Guarus', 'Jardim Carioca'] }
    ]
  },
  {
    state: { code: 'RN', name: 'Rio Grande do Norte', slug: 'rio-grande-do-norte' },
    cities: [
      { name: 'Natal', slug: 'natal', neighborhoods: ['Ponta Negra', 'Petrópolis', 'Tirol', 'Lagoa Nova', 'Candelária'] }
    ]
  },
  {
    state: { code: 'RS', name: 'Rio Grande do Sul', slug: 'rio-grande-do-sul' },
    cities: [
      { name: 'Porto Alegre', slug: 'porto-alegre', neighborhoods: ['Moinhos de Vento', 'Bela Vista', 'Centro', 'Cidade Baixa', 'Petrópolis', 'Auxiliadora'] },
      { name: 'Caxias do Sul', slug: 'caxias-do-sul', neighborhoods: ['Centro', 'São Pelegrino', 'Sanvitto'] },
      { name: 'Canoas', slug: 'canoas', neighborhoods: ['Centro', 'Niterói', 'Mathias Velho'] }
    ]
  },
  {
    state: { code: 'RO', name: 'Rondônia', slug: 'rondonia' },
    cities: [
      { name: 'Porto Velho', slug: 'porto-velho', neighborhoods: ['Centro', 'Olaria', 'Agenor de Carvalho', 'Flodoaldo Pontes Pinto'] }
    ]
  },
  {
    state: { code: 'RR', name: 'Roraima', slug: 'roraima' },
    cities: [
      { name: 'Boa Vista', slug: 'boa-vista', neighborhoods: ['Centro', 'São Francisco', 'Mecejana', 'Paraviana'] }
    ]
  },
  {
    state: { code: 'SC', name: 'Santa Catarina', slug: 'santa-catarina' },
    cities: [
      { name: 'Florianópolis', slug: 'florianopolis', neighborhoods: ['Centro', 'Trindade', 'Lagoa da Conceição', 'Canasvieiras', 'Ingleses', 'Jurerê'] },
      { name: 'Joinville', slug: 'joinville', neighborhoods: ['Centro', 'América', 'Glória', 'Atiradores'] },
      { name: 'Blumenau', slug: 'blumenau', neighborhoods: ['Centro', 'Velha', 'Victor Konder', 'Ponta Aguda'] }
    ]
  },
  {
    state: { code: 'SP', name: 'São Paulo', slug: 'sao-paulo' },
    cities: [
      { name: 'São Paulo', slug: 'sao-paulo', neighborhoods: ['Jardins', 'Moema', 'Itaim Bibi', 'Vila Madalena', 'Pinheiros', 'Brooklin', 'Morumbi', 'Perdizes', 'Vila Mariana', 'Tatuapé', 'Santana'] },
      { name: 'Campinas', slug: 'campinas', neighborhoods: ['Cambuí', 'Centro', 'Barão Geraldo', 'Taquaral', 'Nova Campinas'] },
      { name: 'Santos', slug: 'santos', neighborhoods: ['Gonzaga', 'Boqueirão', 'Embaré', 'Aparecida', 'Centro', 'José Menino'] },
      { name: 'São Bernardo do Campo', slug: 'sao-bernardo-do-campo', neighborhoods: ['Centro', 'Rudge Ramos', 'Baeta Neves', 'Assunção', 'Anchieta'] },
      { name: 'Santo André', slug: 'santo-andre', neighborhoods: ['Centro', 'Vila Assunção', 'Jardim', 'Santa Terezinha', 'Campestre'] },
      { name: 'Ribeirão Preto', slug: 'ribeirao-preto', neighborhoods: ['Centro', 'Jardim Irajá', 'Ribeirânia', 'Alto da Boa Vista', 'Recreio das Acácias'] },
      { name: 'Guarulhos', slug: 'guarulhos', neighborhoods: ['Centro', 'Vila Galvão', 'Gopouva', 'Macedo', 'Cocaia'] },
      { name: 'Osasco', slug: 'osasco', neighborhoods: ['Centro', 'Presidente Altino', 'Bonfim', 'Quitaúna'] },
      { name: 'Sorocaba', slug: 'sorocaba', neighborhoods: ['Centro', 'Campolim', 'Vila Hortência', 'Jardim Vergueiro'] },
      { name: 'São José dos Campos', slug: 'sao-jose-dos-campos', neighborhoods: ['Centro', 'Jardim Aquarius', 'Vila Adyana', 'Urbanova'] },
      { name: 'Piracicaba', slug: 'piracicaba', neighborhoods: ['Centro', 'Alto', 'Vila Rezende', 'Paulista'] },
      { name: 'Bauru', slug: 'bauru', neighborhoods: ['Centro', 'Jardim Estoril', 'Vila Aviação', 'Higienópolis'] }
    ]
  },
  {
    state: { code: 'SE', name: 'Sergipe', slug: 'sergipe' },
    cities: [
      { name: 'Aracaju', slug: 'aracaju', neighborhoods: ['Atalaia', '13 de Julho', 'Farolândia', 'Jardins', 'Centro'] }
    ]
  },
  {
    state: { code: 'TO', name: 'Tocantins', slug: 'tocantins' },
    cities: [
      { name: 'Palmas', slug: 'palmas', neighborhoods: ['Plano Diretor Sul', 'Plano Diretor Norte', 'Taquaralto', 'Centro'] }
    ]
  }
];

async function populateLocations() {
  console.log('🚀 Iniciando população de estados, cidades e bairros do Brasil...\n');

  let totalCities = 0;
  let totalNeighborhoods = 0;

  for (const location of locationsData) {
    const { state, cities } = location;

    console.log(`📍 Processando estado: ${state.name} (${state.code})`);

    for (const city of cities) {
      const { name, slug, neighborhoods } = city;

      // Inserir cidade no banco de dados com upsert
      const { data, error } = await supabase
        .from('cities_seo')
        .upsert({
          state_code: state.code,
          state_name: state.name,
          city_name: name,
          city_slug: slug,
          meta_title: `Acompanhantes em ${name} - ${state.name} | HotBrazil`,
          meta_description: `Encontre as melhores acompanhantes em ${name}, ${state.name}. Anúncios verificados e atualizados. Confira agora!`,
          canonical_url: `/acompanhantes/${state.slug}/${slug}`,
          is_active: true
        }, {
          onConflict: 'city_slug,state_code'
        });

      if (error) {
        console.error(`  ❌ Erro ao inserir ${name}:`, error.message);
      } else {
        totalCities++;
        totalNeighborhoods += neighborhoods.length;
        console.log(`  ✅ ${name} cadastrada com ${neighborhoods.length} bairros`);
      }
    }

    console.log('');
  }

  console.log('✨ População concluída!');
  console.log(`📊 Total de cidades: ${totalCities}`);
  console.log(`🏘️  Total de bairros: ${totalNeighborhoods}`);
  console.log(`🌎 Cobertura completa: ${locationsData.length} estados brasileiros`);
}

populateLocations()
  .then(() => {
    console.log('\n🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro ao executar script:', error);
    process.exit(1);
  });
