# Padrão Organizacional (CRUD) — Frontend

Este repositório deve seguir um padrão único de organização para qualquer CRUD (listar / criar / editar / visualizar), replicando o modelo aplicado em **Petshop > Animais > Pets**.

## Árvore padrão (exemplo: Petshop/Animais/Pets)

```
src/
  pages/
    <area>/
      <dominio>/
        <Entidade>ListaPage.vue
        <Entidade>NovoPage.vue
        <Entidade>EditarPage.vue
        <Entidade>VisualizarPage.vue

  components/
    <area>/
      <dominio>/
        <Entidade>FormWizard.vue

  composables/
    create<Entidade>Draft.ts

  services/
    <area>/
      <dominio>/
        <entidade>.service.ts

  router/
    index.ts
```

## Função de cada arquivo

- `src/pages/<area>/<dominio>/<Entidade>ListaPage.vue`
  - Página de **listagem** com layout padrão (ex.: estilo `notas/emitidas`).
  - Usa `DataTable` + paginação (a paginação só aparece quando `totalPages > 1`).
  - Rotas de ação da linha: **Visualizar** e **Editar**.
  - Botão principal: **Novo** (navega para a rota de criação).

- `src/pages/<area>/<dominio>/<Entidade>NovoPage.vue`
  - Wrapper fino do **create**: carrega `loadOptions`, cria um draft vazio e chama `create<Entidade>(payload)`.
  - Renderiza o componente único `*FormWizard`.

- `src/pages/<area>/<dominio>/<Entidade>EditarPage.vue`
  - Wrapper fino do **edit**: carrega a entidade por `id`, popula o draft e chama `update<Entidade>(id, payload)`.
  - Renderiza o componente único `*FormWizard`.

- `src/pages/<area>/<dominio>/<Entidade>VisualizarPage.vue`
  - Wrapper fino do **view**: carrega a entidade por `id` e renderiza em modo somente leitura.
  - Renderiza o componente único `*FormWizard` com `mode="view"`.

- `src/components/<area>/<dominio>/<Entidade>FormWizard.vue`
  - **Único formulário reutilizável** para `mode: 'create' | 'edit' | 'view'`.
  - Mantém a navegação do wizard internamente (`step` 1/2/3…).
  - Recebe:
    - `mode`
    - `modelValue` (objeto da entidade)
    - `loadOptions` (listas e dependências: clientes, espécies, raças, pelagens…)
    - callbacks: `onSave`, `onCancel`, `onNewCliente`, `onNewEspecie`, `onNewRaca`, `onNewPelagem`…
  - Regra: em `mode="view"`, tudo fica **readonly/disabled** e não há submit de persistência.
  - Layout: segue o padrão visual do sistema (wizard igual `/dps/pessoas`, botões e classes iguais).

- `src/composables/create<Entidade>Draft.ts`
  - Factory **por instância** (não singleton) para evitar vazamento de estado entre telas.
  - Expõe:
    - `draft` (reactive)
    - `reset(initial?)`
    - `toPayload()` (centraliza mapeamento/normalização para o backend)

- `src/services/<area>/<dominio>/<entidade>.service.ts`
  - Camada única para **API/integrações** e carga de dependências.
  - Deve concentrar:
    - `loadOptions()` (listas necessárias ao form)
    - `getById(id)`
    - `create(payload)`
    - `update(id, payload)`
    - `list(search?)`
  - Regra: páginas não fazem fetch direto — chamam o service.

## Padrão de rotas (CRUD)

Use rotas previsíveis para manter consistência:

- Listar: `/.../<EntidadePlural>` (ex.: `/Petshop/ListaPets`)
- Novo: `/.../<EntidadePlural>/Novo` (ex.: `/Petshop/Pets/Novo`)
- Editar: `/.../<EntidadePlural>/:id/Editar`
- Visualizar: `/.../<EntidadePlural>/:id`

## Regras de consistência (obrigatórias)

- Wizard e botões devem seguir **exatamente** o padrão do sistema (`/dps/pessoas`).
- Dependências (ex.: raça depende de espécie) devem ter:
  - disable/enable coerente
  - reset do valor dependente quando o pai mudar
- Não duplicar formulários: **um** `*FormWizard.vue` por entidade.

## Feedback global (obrigatório)

O frontend do Petshop possui um sistema único de feedback (toast) que **deve estar presente em todas as requisições**.

### Onde fica

- Engine/store: `src/services/feedback.ts`
- UI (render global): `src/components/ui/FeedbackToasts.vue` (montado em `src/App.vue`)
- HTTP (fetch wrapper): `src/services/http.ts`

### Regras

- **Não** use `alert()`, `window.ExibirAlerta()` ou mensagens “ad hoc” em páginas novas. Use sempre:
  - `import { feedback } from '@/services/feedback'` (ou caminho relativo)
  - `feedback.success(...) | feedback.error(...) | feedback.info(...)`
- Todo erro HTTP em `apiGet/apiPost/apiPut/apiDelete` já gera toast automaticamente.
- Todo sucesso em `POST/PUT/DELETE` já gera toast automaticamente (GET não).
- Evite “toast duplicado”: se a chamada já mostra feedback automático, não dispare outro manual, a não ser que esteja suprimindo o automático.

### Opções por requisição (quando necessário)

- Personalizar mensagem de sucesso:
  - `apiPost('/rota', payload, { successMessage: 'Criado com sucesso.' })`
- Suprimir sucesso automático (casos específicos):
  - `apiPut('/rota', payload, { suppressSuccessFeedback: true })`
- Suprimir erro automático (erros esperados, ex.: `404` tratado como `null`):
  - `apiGet('/rota', params, { suppressErrorFeedback: true })`

### Nota de validação (422)

- Para `422`, o `http.ts` tenta exibir a primeira mensagem de validação (quando existir `errors` no payload).

## Importante: UI legado (tooltips / menu dos “3 pontos”)

Alguns comportamentos (ex.: tooltip e o menu suspenso da tabela com **Visualizar/Editar** via “3 pontos”) são inicializados por `initLegacyUiBindings()` (jQuery/Bootstrap).

Regra prática:

- Se a página **renderiza linhas/elementos depois de um fetch async** (ex.: listagem paginada via API), o binding do layout pode rodar antes do DOM existir.
- Nesses casos, após atualizar o estado que gera o DOM, rode novamente o binding:
  - `await nextTick()`
  - `initLegacyUiBindings()`

Exemplo: ao final de `fetchData()` em uma `*ListaPage.vue`, depois de setar `rows`.
