/**
 * data.js
 * Dados do protótipo WebGIS.
 *
 * HOSPITAIS: lista baseada na rede de hospitais de Belo Horizonte/Região
 * Metropolitana citada no documento "Rede de Hospitais de Belo Horizonte
 * para cada plano da GEAP" (arquivo fornecido pelo usuário), com bairro e
 * coordenadas aproximadas verificadas via fontes públicas (sites oficiais
 * dos hospitais, CNES/DataSUS, guias de saúde). Coordenadas de rua exata
 * quando disponíveis; nos demais casos, aproximação ao nível de bairro —
 * adequado a um protótipo acadêmico, não a uso de navegação real.
 *
 * FARMACIAS / LABORATORIOS: dados de demonstração distribuídos pelas
 * regiões cobertas pelos hospitais acima, para que a busca produza
 * resultados relevantes qualquer que seja o hospital escolhido.
 */

// ---------------------------------------------------------------------
// HOSPITAIS (ponto de referência inicial da busca)
// Campo "regiao": agrupamento administrativo aproximado de BH/RMBH,
// usado no filtro em cascata Região -> Bairro -> Hospital.
// Campo "fonte": indica se o hospital consta na lista da GEAP (PDF) ou é
// um hospital de referência adicional (rede pública/ensino) incluído
// para dar cobertura geográfica ao protótipo.
// ---------------------------------------------------------------------
const HOSPITAIS = [
  {
    id: "hc-ufmg",
    nome: "Hospital das Clínicas – UFMG",
    bairro: "Santa Efigênia",
    regiao: "Centro-Sul",
    lat: -19.9245,
    lng: -43.9352,
    fonte: "referência (rede de ensino)",
  },
  {
    id: "joao-xxiii",
    nome: "Hospital João XXIII",
    bairro: "Barro Preto",
    regiao: "Centro-Sul",
    lat: -19.9280,
    lng: -43.9440,
    fonte: "referência (rede pública)",
  },
  {
    id: "felicio-rocho",
    nome: "Hospital Felício Rocho",
    bairro: "Santo Agostinho",
    regiao: "Centro-Sul",
    lat: -19.9312,
    lng: -43.9462,
    fonte: "referência",
  },
  {
    id: "santa-casa",
    nome: "Santa Casa BH",
    bairro: "Santa Efigênia",
    regiao: "Centro-Sul",
    lat: -19.9198,
    lng: -43.9277,
    fonte: "referência",
  },
  {
    id: "semper",
    nome: "Hospital Semper",
    bairro: "Santa Efigênia (Centro)",
    regiao: "Centro-Sul",
    lat: -19.9205,
    lng: -43.9358,
    fonte: "GEAP (documento fornecido)",
  },
  {
    id: "socor",
    nome: "Hospital Socor",
    bairro: "Barro Preto",
    regiao: "Centro-Sul",
    lat: -19.9295,
    lng: -43.9400,
    fonte: "GEAP (documento fornecido)",
  },
  {
    id: "lifecenter",
    nome: "Hospital Lifecenter",
    bairro: "Funcionários",
    regiao: "Centro-Sul",
    lat: -19.935069,
    lng: -43.924491,
    fonte: "GEAP (documento fornecido)",
  },
  {
    id: "orizonti",
    nome: "Instituto Orizonti",
    bairro: "Mangabeiras",
    regiao: "Centro-Sul",
    lat: -19.9430,
    lng: -43.9280,
    fonte: "GEAP (documento fornecido)",
  },
  {
    id: "madre-teresa",
    nome: "Hospital Madre Tereza",
    bairro: "Gutierrez",
    regiao: "Oeste",
    lat: -19.9430,
    lng: -43.9520,
    fonte: "GEAP (documento fornecido)",
  },
  {
    id: "odilon-behrens",
    nome: "Hospital Municipal Odilon Behrens",
    bairro: "São Cristóvão",
    regiao: "Noroeste",
    lat: -19.9071,
    lng: -43.9622,
    fonte: "referência (rede pública)",
  },
  {
    id: "andre-luiz",
    nome: "Hospital Espírita André Luiz (HEAL)",
    bairro: "Salgado Filho",
    regiao: "Noroeste",
    lat: -19.8930,
    lng: -43.9720,
    fonte: "GEAP (documento fornecido)",
  },
  {
    id: "hospital-bh",
    nome: "Hospital Belo Horizonte",
    bairro: "Cachoeirinha",
    regiao: "Nordeste",
    lat: -19.8990,
    lng: -43.9430,
    fonte: "GEAP (documento fornecido)",
  },
  {
    id: "santa-rita",
    nome: "Hospital Santa Rita",
    bairro: "Jardim Industrial (Contagem)",
    regiao: "Região Metropolitana",
    lat: -19.9310,
    lng: -44.0530,
    fonte: "GEAP (documento fornecido)",
  },
  {
    id: "biocor",
    nome: "Biocor Instituto",
    bairro: "Vila da Serra (Nova Lima)",
    regiao: "Região Metropolitana",
    lat: -19.9765,
    lng: -43.9235,
    fonte: "GEAP (documento fornecido)",
  },
];

// ---------------------------------------------------------------------
// FARMÁCIAS (pontos) — distribuídas pelas regiões dos hospitais acima
// ---------------------------------------------------------------------
const FARMACIAS = [
  { id: "f1", nome: "Drogaria Araújo – Santa Efigênia", lat: -19.9231, lng: -43.9330 },
  { id: "f2", nome: "Farmácia Popular do Brasil – Centro", lat: -19.9223, lng: -43.9378 },
  { id: "f3", nome: "Drogasil – Barro Preto", lat: -19.9296, lng: -43.9421 },
  { id: "f4", nome: "Pague Menos – Funcionários", lat: -19.9334, lng: -43.9339 },
  { id: "f5", nome: "Drogaria Araújo – Savassi", lat: -19.9366, lng: -43.9377 },
  { id: "f6", nome: "Farmácia São Paulo – Santo Agostinho", lat: -19.9327, lng: -43.9481 },
  { id: "f7", nome: "Drogasil – Gutierrez", lat: -19.9418, lng: -43.9505 },
  { id: "f8", nome: "Farmácia Nissei – Mangabeiras", lat: -19.9415, lng: -43.9295 },
  { id: "f9", nome: "Drogaria Araújo – Floresta", lat: -19.9169, lng: -43.9256 },
  { id: "f10", nome: "Farmácia Popular – São Cristóvão", lat: -19.9058, lng: -43.9605 },
  { id: "f11", nome: "Drogasil – Padre Eustáquio (próx. Salgado Filho)", lat: -19.8955, lng: -43.9695 },
  { id: "f12", nome: "Farmácia Bahamas – Cachoeirinha", lat: -19.8975, lng: -43.9415 },
  { id: "f13", nome: "Drogaria Araújo – Jardim Industrial (Contagem)", lat: -19.9295, lng: -44.0512 },
  { id: "f14", nome: "Farmácia Vale da Serra – Nova Lima", lat: -19.9748, lng: -43.9218 },
];

// ---------------------------------------------------------------------
// LABORATÓRIOS DE RADIOGRAFIA / DIAGNÓSTICO POR IMAGEM (pontos)
// ---------------------------------------------------------------------
const LABORATORIOS = [
  { id: "l1", nome: "Hermes Pardini – Unidade Santa Efigênia", lat: -19.9256, lng: -43.9318 },
  { id: "l2", nome: "CDI – Centro de Diagnósticos por Imagem", lat: -19.9268, lng: -43.9401 },
  { id: "l3", nome: "Alta Excelência Diagnóstica – Barro Preto", lat: -19.9302, lng: -43.9455 },
  { id: "l4", nome: "Lâmina Diagnósticos – Santo Agostinho", lat: -19.9339, lng: -43.9438 },
  { id: "l5", nome: "Rede Labs – Funcionários", lat: -19.9319, lng: -43.9358 },
  { id: "l6", nome: "Radiologia Gutierrez", lat: -19.9440, lng: -43.9540 },
  { id: "l7", nome: "Instituto de Imagem Mangabeiras", lat: -19.9447, lng: -43.9268 },
  { id: "l8", nome: "Hermes Pardini – Unidade Floresta", lat: -19.9182, lng: -43.9268 },
  { id: "l9", nome: "Radiologia São Cristóvão", lat: -19.9048, lng: -43.9638 },
  { id: "l10", nome: "Diagnósticos Salgado Filho", lat: -19.8912, lng: -43.9738 },
  { id: "l11", nome: "Hermes Pardini – Cachoeirinha", lat: -19.9002, lng: -43.9448 },
  { id: "l12", nome: "CDI – Unidade Contagem", lat: -19.9330, lng: -44.0548 },
];

// ---------------------------------------------------------------------
// GERAÇÃO DINÂMICA DE POLÍGONOS E LINHA (ver js/app.js)
// ---------------------------------------------------------------------
// Diferente de uma versão anterior deste protótipo, o polígono de bairro,
// o polígono de bairro vizinho e a linha de referência NÃO são mais fixos
// em um único local do mapa. Eles são recalculados em tempo de execução,
// a partir das coordenadas do hospital selecionado (ver função
// gerarCamadasGeograficas() em app.js), garantindo que sempre representem
// a região em torno do hospital escolhido — e não um bairro fixo que só
// fazia sentido para um hospital específico.
