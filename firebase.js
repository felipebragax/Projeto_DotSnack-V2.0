const firebaseConfig = {
    apiKey: "AIzaSyAzP9SYJDFGZ4pzEI84rmNgd1fjvZ5yw1I",
    authDomain: "gti-felipe.firebaseapp.com",
    databaseURL: "https://gti-felipe-default-rtdb.firebaseio.com",
    projectId: "gti-felipe",
    storageBucket: "gti-felipe.appspot.com",
    messagingSenderId: "683033211368",
    appId: "1:683033211368:web:16ae4d76db6bcfe845745d"
};

//Inicializando o Firebase
firebase.initializeApp(firebaseConfig)
//Definindo a URL padrão do site
const urlApp = 'http://127.0.0.1:5500';

function logaGoogle() {
    //alert('você cliclou!😉') //Tecla Windows + . para inserir emoji
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            window.location.href = 'menu.html'//redireciona para outra página
        }).catch((error) => {
            alert(`Erro ao efetuar login: ${error.message}`)
        })
}
// Função para lidar com o login usando e-mail e senha
function logaEmail(event) {
    event.preventDefault(); // Impede o comportamento padrão do evento (por exemplo, envio de formulário)

    // Obtém o valor do campo de entrada de e-mail
    const email = document.getElementById('email').value;

    // Obtém o valor do campo de entrada de senha
    const senha = document.getElementById('senha').value;

    // Utiliza o método de autenticação do Firebase para fazer login com e-mail e senha
    firebase.auth().signInWithEmailAndPassword(email, senha)
        .then(response => {
            // Se o login for bem-sucedido, redireciona para a página "menu.html"
            window.location.href = "menu.html";
        }).catch(function (error) {
            // Se houver um erro durante o login, exibe um alerta com uma mensagem de erro
            alert(`Não foi possível logar o usuário: ${errors[error.code]}`);
        });
}

function cadastrar(event) {
    event.preventDefault();

    const button = document.getElementById('cadast');
    const email = document.getElementById('em@il').value;
    const senha = document.getElementById('senh@').value;
    const Csenha = document.getElementById('Csenha').value;
    const nome = document.getElementById('name').value;
    const curso = document.getElementById('cursos').value;
    const nasc = document.getElementById('nasc').value;
    const genero = document.getElementById('genero').value;
    const fotoPerfil = document.getElementById('fotoPerfil').files[0];

    // Verifica se os campos obrigatórios estão preenchidos
    if (email.trim() === '' || senha.trim() === '' || Csenha.trim() === '' || nome.trim() === '' || nasc.trim() === '') {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Verifica se as senhas correspondem
    if (senha !== Csenha) {
        alert('As senhas não correspondem!');
        return;
    }

    // Verifica se uma imagem foi selecionada e sua extensão
    if (fotoPerfil) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = fotoPerfil.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            alert('Por favor, selecione uma imagem válida (jpg, jpeg, png, gif).');
            return;
        }
    }

    // Altera o texto do botão para indicar que o cadastro está sendo processado
    button.innerHTML = '<i class="bi bi-hourglass-split"></i> Aguarde';

    // Se todas as verificações passaram, criar usuário no Firebase Authentication
    firebase.auth().createUserWithEmailAndPassword(email, senha)
        .then((result) => {
            const usuarioID = result.user.uid;
            const usuarioRef = firebase.database().ref('usuarios/' + usuarioID);

            // Adicionar detalhes adicionais ao banco de dados
            return usuarioRef.set({
                nome: nome,
                email: email,
                curso: curso,
                usuarioID: usuarioID,
                nascimento: nasc,
                genero: genero
            }).then(() => {
                verificaAutenticacao();

                // Realizar upload da foto de perfil, se uma imagem foi selecionada
                if (fotoPerfil) {
                    const storageRef = firebase.storage().ref(`usuarios/${usuarioID}/${fotoPerfil.name}`);
                    const uploadTask = storageRef.put(fotoPerfil);

                    uploadTask.on('state_changed',
                        (snapshot) => {
                            // Acompanhar progresso do upload aqui, se necessário
                        },
                        (error) => {
                            console.error('Erro ao fazer upload da imagem:', error);
                        },
                        () => {
                            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                usuarioRef.update({ foto: downloadURL }).then(() => {
                                    alert('Usuário cadastrado com sucesso!');
                                    window.location.href = 'menu.html';
                                }).catch((error) => {
                                    console.error('Erro ao atualizar a URL da nova foto:', error);
                                    alert(`Erro ao atualizar dados: ${error.message}`);
                                });
                            });
                        }
                    );
                } else {
                    alert('Usuário cadastrado com sucesso!');
                    window.location.href = 'menu.html';
                }
            });
        })
        .catch(error => {
            alert(`Não foi possível cadastrar o usuário: ${errors[error.code]}`);
            button.innerHTML = '<i class="bi bi-person-plus"></i> Cadastrar';
        });
}




// Verifica se o usuário está autenticado ao tentar carregar a foto de perfil
function verificaAutenticacao() {
    const usuario = firebase.auth().currentUser; // Obtém o usuário autenticado no Firebase Authentication
    if (usuario) {
        console.log('Usuário autenticado:', usuario.uid); // Exibe no console o ID do usuário autenticado
        // Aqui você pode chamar a função de cadastro de usuário, se necessário
    } else {
        console.log('Usuário não autenticado'); // Exibe no console se o usuário não estiver autenticado
    }
}

// Função para verificar se o usuário está logado
function verificaLogado() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) { // Se existir um usuário logado
            // Salvamos o ID do usuário localmente
            localStorage.setItem('usuarioId', user.uid);

            // Elemento onde a imagem do usuário será exibida
            let imagem = document.getElementById('imagemUsuario');

            // Verifica se o usuário fez login por meio de um provedor de terceiros (por exemplo, Google)
            if (user.providerData && user.providerData.length) {
                const provider = user.providerData[0].providerId;
                if (provider === 'google.com') {
                    // Exibe a imagem do perfil do Google ou o logo do Google, se a imagem não estiver disponível
                    if (user.photoURL) {
                        imagem.innerHTML += `<img src="${user.photoURL}" title="${user.displayName}" class="img rounded-circle minhaImagem" width="35" height="35"/>`;
                    } else {
                        imagem.innerHTML += `<img src="images/logo-google.svg" title="${user.displayName}" class="img rounded-circle minhaImagem" height="35" width="35"/>`;
                    }
                } else {
                    // Se não for um login por provedor de terceiros, busca os dados do usuário no banco de dados
                    const usuarioRef = firebase.database().ref(`usuarios/${user.uid}`);
                    usuarioRef.once('value', snapshot => {
                        if (snapshot.exists()) {
                            const usuarioData = snapshot.val();
                            const nomeUsuario = usuarioData.nome;
                            const fotoUsuario = usuarioData.foto;

                            // Exibe a imagem do perfil do usuário ou o logo padrão, se a imagem não estiver disponível
                            if (fotoUsuario) {
                                imagem.innerHTML += `<img src="${fotoUsuario}" title="${nomeUsuario}" class="img rounded-circle minhaImagem" height="35" width="35"/>`;
                            } else {
                                imagem.innerHTML += `<img src="images/logo-google.svg" title="${nomeUsuario}" class="img rounded-circle minhaImagem" height="35" width="35"/>`;
                            }
                        }
                    }).catch(error => {
                        console.error('Erro ao carregar nome do usuário:', error);
                    });
                }
            }

            carregaUsuarios(); // Função para carregar usuários do sistema
            carregarUsuariosGoogle(); // Função para carregar usuários autenticados pelo Google
        } else {
            localStorage.removeItem('usuarioId'); // Remove o ID do usuário localmente
            window.location.href = 'index.html'; // Redireciona para a página de login se não houver usuário logado
        }
    });
}



// Função para fazer logout no Firebase
function logoutFirebase() {
    firebase.auth().signOut() // Chama o método signOut do Firebase Authentication para fazer logout do usuário
        .then(function () {
            localStorage.removeItem('usuarioId'); // Remove o ID do usuário localmente ao fazer logout
            window.location.href = 'index.html'; // Redireciona para a página de login após o logout
        })
        .catch(function (error) {
            alert(`Não foi possível efetuar o logout: ${errors[error.code]}`); // Exibe um alerta em caso de erro durante o logout
        });
}

// Função assíncrona para finalizar um pedido
async function finalizarPedido(pedido) {
    let usuarioAtual = firebase.auth().currentUser; // Obtém o usuário autenticado no Firebase

    try {
        // Obtém uma lista com os nomes dos itens do pedido
        const nomesItens = pedido.map(item => item.nome);

        // Calcula o preço total do pedido somando os preços de cada item multiplicado pela quantidade
        const precoTotal = pedido.reduce((total, item) => {
            return total + (item.preco * item.quantidade);
        }, 0);

        let nomeUsuario = usuarioAtual.displayName; // Obtém o nome do usuário autenticado

        // Se o nome do usuário não estiver definido e se ele fez login por meio de um provedor de terceiros (por ex: Google)
        if (!nomeUsuario && usuarioAtual.providerData && usuarioAtual.providerData.length > 0) {
            // Obtém informações adicionais do usuário no banco de dados
            const snapshot = await firebase.database().ref('usuarios/' + usuarioAtual.uid).once('value');
            const usuarioData = snapshot.val();
            if (usuarioData && usuarioData.nome) {
                nomeUsuario = usuarioData.nome; // Define o nome do usuário com base nos dados do banco de dados
            }
        }

        // Cria um resumo do pedido com informações como nomes dos itens, ID do usuário, preço total, nome do usuário e timestamp
        const pedidoResumo = {
            nomesItens: nomesItens,
            uid: usuarioAtual.uid,
            precoTotal: precoTotal.toFixed(2), // Formata o preço total com duas casas decimais
            nomeUsuario: nomeUsuario,
            timestamp: firebase.database.ServerValue.TIMESTAMP // Adiciona um timestamp do servidor
        };

        // Cria um detalhamento do pedido com informações de cada item (nome, quantidade, valor unitário)
        const pedidoDetalhado = pedido.map(item => {
            return {
                nome: item.nome,
                quantidade: item.quantidade,
                valorUnitario: item.preco
            };
        });

        // Cria uma nova referência para o pedido no banco de dados e define os dados do resumo do pedido
        const novoPedidoRef = await firebase.database().ref('pedidos').push();
        await novoPedidoRef.set(pedidoResumo);

        // Define os detalhes dos itens do pedido na referência do novo pedido criado
        await novoPedidoRef.child('itens').set(pedidoDetalhado);

        alert('✔ Pedido incluído com sucesso!'); // Exibe um alerta informando que o pedido foi incluído com sucesso
    } catch (error) {
        alert(`❌ Erro ao finalizar: ${errors[error.code]}`); // Exibe um alerta em caso de erro ao finalizar o pedido
    }
}


// Função assíncrona para carregar os pedidos do usuário
async function carregaPedidos() {
    let tabela = document.getElementById('dadosTabelaPedidos'); // Obtém a referência da tabela onde os pedidos serão exibidos
    let usuarioAtual = firebase.auth().currentUser; // Obtém o usuário atualmente autenticado

    if (!usuarioAtual) {
        // Se o usuário não está definido, aguarda a autenticação antes de carregar os pedidos
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                usuarioAtual = user; // Define o usuário atual após a autenticação
                carregarPedidos(usuarioAtual, tabela); // Chama a função para carregar os pedidos, passando o usuário e a tabela como parâmetros
            } else {
                // Usuário não autenticado
                console.log('Usuário não autenticado');
            }
        });
    } else {
        // Se o usuário já está definido, carrega os pedidos imediatamente
        carregarPedidos(usuarioAtual, tabela); // Chama a função para carregar os pedidos, passando o usuário e a tabela como parâmetros
    }
}

// Função para carregar os pedidos na tabela, recebendo o usuário atual e a referência da tabela
function carregarPedidos(usuarioAtual, tabela) {
    // Acessa a referência 'pedidos' no banco de dados, ordenando-os por chave, e obtém os dados uma vez
    firebase.database().ref('pedidos').orderByKey().once('value', (snapshot) => {
        // Limpa o conteúdo da tabela e insere a primeira linha com cabeçalhos
        tabela.innerHTML = `
            <tr class='table-warning '>
                <th>Nome do Usuário</th>
                <th>ID do Pedido</th>
                <th>Itens</th>
                <th>Preço Total</th>
                <th>Opções</th>
            </tr>`;

        // Verifica se há algum pedido existente no snapshot
        if (!snapshot.exists()) {
            // Se não houver pedidos, cria uma linha na tabela informando que não há pedidos
            const semPedidosLinha = tabela.insertRow();
            const celulaSemPedidos = semPedidosLinha.insertCell();
            celulaSemPedidos.textContent = 'Ainda não existe nenhum pedido no sistema!';
            celulaSemPedidos.colSpan = 5; // Mescla as colunas para preencher a linha
            celulaSemPedidos.classList.add('table-danger');
        } else {
            // Se houver pedidos, itera sobre cada pedido no snapshot
            snapshot.forEach((pedido) => {
                const pedidoData = pedido.val(); // Obtém os dados do pedido
                const pedidoID = pedido.key; // Obtém o ID do pedido

                // Insere uma nova linha na tabela e preenche as células com os dados do pedido
                const novaLinha = tabela.insertRow();
                novaLinha.insertCell().textContent = pedidoData.nomeUsuario; // Nome do usuário
                novaLinha.insertCell().textContent = pedidoID; // ID do pedido
                novaLinha.insertCell().textContent = pedidoData.nomesItens.join(', '); // Itens do pedido
                novaLinha.insertCell().textContent = `R$ ${pedidoData.precoTotal}`; // Preço total do pedido

                const botoesCell = novaLinha.insertCell(); // Célula para os botões de ação

                // Verifica se o usuário atual é o mesmo que fez o pedido para definir os botões apropriados
                if (usuarioAtual.uid === pedidoData.uid) {
                    // Se for o usuário que fez o pedido, cria um botão para remover o pedido
                    const removerBtn = document.createElement('button');
                    removerBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger');
                    removerBtn.innerHTML = '<i class="bi bi-trash3-fill"></i> Excluir';
                    removerBtn.onclick = () => removerPedido(pedidoID); // Chama a função para remover o pedido

                    botoesCell.appendChild(removerBtn); // Adiciona o botão na célula de botões
                } else {
                    // Se não for o usuário que fez o pedido, mostra um botão indisponível
                    const indisponivelBtn = document.createElement('button');
                    indisponivelBtn.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
                    indisponivelBtn.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Indisponível';

                    botoesCell.appendChild(indisponivelBtn); // Adiciona o botão na célula de botões
                }
            });
        }
    });
}




// Função para carregar os usuários na tabela
function carregaUsuarios() {
    const tabelaUsuarios = document.getElementById('dadosTabelaUsuarios'); // Obtém a referência da tabela de usuários no HTML
    const usuarioAtual = firebase.auth().currentUser; // Obtém o usuário atualmente autenticado

    if (!usuarioAtual) {
       
        return;
    }

    // Acessa a referência 'usuarios' no banco de dados e obtém os dados uma vez
    firebase.database().ref('usuarios').once('value', (snapshot) => {

        // Limpa o conteúdo da tabela e insere a primeira linha com cabeçalhos
        tabelaUsuarios.innerHTML = `
            <tr class='table-success'>
                <th>Id do Usuário</th>
                <th>Nome</th>
                <th>Nascimento</th>
                <th>Gênero</th>
                <th>Email</th>
                <th>Curso</th>
                <th>Ações</th>
            </tr>`

        // Verifica se há algum usuário cadastrado no snapshot
        if (!snapshot.exists()) {
            // Se não houver usuários, cria uma linha na tabela informando que não há usuários cadastrados e encerra a função
            tabelaUsuarios.innerHTML += `
                <tr class='table-danger'>
                    <td colspan='7'>Não existem usuários cadastrados.</td>
                </tr>`;
            return;
        }
        // Itera sobre cada usuário no snapshot
        snapshot.forEach((usuario) => {
            const usuarioData = usuario.val(); // Obtém os dados do usuário
            const usuarioID = usuario.key; // Obtém o ID do usuário

            // Insere uma nova linha na tabela e preenche as células com os dados do usuário
            const novaLinha = tabelaUsuarios.insertRow();
            novaLinha.insertCell().textContent = usuarioID; // ID do usuário
            novaLinha.insertCell().textContent = usuarioData.nome || '-'; // Nome do usuário (ou '-' se não houver)
            novaLinha.insertCell().textContent = usuarioData.nascimento || '-'; // Data de nascimento (ou '-' se não houver)
            novaLinha.insertCell().textContent = usuarioData.genero || '-'; // Gênero (ou '-' se não houver)
            novaLinha.insertCell().textContent = usuarioData.email || '-'; // Email (ou '-' se não houver)
            novaLinha.insertCell().textContent = usuarioData.curso || '-'; // Curso (ou '-' se não houver)

            const cellAcoes = novaLinha.insertCell(); // Célula para os botões de ação

            // Verifica se o usuário atual é o mesmo que está sendo exibido na linha atual da tabela
            if (usuarioAtual.uid === usuarioID) {
                // Se for o usuário atual, cria botões para editar e excluir o usuário
                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-sm', 'btn-outline-warning', 'me-1');
                btnEditar.innerHTML = '<i class="bi bi-pencil-square"></i> Editar';
                btnEditar.onclick = () => {
                    window.location.href = 'edicao.html'; // Redireciona para a página de edição do usuário
                }

                const btnExcluir = document.createElement('button');
                btnExcluir.classList.add('btn', 'btn-sm', 'btn-outline-danger');
                btnExcluir.innerHTML = '<i class="bi bi-person-x"></i> Excluir';
                btnExcluir.onclick = () => excluirUsuario(usuarioID); // Chama a função para excluir o usuário

                cellAcoes.appendChild(btnEditar); // Adiciona o botão de editar na célula de ações
                cellAcoes.appendChild(btnExcluir); // Adiciona o botão de excluir na célula de ações
            } else {
                // Se não for o usuário atual, mostra um botão indisponível
                const btnIndisponivel = document.createElement('button');
                btnIndisponivel.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
                btnIndisponivel.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Indisponível';

                cellAcoes.appendChild(btnIndisponivel); // Adiciona o botão indisponível na célula de ações
            }
        });
    });
}


// Função assíncrona para excluir um usuário
async function excluirUsuario(usuarioID) {
    // Confirmação com o usuário para verificar se deseja realmente excluir o usuário
    if (confirm('Deseja realmente excluir o usuário?')) {
        const user = firebase.auth().currentUser; // Obtém o usuário atualmente autenticado

        // Prompt para o usuário inserir a senha atual para confirmar a exclusão
        const senhaAtual = prompt('Digite sua senha atual:');

        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            senhaAtual
        ); // Cria credenciais de autenticação com base no email e senha fornecidos

        try {
            // Reautentica o usuário atual com as credenciais fornecidas
            await user.reauthenticateWithCredential(credential);

            // Exclui o usuário autenticado
            await user.delete();

            // Exclui os dados do usuário da coleção "usuarios" no banco de dados
            await firebase.database().ref(`usuarios/${usuarioID}`).remove();

            alert('Usuário excluído com sucesso.'); // Exibe um alerta informando que o usuário foi excluído com sucesso
            console.log('Usuário excluído com sucesso'); // Registra no console que o usuário foi excluído com sucesso
        } catch (error) {
            console.error('Erro ao excluir usuário:', error.message); // Registra no console caso ocorra um erro durante a exclusão
            alert('Erro ao excluir usuário:', error.message); // Exibe um alerta em caso de erro durante a exclusão
        }
    }
}


function editarUsuario(event) {
    event.preventDefault(); // Previne o comportamento padrão do evento (submissão do formulário)

    const btnSalvar = document.getElementById('btnSalvar'); // Referência ao botão de salvar

    // Obtenção dos valores dos campos do formulário
    const novoNome = document.getElementById('novoNome').value;
    const novaNasc = document.getElementById('novaNasc').value;
    const novoCurso = document.getElementById('novoCurso').value;
    const novoGenero = document.getElementById('novoGenero').value;
    const novaFotoPerfil = document.getElementById('novaFotoPerfil').files[0]; // Nova foto de perfil

    const usuarioAtual = firebase.auth().currentUser; // Obtém o usuário atual

    if (usuarioAtual) { // Verifica se há um usuário autenticado
        // Verifica se o nome e a data de nascimento não estão vazios
        if (novoNome.trim() !== '' && novaNasc.trim() !== '') {
            // Verifica se há uma nova foto de perfil selecionada e a extensão do arquivo
            if (novaFotoPerfil) {
                // Verifica a extensão da imagem selecionada
                const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                const fileExtension = novaFotoPerfil.name.split('.').pop().toLowerCase();

                if (!allowedExtensions.includes(fileExtension)) {
                    // Alerta se a extensão do arquivo não for suportada
                    alert('Extensão de arquivo não suportada. Por favor, selecione uma imagem com as extensões: jpg, jpeg, png ou gif.');
                    return;
                }
            }

            // Confirmação da alteração dos dados
            if (confirm('Confirma a alteração dos dados?')) {

                btnSalvar.innerHTML = ''; // Limpa o texto existente no botão antes de definir 'Aguarde'
                btnSalvar.innerHTML = `<i class="bi bi-hourglass-split"></i> Aguarde`; // Define o texto do botão para indicar que está processando

                const usuarioRef = firebase.database().ref(`usuarios/${usuarioAtual.uid}`); // Referência ao nó do usuário no banco de dados

                // Atualiza os dados do usuário no banco de dados
                usuarioRef.update({
                    nome: novoNome,
                    nascimento: novaNasc,
                    curso: novoCurso,
                    genero: novoGenero
                }).then(() => {
                    // Se houver nova foto de perfil selecionada, realiza o upload
                    if (novaFotoPerfil) {
                        const storageRef = firebase.storage().ref(`usuarios/${usuarioAtual.uid}/${novaFotoPerfil.name}`);
                        const uploadTask = storageRef.put(novaFotoPerfil);

                        uploadTask.on('state_changed',
                            (snapshot) => {
                                // Acompanha o progresso do upload aqui, se necessário
                            },
                            (error) => {
                                console.error('Erro ao fazer upload da nova imagem:', error);
                            },
                            () => {
                                // Upload concluído com sucesso
                                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                                    // Salva a URL da nova imagem no banco de dados
                                    usuarioRef.update({ foto: downloadURL }).then(() => {
                                        // Alerta e redirecionamento para o menu após a conclusão do processo
                                        alert('Dados editados com sucesso! Redirecionando para o Menu');
                                        window.location.href = 'menu.html';
                                    }).catch((error) => {
                                        // Tratamento de erro ao atualizar a URL da nova foto
                                        console.error('Erro ao atualizar a URL da nova foto:', error);
                                        alert(`Erro ao atualizar dados: ${error.message}`);

                                        // Restauração do texto do botão em caso de erro
                                        btnSalvar.innerHTML = `<i class="bi bi-person-fill-check"></i> Alterar`;
                                    });
                                });
                            }
                        );
                    } else {
                        // Alerta e redirecionamento para o menu após a conclusão do processo
                        alert('Dados editados com sucesso! Redirecionando para o Menu');
                        window.location.href = 'menu.html';
                    }
                }).catch(error => {
                    // Tratamento de erro ao atualizar os dados do usuário no banco de dados
                    console.error('Erro ao atualizar os dados do usuário:', error);
                    alert(`Erro ao atualizar dados: ${error.message}`);

                    // Restauração do texto do botão em caso de erro
                    btnSalvar.innerHTML = `<i class="bi bi-person-fill-check"></i> Alterar`;
                });
            } else {
                // Reset do formulário em caso de cancelamento da edição
                const form = document.getElementById('formDeEdicao');
                form.reset();
                return;
            }
        } else {
            // Alerta se campos obrigatórios estiverem vazios
            alert('Por favor, preencha ao menos o nome e a data de nascimento.');
        }
    }
}



function carregaEmail(event) {
    event.preventDefault(); // Impede o comportamento padrão do evento (prevenção de submissão do formulário)

    const campoEmail = document.getElementById('novoEmail'); // Obtém a referência ao campo de e-mail no formulário
    const notifDiv = document.getElementById('notif'); // Obtém a referência à div 'notif' onde será exibida a mensagem

    const usuarioLogado = firebase.auth().currentUser; // Obtém o usuário atualmente autenticado
    const emailUsuario = usuarioLogado.email; // Obtém o email do usuário autenticado

    campoEmail.value = emailUsuario; // Define o valor do campo de e-mail como o e-mail do usuário logado

    // Mensagem a ser exibida na div 'notif'
    const mensagem = "A função de alterar o e-mail é bloqueada por segurança. Caso necessite contate o Admin!";
    notifDiv.textContent = mensagem; // Define o texto da div 'notif' como a mensagem acima para informar que a função está bloqueada por questões de segurança
}




function removerPedido(pedidoID) {
    // Lógica para remover o pedido com o ID específico do Firebase

    const confirmacao = confirm('Tem certeza que deseja excluir este pedido?'); // Exibe uma caixa de diálogo de confirmação ao usuário

    if (confirmacao) { // Se a confirmação for verdadeira (usuário confirmou)
        firebase.database().ref(`pedidos/${pedidoID}`).remove(); // Remove o pedido com o ID específico do nó 'pedidos' no Firebase Realtime Database
        carregaPedidos(); // Recarrega a lista de pedidos após a remoção
    } else {
        carregaPedidos(); // Recarrega a lista de pedidos, pois o usuário cancelou a remoção
    }
}




firebase.auth().onAuthStateChanged((user) => { // Observa mudanças no estado de autenticação do usuário
    if (user) { // Se há um usuário autenticado
        const usuarioAtual = firebase.auth().currentUser; // Obtém o usuário atualmente autenticado
        const emailUsuario = usuarioAtual.email; // Obtém o e-mail do usuário

        let usuarioGoogleExists = false; // Inicializa variável para verificar se o usuário existe no banco de dados "usuariosGoogle"
        let usuarioExists = false; // Inicializa variável para verificar se o usuário existe no banco de dados "usuarios"

        // Verifica se o usuário existe no banco de dados "usuariosGoogle" com o mesmo email
        firebase.database().ref('usuariosGoogle').orderByChild('email').equalTo(emailUsuario).once('value')
            .then((snapshotGoogle) => {
                usuarioGoogleExists = snapshotGoogle.exists(); // Atualiza a variável com base na existência do usuário no banco de dados "usuariosGoogle"

                // Verifica se o usuário existe no banco de dados "usuarios" com o mesmo email
                return firebase.database().ref('usuarios').orderByChild('email').equalTo(emailUsuario).once('value');
            })
            .then((snapshotUsuarios) => {
                usuarioExists = snapshotUsuarios.exists(); // Atualiza a variável com base na existência do usuário no banco de dados "usuarios"

                if (!usuarioGoogleExists && !usuarioExists) { // Se o usuário não existe em nenhum dos bancos de dados
                    const nomeUsuario = usuarioAtual.displayName; // Obtém o nome do usuário
                    const provedor = 'Google'; // Define o provedor como 'Google'
                    const idUsuario = usuarioAtual.uid; // Obtém o ID do usuário

                    // Cria um novo registro para o usuário no banco de dados "usuariosGoogle"
                    firebase.database().ref('usuariosGoogle').push({
                        nome: nomeUsuario,
                        email: emailUsuario,
                        provedor: provedor,
                        id: idUsuario
                    })
                        .then(() => {
                            console.log('Novo usuário do Google cadastrado com sucesso em usuariosGoogle'); // Exibe mensagem de sucesso
                        })
                        .catch((error) => {
                            console.error('Erro ao salvar informações do usuário do Google em usuariosGoogle:', error.message); // Exibe mensagem de erro se houver algum problema
                        });
                } else {
                    console.log('Usuário já existe em pelo menos um dos bancos de dados'); // Informa que o usuário já está registrado em algum banco de dados
                }
            })
            .catch((error) => {
                console.error('Erro ao verificar se o usuário existe nos bancos de dados:', error.message); // Exibe mensagem de erro caso haja problema na verificação
            });
    }
});


function verificaDonoRegistro(usuarioID, usuarioAtual) {
    return usuarioAtual && usuarioAtual.uid === usuarioID;
}

function carregarUsuariosGoogle() {
    // Obtém a referência do elemento HTML que representa a tabela de usuários do Google
    const tabelaUsuariosGoogle = document.getElementById('dadosTabelaUsuariosGoogle');

    // Listener para detectar mudanças na autenticação do Firebase
    firebase.auth().onAuthStateChanged((user) => {
        // Verifica se há um usuário autenticado
        if (user) {
            // Obtém o usuário autenticado no Firebase
            const usuarioAtual = firebase.auth().currentUser;

            // Acessa a referência da base de dados para os usuários do Google
            firebase.database().ref('usuariosGoogle').once('value')
                .then((snapshot) => {
                    // Limpa o conteúdo da tabela e define o cabeçalho
                    tabelaUsuariosGoogle.innerHTML = `
                        <tr class='table-info'>
                            <th>Id do Usuário</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Provedor</th>
                            <th>Ações</th>
                        </tr>`;

                    // Verifica se não existem usuários cadastrados
                    if (!snapshot.exists()) {
                        // Adiciona uma linha informando que não há usuários cadastrados
                        tabelaUsuariosGoogle.innerHTML += `
                            <tr class='table-danger'>
                                <td colspan='5'>Não existem usuários cadastrados.</td>
                            </tr>`;
                        return; // Encerra a função
                    }

                    // Itera sobre cada usuário retornado pela consulta
                    snapshot.forEach((usuario) => {
                        const usuarioData = usuario.val(); // Obtém os dados do usuário
                        const usuarioEmail = usuarioData.email || '-'; // Obtém o email ou define um valor padrão '-'
                        const usuarioID = usuarioData.id; // Obtém o ID do usuário

                        // Cria uma nova linha na tabela e preenche as células com os dados do usuário
                        const novaLinha = tabelaUsuariosGoogle.insertRow();
                        novaLinha.insertCell().textContent = usuarioData.id || '-';
                        novaLinha.insertCell().textContent = usuarioData.nome || '-';
                        novaLinha.insertCell().textContent = usuarioEmail;
                        novaLinha.insertCell().textContent = usuarioData.provedor || '-';
                        const cellAcoes = novaLinha.insertCell();

                        // Verifica se o usuário logado é o dono do registro atual
                        if (verificaDonoRegistro(usuarioID, usuarioAtual)) {
                            // Cria um botão para excluir a conta e define um evento de clique
                            const btnExcluir = document.createElement('button');
                            btnExcluir.classList.add('btn', 'btn-sm', 'btn-outline-danger');
                            btnExcluir.innerHTML = '<i class="bi bi-person-x"></i> Excluir conta';
                            btnExcluir.onclick = () => excluirContaGoogle(usuarioID);

                            // Adiciona o botão à célula de ações da tabela
                            cellAcoes.appendChild(btnExcluir);
                        } else {
                            // Cria um botão indisponível para usuários que não são donos do registro
                            const btnIndisponivel = document.createElement('button');
                            btnIndisponivel.classList.add('btn', 'btn-sm', 'btn-outline-secondary');
                            btnIndisponivel.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> Indisponível';

                            // Adiciona o botão indisponível à célula de ações da tabela
                            cellAcoes.appendChild(btnIndisponivel);
                        }
                    });
                })
                .catch((error) => {
                    // Em caso de erro ao carregar os usuários do Google, exibe uma mensagem de erro no console
                    console.error('Erro ao carregar usuários do Google:', error.message);
                });
        } else {
            // Se não houver usuário autenticado, exibe uma mensagem no console
            console.log('Usuário não autenticado.');
        }
    });
}






function excluirContaGoogle(usuarioID) {
    // Solicita uma confirmação para excluir a conta do Google
    const confirmacao = confirm('Tem certeza que deseja excluir sua conta?');

    if (confirmacao) { // Se a confirmação for positiva
        const usuarioAtual = firebase.auth().currentUser; // Obtém o usuário atualmente autenticado

        firebase.database().ref('usuariosGoogle/' + usuarioID).remove() // Remove os dados do usuário do banco de dados 'usuariosGoogle'
            .then(() => {
                logoutFirebase(); // Realiza o logout do usuário
                return usuarioAtual.unlink('google.com'); // Desvincula a conta do Google

            })
            .then(() => {
                console.log('Conta do usuário do Google excluída com sucesso'); // Exibe uma mensagem indicando a exclusão bem-sucedida
                carregarUsuariosGoogle(); // Atualiza a tabela de usuários do Google após a exclusão

            })
            .catch((error) => {
                // Em caso de erro, pode ser tratado aqui
            });
    }
}



//mapear códigos de erro que podem ser recebidos ao trabalhar com autenticação no Firebase
const errors = {
    'auth/app-deleted': 'O banco de dados não foi localizado.',
    'auth/invalid-login-credentials': 'Usuário não cadastrado',
    'auth/expired-action-code': 'O código da ação o ou link expirou.',
    'auth/invalid-action-code': 'O código da ação é inválido. Isso pode acontecer se o código estiver malformado ou já tiver sido usado.',
    'auth/user-disabled': 'O usuário correspondente à credencial fornecida foi desativado.',
    'auth/user-not-found': 'O usuário não correponde à nenhuma credencial.',
    'auth/weak-password': 'A senha é muito fraca. Deve conter ao menos 6 caracteres',
    'auth/email-already-in-use': 'Já existi uma conta com o endereço de email fornecido.',
    'auth/invalid-email': 'O endereço de e-mail não é válido.',
    'auth/operation-not-allowed': 'O tipo de conta correspondente à esta credencial, ainda não encontra-se ativada.',
    'auth/account-exists-with-different-credential': 'E-mail já associado a outra conta.',
    'auth/auth-domain-config-required': 'A configuração para autenticação não foi fornecida.',
    'auth/credential-already-in-use': 'Já existe uma conta para esta credencial.',
    'auth/operation-not-supported-in-this-environment': 'Esta operação não é suportada no ambiente que está sendo executada. Verifique se deve ser http ou https.',
    'auth/timeout': 'Excedido o tempo de resposta. O domínio pode não estar autorizado para realizar operações.',
    'auth/missing-android-pkg-name': 'Deve ser fornecido um nome de pacote para instalação do aplicativo Android.',
    'auth/missing-continue-uri': 'A próxima URL deve ser fornecida na solicitação.',
    'auth/missing-ios-bundle-id': 'Deve ser fornecido um nome de pacote para instalação do aplicativo iOS.',
    'auth/invalid-continue-uri': 'A próxima URL fornecida na solicitação é inválida.',
    'auth/unauthorized-continue-uri': 'O domínio da próxima URL não está na lista de autorizações.',
    'auth/invalid-dynamic-link-domain': 'O domínio de link dinâmico fornecido, não está autorizado ou configurado no projeto atual.',
    'auth/argument-error': 'Verifique a configuração de link para o aplicativo.',
    'auth/invalid-persistence-type': 'O tipo especificado para a persistência dos dados é inválido.',
    'auth/unsupported-persistence-type': 'O ambiente atual não suportar o tipo especificado para persistência dos dados.',
    'auth/invalid-credential': 'A credencial expirou ou está mal formada.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-verification-code': 'O código de verificação da credencial não é válido.',
    'auth/invalid-verification-id': 'O ID de verificação da credencial não é válido.',
    'auth/custom-token-mismatch': 'O token está diferente do padrão solicitado.',
    'auth/invalid-custom-token': 'O token fornecido não é válido.',
    'auth/captcha-check-failed': 'O token de resposta do reCAPTCHA não é válido, expirou ou o domínio não é permitido.',
    'auth/invalid-phone-number': 'O número de telefone está em um formato inválido (padrão E.164).',
    'auth/missing-phone-number': 'O número de telefone é requerido.',
    'auth/quota-exceeded': 'A cota de SMS foi excedida.',
    'auth/cancelled-popup-request': 'Somente uma solicitação de janela pop-up é permitida de uma só vez.',
    'auth/popup-blocked': 'A janela pop-up foi bloqueado pelo navegador.',
    'auth/popup-closed-by-user': 'A janela pop-up foi fechada pelo usuário sem concluir o login no provedor.',
    'auth/unauthorized-domain': 'O domínio do aplicativo não está autorizado para realizar operações.',
    'auth/invalid-user-token': 'O usuário atual não foi identificado.',
    'auth/user-token-expired': 'O token do usuário atual expirou.',
    'auth/null-user': 'O usuário atual é nulo.',
    'auth/app-not-authorized': 'Aplicação não autorizada para autenticar com a chave informada.',
    'auth/invalid-api-key': 'A chave da API fornecida é inválida.',
    'auth/network-request-failed': 'Falha de conexão com a rede.',
    'auth/requires-recent-login': 'O último horário de acesso do usuário não atende ao limite de segurança.',
    'auth/too-many-requests': 'As solicitações foram bloqueadas devido a atividades incomuns. Tente novamente depois que algum tempo.',
    'auth/web-storage-unsupported': 'O navegador não suporta armazenamento ou se o usuário desativou este recurso.',
    'auth/invalid-claims': 'Os atributos de cadastro personalizado são inválidos.',
    'auth/claims-too-large': 'O tamanho da requisição excede o tamanho máximo permitido de 1 Megabyte.',
    'auth/id-token-expired': 'O token informado expirou.',
    'auth/id-token-revoked': 'O token informado perdeu a validade.',
    'auth/invalid-argument': 'Um argumento inválido foi fornecido a um método.',
    'auth/invalid-creation-time': 'O horário da criação precisa ser uma data UTC válida.',
    'auth/invalid-disabled-field': 'A propriedade para usuário desabilitado é inválida.',
    'auth/invalid-display-name': 'O nome do usuário é inválido.',
    'auth/invalid-email-verified': 'O e-mail é inválido.',
    'auth/invalid-hash-algorithm': 'O algoritmo de HASH não é uma criptografia compatível.',
    'auth/invalid-hash-block-size': 'O tamanho do bloco de HASH não é válido.',
    'auth/invalid-hash-derived-key-length': 'O tamanho da chave derivada do HASH não é válido.',
    'auth/invalid-hash-key': 'A chave de HASH precisa ter um buffer de byte válido.',
    'auth/invalid-hash-memory-cost': 'O custo da memória HASH não é válido.',
    'auth/invalid-hash-parallelization': 'O carregamento em paralelo do HASH não é válido.',
    'auth/invalid-hash-rounds': 'O arredondamento de HASH não é válido.',
    'auth/invalid-hash-salt-separator': 'O campo do separador de SALT do algoritmo de geração de HASH precisa ser um buffer de byte válido.',
    'auth/invalid-id-token': 'O código do token informado não é válido.',
    'auth/invalid-last-sign-in-time': 'O último horário de login precisa ser uma data UTC válida.',
    'auth/invalid-page-token': 'A próxima URL fornecida na solicitação é inválida.',
    'auth/invalid-password': 'A senha é inválida, precisa ter pelo menos 6 caracteres.',
    'auth/invalid-password-hash': 'O HASH da senha não é válida.',
    'auth/invalid-password-salt': 'O SALT da senha não é válido.',
    'auth/invalid-photo-url': 'A URL da foto de usuário é inválido.',
    'auth/invalid-provider-id': 'O identificador de provedor não é compatível.',
    'auth/invalid-session-cookie-duration': 'A duração do COOKIE da sessão precisa ser um número válido em milissegundos, entre 5 minutos e 2 semanas.',
    'auth/invalid-uid': 'O identificador fornecido deve ter no máximo 128 caracteres.',
    'auth/invalid-user-import': 'O registro do usuário a ser importado não é válido.',
    'auth/invalid-provider-data': 'O provedor de dados não é válido.',
    'auth/maximum-user-count-exceeded': 'O número máximo permitido de usuários a serem importados foi excedido.',
    'auth/missing-hash-algorithm': 'É necessário fornecer o algoritmo de geração de HASH e seus parâmetros para importar usuários.',
    'auth/missing-uid': 'Um identificador é necessário para a operação atual.',
    'auth/reserved-claims': 'Uma ou mais propriedades personalizadas fornecidas usaram palavras reservadas.',
    'auth/session-cookie-revoked': 'O COOKIE da sessão perdeu a validade.',
    'auth/uid-alread-exists': 'O indentificador fornecido já está em uso.',
    'auth/email-already-exists': 'O e-mail fornecido já está em uso.',
    'auth/phone-number-already-exists': 'O telefone fornecido já está em uso.',
    'auth/project-not-found': 'Nenhum projeto foi encontrado.',
    'auth/insufficient-permission': 'A credencial utilizada não tem permissão para acessar o recurso solicitado.',
    'auth/internal-error': 'O servidor de autenticação encontrou um erro inesperado ao tentar processar a solicitação.'
}