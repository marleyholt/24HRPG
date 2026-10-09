Sequencia modular:

#####CONCEITOS
- Narrador: Agente de IA que vamos programar para fazer a narrativa, e modificações diretas nas fichas do jogador, com base nos resultados de suas decisões, baseadas no sistema do jogo.

Início: Tela de Login obrigatória com botão de “manter conectado” que sustenta uma sessão logada através do cache do navegador, caso o usuário atualize, a página.

Módulo 0: Grimório de Campanhas (Concluido)

Ao selecionar a campanha, a janela passa a exibir as seguintes janelas, com gestão de acesso de usuários pelo email, para que somente aquele usuário veja os dados da campanha que esta vinculado.

Módulo 1: Criação e Ficha de Personagem

Inserir um contador de pontos de experiencia, que o narrador vai oferecer por superar desafios matar monstros e afins e gerenciar o lv up de todos.

Se a campanha ainda não tiver nenhum personagem vinculado aquele acesso, exibe o modal de criação de personagem, seguindo as regras do sistema. No multiplayer, inserir caixa para marcar como “Visivel para party” caso deseje compartilhar as informações da sua ficha com seus companheiros, essa opção pode ser alterada na ficha futuramente.

Modo Singleplayer: Se já tiver personagem criado, exibe a ficha do jogador completa. A partir de agora, alterações só serão autorizadas quando o narrador informar que você PASSOU DE NÍVEL ou GERENCIAR RECURSOS (armas, equipamentos, munições, suprimentos, etc) sendo este último apenas em momentos de preparação de missão (safe zone) ou em um mercador (área de compra e venda de suprimentos e equipamentos)

Modo Multiplayer: Se já tiver personagem criado, exibe a ficha do jogador completa. A partir de agora, alterações só serão autorizadas quando o narrador informar que você PASSOU DE NÍVEL ou GERENCIAR RECURSOS (armas, equipamentos, munições, suprimentos, etc) sendo este último apenas em momentos de preparação de missão (safe zone) ou em um mercador (área de compra e venda de suprimentos e equipamentos). Se seus colegas de party tiverem marcado “visível para party” na ficha deles, você poderá visualiza-las tamb´pem aqui, e ter um modal de seleção da ficha como um rolo de fotos, com a imagem do player.
é importante que nesse modulo, na parte de criação de ficha, ao selecionar pericias, dons, raças, vantagens ou desvanteagens que alterem modificadores e atributos, elas devem refletir imediatamente nos indicadores finais e no total de atributos a sere distribuidos. a ideia é que na parte de cima da tela, apareça um resumo fixado da fixa com os indicadores e atributos e abaixos as perguntas e respostas com tela de rolagem ou talvez um do lado do outro. vamos testar para ver como fica melhor de ver.
o lance é que as alterações e calculos e recalculso de tudo deve ser em tempo real, pro jogador conseguir montar sua build sem fazer conta na mão ou de cabeça. SIGA SEMPRE ESTRITAMENTE AS REGRAS DO SISTEMA.

Módulo 2: Narração

Aqui usaremos o layout exato com todas as funções da aba Discord, removendo apenas a função de criar canais, e préfixando os seguintes canais pré definidos:
1 Narrativa
2 Rolagens (somente aqui poderá ser usado o script do rolador de dados)
3 Anotações

Módulo 3: Resumo da Campanha

Basicamente resumir tudo que a campanha tem.

módulo 4: mesa 

local onde o Narrador vai criar cards com os inimigos e aliados (NPC), para o jogador poder saber com o que está lidando e gerenciar os RECURSOS





