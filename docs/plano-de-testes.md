# 7 Plano de Testes

Este plano de testes foi elaborado para validar a qualidade da interface do projeto `Raizes do Nordeste`, com foco nos fluxos principais, responsividade, usabilidade e atendimento aos requisitos de privacidade e LGPD.

## Objetivo

Validar se o prototipo atende aos requisitos funcionais e nao funcionais definidos no roteiro da atividade, garantindo:
- navegacao coerente do cadastro ao pedido;
- clareza no checkout com integracao externa simulada;
- funcionamento do acompanhamento do pedido e da fidelidade;
- presenca explicita de consentimento, transparencia e controle de dados;
- comportamento responsivo em diferentes tamanhos de tela.

## Ambiente de Execucao Sugerido

- Navegadores: Chrome e Edge em versoes atuais.
- Resolucao mobile: `390 x 844`.
- Resolucao tablet: `768 x 1024`.
- Resolucao desktop: `1366 x 768` ou superior.
- Pre-condicao recomendada: limpar `localStorage` antes de executar a bateria completa.

## Tabela de Casos de Teste

| Teste | Entrada | Resultado Esperado |
| --- | --- | --- |
| Cadastro valido | Preencher nome, e-mail, telefone, senha, canal, objetivo e aceitar consentimento | Conta criada com sucesso, sessao iniciada e redirecionamento para a selecao de unidade |
| Cadastro sem LGPD | Preencher os dados, mas nao marcar o aceite obrigatorio | Envio bloqueado pelo formulario e cadastro nao concluido |
| Cadastro com e-mail ja existente | Informar e-mail ja cadastrado no sistema | Exibicao de mensagem informando que ja existe conta com esse e-mail |
| Login valido | Informar credenciais corretas de cliente ou admin | Sessao iniciada com redirecionamento para o fluxo correspondente |
| Login invalido | Informar e-mail inexistente ou senha incorreta | Exibicao de mensagem de erro e permanencia na tela |
| Acesso como visitante | Acionar o botao de entrada como visitante | Sessao temporaria criada e redirecionamento para unidades |
| Selecionar unidade, canal e modalidade | Alterar canal, modalidade e escolher uma unidade disponivel | Contexto atualizado, unidade salva e abertura do cardapio correto |
| Visualizar cardapio por unidade | Abrir o cardapio apos selecionar uma unidade | Lista de produtos filtrada pela unidade, com campanhas e resumo do pedido |
| Adicionar produto | Acionar `Adicionar ao pedido` em um item valido | Item incluido no carrinho, total parcial atualizado e feedback visual exibido |
| Carrinho vazio ao pagar | Tentar acessar pagamento sem itens no carrinho | Checkout bloqueado, exibicao de estado vazio e CTA para voltar ao cardapio |
| Aplicar desconto promocional | Montar pedido que atinja o valor minimo de uma campanha ativa | Desconto calculado automaticamente no resumo do carrinho e do checkout |
| Pagamento sem consentimentos | Preencher dados do checkout, mas nao marcar os dois aceites obrigatorios | Envio bloqueado pelo formulario e pagamento nao processado |
| Pagamento aprovado | Preencher checkout corretamente e confirmar envio | Pedido criado, carrinho limpo, pontos creditados e redirecionamento para `pedido.html` |
| Pagamento recusado ou falha simulada | Simular retorno negativo da integracao externa | Mensagem de erro exibida, pedido nao confirmado e botao reabilitado para nova tentativa |
| Status do pedido | Acompanhar a tela de pedido apos confirmacao | Timeline atualizada progressivamente entre recebido, pagamento aprovado, preparo, pronto e concluido |
| Fidelidade | Concluir pedido com valor valido | Pontos somados corretamente e exibidos na tela de fidelidade |
| Resgate de recompensa | Tentar resgatar premio com pontos suficientes e insuficientes | Resgate concluido quando houver saldo; mensagem de bloqueio quando nao houver pontos suficientes |
| Exportacao de dados locais | Acionar `Exportar dados locais` na tela de perfil | Exibicao estruturada dos dados locais gravados no navegador |
| Exclusao de dados locais | Acionar `Excluir dados locais` e confirmar a acao | Dados locais removidos, aplicacao reinicializada e ambiente limpo |
| LGPD visivel na interface | Navegar pela home, cadastro, checkout, perfil e admin | Finalidade dos dados, consentimentos e status de privacidade exibidos de forma clara |
| Responsividade mobile, tablet e desktop | Executar os fluxos principais em diferentes larguras de tela | Layout adaptado sem sobreposicao, perda de conteudo ou quebra dos formularios |

## Observacoes de Aderencia ao Prototipo

- O prototipo atual nao possui campo de cupom manual. O desconto e validado por campanhas/promocoes aplicadas automaticamente quando o pedido atinge o valor minimo.
- O cenario de `Pagamento recusado ou falha simulada` deve ser tratado como teste negativo planejado da integracao externa simulada, pois o fluxo padrao da interface representa aprovacao com retorno visual.
- Os testes de LGPD devem observar especialmente os aceites no cadastro, o banner de consentimento, os consentimentos do checkout, o status no perfil e a visao de privacidade no painel admin.

## Conclusao do Plano

Com essa bateria, o projeto cobre os fluxos centrais pedidos no roteiro e ainda valida os pontos que mais pesam para a avaliacao da atividade: jornada do usuario, bloqueios de erro, clareza operacional, responsividade e demonstracao explicita de privacidade na interface.
