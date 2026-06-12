// ==========================================
// 1. SIMULAÇÃO DE BANCO DE DADOS (FUTURO BACKEND)
// ==========================================
const BancoDeDadosSemeando = {
    usuarios: [
        { id: 1, nome: "Dona Maria", contato: "(43) 99999-0001" },
        { id: 2, nome: "Carlos (Horta Comunitária)", contato: "(43) 99999-0002" }
    ],
    anuncios: [
        { id: 1, idUsuario: 1, produtor: "Dona Maria", oferece: "mudas de alface", precisa: "húmus de minhoca" },
        { id: 2, idUsuario: 2, produtor: "Carlos (Horta Comunitária)", oferece: "esterco bovino", precisa: "sementes de abóbora" }
    ],
    historicoTrocas: []
};

let anunciosCadastrados = BancoDeDadosSemeando.anuncios;

// ==========================================
// 2. FUNÇÃO DO NOVO MODAL DE ALERTA
// ==========================================
function mostrarAlerta(titulo, mensagem) {
    const modal = document.getElementById('modal-alerta');
    
    // Se a página não tiver o modal criado no HTML, usa o alerta padrão como segurança
    if (!modal) {
        alert(titulo + "\n\n" + mensagem);
        return;
    }

    const tituloEl = document.getElementById('modal-alerta-titulo');
    const mensagemEl = document.getElementById('modal-alerta-mensagem');
    const btnFechar = document.getElementById('btn-fechar-alerta');

    tituloEl.textContent = titulo;
    mensagemEl.textContent = mensagem;

    modal.classList.add('mostrar');

    btnFechar.onclick = () => {
        modal.classList.remove('mostrar');
    };
}

// ==========================================
// 3. REGISTRAR TROCA NO BANCO
// ==========================================
function registrarIntencaoDeTroca(idAnuncioAlvo) {
    const nomeInteressado = localStorage.getItem('nomeProdutor') || "Produtor(a) Visitante";
    const anuncioOriginal = anunciosCadastrados.find(anuncio => anuncio.id === idAnuncioAlvo);

    if (anuncioOriginal) {
        const novaProposta = {
            idTroca: BancoDeDadosSemeando.historicoTrocas.length + 1,
            idAnuncio: idAnuncioAlvo,
            de: nomeInteressado,
            para: anuncioOriginal.produtor,
            status: "Pendente",
            data: new Date().toLocaleDateString('pt-BR')
        };

        BancoDeDadosSemeando.historicoTrocas.push(novaProposta);

        console.clear();
        console.log("💾 NOVO REGISTRO NO BANCO DE DADOS SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);
        
        // AQUI: Usando o novo modal customizado em vez do alert()
        mostrarAlerta(
            '✅ Proposta Enviada!', 
            `Sua intenção de troca foi registrada.\n\nDe: ${nomeInteressado}\nPara: ${anuncioOriginal.produtor}\n\nAguarde o retorno no painel de notificações.`
        );
        
        atualizarMural();
        atualizarPainelDeNotificacoes();
    }
}

// ==========================================
// 4. FUNÇÕES PRINCIPAIS DO MURAL E NOTIFICAÇÕES
// ==========================================
function atualizarMural() {
    const containerMural = document.getElementById('mural');
    if (!containerMural) return;

    containerMural.innerHTML = "";
    const nomeLogado = localStorage.getItem('nomeProdutor') || "Produtor(a) Visitante";

    anunciosCadastrados.forEach(anuncio => {
        const propostaExistente = BancoDeDadosSemeando.historicoTrocas.find(
            t => t.idAnuncio === anuncio.id && t.de === nomeLogado && t.status === "Pendente"
        );

        let botoesHTML = "";

        if (propostaExistente) {
            botoesHTML = `
                <button class="btn-em-analise">⏳ Em Análise</button>
                <button class="btn-cancelar" onclick="cancelarMinhaProposta(${propostaExistente.idTroca})">Cancelar</button>
            `;
        } else {
            botoesHTML = `
                <button class="btn-trocar" onclick="registrarIntencaoDeTroca(${anuncio.id})">Propor Troca</button>
            `;
        }

        const cardHTML = `
            <div class="card">
                <div class="card-header">
                    <span class="badge oferece">Ofereço: ${anuncio.oferece}</span>
                    <span class="badge precisa">Preciso: ${anuncio.precisa}</span>
                </div>
                <div class="card-body">
                    <h3>${anuncio.produtor}</h3>
                    <p><strong>Tem sobrando:</strong> <span style="text-transform: capitalize;">${anuncio.oferece}</span></p>
                    <p><strong>Buscando por:</strong> <span style="text-transform: capitalize;">${anuncio.precisa}</span></p>
                </div>
                <div class="card-footer">
                    ${botoesHTML}
                </div>
            </div>
        `;
        containerMural.innerHTML += cardHTML;
    });
}

function cancelarMinhaProposta(idTroca) {
    const index = BancoDeDadosSemeando.historicoTrocas.findIndex(t => t.idTroca === idTroca);
    
    if (index !== -1) {
        BancoDeDadosSemeando.historicoTrocas.splice(index, 1);
        
        // AQUI: Modal customizado
        mostrarAlerta("🗑️ Cancelado", "Sua proposta foi cancelada e removida do mural.");
        
        atualizarMural();
        atualizarPainelDeNotificacoes();
    }
}

function buscarMatchPerfeito(novoAnuncio) {
    const matchesEncontrados = anunciosCadastrados.filter(anuncio => {
        const ofertaCombina = anuncio.oferece.trim().toLowerCase() === novoAnuncio.precisa.trim().toLowerCase();
        const necessidadeCombina = anuncio.precisa.trim().toLowerCase() === novoAnuncio.oferece.trim().toLowerCase();
        return ofertaCombina && necessidadeCombina;
    });

    if (matchesEncontrados.length > 0) {
        const parceiro = matchesEncontrados[0];
        // AQUI: Modal customizado
        mostrarAlerta(
            "🎉 MATCH PERFEITO!", 
            `${parceiro.produtor} tem exatamente o que você precisa (${novoAnuncio.precisa}) e está procurando pelo seu (${novoAnuncio.oferece})!`
        );
    }
}

// ==========================================
// 5. EVENTOS DO MURAL E INTERFACE
// ==========================================
const formTroca = document.getElementById('form-troca');
if (formTroca) {
    formTroca.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const nomeDigitado = document.getElementById('nome').value;
        const ofereceDigitado = document.getElementById('oferece').value;
        const precisaDigitado = document.getElementById('precisa').value;

        const novoAnuncio = {
            id: anunciosCadastrados.length + 1,
            produtor: nomeDigitado,
            oferece: ofereceDigitado,
            precisa: precisaDigitado
        };

        buscarMatchPerfeito(novoAnuncio);
        anunciosCadastrados.push(novoAnuncio);
        atualizarMural();
        formTroca.reset();

        // AQUI: Modal customizado
        mostrarAlerta('🌱 Sucesso!', 'Anúncio publicado com sucesso no mural!');
    });
}

function saudarUsuario() {
    let nomeUsuario = localStorage.getItem('nomeProdutor');
    const headerP = document.querySelector('header p');
    const modal = document.getElementById('modal-boas-vindas');
    const btnSalvar = document.getElementById('btn-salvar-nome');
    const inputNome = document.getElementById('input-nome-usuario');

    const atualizarTextoHeader = (nome) => {
        if (headerP) {
            headerP.innerHTML = `Olá, <strong>${nome}</strong>! Conectando produtores e reduzindo desperdícios.`;
        }
    };

    if (!nomeUsuario) {
        if (modal) modal.classList.add('mostrar');

        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => {
                let nomeDigitado = inputNome.value.trim();
                if (nomeDigitado === "") {
                    nomeDigitado = "Produtor(a)";
                }
                localStorage.setItem('nomeProdutor', nomeDigitado);
                atualizarTextoHeader(nomeDigitado);
                modal.classList.remove('mostrar');
            });
        }
    } else {
        atualizarTextoHeader(nomeUsuario);
    }
}

const btnDarkMode = document.getElementById('btn-dark-mode');
if (btnDarkMode) {
    btnDarkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            btnDarkMode.textContent = "☀️ Modo Claro";
        } else {
            btnDarkMode.textContent = "🌙 Modo Escuro";
        }
    });
}

function abrirAba(evento, idAba) {
    const conteudos = document.querySelectorAll('.tab-content');
    conteudos.forEach(conteudo => conteudo.classList.remove('active'));

    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(botao => botao.classList.remove('active'));

    const abaSelecionada = document.getElementById(idAba);
    if (abaSelecionada) abaSelecionada.classList.add('active');

    evento.currentTarget.classList.add('active');
}

const btnVoltarTopo = document.getElementById('btn-voltar-topo');
if (btnVoltarTopo) {
    btnVoltarTopo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==========================================
// 6. INICIALIZAÇÃO DA PÁGINA PRINCIPAL
// ==========================================
saudarUsuario();
atualizarMural();
atualizarPainelDeNotificacoes();

// ==========================================
// 7. LÓGICA DA PÁGINA DE CADASTRO
// ==========================================
const formDadosPessoais = document.getElementById('form-dados-pessoais');
if (formDadosPessoais) {
    formDadosPessoais.addEventListener('submit', function (evento) {
        evento.preventDefault();
        const nomeCompleto = document.getElementById('nome-completo').value.trim();

        if (nomeCompleto !== "") {
            const primeiroNome = nomeCompleto.split(" ")[0];
            localStorage.setItem('nomeProdutor', primeiroNome);
        }

        alert('✅ Cadastro realizado com sucesso! Bem-vindo à rede Semeando Trocas.');
        window.location.href = 'index.html';
    });
}

// ==========================================
// 8. GERENCIAMENTO DE TROCAS (ACEITAR / CANCELAR)
// ==========================================
function aceitarTroca(idTroca) {
    const troca = BancoDeDadosSemeando.historicoTrocas.find(t => t.idTroca === idTroca);
    
    if (troca) {
        troca.status = "Aceita";
        
        // AQUI: Modal customizado
        mostrarAlerta("✅ Troca Aceita!", `Você aceitou a proposta de ${troca.de}.\nVocês já podem combinar a entrega!`);
        
        console.clear();
        console.log("🔄 STATUS ATUALIZADO NO BANCO SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);
        atualizarPainelDeNotificacoes();
    }
}

function cancelarTroca(idTroca) {
    const troca = BancoDeDadosSemeando.historicoTrocas.find(t => t.idTroca === idTroca);
    
    if (troca) {
        troca.status = "Cancelada";
        
        // AQUI: Modal customizado
        mostrarAlerta("❌ Troca Recusada", `Você recusou a proposta de ${troca.de}.`);
        
        console.clear();
        console.log("🔄 STATUS ATUALIZADO NO BANCO SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);
        atualizarPainelDeNotificacoes();
    }
}

function atualizarPainelDeNotificacoes() {
    let painel = document.getElementById('painel-notificacoes');
    
    if (!painel) {
        painel = document.createElement('div');
        painel.id = 'painel-notificacoes';
        const container = document.querySelector('.container');
        if (container) {
            container.appendChild(painel);
        } else {
             document.body.appendChild(painel);
        }
    }

    painel.innerHTML = "<h3 class='titulo-notificacao'>Propostas Recebidas</h3>";

    const propostasPendentes = BancoDeDadosSemeando.historicoTrocas.filter(t => t.status === "Pendente");

    if (propostasPendentes.length === 0) {
        painel.innerHTML += "<p class='notificacao-vazia'>Nenhuma nova proposta no momento. 🌱</p>";
        return;
    }

    propostasPendentes.forEach(proposta => {
        const notificacaoHTML = `
            <div class="card-notificacao">
                <p class="texto-notificacao"><strong>${proposta.de}</strong> quer fazer uma troca com você pelo anúncio ID: ${proposta.idAnuncio}</p>
                <div class="botoes-notificacao">
                    <button class="btn-aceitar-notificacao" onclick="aceitarTroca(${proposta.idTroca})">Aceitar</button>
                    <button class="btn-recusar-notificacao" onclick="cancelarTroca(${proposta.idTroca})">Recusar</button>
                </div>
            </div>
        `;
        painel.innerHTML += notificacaoHTML;
    });
}