const API_URL = "https://akabab.github.io/superhero-api/api/all.json";

const ATRIBUTOS = [
  { chave: "intelligence", nome: "Inteligência" },
  { chave: "strength", nome: "Força" },
  { chave: "speed", nome: "Velocidade" },
  { chave: "durability", nome: "Durabilidade" },
  { chave: "power", nome: "Poder" },
  { chave: "combat", nome: "Combate" },
];

const duelo = document.getElementById("duelo");
const resultado = document.getElementById("resultado");

function normalizarHeroi(h) {
  const stats = {};
  let total = 0;
  ATRIBUTOS.forEach(({ chave }) => {
    const valor = Number(h.powerstats?.[chave]) || 0;
    stats[chave] = valor;
    total += valor;
  });
  return {
    nome: h.name,
    editora: h.biography?.publisher || "Editora desconhecida",
    imagem: h.images?.md || h.images?.sm || "",
    stats,
    total,
  };
}

function sortearDois(lista) {
  const i = Math.floor(Math.random() * lista.length);
  let j = Math.floor(Math.random() * (lista.length - 1));
  if (j >= i) j++; 
}


function compararHerois(a, b) {
  if (a.total > b.total) return 0;
  if (b.total > a.total) return 1;
  return -1;
}

function criarCarta(heroi, outro, status) {
  const carta = document.createElement("article");
  carta.className = "carta " + status;

  const stats = ATRIBUTOS.map(({ chave, nome }) => {
    const valor = heroi.stats[chave];
    const melhor = valor > outro.stats[chave] ? "stat-melhor" : "";
    return `
      <li class="${melhor}">
        <div class="stat-linha"><span>${nome}</span><strong>${valor}</strong></div>
        <div class="barra"><span style="width:${valor}%"></span></div>
      </li>`;
  }).join("");

  carta.innerHTML = `
    ${status === "vencedora" ? '<span class="selo">Vencedor</span>' : ""}
    <img src="${heroi.imagem}" alt="${heroi.nome}">
    <h2></h2>
    <p class="editora"></p>
    <ul class="stats">${stats}</ul>
    <div class="total"><span>Total</span><span>${heroi.total}</span></div>`;

  // textContent evita injetar HTML vindo da API
  carta.querySelector("h2").textContent = heroi.nome;
  carta.querySelector(".editora").textContent = heroi.editora;
  return carta;
}

function mostrarBatalha(a, b) {
  const vencedor = compararHerois(a, b);

  const statusA = vencedor === 0 ? "vencedora" : vencedor === 1 ? "perdedora" : "";
  const statusB = vencedor === 1 ? "vencedora" : vencedor === 0 ? "perdedora" : "";

  const versus = document.createElement("div");
  versus.className = "versus";
  versus.textContent = "VS";

  duelo.replaceChildren(criarCarta(a, b, statusA), versus, criarCarta(b, a, statusB));

  if (vencedor === -1) {
    resultado.textContent = `Empate! ${a.nome} e ${b.nome} têm ${a.total} pontos.`;
    resultado.className = "resultado empate";
  } else {
    const [ganhador, perdedor] = vencedor === 0 ? [a, b] : [b, a];
    resultado.textContent = `${ganhador.nome} venceu ${perdedor.nome} por ${ganhador.total} a ${perdedor.total}!`;
    resultado.className = "resultado vitoria";
  }
}

async function iniciar() {
  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error("Falha ao buscar os dados: " + resposta.status);
    const dados = await resposta.json();

    
    const herois = dados.map(normalizarHeroi).filter((h) => h.total > 0);
    if (herois.length < 2) throw new Error("Heróis insuficientes para a batalha.");

    const [a, b] = sortearDois(herois);
    mostrarBatalha(a, b);
  } catch (erro) {
    console.error(erro);
    resultado.textContent = "Não foi possível carregar os heróis. Tente atualizar a página.";
    resultado.className = "resultado erro";
  }
}

iniciar();
