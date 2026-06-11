// ==========================================
// 1. DADOS INICIAIS (Array de objetos)
// ==========================================
let anunciosCadastrados = [
    { id: 1, produtor: "Dona Maria", oferece: "mudas de alface", precisa: "húmus de minhoca" },
    { id: 2, produtor: "Carlos (Horta Comunitária)", oferece: "esterco bovino", precisa: "sementes de abóbora" }
];

// ==========================================
// 2. FUNÇÕES PRINCIPAIS DO MURAL (index.html)
// ==========================================

function atualizarMural() {
    const containerMural = document.getElementById('mural');
    if (!containerMural) return; 

    containerMural.innerHTML = ""; 

    anunciosCadastrados.forEach(anuncio => {
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
                    <button class="btn-trocar" onclick="alert('Funcionalidade de chat/contato em desenvolvimento!')">Propor Troca</button>
                </div>
            </div>
        `;
        containerMural.innerHTML += cardHTML;
    });
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
    formTroca.addEventListener('submit', function(evento) {
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

// ==========================================
// 5. LÓGICA DA PÁGINA DE CADASTRO (cadastro.html)
// ==========================================
const formDadosPessoais = document.getElementById('form-dados-pessoais');
if (formDadosPessoais) {
    formDadosPessoais.addEventListener('submit', function(evento) {
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
}