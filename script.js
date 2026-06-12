// ==========================================
// 1. SIMULAÇÃO DE BANCO DE DADOS (FUTURO BACKEND)
// ==========================================
// Estrutura relacional simulada para apresentar no projeto Agrinho
const BancoDeDadosSemeando = {
    // Tabela 1: Usuários cadastrados no sistema
    usuarios: [
        { id: 1, nome: "Dona Maria", contato: "(43) 99999-0001" },
        { id: 2, nome: "Carlos (Horta Comunitária)", contato: "(43) 99999-0002" }
    ],

    // Tabela 2: Mural de Anúncios (relacionado ao usuário pelo idUsuario)
    anuncios: [
        { id: 1, idUsuario: 1, produtor: "Dona Maria", oferece: "mudas de alface", precisa: "húmus de minhoca" },
        { id: 2, idUsuario: 2, produtor: "Carlos (Horta Comunitária)", oferece: "esterco bovino", precisa: "sementes de abóbora" }
    ],

    // Tabela 3: Histórico de Trocas (A Ideia do Banco de Dados para o Futuro)
    // Aqui ficam registradas as intenções de troca entre produtores
    historicoTrocas: []
};

// Mantemos a variável antiga apontando para a nova estrutura para não quebrar o resto do seu código!
let anunciosCadastrados = BancoDeDadosSemeando.anuncios;

// Nova Função: Simula a gravação de uma proposta de troca no Banco de Dados
function registrarIntencaoDeTroca(idAnuncioAlvo) {
    // Pega o nome de quem está logado/visitando
    const nomeInteressado = localStorage.getItem('nomeProdutor') || "Produtor(a) Visitante";
    
    // Busca os detalhes do anúncio que a pessoa clicou
    const anuncioOriginal = anunciosCadastrados.find(anuncio => anuncio.id === idAnuncioAlvo);

    if (anuncioOriginal) {
        // Cria a "linha" que seria inserida no banco de dados real
        const novaProposta = {
            idTroca: BancoDeDadosSemeando.historicoTrocas.length + 1,
            idAnuncio: idAnuncioAlvo,
            de: nomeInteressado,
            para: anuncioOriginal.produtor,
            status: "Pendente",
            data: new Date().toLocaleDateString('pt-BR')
        };

        // Salva na tabela simulada
        BancoDeDadosSemeando.historicoTrocas.push(novaProposta);

        // Feedback visual para o usuário e para os avaliadores no Console
        console.clear();
        console.log("💾 NOVO REGISTRO NO BANCO DE DADOS SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);
        
        alert(`✅ Intenção registrada no banco de dados simulado!\n\nDe: ${nomeInteressado}\nPara: ${anuncioOriginal.produtor}\n\nAbra o console do navegador (F12) para ver a tabela de trocas.`);
        
        // Atualiza a tela imediatamente para mostrar os novos botões (Em Análise / Cancelar)
        atualizarMural();
        atualizarPainelDeNotificacoes();
    }
}

// ==========================================
// 2. FUNÇÕES PRINCIPAIS DO MURAL (index.html)
// ==========================================

function atualizarMural() {
    const containerMural = document.getElementById('mural');
    if (!containerMural) return;

    containerMural.innerHTML = "";

    // Pega o nome do usuário logado para saber quais propostas são dele
    const nomeLogado = localStorage.getItem('nomeProdutor') || "Produtor(a) Visitante";

    anunciosCadastrados.forEach(anuncio => {
        // Verifica no banco de dados se já existe uma troca pendente DESTE usuário para ESTE anúncio
        const propostaExistente = BancoDeDadosSemeando.historicoTrocas.find(
            t => t.idAnuncio === anuncio.id && t.de === nomeLogado && t.status === "Pendente"
        );

        // Define quais botões vão aparecer via JavaScript
        let botoesHTML = "";

        if (propostaExistente) {
            // Se já propôs, mostra que está em análise e dá a opção de cancelar
            botoesHTML = `
                <button style="background: #f39c12; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: default; font-weight: bold;">⏳ Em Análise</button>
                <button style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-left: 5px; font-weight: bold;" onclick="cancelarMinhaProposta(${propostaExistente.idTroca})">Cancelar</button>
            `;
        } else {
            // Se não propôs, mostra o botão normal
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
    // Procura a proposta na lista
    const index = BancoDeDadosSemeando.historicoTrocas.findIndex(t => t.idTroca === idTroca);
    
    if (index !== -1) {
        // Remove a proposta do banco de dados simulado
        BancoDeDadosSemeando.historicoTrocas.splice(index, 1);
        
        alert("🗑️ Sua proposta foi cancelada.");
        
        // Atualiza a tela para os botões voltarem ao normal
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
        alert(`🎉 MATCH PERFEITO ENCONTRADO!\n\n${parceiro.produtor} tem exatamente o que você precisa (${novoAnuncio.precisa}) e está procurando pelo seu (${novoAnuncio.oferece})!`);
    }
}

// ==========================================
// 3. EVENTOS DO MURAL E INTERFACE (index.html)
// ==========================================

// Captura envio de nova troca no mural
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

        alert('🌱 Anúncio publicado com sucesso no mural!');
    });
}

// Lógica de Saudação e Modal
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

// Alternar Modo Escuro/Claro
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

// Guias (Tabs) de História, Visão e Metas
function abrirAba(evento, idAba) {
    const conteudos = document.querySelectorAll('.tab-content');
    conteudos.forEach(conteudo => {
        conteudo.classList.remove('active');
    });

    const botoes = document.querySelectorAll('.tab-btn');
    botoes.forEach(botao => {
        botao.classList.remove('active');
    });

    const abaSelecionada = document.getElementById(idAba);
    if (abaSelecionada) abaSelecionada.classList.add('active');

    evento.currentTarget.classList.add('active');
}

// Botão de voltar ao topo no rodapé
const btnVoltarTopo = document.getElementById('btn-voltar-topo');
if (btnVoltarTopo) {
    btnVoltarTopo.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==========================================
// 4. INICIALIZAÇÃO DA PÁGINA PRINCIPAL
// ==========================================
saudarUsuario();
atualizarMural();
atualizarPainelDeNotificacoes(); // Inicia o painel caso exista na página

// ==========================================
// 5. LÓGICA DA PÁGINA DE CADASTRO (cadastro.html)
// ==========================================
const formDadosPessoais = document.getElementById('form-dados-pessoais');
if (formDadosPessoais) {
    formDadosPessoais.addEventListener('submit', function (evento) {
        evento.preventDefault(); // Impede o recarregamento padrão da página

        // Captura o nome digitado no formulário
        const nomeCompleto = document.getElementById('nome-completo').value.trim();

        // Se o usuário digitou o nome, salva no armazenamento do navegador
        if (nomeCompleto !== "") {
            // Pega o primeiro nome para a saudação ficar amigável
            const primeiroNome = nomeCompleto.split(" ")[0];
            localStorage.setItem('nomeProdutor', primeiroNome);
        }

        alert('✅ Cadastro realizado com sucesso! Bem-vindo à rede Semeando Trocas.');

        // Redireciona o usuário de volta para a página inicial
        window.location.href = 'index.html';
    });
} // A chave que fecha a lógica de cadastro.

// ==========================================
// 6. GERENCIAMENTO DE TROCAS (ACEITAR / CANCELAR)
// ==========================================

function aceitarTroca(idTroca) {
    // Busca a proposta específica dentro do array historicoTrocas
    const troca = BancoDeDadosSemeando.historicoTrocas.find(t => t.idTroca === idTroca);
    
    if (troca) {
        troca.status = "Aceita"; // Atualiza o status
        
        alert(`✅ Troca Aceita!\n\nVocê aceitou a proposta de ${troca.de}.`);
        
        // Mostra no console para os avaliadores verem a mudança
        console.clear();
        console.log("🔄 STATUS ATUALIZADO NO BANCO SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);
        
        // Atualiza a interface
        atualizarPainelDeNotificacoes();
    }
}

function cancelarTroca(idTroca) {
    const troca = BancoDeDadosSemeando.historicoTrocas.find(t => t.idTroca === idTroca);
    
    if (troca) {
        troca.status = "Cancelada";
        
        alert(`❌ Troca Recusada.\n\nVocê recusou a proposta de ${troca.de}.`);
        
        console.clear();
        console.log("🔄 STATUS ATUALIZADO NO BANCO SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);
        
        // Atualiza a interface
        atualizarPainelDeNotificacoes();
    }
}

function atualizarPainelDeNotificacoes() {
    const painel = document.getElementById('painel-notificacoes');
    if (!painel) return;

    painel.innerHTML = "<h3>Propostas Recebidas</h3>";

    // Filtra apenas as trocas que estão pendentes
    const propostasPendentes = BancoDeDadosSemeando.historicoTrocas.filter(t => t.status === "Pendente");

    if (propostasPendentes.length === 0) {
        painel.innerHTML += "<p>Nenhuma nova proposta no momento.</p>";
        return;
    }

    propostasPendentes.forEach(proposta => {
        const notificacaoHTML = `
            <div class="card-notificacao" style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;">
                <p><strong>${proposta.de}</strong> quer fazer uma troca com você pelo anúncio ID: ${proposta.idAnuncio}</p>
                <div class="botoes-acao">
                    <button style="background: green; color: white; cursor: pointer; padding: 5px 10px; border: none; border-radius: 5px;" onclick="aceitarTroca(${proposta.idTroca})">Aceitar</button>
                    <button style="background: red; color: white; cursor: pointer; padding: 5px 10px; border: none; border-radius: 5px; margin-left: 5px;" onclick="cancelarTroca(${proposta.idTroca})">Recusar</button>
                </div>
            </div>
        `;
        painel.innerHTML += notificacaoHTML;
    });
}