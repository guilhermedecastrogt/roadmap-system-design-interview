---
title: "Teorema CAP"
slug: cap-theorem
description: "Por que um sistema distribuído não consegue garantir totalmente consistência e disponibilidade durante uma partição de rede — e como os trade-offs AP, CP e CA moldam arquiteturas reais."
category: blocos-fundamentais
order: 70
difficulty: intermediate
status: published
tags: [cap-theorem, sistemas-distribuidos, consistencia, disponibilidade, tolerancia-a-particao, replicacao, trade-offs]
updatedAt: "2026-07-17"
beginnerSummary: >-
  O Teorema CAP fala sobre o que acontece quando a rede entre as máquinas de um sistema
  distribuído quebra (uma partição). Consistência significa que toda leitura retorna a
  escrita bem-sucedida mais recente, não importa qual réplica responda. Disponibilidade
  significa que toda requisição recebe uma resposta, mesmo que ela possa não ser o dado mais
  fresco. Tolerância a partição significa que o sistema continua operando enquanto os nós
  não conseguem se falar. Durante uma partição você não pode ter totalmente consistência e
  disponibilidade ao mesmo tempo: uma réplica que não consegue conferir com as outras precisa
  ou responder assim mesmo (arriscando dado desatualizado — a postura AP) ou se recusar a
  responder (sacrificando disponibilidade — a postura CP). Como redes reais falham, sistemas
  distribuídos precisam tolerar partições, então a escolha prática costuma ser AP vs CP — e
  boas arquiteturas escolhem por tipo de dado: feeds sociais pendem para AP, saldos
  bancários pendem para CP. CA (as duas garantias, sem tolerância a partição) só faz sentido
  quando partições estão fora do jogo, como em um banco de dados de nó único.
glossary:
  - term: Consistência (no CAP)
    definition: "Todo cliente vê a escrita bem-sucedida mais recente, não importa qual réplica responda. Não é correção em geral — é especificamente a ausência de leituras desatualizadas."
  - term: Disponibilidade (no CAP)
    definition: "Toda requisição recebe uma resposta sem erro — mesmo que ela possa não conter a escrita mais recente. É sobre responder, não sobre estar atualizado."
  - term: Tolerância a partição
    definition: "O sistema continua operando mesmo quando os nós não conseguem se comunicar porque a rede entre eles falhou. Os nós estão vivos; as mensagens se perdem."
  - term: Partição de rede
    definition: "Uma falha de rede que divide um cluster em grupos de nós que não se alcançam, enquanto cada grupo continua rodando."
  - term: Réplica
    definition: "Uma cópia do mesmo dado mantida em outro nó, para o sistema sobreviver a falhas e servir leituras mais perto dos usuários."
  - term: Leitura desatualizada (stale read)
    definition: "Uma leitura que retorna um valor antigo porque a réplica que respondeu ainda não recebeu a escrita mais recente."
  - term: Sistema AP
    definition: "Durante uma partição, continua respondendo toda requisição ao custo de possivelmente servir dados desatualizados. Réplicas divergem e se reconciliam depois."
  - term: Sistema CP
    definition: "Durante uma partição, rejeita ou atrasa requisições que não consegue coordenar com segurança, então clientes nunca veem dado desatualizado — ao custo de disponibilidade."
  - term: Sistema CA
    definition: "Consistente e disponível apenas enquanto nenhuma partição existe. Faz sentido quando tolerância a partição não é necessária (ex.: nó único); não é uma postura prática para a maioria dos sistemas distribuídos."
  - term: Split brain
    definition: "Uma falha em que os dois lados de uma partição acreditam estar no comando e aceitam escritas conflitantes — o desastre que sistemas de coordenação CP existem para evitar."
  - term: Consistência eventual
    definition: "Réplicas podem discordar temporariamente, mas convergem quando a replicação alcança — o modelo de consistência usual de sistemas AP."
  - term: Quorum
    definition: "Exigir que a maioria das réplicas confirme uma leitura ou escrita, para que duas maiorias discordantes não possam existir — um bloco de construção comum em CP."
references:
  - label: "Eric Brewer — CAP Twelve Years Later: How the Rules Have Changed"
    url: https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/
  - label: "Gilbert & Lynch — Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"
    url: https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf
  - label: "Martin Kleppmann — Please stop calling databases CP or AP"
    url: https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html
  - label: "Designing Data-Intensive Applications (Kleppmann)"
    url: https://dataintensive.net/
  - label: "Jepsen — Consistency Models"
    url: https://jepsen.io/consistency
---

> Use o laboratório acima para **sentir o teorema em vez de decorá-lo**: toque no triângulo
> para aprender o que C, A e P realmente prometem, depois corte a rede entre as réplicas A e
> B, saque dinheiro de um lado, leia o saldo do outro — e veja AP, CP e CA responderem às
> mesmas requisições de formas diferentes. As notas abaixo são a referência rápida.

## O que é

O Teorema CAP descreve um trade-off em **sistemas distribuídos** — sistemas onde o mesmo
dado vive em mais de um nó. Ele diz que, quando uma **partição de rede** acontece, um
sistema não consegue garantir totalmente ao mesmo tempo:

- **C — Consistência**: toda leitura vê a escrita bem-sucedida mais recente, qualquer que
  seja a réplica que responda.
- **A — Disponibilidade**: toda requisição recebe uma resposta (sem erro), mesmo que ela
  possa não conter o dado mais recente.

enquanto também é **P — Tolerante a partição**: continua operando enquanto os nós não
conseguem se falar.

## Por que importa

Todo sistema replicado — bancos multi-região, caches, filas, serviços de coordenação — uma
hora encara uma partição, porque **redes reais falham**: cabos são cortados, roteadores dão
problema, uma zona de disponibilidade inteira some. O CAP força a pergunta que todo
arquiteto precisa responder com antecedência: *quando isso acontecer, este dado continua
respondendo (e arrisca estar desatualizado) ou permanece estritamente fresco (e rejeita
algumas requisições)?*

## As três partes

- **Consistência** — todos os clientes veem a última escrita bem-sucedida, não importa qual
  réplica atendam. *Não* é "os dados estão corretos" em sentido geral; é especificamente:
  **nenhuma leitura desatualizada**.
- **Disponibilidade** — toda requisição recebe uma resposta. *Não* é "a resposta é a mais
  recente"; é especificamente: **nenhuma requisição recusada**.
- **Tolerância a partição** — o sistema continua operando quando a rede entre os nós falha.
  Os nós estão saudáveis; as **mensagens entre eles é que se perdem**.

## O que é uma partição

Uma partição é uma **divisão da rede**, não um crash. A réplica A e a réplica B estão ambas
de pé e servindo, mas o link entre elas caiu: escritas aceitas de um lado **não conseguem
chegar** ao outro. Cada lado agora precisa decidir sozinho se ainda pode responder com
segurança.

## O exemplo do saldo

Duas réplicas guardam o saldo da sua conta de **R$ 1000** *(é o laboratório acima)*:

1. Você **saca R$ 100**; a escrita cai na **réplica A** → A agora diz **R$ 900**.
2. Logo em seguida, sua **leitura cai na réplica B**.
3. Se o sistema é **consistente**, B precisa responder **R$ 900**. Se B responder
   **R$ 1000**, isso é uma **leitura desatualizada** — e, com dinheiro, leitura
   desatualizada convida ao gasto duplo.

Enquanto a rede está saudável, a replicação mantém B em sincronia e isso é fácil. Durante
uma partição, a escrita de A não consegue chegar em B — e agora o sistema precisa escolher.

## Por que não dá para ter os três (durante uma partição)

Com o link caído, a réplica B recebe uma leitura e tem exatamente duas opções:

- **Responder assim mesmo** com o dado que tem → o sistema continuou **disponível**, mas
  pode ter servido um valor desatualizado → consistência sacrificada → **AP**.
- **Recusar ou esperar** porque não consegue verificar se tem a escrita mais recente → sem
  leitura desatualizada, mas a requisição não teve resposta útil → disponibilidade
  sacrificada → **CP**.

Não existe terceira opção para B: ela *não pode conferir com A*, porque é isso que uma
partição significa. Esse é o teorema — não um slogan de "escolha 2 de 3 para sempre", mas
uma escolha forçada **enquanto a partição durar**.

## AP — disponibilidade + tolerância a partição

- O sistema **continua respondendo dos dois lados** da divisão.
- Escritas confirmam localmente; réplicas **divergem temporariamente** e se reconciliam
  depois da recuperação (consistência eventual).
- Leituras podem retornar **dados desatualizados** — aceitável para likes, feeds,
  contadores de visualização, carrinhos, presença.
- Exemplos: Cassandra, leituras padrão do DynamoDB, DNS, a maioria dos caches.

## CP — consistência + tolerância a partição

- O sistema **rejeita ou atrasa** requisições que não consegue coordenar com segurança
  durante a divisão (frequentemente: o lado minoritário para de responder).
- Clientes recebem **dado fresco ou um erro** — nunca um valor silenciosamente errado.
- O preço é disponibilidade e latência — aceitável para saldos, estoque no checkout,
  eleição de líder, configuração de cluster.
- Exemplos: ZooKeeper, etcd, Google Spanner, setups relacionais com replicação síncrona.

## CA — consistência + disponibilidade

- As duas garantias valem **apenas enquanto a rede nunca particiona** — CA não tem plano
  para uma divisão.
- Faz sentido quando tolerância a partição genuinamente não é necessária: um **banco de
  dados de nó único**, ou sistemas fortemente acoplados onde uma partição já significa
  falha total.
- Em um sistema distribuído real uma partição eventualmente acontece, e nesse momento um
  design "CA" é forçado a abrir mão de C ou de A na hora. **Não apresente CA como a escolha
  normal para sistemas distribuídos.**

## Trade-offs por caso de uso

- **Feeds sociais, likes, timelines** → AP: uma contagem brevemente errada é invisível; uma
  página de erro não é.
- **Saldos bancários, transferências, estoque no checkout** → CP: uma resposta
  desatualizada é pior que uma requisição rejeitada.
- **Carrinhos de compra, presença no chat** → AP: perder frescor por segundos é barato.
- **Eleição de líder, locks distribuídos, config de cluster** → CP: split brain corrompe
  dados.

O mesmo produto usa as duas posturas ao mesmo tempo — a navegação pende para AP enquanto o
pagamento pende para CP. **Escolha por tipo de dado, não por aplicação.**

## Intuição do mundo real

- Partições são **raras mas certas** — projete para elas como você projeta para falha de
  disco.
- Fora das partições, a mesma tensão aparece como **consistência vs latência**: garantias
  mais fortes significam mais coordenação em cada escrita (esse refinamento é conhecido como
  PACELC).
- Bancos de dados reais são **ajustáveis**, não permanentemente "AP" ou "CP": configurações
  de quorum, preferências de leitura e replicação síncrona vs assíncrona movem você ao longo
  do espectro por operação.

## Relevância em entrevistas

- **Explique em uma frase**: "Quando as réplicas não conseguem se falar, uma requisição cai
  em uma réplica que não pode verificar se tem o dado mais recente — ela ou responde assim
  mesmo (AP, talvez desatualizado) ou recusa (CP, indisponível)."
- **Defina C e A com precisão** — consistência = toda leitura vê a última escrita
  bem-sucedida; disponibilidade = toda requisição recebe resposta. Definições frouxas são o
  erro mais comum sobre CAP.
- **Diga por que P não é negociável** — redes falham, então sistemas distribuídos precisam
  tolerar partições; a decisão real é AP vs CP *durante* a partição.
- **Argumente com tipos de dado**: likes desatualizados são ok (AP), saldos desatualizados
  são perigosos (CP). Nomear *onde leituras desatualizadas são aceitáveis* é exatamente o
  que entrevistadores testam.
- **Aponte a armadilha do CA** — mencione que CA só faz sentido sem tolerância a partição
  (nó único); chamar um sistema distribuído de "CA" sinaliza incompreensão.

## Notas de aula

- A escolha forçada acontece **apenas enquanto a partição durar** — no resto do tempo você
  está ajustando consistência vs latência, não C vs A.
- A demo do saldo é o teorema inteiro: **escreve em A, lê de B, link caído** — B ou mente
  (AP) ou recusa (CP).
- Mate o slogan "escolha quaisquer dois": P não é opcional em sistemas distribuídos, então
  o cardápio real é **AP ou CP sob partição**.
- Pensar por tipo de dado é a resposta sênior: um sistema, várias posturas.
