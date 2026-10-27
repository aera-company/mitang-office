# MITANG OFFICE · AERA × MITANG

Versão conceitual para apresentação em 27/10/2026, baseada na proposta publicada em https://mitang-mu.vercel.app/mitang.

## Baixar do GitHub

```sh
git clone https://github.com/aera-company/mitang-office.git
cd mitang-office
python3 scripts/serve_demo.py
```

O build em `dist/` está incluído. Não é necessário instalar dependências para apresentar.

## Abrir para apresentar

Dê dois cliques em **INICIAR_MITANG.command**. O navegador abre em **http://127.0.0.1:8088/**. Mantenha a janela do iniciador aberta durante a apresentação. O build em `dist/` está pronto e funciona sem instalar pacotes ou acessar internet. Requer Python 3 neste computador.

Alternativa: `python3 scripts/serve_demo.py`. Se a porta estiver ocupada: `python3 scripts/serve_demo.py --port 8089`.

## Percurso sugerido · 3 minutos

1. **Abertura:** “Este é um jeito de visualizar a operação que está na proposta: marketing conectado ao Comercial da MITANG.”
2. **Conhecer a operação:** inicia um percurso de aproximadamente 65 segundos pelos cinco ambientes. Pausar, setas e Sair permitem conduzir a conversa.
3. **Explorar:** selecione Demanda, Comunicação comercial, Prospecção, MITANG Radar ou Direção da operação. Os ambientes representam quatro frentes conectadas por uma direção comercial.
4. **Abrir Radar → Uma oportunidade:** percorra o exemplo fictício de Survey Positioning. Mostre o desenvolvimento do sinal até a reunião e a passagem de responsabilidade para a MITANG.
5. **Primeiros 90 dias:** estruturar, colocar no mercado, aprender e acelerar.
6. **Fechar:** “O escritório torna visível a operação. O Radar dá memória ao serviço. A AERA desenvolve as conversas; a MITANG valida tecnicamente, propõe, negocia e fecha.”

## Controles

Arrastar: orbitar. Rolar: zoom. 1–5: núcleos. Esc: visão geral. P: apresentação. Durante o percurso, setas avançam e voltam; espaço pausa. Comandos: abrir demanda, comunicação, prospecção, Radar ou direção. O botão Agentes pausa as presenças animadas. A preferência do sistema por movimento reduzido é respeitada.

## Escopo e limites

Demonstração conceitual com conteúdo predefinido. Os personagens representam capacidades propostas; os movimentos são ilustrativos. A Operadora A e os sinais são fictícios. Não há CRM, IA, coleta de dados, contas reais ou serviços externos conectados. O desenho representa um serviço recorrente definido por prioridades mensais, sem promessa de produção ilimitada ou resultados comerciais. As condições contratuais permanecem no PDF da proposta original.

A logo oficial MITANG fornecida pelo cliente está no cabeçalho e na recepção 3D. A arquitetura foi adaptada da base local do OFFICE AERA, em uma pasta separada.

## Desenvolvimento

`npm ci`, `npm run dev`, `npm run build`. Requer Node.js 20.19+ ou 22.12+. Execute `npm ci` após clonar para instalar as dependências. O build pronto não depende dessa instalação. Licenças de Three.js e Instrument Sans em `public/licenses/` e `dist/licenses/`.

## Verificação

Build de produção concluído. Revisão no navegador: cena 3D carregada, núcleo Prospecção, avanço do Radar, etapa Oportunidade com responsabilidade MITANG e aba Primeiros 90 dias. Roteiro automático e encerramento também revisados. Não foi feita validação em aparelho móvel físico.
