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

