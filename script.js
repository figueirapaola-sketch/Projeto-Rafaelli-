/**
 * @file script.js
 * @description Lógica principal da plataforma Semeando Trocas.
 *
 * Este arquivo centraliza todas as funcionalidades client-side:
 * simulação de banco de dados em memória, sistema de propostas
 * de troca, painel de notificações, controles de interface
 * (modal, dark mode, abas) e persistência via localStorage.
 *
 * @project  Semeando Trocas
 * @event    Agrinho 2026
 * @school   CEEP Ibiporã — Turma 1º IA
 * @version  2.0
 */


/* ============================================================
   1. SIMULAÇÃO DE BANCO DE DADOS
   Estrutura que representa o futuro backend da aplicação.
   Em uma versão com servidor, esses dados viriam de uma API
   REST e seriam persistidos em um banco de dados real.
   ============================================================ */

/**
 * Banco de dados simulado em memória para a sessão atual.
 * Contém os dados iniciais de usuários e anúncios, além do
 * histórico de trocas gerado durante a navegação.
 *
 * @type {{
 *   usuarios:        Array<{id: number, nome: string, contato: string}>,
 *   anuncios:        Array<{id: number, idUsuario: number, produtor: string, oferece: string, precisa: string}>,
 *   historicoTrocas: Array<Object>
 * }}
 */
const BancoDeDadosSemeando = {

    /** Produtores pré-cadastrados para demonstração da plataforma */
    usuarios: [
        { id: 1, nome: "Dona Maria",                  contato: "(43) 99999-0001" },
        { id: 2, nome: "Carlos (Horta Comunitária)",   contato: "(43) 99999-0002" }
    ],

    /** Anúncios de troca publicados no mural de demonstração */
    anuncios: [
        { id: 1, idUsuario: 1, produtor: "Dona Maria",                 oferece: "mudas de alface",   precisa: "húmus de minhoca"    },
        { id: 2, idUsuario: 2, produtor: "Carlos (Horta Comunitária)", oferece: "esterco bovino",     precisa: "sementes de abóbora" }
    ],

    /**
     * Histórico de todas as propostas de troca criadas na sessão.
     * Cada entrada registra quem propôs, para quem, o status atual e a data.
     * @type {Array<{idTroca: number, idAnuncio: number, de: string, para: string, status: string, data: string}>}
     */
    historicoTrocas: []
};

/**
 * Cópia de trabalho da lista de anúncios.
 * Separada do objeto original para permitir a adição de novos
 * anúncios durante a sessão sem modificar os dados de demonstração.
 *
 * @type {Array}
 */
let anunciosCadastrados = BancoDeDadosSemeando.anuncios;


/* ============================================================
   2. SISTEMA DE ALERTAS CUSTOMIZADOS
   Substitui o alert() nativo do navegador por um modal
   estilizado, mantendo a identidade visual do projeto.
   Inclui fallback automático para páginas sem o modal no HTML.
   ============================================================ */

/**
 * Exibe um modal de alerta customizado com título e mensagem.
 *
 * Caso o elemento #modal-alerta não exista na página atual,
 * utiliza o alert() nativo do navegador como fallback de segurança,
 * garantindo que o usuário sempre receba o feedback esperado.
 *
 * @param {string} titulo   - Título exibido no cabeçalho do modal.
 * @param {string} mensagem - Corpo da mensagem exibida ao usuário.
 * @returns {void}
 */
function mostrarAlerta(titulo, mensagem) {
    const modal = document.getElementById('modal-alerta');

    // Fallback: se o modal não existir na página, usa o alert() nativo
    if (!modal) {
        alert(titulo + "\n\n" + mensagem);
        return;
    }

    // Seleciona os elementos internos do modal
    const tituloEl   = document.getElementById('modal-alerta-titulo');
    const mensagemEl = document.getElementById('modal-alerta-mensagem');
    const btnFechar  = document.getElementById('btn-fechar-alerta');

    // Injeta o conteúdo dinâmico passado como argumento
    tituloEl.textContent   = titulo;
    mensagemEl.textContent = mensagem;

    // Torna o modal visível adicionando a classe de controle CSS
    modal.classList.add('mostrar');

    // Registra o evento de fechamento no botão de confirmação
    btnFechar.onclick = () => {
        modal.classList.remove('mostrar');
    };
}


/* ============================================================
   3. REGISTRO E CANCELAMENTO DE PROPOSTAS
   Funções responsáveis por criar, registrar e remover
   intenções de troca no histórico simulado da sessão.
   ============================================================ */

/**
 * Registra uma nova proposta de troca no banco simulado.
 *
 * Identifica o produtor logado via localStorage e cria um registro
 * de proposta vinculado ao anúncio selecionado. Após o registro,
 * atualiza o mural e o painel de notificações para refletir
 * o novo estado da interface.
 *
 * @param {number} idAnuncioAlvo - ID do anúncio que o usuário deseja trocar.
 * @returns {void}
 */
function registrarIntencaoDeTroca(idAnuncioAlvo) {
    const nomeInteressado = localStorage.getItem('nomeProdutor') || "Produtor(a) Visitante";
    const anuncioOriginal = anunciosCadastrados.find(anuncio => anuncio.id === idAnuncioAlvo);

    if (anuncioOriginal) {

        // Monta o objeto da nova proposta com todos os metadados necessários
        const novaProposta = {
            idTroca:   BancoDeDadosSemeando.historicoTrocas.length + 1,
            idAnuncio: idAnuncioAlvo,
            de:        nomeInteressado,
            para:      anuncioOriginal.produtor,
            status:    "Pendente",
            data:      new Date().toLocaleDateString('pt-BR')
        };

        BancoDeDadosSemeando.historicoTrocas.push(novaProposta);

        // Exibe o estado atualizado do banco no console para fins de depuração
        console.clear();
        console.log("💾 NOVO REGISTRO NO BANCO DE DADOS SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);

        // Notifica o usuário sobre o sucesso do envio
        mostrarAlerta(
            '✅ Proposta Enviada!',
            `Sua intenção de troca foi registrada.\n\nDe: ${nomeInteressado}\nPara: ${anuncioOriginal.produtor}\n\nAguarde o retorno no painel de notificações.`
        );

        // Sincroniza a interface com o novo estado do banco
        atualizarMural();
        atualizarPainelDeNotificacoes();
    }
}

/**
 * Cancela uma proposta de troca enviada pelo usuário logado.
 *
 * Remove o registro do histórico pelo índice encontrado e
 * atualiza o mural e o painel para refletir a remoção.
 *
 * @param {number} idTroca - ID único da proposta a ser cancelada.
 * @returns {void}
 */
function cancelarMinhaProposta(idTroca) {
    const index = BancoDeDadosSemeando.historicoTrocas.findIndex(t => t.idTroca === idTroca);

    if (index !== -1) {
        // Remove o registro diretamente do array pelo índice
        BancoDeDadosSemeando.historicoTrocas.splice(index, 1);

        mostrarAlerta("🗑️ Cancelado", "Sua proposta foi cancelada e removida do mural.");

        // Sincroniza a interface após a remoção
        atualizarMural();
        atualizarPainelDeNotificacoes();
    }
}


/* ============================================================
   4. MURAL DE TROCAS E SISTEMA DE MATCH
   Funções de renderização do mural e detecção automática
   de compatibilidade entre anúncios (match perfeito).
   ============================================================ */

/**
 * Reconstrói o mural de trocas com base nos anúncios cadastrados.
 *
 * Para cada anúncio, verifica se o usuário logado já possui uma
 * proposta pendente associada a ele. Com base nisso, renderiza
 * botões diferentes: "Propor Troca" ou "Em Análise + Cancelar".
 *
 * @returns {void}
 */
function atualizarMural() {
    const containerMural = document.getElementById('mural');

    // Trava de segurança: encerra se o mural não existir na página atual
    if (!containerMural) return;

    containerMural.innerHTML = "";
    const nomeLogado = localStorage.getItem('nomeProdutor') || "Produtor(a) Visitante";

    anunciosCadastrados.forEach(anuncio => {

        // Verifica se já existe uma proposta pendente do usuário para este anúncio
        const propostaExistente = BancoDeDadosSemeando.historicoTrocas.find(
            t => t.idAnuncio === anuncio.id && t.de === nomeLogado && t.status === "Pendente"
        );

        let botoesHTML = "";

        if (propostaExistente) {
            // Proposta já enviada: exibe indicador de status e opção de cancelamento
            botoesHTML = `
                <button class="btn-em-analise">⏳ Em Análise</button>
                <button class="btn-cancelar" onclick="cancelarMinhaProposta(${propostaExistente.idTroca})">Cancelar</button>
            `;
        } else {
            // Sem proposta ativa: exibe o botão padrão de proposta de troca
            botoesHTML = `
                <button class="btn-trocar" onclick="registrarIntencaoDeTroca(${anuncio.id})">Propor Troca</button>
            `;
        }

        // Monta o HTML completo do card e insere no container do mural
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

/**
 * Verifica se um novo anúncio possui correspondência exata
 * com algum anúncio já publicado no mural (match perfeito).
 *
 * Um match ocorre quando o que o produtor A oferece é exatamente
 * o que o produtor B precisa, e vice-versa — indicando uma troca
 * ideal sem necessidade de negociação adicional.
 *
 * @param {Object} novoAnuncio         - Anúncio recém-criado pelo usuário.
 * @param {string} novoAnuncio.oferece - O que o usuário tem disponível para troca.
 * @param {string} novoAnuncio.precisa - O que o usuário está buscando na plataforma.
 * @returns {void}
 */
function buscarMatchPerfeito(novoAnuncio) {
    const matchesEncontrados = anunciosCadastrados.filter(anuncio => {
        const ofertaCombina      = anuncio.oferece.trim().toLowerCase() === novoAnuncio.precisa.trim().toLowerCase();
        const necessidadeCombina = anuncio.precisa.trim().toLowerCase() === novoAnuncio.oferece.trim().toLowerCase();
        return ofertaCombina && necessidadeCombina;
    });

    // Se houver pelo menos um match, notifica o usuário imediatamente
    if (matchesEncontrados.length > 0) {
        const parceiro = matchesEncontrados[0];
        mostrarAlerta(
            "🎉 MATCH PERFEITO!",
            `${parceiro.produtor} tem exatamente o que você precisa (${novoAnuncio.precisa}) e está procurando pelo seu (${novoAnuncio.oferece})!`
        );
    }
}


/* ============================================================
   5. EVENTOS DE INTERFACE
   Listeners de interação do usuário: publicação de anúncio,
   saudação personalizada, dark mode, abas e voltar ao topo.
   ============================================================ */

/**
 * Listener do formulário de publicação de anúncio no mural.
 *
 * Captura os dados preenchidos, verifica compatibilidade com anúncios
 * existentes via buscarMatchPerfeito(), adiciona o novo anúncio à
 * lista e atualiza o mural. Exibe confirmação ao final.
 */
const formTroca = document.getElementById('form-troca');
if (formTroca) {
    formTroca.addEventListener('submit', function (evento) {
        evento.preventDefault();

        // Captura os valores preenchidos pelo usuário no formulário
        const nomeDigitado    = document.getElementById('nome').value;
        const ofereceDigitado = document.getElementById('oferece').value;
        const precisaDigitado = document.getElementById('precisa').value;

        const novoAnuncio = {
            id:       anunciosCadastrados.length + 1,
            produtor: nomeDigitado,
            oferece:  ofereceDigitado,
            precisa:  precisaDigitado
        };

        buscarMatchPerfeito(novoAnuncio);   // Verifica compatibilidade antes de publicar
        anunciosCadastrados.push(novoAnuncio);
        atualizarMural();
        formTroca.reset();                  // Limpa o formulário após a publicação

        mostrarAlerta('🌱 Sucesso!', 'Anúncio publicado com sucesso no mural!');
    });
}

/**
 * Exibe uma saudação personalizada no cabeçalho da página.
 *
 * Na primeira visita, abre o modal de boas-vindas para capturar
 * o nome do produtor e salvá-lo no localStorage. Nas visitas
 * seguintes, reutiliza o nome já armazenado sem exibir o modal.
 *
 * @returns {void}
 */
function saudarUsuario() {
    let nomeUsuario = localStorage.getItem('nomeProdutor');
    const headerP   = document.querySelector('header p');
    const modal     = document.getElementById('modal-boas-vindas');
    const btnSalvar = document.getElementById('btn-salvar-nome');
    const inputNome = document.getElementById('input-nome-usuario');

    /**
     * Atualiza o parágrafo do cabeçalho com o nome do produtor.
     * Usa innerHTML para permitir a formatação em negrito do nome.
     *
     * @param {string} nome - Nome a ser exibido na saudação.
     */
    const atualizarTextoHeader = (nome) => {
        if (headerP) {
            headerP.innerHTML = `Olá, <strong>${nome}</strong>! Conectando produtores e reduzindo desperdícios.`;
        }
    };

    if (!nomeUsuario) {
        // Primeira visita: exibe o modal para capturar o nome do produtor
        if (modal) modal.classList.add('mostrar');

        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => {
                let nomeDigitado = inputNome.value.trim();

                // Atribui nome genérico se o campo for enviado em branco
                if (nomeDigitado === "") nomeDigitado = "Produtor(a)";

                localStorage.setItem('nomeProdutor', nomeDigitado);
                atualizarTextoHeader(nomeDigitado);
                modal.classList.remove('mostrar');
            });
        }
    } else {
        // Visita recorrente: reutiliza o nome salvo sem abrir o modal
        atualizarTextoHeader(nomeUsuario);
    }
}

/**
 * Listener do botão de alternância entre modo claro e escuro.
 *
 * Adiciona ou remove a classe .dark-mode do <body> e atualiza
 * o rótulo do botão para refletir o modo que será ativado no próximo clique.
 */
const btnDarkMode = document.getElementById('btn-dark-mode');
if (btnDarkMode) {
    btnDarkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        // Atualiza o texto do botão conforme o modo atualmente ativo
        btnDarkMode.textContent = document.body.classList.contains('dark-mode')
            ? "☀️ Modo Claro"
            : "🌙 Modo Escuro";
    });
}

/**
 * Ativa a aba selecionada na seção "Sobre o Projeto" e desativa as demais.
 *
 * Chamada diretamente pelos atributos onclick nos botões de aba do HTML.
 * Remove a classe .active de todos os painéis e botões antes de aplicar
 * ao elemento selecionado.
 *
 * @param {Event}  evento - Evento de clique disparado pelo botão de aba.
 * @param {string} idAba  - ID do painel de conteúdo a ser exibido.
 * @returns {void}
 */
function abrirAba(evento, idAba) {
    // Remove o estado ativo de todos os painéis e botões de aba
    document.querySelectorAll('.tab-content').forEach(conteudo => conteudo.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(botao => botao.classList.remove('active'));

    // Ativa o painel correspondente à aba clicada
    const abaSelecionada = document.getElementById(idAba);
    if (abaSelecionada) abaSelecionada.classList.add('active');

    // Marca o botão clicado como ativo
    evento.currentTarget.classList.add('active');
}

/**
 * Listener do botão "Voltar ao Topo".
 * Rola a página de volta ao início com animação suave,
 * aproveitando o scroll-behavior definido no CSS.
 */
const btnVoltarTopo = document.getElementById('btn-voltar-topo');
if (btnVoltarTopo) {
    btnVoltarTopo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


/* ============================================================
   6. INICIALIZAÇÃO DA PÁGINA PRINCIPAL
   Funções executadas imediatamente ao carregar o script.
   A ordem é importante: saudar o usuário antes de renderizar
   o mural garante que o nome correto apareça nos cards.
   ============================================================ */

saudarUsuario();                    // Identifica ou captura o nome do produtor
atualizarMural();                   // Renderiza os cards de anúncio no mural
atualizarPainelDeNotificacoes();    // Exibe eventuais propostas pendentes


/* ============================================================
   7. PÁGINA DE CADASTRO (cadastro.html)
   Captura os dados do formulário de cadastro de produtor,
   persiste o primeiro nome no localStorage e redireciona
   o usuário para a página principal ao concluir.
   ============================================================ */

/**
 * Listener do formulário de cadastro de produtor.
 *
 * Extrai o primeiro nome digitado no campo de nome completo,
 * salva-o no localStorage para uso na saudação personalizada
 * e redireciona o usuário para o index.html via caminho relativo.
 */
const formDadosPessoais = document.getElementById('form-dados-pessoais');
if (formDadosPessoais) {
    formDadosPessoais.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const nomeCompleto = document.getElementById('nome-completo').value.trim();

        if (nomeCompleto !== "") {
            // Salva apenas o primeiro nome para personalizar a saudação no mural
            const primeiroNome = nomeCompleto.split(" ")[0];
            localStorage.setItem('nomeProdutor', primeiroNome);
        }

        alert('✅ Cadastro realizado com sucesso! Bem-vindo à rede Semeando Trocas.');

        // Redirecionamento relativo garante compatibilidade em qualquer estrutura de pastas
        window.location.assign('./index.html');
    });
}


/* ============================================================
   8. GERENCIAMENTO DE PROPOSTAS RECEBIDAS
   Funções acionadas pelos botões do painel de notificações
   para que o produtor receptor aceite ou recuse propostas
   enviadas por outros membros da rede.
   ============================================================ */

/**
 * Marca uma proposta recebida como aceita e notifica o usuário.
 *
 * Localiza a proposta pelo ID no histórico, atualiza seu status
 * para "Aceita" e exibe uma confirmação. Registra o novo estado
 * no console e atualiza o painel de notificações.
 *
 * @param {number} idTroca - ID único da proposta a ser aceita.
 * @returns {void}
 */
function aceitarTroca(idTroca) {
    const troca = BancoDeDadosSemeando.historicoTrocas.find(t => t.idTroca === idTroca);

    if (troca) {
        troca.status = "Aceita";

        mostrarAlerta(
            "✅ Troca Aceita!",
            `Você aceitou a proposta de ${troca.de}.\nVocês já podem combinar a entrega!`
        );

        // Registra o novo status no console para fins de depuração
        console.clear();
        console.log("🔄 STATUS ATUALIZADO NO BANCO SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);

        atualizarPainelDeNotificacoes();
    }
}

/**
 * Marca uma proposta recebida como recusada e notifica o usuário.
 *
 * Localiza a proposta pelo ID no histórico, atualiza seu status
 * para "Cancelada" e exibe uma confirmação. Registra o novo estado
 * no console e atualiza o painel de notificações.
 *
 * @param {number} idTroca - ID único da proposta a ser recusada.
 * @returns {void}
 */
function cancelarTroca(idTroca) {
    const troca = BancoDeDadosSemeando.historicoTrocas.find(t => t.idTroca === idTroca);

    if (troca) {
        troca.status = "Cancelada";

        mostrarAlerta(
            "❌ Troca Recusada",
            `Você recusou a proposta de ${troca.de}.`
        );

        // Registra o novo status no console para fins de depuração
        console.clear();
        console.log("🔄 STATUS ATUALIZADO NO BANCO SIMULADO:");
        console.table(BancoDeDadosSemeando.historicoTrocas);

        atualizarPainelDeNotificacoes();
    }
}

/**
 * Reconstrói o painel de notificações com as propostas pendentes da sessão.
 *
 * Cria o elemento #painel-notificacoes dinamicamente no DOM caso ainda
 * não exista. Exibe um card para cada proposta com status "Pendente",
 * contendo botões de aceitar e recusar.
 *
 * Utiliza a presença do elemento #mural como trava de segurança para
 * garantir que a função só execute no index.html, evitando erros
 * nas demais páginas que compartilham o mesmo script.js.
 *
 * @returns {void}
 */
function atualizarPainelDeNotificacoes() {

    // Trava de segurança: só executa na página que contém o mural (#mural)
    // Se o elemento não existir, não estamos no index.html — encerra a função
    const containerMural = document.getElementById('mural');
    if (!containerMural) return;

    // Cria o painel dinamicamente se ainda não existir no DOM
    let painel = document.getElementById('painel-notificacoes');
    if (!painel) {
        painel = document.createElement('div');
        painel.id = 'painel-notificacoes';

        const container = document.querySelector('.container');
        if (container) {
            container.appendChild(painel);      // Posição preferencial: dentro do .container
        } else {
            document.body.appendChild(painel);  // Fallback: direto no <body>
        }
    }

    // Reseta o conteúdo do painel e reinsere o título
    painel.innerHTML = "<h3 class='titulo-notificacao'>Propostas Recebidas</h3>";

    // Filtra apenas as propostas que ainda aguardam resposta do receptor
    const propostasPendentes = BancoDeDadosSemeando.historicoTrocas.filter(t => t.status === "Pendente");

    if (propostasPendentes.length === 0) {
        painel.innerHTML += "<p class='notificacao-vazia'>Nenhuma nova proposta no momento. 🌱</p>";
        return;
    }

    // Renderiza um card de notificação para cada proposta pendente encontrada
    propostasPendentes.forEach(proposta => {
        const notificacaoHTML = `
            <div class="card-notificacao">
                <p class="texto-notificacao">
                    <strong>${proposta.de}</strong> quer fazer uma troca com você pelo anúncio ID: ${proposta.idAnuncio}
                </p>
                <div class="botoes-notificacao">
                    <button class="btn-aceitar-notificacao" onclick="aceitarTroca(${proposta.idTroca})">Aceitar</button>
                    <button class="btn-recusar-notificacao" onclick="cancelarTroca(${proposta.idTroca})">Recusar</button>
                </div>
            </div>
        `;
        painel.innerHTML += notificacaoHTML;
    });
}