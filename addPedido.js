// Referenciando os elementos do HTML
const tabelaPedido = document.getElementById('tabelaPedido');
const totalPedido = document.getElementById('totalPedido');

// Variáveis para armazenar os dados do pedido e o preço total
let pedido = [];
let precoTotal = 0;

// Função para adicionar o produto ao pedido
function adicionarProduto(nome, preco, quantidade) {

    //verifica se a quantidade é maior que 5 ou menor que 1
    if (isNaN(quantidade) || quantidade <= 0 || quantidade > 5) {
        if (quantidade > 5) {
            alert("A quantidade máxima é 5!");
        } else {
            alert("A quantidade mínima é de 1!");
        }
    } else {
        // Verifica se o produto já está no pedido
        const produtoExistente = pedido.find(item => item.nome === nome);

        if (produtoExistente) {
            produtoExistente.quantidade += quantidade; // Aumenta a quantidade do produto
        } else {
            // Cálculo do preço do produto com base na quantidade
            const precoProduto = preco;

            // Adicionar o produto ao array do pedido
            pedido.push({ nome, quantidade, preco: precoProduto });
            console.log('pedido');
        }

        // Atualizar a exibição da tabela do pedido
        exibirPedido();
    }
}


// Função para remover o produto do pedido
function removerProduto(index) {
    if (pedido[index].quantidade > 1) {
        pedido[index].quantidade -= 1; // Diminui a quantidade do produto
    } else {
        pedido.splice(index, 1); // Remove o produto se a quantidade for 1
    }

    // Atualiza a exibição da tabela do pedido
    exibirPedido();

}

// Função para exibir o pedido na tabela
function exibirPedido() {
    const tabelaBody = tabelaPedido.querySelector('tbody');

    // Limpar o conteúdo do corpo da tabela
    tabelaBody.innerHTML = '';

    let precoTotalPedido = 0; // Inicializa o preço total do pedido

    pedido.forEach((item, index) => {
        const row = tabelaBody.insertRow(); // Inserir uma nova linha na tabela
        const cellNome = row.insertCell(0);
        const cellPreco = row.insertCell(1);
        const cellQuantidade = row.insertCell(2);
        const cellOpcoes = row.insertCell(3);

        cellNome.textContent = item.nome;
        cellQuantidade.textContent = item.quantidade;

        // Calcula o preço total do item (preço unitário * quantidade)
        const precoTotalItem = item.preco * item.quantidade;
        cellPreco.textContent = `R$ ${precoTotalItem.toFixed(2)}`;
        precoTotalPedido += precoTotalItem; // Soma ao preço total do pedido

        // Adiciona um botão de remoção na célula de opções
        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'Remover 1 ';
        btnRemover.classList.add('btn', 'btn-danger', 'btn-remover');

        // Adicionando um ícone de lixo usando Bootstrap Icons
        const icon = document.createElement('i');
        icon.classList.add('bi', 'bi-trash3'); // Classes do Bootstrap Icons
        btnRemover.appendChild(icon);

        // Adiciona um evento de clique para remover o item
        btnRemover.addEventListener('click', () => {
            removerProduto(index);
        });

        cellOpcoes.appendChild(btnRemover);
    });

    const rowTotal = tabelaBody.insertRow();
    const cellTotalLabel = rowTotal.insertCell(0);
    const cellTotal = rowTotal.insertCell(1);
    const cellFinalizar = rowTotal.insertCell(2); // Célula para o botão "Finalizar Pedido"
    tabelaBody.classList.add('text-center', 'table-hover');

    // Criação da tag span com a classe desejada
    const totalPedidoLabel = document.createElement('span');
    totalPedidoLabel.textContent = 'Total do Pedido';
    totalPedidoLabel.classList.add('text-danger');

    cellTotalLabel.appendChild(totalPedidoLabel);
    cellTotalLabel.colSpan = 2; // Mescla as colunas para ocupar espaço do nome e preço

    cellTotal.textContent = `R$ ${precoTotalPedido.toFixed(2)}`;
    const PrecoTotalPedido = precoTotalPedido;


    // Adicionando o botão "Finalizar Pedido"
    const btnFinalizarPedido = document.createElement('button');
    btnFinalizarPedido.textContent = 'Finalizar Pedido ';
    btnFinalizarPedido.classList.add('btn', 'btn-success', 'btn-finalizar'); // Adicione classes para estilização

    // Adicionando um ícone de dinheiro usando Bootstrap Icons
    const icon = document.createElement('i');
    icon.classList.add('bi', 'bi-cash-coin'); // Classes do Bootstrap Icons
    btnFinalizarPedido.appendChild(icon);


    // Adiciona o evento de clique para finalizar o pedido (coloque aqui a lógica de finalização do pedido)
    btnFinalizarPedido.addEventListener('click', () => {

        if (precoTotalPedido != 0) {
            if (confirm('Deseja realmente finalizar o pedido? O pedido não poderá ser alterado!')) {
                finalizarPedido(pedido);
                pedido = [];
                exibirPedido();
            } else {
                exibirPedido();
            }
        } else {
            alert('Carrinho Vazio! Adicione ao menos um produto')
            return;
        }
    });

    cellFinalizar.appendChild(btnFinalizarPedido);
}

// Obter todos os botões de adição
const botoesAdicionar = document.querySelectorAll('.btn-success');

// Adicionar evento de clique a todos os botões de adição
botoesAdicionar.forEach(botao => {
    botao.addEventListener('click', () => {
        const tr = botao.closest('.produto');
        const nome = tr.getElementsByTagName('td')[0].textContent;
        const preco = parseFloat(tr.getElementsByTagName('td')[2].textContent.replace(',', '.'));
        const quantidade = parseFloat(tr.querySelector('.quant-produto').value);

        adicionarProduto(nome, preco, quantidade);
    });
});

