# WebGIS Saúde BH

Protótipo funcional de **WebGIS para apoio à localização de serviços de saúde
próximos a hospitais em Belo Horizonte**, com foco em **farmácias** e
**laboratórios de radiografia**.

## Como executar

Não é necessário instalar nada nem configurar chave de API. Basta abrir o
arquivo `index.html` em um navegador com acesso à internet (os mapas e
bibliotecas são carregados via CDN público: Leaflet + OpenStreetMap + Turf.js).

Opcionalmente, para evitar restrições de alguns navegadores ao abrir arquivos
locais, você pode servir a pasta com um servidor simples:

```bash
cd webgis-saude-bh
python3 -m http.server 8080
# depois acesse http://localhost:8080
```

## Estrutura do projeto

```
webgis-saude-bh/
├── index.html                          # página principal (mapa + painel)
├── css/
│   └── style.css                       # identidade visual "verde-água"
├── js/
│   ├── data.js                         # hospitais, farmácias, laboratórios,
│   │                                    # polígono de bairro e via de demonstração
│   └── app.js                          # lógica: filtros, buffer, consultas
│                                        # espaciais, ordenação, mapa
└── docs/
    ├── especificacao_casos_uso.md      # requisitos + diagrama UML + casos de uso (UC00–UC04)
    ├── diagrama_casos_uso.svg          # Diagrama de Casos de Uso UML (vetorial)
    └── diagrama_casos_uso.png          # mesmo diagrama, em imagem (alta resolução)
```

## O que o protótipo demonstra

- **Seleção do hospital de duas formas:**
  - Filtros em cascata **Região → Bairro → Hospital**; ou
  - **Busca pelo nome** do hospital, com resultados em tempo real.
- **Pontos:** hospitais, farmácias e laboratórios de radiografia.
- **Polígono (buffer):** raio de busca configurável (200/500/1000/1500 m)
  gerado dinamicamente a partir do hospital selecionado.
- **Polígono do bairro do hospital** e **polígono de um bairro vizinho**:
  gerados dinamicamente ao redor do hospital escolhido (não são mais fixos
  em um único ponto do mapa — corrigido a partir do feedback de que, ao
  trocar de hospital, o polígono antigo "não acompanhava" a seleção).
- **Linha:** trajeto do hospital até o resultado mais próximo, também
  recalculado a cada consulta.
- **Consultas espaciais (Turf.js):**
  - *Está contido* — `turf.booleanPointInPolygon` define quais
    farmácias/laboratórios caem dentro do raio de busca.
  - *Contém* — `turf.booleanContains` verifica se o polígono do bairro do
    hospital selecionado contém o ponto desse hospital.
  - *Intercepta* — `turf.booleanIntersects` verifica se o buffer de busca
    cruza o polígono do bairro vizinho — como esse bairro fica a ~1,3 km do
    hospital, a relação muda de "não intercepta" para "intercepta" quando o
    usuário aumenta o raio para 1000 m ou 1500 m, tornando a consulta
    visível e didática.
- **Filtros:** por categoria (farmácia / laboratório).
- **Ordenação:** por proximidade (distância crescente, via `turf.distance`)
  ou ordem alfabética.
- **Listagem + mapa sincronizados:** clicar em um resultado centraliza o
  mapa no ponto correspondente e abre seu popup.

## Dados

**Hospitais:** a lista tem como referência o documento *"Rede de Hospitais
de Belo Horizonte para cada plano da GEAP"* fornecido pelo usuário. Os
hospitais citados no documento (ex.: Hospital Semper, Hospital Belo
Horizonte, Hospital Santa Rita – Contagem, Hospital Madre Tereza, Hospital
Lifecenter, Hospital Socor, Biocor – Nova Lima, Instituto Orizonti, Hospital
Espírita André Luiz) foram localizados a partir de fontes públicas (sites
oficiais dos hospitais, CNES/DataSUS, guias de saúde) — endereço e bairro
reais; a coordenada geográfica é exata quando encontrada em fonte
confiável, ou aproximada ao nível de bairro nos demais casos. Alguns
hospitais de referência adicionais da rede pública/ensino (Hospital das
Clínicas – UFMG, João XXIII, Felício Rocho, Santa Casa, Odilon Behrens)
foram incluídos para ampliar a cobertura geográfica do protótipo.

**Farmácias e laboratórios:** continuam sendo **dados de demonstração**
(nomes e coordenadas ilustrativos), distribuídos pelas regiões dos
hospitais acima para que a busca produza resultados relevantes qualquer
que seja o hospital escolhido. Para uma versão em produção, essas camadas
deveriam vir de uma base cadastral oficial (ex.: CNES/DataSUS, prefeitura,
ou uma API de estabelecimentos de saúde).

## Tecnologias

- HTML5 / CSS3 / JavaScript (vanilla)
- [Leaflet.js](https://leafletjs.com/) — mapa interativo
- [OpenStreetMap](https://www.openstreetmap.org/) — tiles cartográficos públicos
- [Turf.js](https://turfjs.org/) — análise e consultas geoespaciais

## Documentação de apoio

Veja `docs/especificacao_casos_uso.md` para o levantamento de requisitos
funcionais/não funcionais, o diagrama de casos de uso (descrição textual) e
as especificações textuais de UC01 a UC04, com rastreabilidade para os
requisitos originados das estórias de usuário do enunciado.
