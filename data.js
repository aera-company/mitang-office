export const departments = [
 {
  "id": "brand",
  "number": "01",
  "short": "Demanda",
  "title": "Criar razões para\nabrir uma conversa.",
  "floor": "Pavimento superior · Núcleo de demanda",
  "agent": "MAYA",
  "role": "Estratégia de demanda",
  "description": "Transformar a expertise técnica da MITANG em presença e interesse nos segmentos que o Comercial precisa ativar.",
  "responsibilities": [
   "Campanhas por serviço e segmento",
   "LinkedIn, e-mail e conteúdo B2B",
   "Ações pós-evento e landing pages"
  ],
  "example": "Um sinal sobre uma campanha de survey orienta um conteúdo técnico e uma campanha dirigida às contas prioritárias.",
  "output": "Plano de ativação para Survey Positioning, com mensagem, canal e ativo prioritário.",
  "message": "O mercado precisa entender quando conversar com a MITANG.",
  "agentDescription": "Representa a capacidade de conectar contexto de mercado, mensagem e ativação.",
  "phase": "DEMANDA",
  "modelZone": "think"
 },
 {
  "id": "marketing",
  "number": "02",
  "short": "Comunicação comercial",
  "title": "A resposta certa.\nPara cada oportunidade.",
  "floor": "Pavimento superior · Estúdio comercial",
  "agent": "NOA",
  "role": "Comunicação e criação",
  "description": "Dar ao Comercial os argumentos e materiais que cada oportunidade pede, com clareza e consistência técnica.",
  "responsibilities": [
   "Apresentações, cases e one-pages",
   "Mensagens e materiais para reunião",
   "Conteúdo técnico, vídeo e landing pages"
  ],
  "example": "Para preparar uma reunião de survey, organizamos um case e uma one-page; a MITANG valida as informações técnicas.",
  "output": "Rascunho de one-page e roteiro de conversa para validação técnica.",
  "message": "A expertise técnica ganha uma linguagem comercial clara.",
  "agentDescription": "Representa a criação dos ativos necessários para abrir e avançar conversas.",
  "phase": "COMUNICAÇÃO",
  "modelZone": "create"
 },
 {
  "id": "growth",
  "number": "03",
  "short": "Prospecção",
  "title": "As contas certas.\nAs pessoas certas.",
  "floor": "Pavimento térreo · Inteligência de contas",
  "agent": "NINA",
  "role": "Prospecção e relacionamento",
  "description": "Mapear contas, encontrar decisores e desenvolver o relacionamento até existir contexto para uma reunião qualificada.",
  "responsibilities": [
   "ICP, listas e mapeamento de decisores",
   "Abordagens, cadências e follow-up",
   "Nutrição e reuniões qualificadas"
  ],
  "example": "Na Operadora A, conta fictícia, Engenharia de Projetos funciona como ponte para uma conversa com a Gerência de Operações.",
  "output": "Mapa da conta, hipótese de entrada e próxima abordagem para revisão.",
  "message": "Do sinal à conta. Da conta à conversa qualificada.",
  "agentDescription": "Representa a pesquisa, a abordagem e a continuidade da relação comercial.",
  "phase": "PROSPECÇÃO",
  "modelZone": "grow"
 },
 {
  "id": "technology",
  "number": "04",
  "short": "MITANG Radar",
  "title": "A operação\nganha memória.",
  "floor": "Pavimento térreo · Inteligência e operação",
  "agent": "LEO",
  "role": "Inteligência e sistemas",
  "description": "Organizar contas, sinais, contatos, pipeline e próximas ações. O Radar é a infraestrutura do serviço de Marketing & Lead Generation.",
  "responsibilities": [
   "CRM, pipeline e classificação",
   "Métricas, dashboards e automações",
   "Histórico e preparação com AERA AI Brief"
  ],
  "example": "Cada interação atualiza o contexto da conta e deixa explícita a próxima ação, sem recomeçar a pesquisa toda semana.",
  "output": "Conta organizada com sinal, serviço relacionado, histórico e próxima ação.",
  "message": "O conhecimento não recomeça toda semana.",
  "agentDescription": "Representa a organização dos dados e o apoio à preparação. A decisão comercial continua humana.",
  "phase": "RADAR",
  "modelZone": "build"
 },
 {
  "id": "direction",
  "number": "05",
  "short": "Direção da operação",
  "title": "Uma operação.\nOportunidades reais.",
  "floor": "Átrio central · AERA + Comercial MITANG",
  "agent": "ARI",
  "role": "Coordenação da operação",
  "description": "Conectar inteligência, estratégia, prospecção, criação e tecnologia às prioridades comerciais da MITANG.",
  "responsibilities": [
   "Prioridades mensais e pipeline semanal",
   "Primeiro ciclo: estruturar, ativar e aprender",
   "Reunião qualificada → Comercial MITANG"
  ],
  "example": "A AERA pesquisa, cria, ativa, acompanha e mede. A MITANG valida tecnicamente, constrói a proposta, negocia e fecha.",
  "output": "Plano do ciclo e preparação da reunião com responsáveis e próximos passos.",
  "message": "A AERA abre e desenvolve. A MITANG conduz e fecha.",
  "agentDescription": "Representa a coordenação do serviço recorrente. As prioridades mensais definem as entregas.",
  "phase": "DIREÇÃO",
  "modelZone": "control"
 }
];

export function parseCommand(raw) {
 const s=raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
 if(/^[1-5]$/.test(s))return {type:'zone',id:departments[Number(s)-1].id};
 if(/visao geral|overview|voltar|escritorio|inicio/.test(s))return {type:'overview'};
 if(/apresenta|iniciar|futuro|experience/.test(s))return {type:'presentation'};
 const keys=[['brand',/demanda|campanha|maya/],['marketing',/comunic|criacao|noa/],['growth',/prospec|conta|decisor|nina/],['technology',/radar|sistema|crm|leo/],['direction',/direcao|operac|comercial|ari/]];
 const found=keys.find(([,re])=>re.test(s));return found?{type:'zone',id:found[0]}:null;
}
