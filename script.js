// --- LÓGICA DO JOGO (JAVASCRIPT) ---

let sustentabilidade = 50;
let producao = 20;
let acaoSelecionada = null;

// Posição inicial do boneco (Linha 2, Coluna 1 do grid)
let playerY = 2;
let playerX = 1;

// Representação do mapa (4x4): G = Grama, A = Árvore, L = Lavoura, P = Pasto, D = Degradado
const mapa = [
    ['A', 'A', 'G', 'G'],
    ['G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G']
];

const mundoElemento = document.getElementById('mundo');
const logElemento = document.getElementById('log-mensagem');

// Inicializar e renderizar o tabuleiro junto com o boneco
function renderizarMapa() {
    mundoElemento.innerHTML = '';
    
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const bloco = document.createElement('div');
            bloco.classList.add('bloco');
            
            // Definir o plano de fundo do bloco
            if (mapa[r][c] === 'G') bloco.classList.add('grama');
            if (mapa[r][c] === 'A') { bloco.classList.add('arvore'); bloco.innerText = '🌳'; }
            if (mapa[r][c] === 'L') { bloco.classList.add('lavoura'); bloco.innerText = '🌾'; }
            if (mapa[r][c] === 'P') { bloco.classList.add('pastagem'); bloco.innerText = '🐄'; }
            if (mapa[r][c] === 'D') { bloco.classList.add('degradado'); bloco.innerText = '🪨'; }

            // Se a coordenada atual for a mesma do jogador, insere o boneco nela
            if (r === playerY && c === playerX) {
                const boneco = document.createElement('span');
                boneco.classList.add('boneco');
                boneco.innerText = '🧑‍🌾';
                bloco.appendChild(boneco);
            }

            // O clique agora age diretamente onde o boneco está posicionado!
            bloco.onclick = () => aplicarAcaoNoBlocoAtual();
            
            mundoElemento.appendChild(bloco);
        }
    }
    atualizarInterface();
}

// Monitoramento dos movimentos pelas teclas (WASD ou Setas)
window.addEventListener('keydown', function(event) {
    const tecla = event.key.toLowerCase();
    
    // Evita mover se o jogo já acabou (botões desativados)
    if (sustentabilidade <= 15 || (producao >= 80 && sustentabilidade >= 70)) return;

    if (tecla === 'a' || tecla === 'arrowleft') {
        if (playerX > 0) playerX--; // Move para a Esquerda
    }
    else if (tecla === 'd' || tecla === 'arrowright') {
        if (playerX < 3) playerX++; // Move para a Direita
    }
    else if (tecla === 'w' || tecla === 'arrowup') {
        if (playerY > 0) playerY--; // Move para Cima
    }
    else if (tecla === 's' || tecla === 'arrowdown') {
        if (playerY < 3) playerY++; // Move para Baixo
    }

    renderizarMapa(); // Atualiza a posição do boneco na tela
});

// Selecionar ferramenta da Hotbar
function selecionarAcao(acao) {
    acaoSelecionada = acao;
    enviarMensagem(`[Ferramenta]: ${acao.replace('-', ' ').toUpperCase()} ativada. Clique em qualquer lugar do mapa para aplicá-la na posição do seu boneco!`);
}

// Processa as modificações ambientais com base em onde o boneco está pisando
function aplicarAcaoNoBlocoAtual() {
    if (!acaoSelecionada) {
        enviarMensagem("[Aviso]: Selecione uma ferramenta na barra lateral primeiro!");
        return;
    }

    const blocoAtual = mapa[playerY][playerX];

    if (acaoSelecionada === 'plantar-arvore') {
        if (blocoAtual === 'G') {
            mapa[playerY][playerX] = 'A';
            sustentabilidade += 10;
            enviarMensagem("[Sustentável]: Você plantou uma Árvore Nativa no seu bloco! Absorção de CO2 ativada.");
        } else {
            enviarMensagem("[Aviso]: O boneco deve estar em cima de um bloco de grama livre.");
        }
    } 
    
    else if (acaoSelecionada === 'plantar-lavoura') {
        if (blocoAtual === 'G' || blocoAtual === 'A') {
            if (blocoAtual === 'A') sustentabilidade -= 15; // Penalidade por remover árvore nativa
            mapa[playerY][playerX] = 'L';
            producao += 15;
            sustentabilidade -= 5;
            enviarMensagem("[Produção]: Plantio Direto feito sob os pés do agricultor! Solo protegido.");
        } else {
            enviarMensagem("[Aviso]: Limpe o bloco ou vá até uma área de grama livre.");
        }
    } 
    
    else if (acaoSelecionada === 'manejo-pastagem') {
        if (blocoAtual === 'G') {
            mapa[playerY][playerX] = 'P';
            producao += 10;
            sustentabilidade += 5;
            enviarMensagem("[Manejo]: Pasto Rotacionado implementado onde você está pisando!");
        } else {
            enviarMensagem("[Aviso]: Movimente-se até uma grama livre para criar pasto.");
        }
    } 
    
    else if (acaoSelecionada === 'Desmatar') {
        if (blocoAtual === 'A') {
            mapa[playerY][playerX] = 'G';
            sustentabilidade -= 25;
            enviarMensagem("[Alerta Ecológico]: Você removeu a cobertura vegetal deste bloco.");
        } else {
            enviarMensagem("[Aviso]: Só é possível desmatar blocos com árvores 🌳.");
        }
    }

    provocarDesgasteAleatorio();
    acaoSelecionada = null; // Reseta a ferramenta usada
    renderizarMapa();
    checarFimDeJogo();
}

// Recuperação de áreas danificadas por erosão
function recuperarSolo() {
    let recuperou = false;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (mapa[r][c] === 'D') {
                mapa[r][c] = 'G';
                recuperou = true;
            }
        }
    }
    if (recuperou) {
        sustentabilidade += 15;
        enviarMensagem("[Recuperação]: Recuperação orgânica do solo ativada nas áreas inférteis!");
        renderizarMapa();
    } else {
        enviarMensagem("[Info]: Não há blocos inféreis/degradados (🪨) para restaurar.");
    }
}

// Desgaste natural do solo se a produção estiver muito agressiva
function provocarDesgasteAleatorio() {
    if (producao > 60 && Math.random() > 0.5) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (mapa[r][c] === 'L' && !(r === playerY && c === playerX)) { 
                    mapa[r][c] = 'D'; // Vira bloco degradado
                    sustentabilidade -= 10;
                    producao -= 5;
                    enviarMensagem("[Erosão!]: O uso intensivo esgotou os nutrientes de uma lavoura distante! Use 'Recuperar Solo'.");
                    return;
                }
            }
        }
    }
}

function atualizarInterface() {
    sustentabilidade = Math.max(0, Math.min(100, sustentabilidade));
    producao = Math.max(0, Math.min(100, producao));

    document.getElementById('txt-sustentabilidade').innerText = sustentabilidade + '%';
    document.getElementById('txt-producao').innerText = producao + '%';

    document.getElementById('sustentabilidade-bar').style.width = sustentabilidade + '%';
    document.getElementById('producao-bar').style.width = producao + '%';
}

function enviarMensagem(msg) {
    logElemento.innerText = msg;
}

function checarFimDeJogo() {
    if (sustentabilidade <= 15) {
        enviarMensagem("[FIM DE JOGO]: A degradação ambiental foi severa demais. Lembre-se: O Agro forte precisa do Meio Ambiente equilibrado!");
        bloquearJogo();
    } else if (producao >= 80 && sustentabilidade >= 70) {
        enviarMensagem("[VITÓRIA!]: Parabéns! Você atingiu metas altas de produção garantindo a sustentabilidade da terra!");
        bloquearJogo();
    }
}

function bloquearJogo() {
    const botoes = document.querySelectorAll('.btn-action');
    botoes.forEach(b => b.disabled = true);
}

// Início do Game
renderizarMapa();
