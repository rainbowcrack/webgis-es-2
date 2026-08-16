/**
 * app.js
 * Protótipo funcional de WebGIS para localização de farmácias e
 * laboratórios de radiografia próximos a um hospital em Belo Horizonte.
 *
 * Bibliotecas:
 *  - Leaflet.js  -> mapa, camadas, marcadores
 *  - Turf.js     -> consultas espaciais (booleanPointInPolygon "está contido",
 *                    booleanContains "contém", booleanIntersects "intercepta",
 *                    circle "buffer" e distance "ordenação por proximidade")
 *
 * IMPORTANTE (correção de versão anterior): o polígono de bairro e a linha
 * de referência costumavam ser fixos em um único ponto do mapa (região de
 * Santa Efigênia), o que fazia sentido apenas para o Hospital das Clínicas.
 * Ao trocar de hospital, esse polígono ficava "sem relação" com o ponto
 * selecionado. Agora essas camadas são recalculadas dinamicamente a cada
 * consulta, a partir das coordenadas do hospital escolhido — ver a função
 * gerarCamadasGeograficas() abaixo.
 */

// ------------------------------------------------------------------
// Elementos da interface
// ------------------------------------------------------------------
const el = {
  hospitalSearch: document.getElementById("hospitalSearch"),
  hospitalSearchResults: document.getElementById("hospitalSearchResults"),
  regiaoSelect: document.getElementById("regiaoSelect"),
  bairroSelect: document.getElementById("bairroSelect"),
  hospitalSelect: document.getElementById("hospitalSelect"),
  fFarmacia: document.getElementById("fFarmacia"),
  fLaboratorio: document.getElementById("fLaboratorio"),
  raioSelect: document.getElementById("raioSelect"),
  ordenarSelect: document.getElementById("ordenarSelect"),
  resultList: document.getElementById("resultList"),
  resultCount: document.getElementById("resultCount"),
  queryInfo: document.getElementById("queryInfo"),
  statusChip: document.getElementById("statusChip"),
  hospitalHint: document.getElementById("hospitalHint"),
};

// ------------------------------------------------------------------
// Mapa base
// ------------------------------------------------------------------
const map = L.map("map", { zoomControl: true }).setView([-19.9227, -43.9400], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Camadas dinâmicas (recriadas a cada consulta)
const layers = {
  hospital: L.layerGroup().addTo(map),
  buffer: L.layerGroup().addTo(map),
  bairro: L.layerGroup().addTo(map),
  bairroVizinho: L.layerGroup().addTo(map),
  via: L.layerGroup().addTo(map),
  farmacias: L.layerGroup().addTo(map),
  laboratorios: L.layerGroup().addTo(map),
};

// ------------------------------------------------------------------
// Ícones (círculos coloridos via divIcon, combinando com a legenda)
// ------------------------------------------------------------------
function pinIcon(colorClass) {
  return L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:16px;height:16px;border-radius:50%;
      border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.2);
      background:${colorClass};"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
const ICON_HOSPITAL = pinIcon("#ff7a5c");
const ICON_FARMACIA = pinIcon("#ffb18f");
const ICON_LAB = pinIcon("#1aa695");

// ------------------------------------------------------------------
// Utilitários
// ------------------------------------------------------------------
function fmtDist(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
}

/** Gera um polígono retangular (Turf) centrado em [lng,lat] com a metade
 *  da largura informada em km — usado para simular, de forma leve e sem
 *  depender de uma base cartográfica externa, o "bairro" de um hospital
 *  e um "bairro vizinho" para as consultas espaciais contém/intercepta. */
function poligonoRetangular(lng, lat, meiaLarguraKm, propriedades) {
  const dLat = meiaLarguraKm / 111;
  const dLng = meiaLarguraKm / (111 * Math.cos((lat * Math.PI) / 180));
  const coords = [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat - dLat],
    [lng + dLng, lat + dLat],
    [lng - dLng, lat + dLat],
    [lng - dLng, lat - dLat],
  ];
  return turf.polygon([coords], propriedades || {});
}

/** Gera, para o hospital informado, o polígono do seu próprio bairro
 *  (sempre contém o ponto do hospital) e o polígono de um bairro vizinho,
 *  deslocado ~1,3 km a leste — distância suficiente para que só passe a
 *  "interceptar" o raio de busca quando este for grande (1000 m/1500 m),
 *  tornando a consulta "intercepta" sensível ao raio escolhido. */
function gerarCamadasGeograficas(hospital) {
  const bairroPoly = poligonoRetangular(hospital.lng, hospital.lat, 0.55, {
    nome: `Bairro ${hospital.bairro} (limite aproximado)`,
  });

  const dLngVizinho = 1.3 / (111 * Math.cos((hospital.lat * Math.PI) / 180));
  const bairroVizinhoPoly = poligonoRetangular(
    hospital.lng + dLngVizinho,
    hospital.lat,
    0.55,
    { nome: "Bairro vizinho (limite aproximado)" }
  );

  return { bairroPoly, bairroVizinhoPoly };
}

function limparCamadasResultado() {
  Object.values(layers).forEach((l) => l.clearLayers());
}

// ------------------------------------------------------------------
// Popular filtros em cascata: Região -> Bairro -> Hospital
// ------------------------------------------------------------------
function popularRegioes() {
  const regioes = [...new Set(HOSPITAIS.map((h) => h.regiao))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  el.regiaoSelect.innerHTML = `<option value="">Todas</option>`;
  regioes.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    el.regiaoSelect.appendChild(opt);
  });
}

function popularBairros() {
  const regiaoAtual = el.regiaoSelect.value;
  const hospitaisFiltrados = regiaoAtual
    ? HOSPITAIS.filter((h) => h.regiao === regiaoAtual)
    : HOSPITAIS;
  const bairros = [...new Set(hospitaisFiltrados.map((h) => h.bairro))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  el.bairroSelect.innerHTML = `<option value="">Todos</option>`;
  bairros.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    el.bairroSelect.appendChild(opt);
  });
}

function popularHospitais() {
  const regiaoAtual = el.regiaoSelect.value;
  const bairroAtual = el.bairroSelect.value;
  const filtrados = HOSPITAIS.filter(
    (h) => (!regiaoAtual || h.regiao === regiaoAtual) && (!bairroAtual || h.bairro === bairroAtual)
  );

  const valorAtual = el.hospitalSelect.value;
  el.hospitalSelect.innerHTML = `<option value="" disabled ${!valorAtual ? "selected" : ""}>Escolha um hospital…</option>`;
  filtrados.forEach((h) => {
    const opt = document.createElement("option");
    opt.value = h.id;
    opt.textContent = `${h.nome} — ${h.bairro}`;
    el.hospitalSelect.appendChild(opt);
  });

  // Mantém a seleção anterior se ela ainda estiver na lista filtrada;
  // caso contrário, seleciona o primeiro hospital disponível.
  if (filtrados.some((h) => h.id === valorAtual)) {
    el.hospitalSelect.value = valorAtual;
  } else if (filtrados.length > 0) {
    el.hospitalSelect.value = filtrados[0].id;
  }
}

function selecionarHospitalPorId(id) {
  const hospital = HOSPITAIS.find((h) => h.id === id);
  if (!hospital) return;
  // sincroniza os seletores de região/bairro com o hospital escolhido
  el.regiaoSelect.value = hospital.regiao;
  popularBairros();
  el.bairroSelect.value = hospital.bairro;
  popularHospitais();
  el.hospitalSelect.value = hospital.id;
  el.hospitalSearch.value = "";
  el.hospitalSearchResults.classList.add("hidden");
  executarConsulta();
}

// ------------------------------------------------------------------
// Busca de hospital por nome (opção alternativa às listas em cascata)
// ------------------------------------------------------------------
function renderizarResultadosBusca(termo) {
  const termoNorm = termo.trim().toLocaleLowerCase("pt-BR");
  if (!termoNorm) {
    el.hospitalSearchResults.classList.add("hidden");
    el.hospitalSearchResults.innerHTML = "";
    return;
  }

  const encontrados = HOSPITAIS.filter((h) =>
    h.nome.toLocaleLowerCase("pt-BR").includes(termoNorm)
  ).slice(0, 8);

  el.hospitalSearchResults.innerHTML = "";
  if (encontrados.length === 0) {
    el.hospitalSearchResults.innerHTML = `<li class="no-match">Nenhum hospital encontrado para "${termo}".</li>`;
  } else {
    encontrados.forEach((h) => {
      const li = document.createElement("li");
      li.innerHTML = `${h.nome}<span class="sr-bairro">${h.bairro} · ${h.regiao}</span>`;
      li.addEventListener("click", () => selecionarHospitalPorId(h.id));
      el.hospitalSearchResults.appendChild(li);
    });
  }
  el.hospitalSearchResults.classList.remove("hidden");
}

el.hospitalSearch.addEventListener("input", (e) => renderizarResultadosBusca(e.target.value));
el.hospitalSearch.addEventListener("focus", (e) => {
  if (e.target.value.trim()) renderizarResultadosBusca(e.target.value);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".panel-block")) return;
  if (!e.target.closest("#hospitalSearch") && !e.target.closest("#hospitalSearchResults")) {
    el.hospitalSearchResults.classList.add("hidden");
  }
});

// ------------------------------------------------------------------
// Núcleo: executa filtros + consultas espaciais + ordenação
// ------------------------------------------------------------------
function executarConsulta() {
  const hospitalId = el.hospitalSelect.value;
  if (!hospitalId) return;

  const hospital = HOSPITAIS.find((h) => h.id === hospitalId);
  const raioM = Number(el.raioSelect.value);
  const usarFarmacia = el.fFarmacia.checked;
  const usarLab = el.fLaboratorio.checked;
  const ordenacao = el.ordenarSelect.value;

  limparCamadasResultado();

  // ---- ponto do hospital (Turf) ----
  const hospitalPt = turf.point([hospital.lng, hospital.lat]);

  // ---- marcador do hospital ----
  L.marker([hospital.lat, hospital.lng], { icon: ICON_HOSPITAL })
    .bindPopup(`<strong>${hospital.nome}</strong><br>Hospital de referência<br>${hospital.bairro} · ${hospital.regiao}`)
    .addTo(layers.hospital);

  // ---- buffer = polígono do raio de busca (turf.circle) ----
  const bufferPoly = turf.circle(hospitalPt, raioM / 1000, { steps: 64, units: "kilometers" });
  L.geoJSON(bufferPoly, {
    style: { color: "#1aa695", weight: 1.5, fillColor: "#1aa695", fillOpacity: 0.12 },
  }).addTo(layers.buffer);

  // ---- polígonos de bairro (do hospital e vizinho), recalculados para ESTE hospital ----
  const { bairroPoly, bairroVizinhoPoly } = gerarCamadasGeograficas(hospital);
  L.geoJSON(bairroPoly, {
    style: { color: "#ff7a5c", weight: 1.5, dashArray: "6 5", fillColor: "#ff7a5c", fillOpacity: 0.08 },
  })
    .bindPopup(`<strong>${bairroPoly.properties.nome}</strong><br>Contém o hospital selecionado.`)
    .addTo(layers.bairro);

  L.geoJSON(bairroVizinhoPoly, {
    style: { color: "#0f4f49", weight: 1.5, dashArray: "6 5", fillColor: "#0f4f49", fillOpacity: 0.06 },
  })
    .bindPopup(`<strong>${bairroVizinhoPoly.properties.nome}</strong><br>Usado para testar a relação "intercepta" com o raio de busca.`)
    .addTo(layers.bairroVizinho);

  // ---- monta lista-base de estabelecimentos conforme filtro de categoria ----
  let candidatos = [];
  if (usarFarmacia) candidatos = candidatos.concat(FARMACIAS.map((f) => ({ ...f, tipo: "farmacia" })));
  if (usarLab) candidatos = candidatos.concat(LABORATORIOS.map((l) => ({ ...l, tipo: "laboratorio" })));

  // ---- consulta espacial "está contido": ponto dentro do buffer ----
  const dentroDoRaio = candidatos.filter((c) => {
    const pt = turf.point([c.lng, c.lat]);
    return turf.booleanPointInPolygon(pt, bufferPoly);
  });

  // ---- distância (para ordenação por proximidade e para a linha até o mais próximo) ----
  dentroDoRaio.forEach((c) => {
    const pt = turf.point([c.lng, c.lat]);
    c.distanciaM = turf.distance(hospitalPt, pt, { units: "kilometers" }) * 1000;
  });

  const maisProximo =
    dentroDoRaio.length > 0
      ? dentroDoRaio.reduce((a, b) => (a.distanciaM < b.distanciaM ? a : b))
      : null;

  // ---- linha (entidade geográfica linear): hospital -> resultado mais próximo ----
  if (maisProximo) {
    const linha = turf.lineString(
      [
        [hospital.lng, hospital.lat],
        [maisProximo.lng, maisProximo.lat],
      ],
      { nome: `Trajeto até ${maisProximo.nome}` }
    );
    L.geoJSON(linha, {
      style: { color: "#0f4f49", weight: 2.5, dashArray: "1 6", lineCap: "round" },
    })
      .bindPopup(`<strong>Mais próximo:</strong> ${maisProximo.nome}<br>${fmtDist(maisProximo.distanciaM)}`)
      .addTo(layers.via);
  }

  // ---- ordenação ----
  if (ordenacao === "alfabetica") {
    dentroDoRaio.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  } else {
    dentroDoRaio.sort((a, b) => a.distanciaM - b.distanciaM);
  }

  // ---- desenha marcadores dos resultados ----
  dentroDoRaio.forEach((c) => {
    const icon = c.tipo === "farmacia" ? ICON_FARMACIA : ICON_LAB;
    const grupo = c.tipo === "farmacia" ? layers.farmacias : layers.laboratorios;
    L.marker([c.lat, c.lng], { icon })
      .bindPopup(`<strong>${c.nome}</strong><br>${c.tipo === "farmacia" ? "Farmácia" : "Laboratório de radiografia"}<br>${fmtDist(c.distanciaM)} do hospital`)
      .addTo(grupo);
  });

  // ---- relações espaciais adicionais: "contém" e "intercepta", já ligadas a ESTE hospital ----
  const bairroContemHospital = turf.booleanContains(bairroPoly, hospitalPt);
  const bufferInterceptaVizinho = turf.booleanIntersects(bufferPoly, bairroVizinhoPoly);

  // ---- painel de consulta espacial ----
  el.queryInfo.innerHTML = `
    <li><strong>${dentroDoRaio.length}</strong> estabelecimento(s) <em>estão contidos</em> no buffer de ${fmtDist(raioM)} ao redor de ${hospital.nome}.</li>
    <li>O polígono do bairro <strong>${bairroPoly.properties.nome}</strong> <strong>${bairroContemHospital ? "contém" : "não contém"}</strong> o ponto do hospital.</li>
    <li>Com raio de ${fmtDist(raioM)}, o buffer de busca <strong>${bufferInterceptaVizinho ? "intercepta" : "não intercepta"}</strong> o bairro vizinho. ${bufferInterceptaVizinho ? "" : "Aumente o raio para ver essa relação mudar."}</li>
  `;

  // ---- lista lateral ----
  el.resultCount.textContent = dentroDoRaio.length;
  el.resultList.innerHTML = "";

  if (dentroDoRaio.length === 0) {
    el.resultList.innerHTML = `<li class="empty-state">Nenhum estabelecimento encontrado neste raio. Tente aumentar a distância ou ajustar os filtros.</li>`;
  } else {
    dentroDoRaio.forEach((c) => {
      const li = document.createElement("li");
      li.className = "result-card";
      li.innerHTML = `
        <div class="rc-top">
          <span class="rc-name">${c.nome}</span>
          <span class="rc-dist">${fmtDist(c.distanciaM)}</span>
        </div>
        <span class="rc-tag ${c.tipo}">${c.tipo === "farmacia" ? "Farmácia" : "Laboratório"}</span>
      `;
      li.addEventListener("click", () => {
        map.flyTo([c.lat, c.lng], 16, { duration: 0.6 });
        const grupo = c.tipo === "farmacia" ? layers.farmacias : layers.laboratorios;
        grupo.eachLayer((mk) => {
          if (mk.getLatLng().lat === c.lat && mk.getLatLng().lng === c.lng) mk.openPopup();
        });
      });
      el.resultList.appendChild(li);
    });
  }

  // ---- status e enquadramento do mapa ----
  el.statusChip.textContent = `${hospital.nome} · raio ${fmtDist(raioM)} · ${dentroDoRaio.length} resultado(s)`;
  el.hospitalHint.textContent = `Origem: ${hospital.nome} (${hospital.bairro}, ${hospital.regiao}).`;

  const bounds = L.geoJSON(bairroVizinhoPoly).getBounds().extend(L.geoJSON(bufferPoly).getBounds());
  map.fitBounds(bounds, { padding: [40, 40] });
}

// ------------------------------------------------------------------
// Eventos
// ------------------------------------------------------------------
el.regiaoSelect.addEventListener("change", () => {
  popularBairros();
  popularHospitais();
  executarConsulta();
});
el.bairroSelect.addEventListener("change", () => {
  popularHospitais();
  executarConsulta();
});
[el.hospitalSelect, el.fFarmacia, el.fLaboratorio, el.raioSelect, el.ordenarSelect].forEach((input) => {
  input.addEventListener("change", executarConsulta);
});

// ------------------------------------------------------------------
// Inicialização
// ------------------------------------------------------------------
popularRegioes();
popularBairros();
popularHospitais();
el.hospitalSelect.value = HOSPITAIS[0].id;
executarConsulta();
