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
// 2. FUNÇÃO DO NOVO MODAL DE ALERTA (SISTEMA ISOLADO)
// ==========================================
function mostrarAlerta(titulo, mensagem) {
    const modal = document.getElementById('modal-alerta-novo');
    
    // Fallback de segurança caso o HTML/CSS não esteja atualizado
    if (!modal) {
        alert(titulo + "\n\n" + mensagem);
        return;
    }

    const tituloEl = document.getElementById('modal-alerta-titulo-novo');
    const mensagemEl = document.getElementById('modal-alerta-mensagem-novo');
    const btnFechar = document.getElementById('btn-fechar-alerta-novo');
    const btnFecharX = document.getElementById('btn-fechar-alerta-x-novo');

    // Insere os textos dinamicamente de forma segura
    if (tituloEl) tituloEl.textContent = titulo;
    if (mensagemEl) mensagemEl.textContent = mensagem;

    // Adiciona a classe CSS que torna o modal visível
    modal.classList.add('exibir-modal');

    // Função interna para fechar o pop-up
    const fecharModal = () => {
        modal.classList.remove('exibir-modal');
    };

    if (btnFechar) btnFechar.onclick = fecharModal;
    if (btnFecharX) btnFecharX.onclick = fecharModal;
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
        mostrarAlerta(
            "🎉 MATCH PERFEITO!", 
            `${parceiro.produtor} tem exatamente o que você precisa (${novoAnuncio.precisa}) e está procurando pelo seu (${novoAnuncio.oferece})!`
        );
    }
}

// ==========================================
// 5. EVENTOS DO MURAL E INTERFACE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
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

            mostrarAlerta('🌱 Sucesso!', 'Anúncio publicado com sucesso no mural!');
        });
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

    const btnVoltarTopo = document.getElementById('btn-voltar-topo');
    if (btnVoltarTopo) {
        btnVoltarTopo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});

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

function abrirAba(evento, idAba) {
    const conteudos = document.querySelectorAll('.tab-content');
    conteudos.forEach(conteudo => conteudo.classList.remove('active'));

    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(botao => botao.classList.remove('active'));

    const abaSelecionada = document.getElementById(idAba);
    if (abaSelecionada) abaSelecionada.classList.add('active');

    if (evento && evento.currentTarget) {
        evento.currentTarget.classList.add('active');
    }
}

// ==========================================
// 6. INICIALIZAÇÃO DA PÁGINA PRINCIPAL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('mural')) {
        saudarUsuario();
        atualizarMural();
        atualizarPainelDeNotificacoes();
    } else {
        let nomeUsuario = localStorage.getItem('nomeProdutor');
        if (nomeUsuario) {
            const headerP = document.querySelector('header p');
            if (headerP) {
                headerP.innerHTML = `Olá, <strong>${nomeUsuario}</strong>! Conectando produtores e reduzindo desperdícios.`;
            }
        }
    }
});

// ==========================================
// 7. LÓGICA DA PÁGINA DE CADASTRO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const formDadosPessoais = document.getElementById('form-dados-pessoais');
    if (formDadosPessoais) {
        formDadosPessoais.addEventListener('submit', function (evento) {
            evento.preventDefault();
            const nomeCompleto = document.getElementById('nome-completo').value.trim();

            if (nomeCompleto !== "") {
                const primeiroNome = nomeCompleto.split(" ")[0];
                localStorage.setItem('nomeProdutor', primeiroNome);
            }

            // Usando o novo modal de alerta customizado na tela de sucesso também!
            mostrarAlerta('✅ Sucesso!', 'Cadastro realizado com sucesso! Bem-vindo à rede Semeando Trocas.');
            
            // Espera 2.5 segundos para o usuário ver o modal antes de redirecionar
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2500);
        });
    }
});

// ==========================================
// 8. GERENCIAMENTO DE TROCAS (ACEITAR / CANCELAR)
// ==========================================
function aceitarTroca(idTroca) {
    const troca = BancoDeDadosSemeando.historicoTrocas.find(t => t.idTroca === idTroca);
    
    if (troca) {
        troca.status = "Aceita";
        
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
        
        mostrarAlerta("❌ Troca Recusada", `Você recusou a proposta de ${troca.de}.`);
        
        console.clear();
        console.log("🔄 STATUS ATUALIZADO NO BANCO SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);
        atualizarPainelDeNotificacoes();
    }
}

function atualizarPainelDeNotificacoes() {
    const painel = document.getElementById('painel-notificacoes');
    if (!painel) return;

    // Limpa o painel e define o título principal
    painel.innerHTML = "<h3 class='titulo-notificacao'>Histórico de Propostas e Notificações</h3>";

    // Modificado para pegar TODAS as propostas (Pendentes, Aceitas e Canceladas)
    const todasAsPropostas = BancoDeDadosSemeando.historicoTrocas;

    if (todasAsPropostas.length === 0) {
        painel.innerHTML += "<p class='notificacao-vazia'>Nenhuma proposta no momento. 🌱</p>";
        return;
    }

    todasAsPropostas.forEach(proposta => {
        let botoesOuStatusHTML = "";

        // Se estiver pendente, mostra os botões de ação normal
        if (proposta.status === "Pendente") {
            botoesOuStatusHTML = `
                <div class="botoes-notificacao">
                    <button class="btn-aceitar-notificacao" onclick="aceitarTroca(${proposta.idTroca})">Aceitar</button>
                    <button class="btn-recusar-notificacao" onclick="cancelarTroca(${proposta.idTroca})">Recusar</button>
                </div>
            `;
        } 
        // Se já foi aceita, mostra um texto estilizado de sucesso
        else if (proposta.status === "Aceita") {
            botoesOuStatusHTML = `
                <p class="status-notificacao status-aceita">✅ Proposta Aceita! Combine a entrega.</p>
            `;
        } 
        // Se foi recusada/cancelada, mostra o texto de encerrada
        else if (proposta.status === "Cancelada") {
            botoesOuStatusHTML = `
                <p class="status-notificacao status-recusada">❌ Proposta Recusada.</p>
            `;
        }

        const notificacaoHTML = `
            <div class="card-notificacao status-${proposta.status.toLowerCase()}">
                <p class="texto-notificacao">
                    <strong>${proposta.de}</strong> quer fazer uma troca com você pelo anúncio ID: ${proposta.idAnuncio}
                </p>
                ${botoesOuStatusHTML}
            </div>
        `;
        painel.innerHTML += notificacaoHTML;
    });
}