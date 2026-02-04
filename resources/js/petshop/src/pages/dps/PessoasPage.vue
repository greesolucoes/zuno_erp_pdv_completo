<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { loadLegacyStyleOnce, removeLegacyTag } from '../../utils/legacyScripts'

const router = useRouter()

removeLegacyTag('legacy-login-css')
removeLegacyTag('legacy-dashboard-css')

loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })

type LocalDomicilio = '0' | '1' | '2'
type TipoEmitente = '1' | '2' | '3'

const dtCompetencia = ref<string>('')
const tipoEmitente = ref<TipoEmitente>('1')

const emitente = reactive({
  tipoInscricao: 'CNPJ' as 'CNPJ' | 'CPF',
  inscricao: '',
  razaoSocial: '',
  telefone: '',
  email: '',
  endereco: { cep: '', bairro: '', logradouro: '', numero: '', complemento: '' },
  municipio: { codigo: 0, nome: '', uf: '' },
})

const ui = reactive({
  mostrarTrascricaoDps: false,
  mostrarDetalhesEmitente: false,
})

const tomador = reactive({
  localDomicilio: '0' as LocalDomicilio,
  informarEndereco: false,
})

const intermediario = reactive({
  localDomicilio: '0' as LocalDomicilio,
  informarEndereco: false,
})

const mostrarTomador = computed(() => tipoEmitente.value !== '3')
const mostrarIntermediario = computed(() => tipoEmitente.value !== '2')

const tomadorPodeMarcarEndereco = computed(() => tomador.localDomicilio === '1')
const intermediarioPodeMarcarEndereco = computed(() => intermediario.localDomicilio === '1')

function normalizeDatePtBrToApi(value: string): string {
  return (value ?? '').trim()
}

function resetTomador() {
  tomador.localDomicilio = '0'
  tomador.informarEndereco = false
}

function resetIntermediario() {
  intermediario.localDomicilio = '0'
  intermediario.informarEndereco = false
}

function toggleDetalhesEmitente() {
  ui.mostrarDetalhesEmitente = !ui.mostrarDetalhesEmitente
}

async function loadEmitente() {
  const resp = await fetch('/v2/api/dps/emitente', { method: 'GET', credentials: 'same-origin', headers: { Accept: 'application/json' } })
  if (!resp.ok) return
  const data = await resp.json()
  emitente.tipoInscricao = data?.tipoInscricao === 'CPF' ? 'CPF' : 'CNPJ'
  emitente.inscricao = data?.inscricao ?? ''
  emitente.razaoSocial = data?.razaoSocial ?? ''
  emitente.telefone = data?.telefone ?? ''
  emitente.email = data?.email ?? ''
  emitente.endereco.cep = data?.endereco?.cep ?? ''
  emitente.endereco.bairro = data?.endereco?.bairro ?? ''
  emitente.endereco.logradouro = data?.endereco?.logradouro ?? ''
  emitente.endereco.numero = data?.endereco?.numero ?? ''
  emitente.endereco.complemento = data?.endereco?.complemento ?? ''
  emitente.municipio.codigo = data?.cidade?.codigo ?? 0
  emitente.municipio.nome = data?.cidade?.nome ?? ''
  emitente.municipio.uf = data?.cidade?.uf ?? ''
}

onMounted(async () => {
  await loadEmitente()
})

function onAvancar() {
  router.push({ name: 'dps-servico' })
}

watch(
  () => tomador.localDomicilio,
  (value) => {
    if (value === '0') {
      tomador.informarEndereco = false
      return
    }
    if (value === '2') {
      tomador.informarEndereco = true
      return
    }
    if (value === '1' && !tomador.informarEndereco) {
      tomador.informarEndereco = true
    }
  },
)

watch(
  () => intermediario.localDomicilio,
  (value) => {
    if (value === '0') {
      intermediario.informarEndereco = false
      return
    }
    if (value === '2') {
      intermediario.informarEndereco = true
      return
    }
    if (value === '1' && !intermediario.informarEndereco) {
      intermediario.informarEndereco = true
    }
  },
)

watch(
  () => tipoEmitente.value,
  (value) => {
    if (value === '1') {
      // Prestador: ambos painéis disponíveis, porém começam não informados
      resetTomador()
      resetIntermediario()
    }
    if (value === '2') {
      // Tomador: intermediário não informado
      resetIntermediario()
    }
    if (value === '3') {
      // Intermediário: tomador não informado
      resetTomador()
    }
  },
)
</script>

<template>
  <div class="wizard">
    <div class="wizard-inner">
      <div class="connecting-line"></div>
      <ul class="nav nav-tabs" role="tablist">
        <li class="ativo">
          <a href="javascript:void(0);">
            <span class="round-tab">
              <img class="passos-pessoas" src="/img/passos-pessoas-ativo-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag">
            <span class="tag-text">Pessoas</span>
          </a>
        </li>
        <li class="fechado">
          <a href="javascript:void(0);">
            <span class="round-tab">
              <img class="passos-servico" src="/img/passos-servico-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag">
            <span class="tag-text">Serviço</span>
          </a>
        </li>
        <li class="fechado">
          <a href="javascript:void(0);">
            <span class="round-tab">
              <img class="passos-valores" src="/img/passos-valores-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag">
            <span class="tag-text">Valores</span>
          </a>
        </li>
        <li class="fechado">
          <a href="javascript:void(0);">
            <span class="round-tab">
              <img class="passos-nfse" src="/img/passos-nfse-fechado-ico.svg" />
            </span>
          </a>
          <a href="javascript:void(0);" class="tag">
            <span class="tag-text">Emitir NFS-e</span>
          </a>
        </li>
      </ul>
    </div>
  </div>

  <form action="#" class="formdps" method="post" @submit.prevent="onAvancar">
    <input type="hidden" id="NotaDoMei" name="NotaDoMei" value="False" />
    <input type="hidden" id="Prestador_LocalDomicilio" name="Prestador.LocalDomicilio" value="0" />

    <div class="pnlCollapse">
      <div class="retratil" style="padding-top: 15px; padding-bottom: 0">
        <div class="row">
          <div class="col-md-3">
            <div class="form-group form-group-lg">
              <label class="control-label">
                <span>
                  Data de Competência<span class="asterisco">*</span>
                </span>
                <a
                  class=""
                  data-content="Refere-se à data em que o serviço foi prestado. Para maiores informações, consulte a legislação do município onde incidirá o ISSQN."
                  data-placement="top"
                  data-toggle="popover"
                  data-trigger="focus"
                  role="button"
                  tabindex="0"
                >
                  <i class="fa fa-question-circle helpBox"></i>
                </a>
              </label>
              <div class="input-group input-group-lg">
                <input
                  class="form-control data"
                  data-date-end-date="23-01-2026"
                  data-val="true"
                  data-val-date="O campo Data de Competência deve ser uma data."
                  id="DataCompetencia"
                  name="DataCompetencia"
                  type="text"
                  v-model="dtCompetencia"
                />
                <span class="input-group-btn">
                  <button
                    class="btn btn-lg btn-default btnCalendario"
                    data-original-title="Abrir calendário"
                    data-toggle="tooltip"
                    id="btn_DataCompetencia"
                    type="button"
                  >
                    <div class="btn-calendario"></div>
                  </button>
                </span>
              </div>
              <span class="field-validation-valid text-danger" data-valmsg-for="DataCompetencia" data-valmsg-replace="true"></span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <div class="checkbox">
              <label>
                <input
                  data-val="true"
                  data-val-required="The Informar série e número da DPS field is required."
                  id="InformarSerieNumeroDPS"
                  name="InformarSerieNumeroDPS"
                  type="checkbox"
                  value="true"
                  v-model="ui.mostrarTrascricaoDps"
                />
                <input name="InformarSerieNumeroDPS" type="hidden" value="false" />
                <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                <span class="cr-text">Informar série e número da DPS</span>
              </label>
            </div>
          </div>
        </div>

        <div id="pnlTrascricaoDPS" v-show="ui.mostrarTrascricaoDps" style="display: none">
          <div class="bd-callout bd-callout-info">
            O número e a série da DPS são campos obrigatórios de controle da DPS que ajudam a identificar unicamente uma
            DPS. Em geral, campos são gerados automaticamente pelo sistema para cada emitente de NFS-e.
          </div>
          <div class="row">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label">
                  <span>Série<span class="asterisco">*</span></span>
                  <a
                    class=""
                    data-content="A série transcrita manualmente para a DPS deve ser um número dentro da faixa definida para este fim, que é de 80000 até 89999."
                    data-placement="top"
                    data-toggle="popover"
                    data-trigger="focus"
                    role="button"
                    tabindex="0"
                  >
                    <i class="fa fa-question-circle helpBox"></i>
                  </a>
                </label>
                <input
                  class="form-control numerico"
                  data-val="true"
                  data-val-length="The field Série must be a string with a maximum length of 5."
                  data-val-length-max="5"
                  id="SerieDPS"
                  maxlength="5"
                  name="SerieDPS"
                  type="text"
                  value=""
                />
                <span class="field-validation-valid text-danger" data-valmsg-for="SerieDPS" data-valmsg-replace="true"></span>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Número da DPS<span class="asterisco">*</span></span></label>
                <input
                  class="form-control num15pos"
                  data-val="true"
                  data-val-length="The field Número da DPS must be a string with a maximum length of 15."
                  data-val-length-max="15"
                  id="NumeroDPS"
                  maxlength="15"
                  name="NumeroDPS"
                  type="text"
                  value=""
                />
                <span class="field-validation-valid text-danger" data-valmsg-for="NumeroDPS" data-valmsg-replace="true"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pnlCollapse semi-aberto emitente">
      <h2>Emitente da NFS-e</h2>
      <div style="padding: 0 20px">
        <div class="row" style="margin-top: 5px; margin-bottom: 0">
          <div class="col-md-9">
            <div class="form-group">
              <label class="control-label">
                <span>Você irá emitir esta NFS-e como?<span class="asterisco">*</span></span>
                <a
                  class=""
                  data-content="A NFS-e poderá ser emitida por um Prestador, Tomador ou Intermediário. No entanto, as emissões de NFS-e por Tomador e Intermediário não estão disponíveis."
                  data-placement="top"
                  data-toggle="popover"
                  data-trigger="focus"
                  role="button"
                  tabindex="0"
                >
                  <i class="fa fa-question-circle helpBox"></i>
                </a>
              </label>
              <div class="radio-options">
                <div class="radiobutton">
                  <label
                    ><input id="TipoEmitente" name="TipoEmitente" type="radio" value="1" v-model="tipoEmitente" />Prestador<span
                      class="cr"
                      ><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input id="TipoEmitente" name="TipoEmitente" type="radio" value="2" v-model="tipoEmitente" />Tomador<span class="cr"
                      ><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input id="TipoEmitente" name="TipoEmitente" type="radio" value="3" v-model="tipoEmitente" />Intermediário<span
                      class="cr"
                      ><i class="cr-icon"></i></span
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-8">
            <div class="form-group form-group-lg">
              <input id="Prestador_EnderecoNacional_NomeMunicipio" name="Prestador.EnderecoNacional.NomeMunicipio" type="hidden" value="" />
              <label class="control-label"><span>Município<span class="asterisco">*</span></span></label>
              <select
                class="form-control form-chosen"
                data-val="true"
                data-val-number="O campo Município deve ser um número."
                id="Prestador_EnderecoNacional_CodigoMunicipio"
                name="Prestador.EnderecoNacional.CodigoMunicipio"
                :readonly="true"
              >
                <option :value="emitente.municipio.codigo || ''">{{ emitente.municipio.nome }}</option>
              </select>
              <span class="field-validation-valid text-danger" data-valmsg-for="Prestador.EnderecoNacional.CodigoMunicipio" data-valmsg-replace="true"></span>
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group form-group-lg">
              <label id="lblIMPrestador" class="control-label"><span>Indicador Municipal<span class="asterisco" style="display: none">*</span></span></label>
              <select
                class="form-control form-chosen"
                data-val="true"
                data-val-length="The field Indicador Municipal must be a string with a maximum length of 15."
                data-val-length-max="15"
                id="Prestador_InscricaoMunicipal"
                name="Prestador.InscricaoMunicipal"
                :readonly="true"
              >
                <option value=""></option>
              </select>
              <span class="field-validation-valid text-danger" data-valmsg-for="Prestador.InscricaoMunicipal" data-valmsg-replace="true"></span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-4">
            <div class="form-group form-group-lg">
              <label class="control-label">CNPJ</label>
                <input
                  class="form-control cpfcnpj"
                  data-val="true"
                  data-val-length="The field CPF/CNPJ must be a string with a maximum length of 18."
                  data-val-length-max="18"
                  id="Prestador_Inscricao"
                  maxlength="18"
                  name="Prestador.Inscricao"
                  readonly
                  type="text"
                  :value="emitente.inscricao"
                />
            </div>
          </div>
          <div class="col-md-8">
            <div class="form-group form-group-lg">
              <label class="control-label">Razão Social</label>
                <input
                  class="form-control"
                  data-val="true"
                  data-val-length="The field Nome/Razão Social must be a string with a maximum length of 150."
                  data-val-length-max="150"
                  id="Prestador_Nome"
                  maxlength="150"
                  name="Prestador.Nome"
                  readonly
                  type="text"
                  :value="emitente.razaoSocial"
                />
            </div>
          </div>
        </div>

        <!-- Opção/Regime do Simples Nacional (campos visíveis do original) -->
        <div class="row">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Opção no Simples Nacional<span class="asterisco">*</span></span></label>
              <input id="txtOpcaoSN" type="text" class="form-control" disabled="disabled" value="" />
              <input id="SimplesNacional_Opcao" name="SimplesNacional.Opcao" type="hidden" value="0" />
            </div>
          </div>
        </div>

        <div id="pnlRegimeApuracaoTributosSN" class="row" style="display: none">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"
                ><span>Regime de Apuração dos Tributos no Simples Nacional<span class="asterisco">*</span></span></label
              >
              <select
                id="SimplesNacional_RegimeApuracaoTributosSN"
                name="SimplesNacional.RegimeApuracaoTributosSN"
                class="form-control form-chosen"
              >
                <option value="">Selecione...</option>
                <option value="1">Regime de apuração dos tributos federais e municipal pelo Simples Nacional</option>
              </select>
              <span
                class="field-validation-valid text-danger"
                data-valmsg-for="SimplesNacional.RegimeApuracaoTributosSN"
                data-valmsg-replace="true"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 0 20px 15px; margin-top: 20px">
        <button
          id="btnMaisInfoEmitente"
          class="btn btn-lg btn-info"
          type="button"
          :ativo="ui.mostrarDetalhesEmitente ? 'Ocultar detalhes do emitente' : 'Exibir detalhes do emitente'"
          :inativo="ui.mostrarDetalhesEmitente ? 'Exibir detalhes do emitente' : 'Ocultar detalhes do emitente'"
          @click.prevent="toggleDetalhesEmitente"
        >
          {{ ui.mostrarDetalhesEmitente ? 'Ocultar detalhes do emitente' : 'Exibir detalhes do emitente' }}
        </button>
      </div>
      <div id="pnlMaisInfo" v-show="ui.mostrarDetalhesEmitente" style="display: none; padding: 0 20px">
        <div class="row">
          <div class="col-md-4">
            <div class="form-group form-group-lg">
              <label class="control-label">Telefone</label>
              <input class="form-control" id="Prestador_Telefone" name="Prestador.Telefone" readonly type="text" :value="emitente.telefone" />
            </div>
          </div>
          <div class="col-md-8">
            <div class="form-group form-group-lg">
              <label class="control-label">E-mail</label>
              <input class="form-control" id="Prestador_Email" name="Prestador.Email" readonly type="text" :value="emitente.email" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group form-group-lg">
              <label class="control-label">CEP</label>
              <input class="form-control" id="Prestador_EnderecoNacional_CEP" name="Prestador.EnderecoNacional.CEP" readonly type="text" :value="emitente.endereco.cep" />
            </div>
          </div>
          <div class="col-md-9">
            <div class="form-group form-group-lg">
              <label class="control-label">Logradouro</label>
              <input class="form-control" id="Prestador_EnderecoNacional_Logradouro" name="Prestador.EnderecoNacional.Logradouro" readonly type="text" :value="emitente.endereco.logradouro" />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-3">
            <div class="form-group form-group-lg">
              <label class="control-label">Número</label>
              <input class="form-control" id="Prestador_EnderecoNacional_Numero" name="Prestador.EnderecoNacional.Numero" readonly type="text" :value="emitente.endereco.numero" />
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group form-group-lg">
              <label class="control-label">Complemento</label>
              <input class="form-control" id="Prestador_EnderecoNacional_Complemento" name="Prestador.EnderecoNacional.Complemento" readonly type="text" :value="emitente.endereco.complemento" />
            </div>
          </div>
          <div class="col-md-5">
            <div class="form-group form-group-lg">
              <label class="control-label">Bairro</label>
              <input class="form-control" id="Prestador_EnderecoNacional_Bairro" name="Prestador.EnderecoNacional.Bairro" readonly type="text" :value="emitente.endereco.bairro" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="pnlTomador" data-tipoPessoa="Tomador" class="pnlCollapse semi-aberto" v-show="mostrarTomador">
      <h2>Tomador do Serviço</h2>
      <div style="padding: 0 20px">
        <div class="form-group form-group-lg">
          <label class="control-label">
            <span>Onde está localizado o estabelecimento/domicílio?<span class="asterisco">*</span></span>
          </label>
          <div class="radio-options">
            <div class="radiobutton inline">
              <label
                ><input
                  data-val="true"
                  data-val-number="O campo Onde está localizado o estabelecimento/domicílio? deve ser um número."
                  id="Tomador_LocalDomicilio"
                  name="Tomador.LocalDomicilio"
                  type="radio"
                  value="0"
                  v-model="tomador.localDomicilio"
                />Tomador não informado<span
                  class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
            <div class="radiobutton inline">
              <label
                ><input id="Tomador_LocalDomicilio" name="Tomador.LocalDomicilio" type="radio" value="1" v-model="tomador.localDomicilio" />Brasil<span class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
            <div class="radiobutton inline">
              <label
                ><input id="Tomador_LocalDomicilio" name="Tomador.LocalDomicilio" type="radio" value="2" v-model="tomador.localDomicilio" />Exterior<span class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
          </div>
        </div>
      </div>
      <div class="retratil" style="padding-top: 0" v-show="tomador.localDomicilio !== '0'">
        <!-- Inscrição (Brasil/Exterior) + dados básicos do Tomador (conforme Pessoas.html) -->
        <div id="pnlInscricaoBrasil" class="row" v-show="tomador.localDomicilio === '1'">
          <div class="col-md-4">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>CPF/CNPJ<span class="asterisco">*</span></span></label>
              <div class="input-group input-group-lg">
                <input
                  class="form-control cpfcnpj"
                  data-val="true"
                  data-val-length="The field CPF/CNPJ must be a string with a maximum length of 18."
                  data-val-length-max="18"
                  id="Tomador_Inscricao"
                  maxlength="18"
                  name="Tomador.Inscricao"
                  type="text"
                  value=""
                />
                <span class="input-group-btn">
                  <button class="btn btn-lg btn-default" data-original-title="Pesquisar CPF/CNPJ" data-toggle="tooltip" id="btn_Tomador_Inscricao_pesquisar" type="button">
                    <i class="fa fa-search"></i>
                  </button>
                  <button
                    class="btn btn-lg btn-default btn-group-separado"
                    data-original-title="Últimos Tomadores"
                    data-toggle="tooltip"
                    id="btn_Tomador_Inscricao_historico"
                    type="button"
                  >
                    <i class="fa fa-users"></i>
                  </button>
                </span>
              </div>
              <span class="field-validation-valid text-danger" data-valmsg-for="Tomador.Inscricao" data-valmsg-replace="true"></span>
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Indicador Municipal</span></label>
              <input
                class="form-control num15pos"
                data-val="true"
                data-val-length="The field Indicador Municipal must be a string with a maximum length of 15."
                data-val-length-max="15"
                id="Tomador_InscricaoMunicipal"
                maxlength="15"
                name="Tomador.InscricaoMunicipal"
                type="text"
                value=""
              />
            </div>
          </div>
        </div>

        <div id="pnlInscricaoExterior" v-show="tomador.localDomicilio === '2'">
          <div class="row">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"
                  ><span>O NIF será informado?<span class="asterisco">*</span></span></label
                >
                <div class="radio-options">
                  <div class="radiobutton inline">
                    <label
                      ><input id="Tomador_NIFInformado" name="Tomador.NIFInformado" type="radio" value="1" />Sim<span class="cr"
                        ><i class="cr-icon"></i></span
                    ></label>
                  </div>
                  <div class="radiobutton inline">
                    <label
                      ><input id="Tomador_NIFInformado" name="Tomador.NIFInformado" type="radio" value="0" />Não<span class="cr"
                        ><i class="cr-icon"></i></span
                    ></label>
                  </div>
                </div>
                <span class="field-validation-valid text-danger" data-valmsg-for="Tomador.NIFInformado" data-valmsg-replace="true"></span>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-sm-12 col-md-4">
              <div id="pnlTomadorNumeroNIF" class="form-group form-group-lg" style="display: none">
                <label class="control-label"><span>NIF<span class="asterisco">*</span></span></label>
                <div class="input-group input-group-lg">
                  <input
                    class="form-control"
                    data-val="true"
                    data-val-length="The field NIF must be a string with a maximum length of 40."
                    data-val-length-max="40"
                    id="Tomador_NIF"
                    maxlength="40"
                    name="Tomador.NIF"
                    type="text"
                    value=""
                  />
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default btn-group-separado" data-original-title="Últimos Tomadores" data-toggle="tooltip" id="btn_Tomador_NIF_historico" type="button">
                      <i class="fa fa-users"></i>
                    </button>
                  </span>
                </div>
                <span class="field-validation-valid text-danger" data-valmsg-for="Tomador.NIF" data-valmsg-replace="true"></span>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-sm-12 col-md-4">
              <div id="pnlTomadorMotivoNaoInformacaoNIF" class="form-group form-group-lg" style="display: none">
                <label class="control-label"
                  ><span>Motivo da não informação do NIF<span class="asterisco">*</span></span></label
                >
                <select class="form-control form-chosen" id="Tomador_MotivoNaoInformacaoNIF" name="Tomador.MotivoNaoInformacaoNIF">
                  <option value="">Selecione...</option>
                  <option value="1">Dispensado do NIF</option>
                  <option value="2">Não exigência do NIF</option>
                </select>
                <span class="field-validation-valid text-danger" data-valmsg-for="Tomador.MotivoNaoInformacaoNIF" data-valmsg-replace="true"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <div class="form-group form-group-lg">
              <label class="control-label"><span>Nome/Razão Social<span class="asterisco">*</span></span></label>
              <input
                class="form-control"
                data-val="true"
                data-val-length="The field Nome/Razão Social must be a string with a maximum length of 150."
                data-val-length-max="150"
                id="Tomador_Nome"
                maxlength="150"
                name="Tomador.Nome"
                type="text"
                value=""
              />
              <span class="field-validation-valid text-danger" data-valmsg-for="Tomador.Nome" data-valmsg-replace="true"></span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label">Telefone</label>
              <input class="form-control telefone" id="Tomador_Telefone" name="Tomador.Telefone" type="text" value="" />
              <span class="field-validation-valid text-danger" data-valmsg-for="Tomador.Telefone" data-valmsg-replace="true"></span>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group form-group-lg">
              <label class="control-label">E-mail</label>
              <input
                class="form-control"
                data-val="true"
                data-val-length="The field E-mail must be a string with a maximum length of 80."
                data-val-length-max="80"
                id="Tomador_Email"
                maxlength="80"
                name="Tomador.Email"
                type="text"
                value=""
              />
              <span class="field-validation-valid text-danger" data-valmsg-for="Tomador.Email" data-valmsg-replace="true"></span>
            </div>
          </div>
        </div>

        <div id="Tomador_InformarEnderecoCheck" class="row" v-show="tomadorPodeMarcarEndereco">
          <div class="col-md-12">
            <div class="checkbox">
              <label>
                <input data-val="true" data-val-required="The Informar endereço field is required." id="Tomador_InformarEndereco" name="Tomador.InformarEndereco" type="checkbox" value="true" v-model="tomador.informarEndereco" />
                <input name="Tomador.InformarEndereco" type="hidden" value="false" />
                <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                <span class="cr-text">Informar endereço</span>
              </label>
            </div>
          </div>
        </div>

        <div id="pnlTomadorEnderecoBrasil" class="enderecoBrasil" v-show="tomador.localDomicilio === '1' && tomador.informarEndereco">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CEP<span class="asterisco">*</span></span></label>
                <div class="input-group input-group-lg">
                  <input autocomplete="off" class="form-control cep" data-val="true" data-val-length="The field CEP must be a string with a maximum length of 10." data-val-length-max="10" id="Tomador_EnderecoNacional_CEP" maxlength="10" name="Tomador.EnderecoNacional.CEP" type="text" value="" />
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default" id="btn_Tomador_EnderecoNacional_CEP" type="button"><i class="fa fa-search"></i></button>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Município<span class="asterisco">*</span></span></label>
                <input data-val="true" data-val-number="O campo Município deve ser um número." id="Tomador_EnderecoNacional_CodigoMunicipio" name="Tomador.EnderecoNacional.CodigoMunicipio" type="hidden" value="" />
                <input class="form-control" id="Tomador_EnderecoNacional_NomeMunicipio" name="Tomador.EnderecoNacional.NomeMunicipio" readonly="readonly" type="text" value="" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label">Logradouro</label>
                <input autocomplete="off" class="form-control logradouro" data-val="true" data-val-length="The field Logradouro must be a string with a maximum length of 255." data-val-length-max="255" id="Tomador_EnderecoNacional_Logradouro" maxlength="255" name="Tomador.EnderecoNacional.Logradouro" type="text" value="" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label">Número</label>
                <input autocomplete="off" class="form-control" data-val="true" data-val-length="The field Número must be a string with a maximum length of 60." data-val-length-max="60" id="Tomador_EnderecoNacional_Numero" maxlength="60" name="Tomador.EnderecoNacional.Numero" type="text" value="" />
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group form-group-lg">
                <label class="control-label">Complemento</label>
                <input autocomplete="off" class="form-control" data-val="true" data-val-length="The field Complemento must be a string with a maximum length of 156." data-val-length-max="156" id="Tomador_EnderecoNacional_Complemento" maxlength="156" name="Tomador.EnderecoNacional.Complemento" type="text" value="" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label">Bairro</label>
                <input autocomplete="off" class="form-control bairro" data-val="true" data-val-length="The field Bairro must be a string with a maximum length of 60." data-val-length-max="60" id="Tomador_EnderecoNacional_Bairro" maxlength="60" name="Tomador.EnderecoNacional.Bairro" type="text" value="" />
              </div>
            </div>
          </div>
        </div>

        <div id="pnlTomadorEnderecoExterior" class="enderecoExterior" v-show="tomador.localDomicilio === '2'">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>País<span class="asterisco">*</span></span></label>
                <select class="form-control form-chosen" id="Tomador_EnderecoExterior_CodigoPais" name="Tomador.EnderecoExterior.CodigoPais">
                  <option value="">Selecione...</option>
                  <option value="US">Estados Unidos</option>
                  <option value="PT">Portugal</option>
                  <option value="BR">Brasil</option>
                </select>
                <input id="Tomador_EnderecoExterior_NomePais" name="Tomador.EnderecoExterior.NomePais" type="hidden" value="" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Cidade<span class="asterisco">*</span></span></label>
                <input class="form-control" id="Tomador_EnderecoExterior_Cidade" maxlength="255" name="Tomador.EnderecoExterior.Cidade" type="text" value="" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Logradouro<span class="asterisco">*</span></span></label>
                <input class="form-control" id="Tomador_EnderecoExterior_Logradouro" maxlength="255" name="Tomador.EnderecoExterior.Logradouro" type="text" value="" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Número<span class="asterisco">*</span></span></label>
                <input
                  autocomplete="off"
                  class="form-control"
                  data-val="true"
                  data-val-length="The field Número must be a string with a maximum length of 255."
                  data-val-length-max="255"
                  id="Tomador_EnderecoExterior_Numero"
                  maxlength="255"
                  name="Tomador.EnderecoExterior.Numero"
                  type="text"
                  value=""
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label">Complemento</label>
                <input
                  autocomplete="off"
                  class="form-control"
                  data-val="true"
                  data-val-length="The field Complemento must be a string with a maximum length of 255."
                  data-val-length-max="255"
                  id="Tomador_EnderecoExterior_Complemento"
                  maxlength="255"
                  name="Tomador.EnderecoExterior.Complemento"
                  type="text"
                  value=""
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Bairro<span class="asterisco">*</span></span></label>
                <input
                  autocomplete="off"
                  class="form-control"
                  data-val="true"
                  data-val-length="The field Bairro must be a string with a maximum length of 255."
                  data-val-length-max="255"
                  id="Tomador_EnderecoExterior_Bairro"
                  maxlength="255"
                  name="Tomador.EnderecoExterior.Bairro"
                  type="text"
                  value=""
                />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Código de Endereçamento Postal<span class="asterisco">*</span></span></label>
                <input
                  autocomplete="off"
                  class="form-control"
                  data-val="true"
                  data-val-length="The field Código de Endereçamento Postal must be a string with a maximum length of 11."
                  data-val-length-max="11"
                  id="Tomador_EnderecoExterior_CodigoEnderecamentoPostal"
                  maxlength="11"
                  name="Tomador.EnderecoExterior.CodigoEnderecamentoPostal"
                  type="text"
                  value=""
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Estado, província ou região<span class="asterisco">*</span></span></label>
                <input
                  autocomplete="off"
                  class="form-control"
                  id="Tomador_EnderecoExterior_EstadoProvinciaRegiao"
                  name="Tomador.EnderecoExterior.EstadoProvinciaRegiao"
                  type="text"
                  value=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="pnlIntermediario" data-tipoPessoa="Intermediario" class="pnlCollapse semi-aberto" v-show="mostrarIntermediario">
      <h2>Intermediario do Serviço</h2>
      <div style="padding: 0 20px">
        <div class="form-group form-group-lg">
          <label class="control-label">
            <span>Onde está localizado o estabelecimento/domicílio?<span class="asterisco">*</span></span>
          </label>
          <div class="radio-options">
            <div class="radiobutton inline">
              <label
                ><input
                  checked
                  data-val="true"
                  data-val-number="O campo Onde está localizado o estabelecimento/domicílio? deve ser um número."
                  id="Intermediario_LocalDomicilio"
                  name="Intermediario.LocalDomicilio"
                  type="radio"
                  value="0"
                  v-model="intermediario.localDomicilio"
                />Intermediário não informado<span
                  class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
            <div class="radiobutton inline">
              <label
                ><input id="Intermediario_LocalDomicilio" name="Intermediario.LocalDomicilio" type="radio" value="1" v-model="intermediario.localDomicilio" />Brasil<span class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
            <div class="radiobutton inline">
              <label
                ><input id="Intermediario_LocalDomicilio" name="Intermediario.LocalDomicilio" type="radio" value="2" v-model="intermediario.localDomicilio" />Exterior<span class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
          </div>
        </div>
      </div>
      <div class="retratil" style="padding-top: 0" v-show="intermediario.localDomicilio !== '0'">
        <div id="Intermediario_InformarEnderecoCheck" class="row" v-show="intermediarioPodeMarcarEndereco">
          <div class="col-md-12">
            <div class="checkbox">
              <label>
                <input data-val="true" data-val-required="The Informar endereço field is required." id="Intermediario_InformarEndereco" name="Intermediario.InformarEndereco" type="checkbox" value="true" v-model="intermediario.informarEndereco" />
                <input name="Intermediario.InformarEndereco" type="hidden" value="false" />
                <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                <span class="cr-text">Informar endereço</span>
              </label>
            </div>
          </div>
        </div>

        <div id="pnlIntermediarioEnderecoBrasil" class="enderecoBrasil" v-show="intermediario.localDomicilio === '1' && intermediario.informarEndereco">
          <div class="row">
            <div class="col-md-4">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>CEP<span class="asterisco">*</span></span></label>
                <div class="input-group input-group-lg">
                  <input autocomplete="off" class="form-control cep" id="Intermediario_EnderecoNacional_CEP" maxlength="10" name="Intermediario.EnderecoNacional.CEP" type="text" value="" />
                  <span class="input-group-btn">
                    <button class="btn btn-lg btn-default" id="btn_Intermediario_EnderecoNacional_CEP" type="button"><i class="fa fa-search"></i></button>
                  </span>
                </div>
              </div>
            </div>
            <div class="col-md-8">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Município<span class="asterisco">*</span></span></label>
                <input id="Intermediario_EnderecoNacional_CodigoMunicipio" name="Intermediario.EnderecoNacional.CodigoMunicipio" type="hidden" value="" />
                <input class="form-control" id="Intermediario_EnderecoNacional_NomeMunicipio" name="Intermediario.EnderecoNacional.NomeMunicipio" readonly="readonly" type="text" value="" />
              </div>
            </div>
          </div>
        </div>

        <div id="pnlIntermediarioEnderecoExterior" class="enderecoExterior" v-show="intermediario.localDomicilio === '2'">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>País<span class="asterisco">*</span></span></label>
                <select class="form-control form-chosen" id="Intermediario_EnderecoExterior_CodigoPais" name="Intermediario.EnderecoExterior.CodigoPais">
                  <option value="">Selecione...</option>
                  <option value="US">Estados Unidos</option>
                  <option value="PT">Portugal</option>
                  <option value="BR">Brasil</option>
                </select>
                <input id="Intermediario_EnderecoExterior_NomePais" name="Intermediario.EnderecoExterior.NomePais" type="hidden" value="" />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group form-group-lg">
                <label class="control-label"><span>Cidade<span class="asterisco">*</span></span></label>
                <input class="form-control" id="Intermediario_EnderecoExterior_Cidade" maxlength="255" name="Intermediario.EnderecoExterior.Cidade" type="text" value="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="comandos">
      <button id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin">
        <span>Avançar</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>

  <div id="modalHistoricoPessoas" class="modal fade" tabindex="-1" role="dialog"></div>

  <!--
    IMPORTANTE: manter 100% dos campos/IDs do HTML original (Pessoas.html).
    Estes elementos abaixo existem para não “sumir” campo nenhum durante a migração para Vue.
    A regra/visibilidade será portada em etapas, mas os campos precisam existir no DOM.
  -->
  <div id="__legacy_fields_pessoas" style="display: none">
    <input id="SimplesNacional_Opcao" name="SimplesNacional.Opcao" type="hidden" value="0" />
    <input id="txtOpcaoSN" type="text" class="form-control" disabled="disabled" value="" />
    <div id="pnlRegimeApuracaoTributosSN" class="row" style="display: none"></div>
    <select id="SimplesNacional_RegimeApuracaoTributosSN" name="SimplesNacional.RegimeApuracaoTributosSN" class="form-control form-chosen">
      <option value=""></option>
    </select>

    <div id="pnlInscricaoBrasil" class="row" style="display: none"></div>
    <div id="pnlInscricaoExterior" style="display: none"></div>

    <div id="pnlTomadorEndereco" style="display: none"></div>
    <div id="pnlTomadorInformarEnderecoCheck" class="row" style="display: none"></div>
    <div id="pnlTomadorNumeroNIF" class="form-group form-group-lg" style="display: none"></div>
    <div id="pnlTomadorMotivoNaoInformacaoNIF" class="form-group form-group-lg" style="display: none"></div>

    <div id="pnlIntermediarioEndereco" style="display: none"></div>
    <div id="pnlIntermediarioInformarEnderecoCheck" class="row" style="display: none"></div>
    <div id="pnlIntermediarioNumeroNIF" class="form-group form-group-lg" style="display: none"></div>
    <div id="pnlIntermediarioMotivoNaoInformacaoNIF" class="form-group form-group-lg" style="display: none"></div>

    <div id="pnlEmitenteEnderecoBrasil" class="enderecoBrasil" style="display: none"></div>
    <input
      data-val="true"
      data-val-required="The IndicadorEnderecoAlterado field is required."
      id="Prestador_EnderecoNacional_IndicadorEnderecoAlterado"
      name="Prestador.EnderecoNacional.IndicadorEnderecoAlterado"
      type="hidden"
      value="False"
    />

    <!-- Tomador (campos que existiam no original) -->
    <input id="Tomador_Inscricao" name="Tomador.Inscricao" type="text" value="" />
    <input id="Tomador_InscricaoMunicipal" name="Tomador.InscricaoMunicipal" type="text" value="" />
    <input id="Tomador_Nome" name="Tomador.Nome" type="text" value="" />
    <input id="Tomador_Telefone" name="Tomador.Telefone" type="text" value="" />
    <input id="Tomador_Email" name="Tomador.Email" type="text" value="" />
    <input id="Tomador_NIF" name="Tomador.NIF" type="text" value="" />
    <input id="Tomador_NIFInformado" name="Tomador.NIFInformado" type="radio" value="1" />
    <select id="Tomador_MotivoNaoInformacaoNIF" name="Tomador.MotivoNaoInformacaoNIF" class="form-control form-chosen">
      <option value="">Selecione...</option>
      <option value="1">Dispensado do NIF</option>
      <option value="2">Não exigência do NIF</option>
    </select>
    <input id="Tomador_EnderecoExterior_Numero" name="Tomador.EnderecoExterior.Numero" type="text" value="" />
    <input id="Tomador_EnderecoExterior_Complemento" name="Tomador.EnderecoExterior.Complemento" type="text" value="" />
    <input id="Tomador_EnderecoExterior_Bairro" name="Tomador.EnderecoExterior.Bairro" type="text" value="" />
    <input id="Tomador_EnderecoExterior_EstadoProvinciaRegiao" name="Tomador.EnderecoExterior.EstadoProvinciaRegiao" type="text" value="" />
    <input id="Tomador_EnderecoExterior_CodigoEnderecamentoPostal" name="Tomador.EnderecoExterior.CodigoEnderecamentoPostal" type="text" value="" />

    <button id="btn_Tomador_Inscricao_pesquisar" type="button"></button>
    <button id="btn_Tomador_Inscricao_historico" type="button"></button>
    <button id="btn_Tomador_NIF_historico" type="button"></button>

    <!-- Intermediário (campos que existiam no original) -->
    <input id="Intermediario_Inscricao" name="Intermediario.Inscricao" type="text" value="" />
    <input id="Intermediario_InscricaoMunicipal" name="Intermediario.InscricaoMunicipal" type="text" value="" />
    <input id="Intermediario_Nome" name="Intermediario.Nome" type="text" value="" />
    <input id="Intermediario_Telefone" name="Intermediario.Telefone" type="text" value="" />
    <input id="Intermediario_Email" name="Intermediario.Email" type="text" value="" />
    <input id="Intermediario_NIF" name="Intermediario.NIF" type="text" value="" />
    <input id="Intermediario_NIFInformado" name="Intermediario.NIFInformado" type="radio" value="1" />
    <select id="Intermediario_MotivoNaoInformacaoNIF" name="Intermediario.MotivoNaoInformacaoNIF" class="form-control form-chosen">
      <option value="">Selecione...</option>
      <option value="1">Dispensado do NIF</option>
      <option value="2">Não exigência do NIF</option>
    </select>
    <input id="Intermediario_EnderecoNacional_Logradouro" name="Intermediario.EnderecoNacional.Logradouro" type="text" value="" />
    <input id="Intermediario_EnderecoNacional_Numero" name="Intermediario.EnderecoNacional.Numero" type="text" value="" />
    <input id="Intermediario_EnderecoNacional_Complemento" name="Intermediario.EnderecoNacional.Complemento" type="text" value="" />
    <input id="Intermediario_EnderecoNacional_Bairro" name="Intermediario.EnderecoNacional.Bairro" type="text" value="" />
    <input id="Intermediario_EnderecoExterior_Logradouro" name="Intermediario.EnderecoExterior.Logradouro" type="text" value="" />
    <input id="Intermediario_EnderecoExterior_Numero" name="Intermediario.EnderecoExterior.Numero" type="text" value="" />
    <input id="Intermediario_EnderecoExterior_Complemento" name="Intermediario.EnderecoExterior.Complemento" type="text" value="" />
    <input id="Intermediario_EnderecoExterior_Bairro" name="Intermediario.EnderecoExterior.Bairro" type="text" value="" />
    <input id="Intermediario_EnderecoExterior_EstadoProvinciaRegiao" name="Intermediario.EnderecoExterior.EstadoProvinciaRegiao" type="text" value="" />
    <input
      id="Intermediario_EnderecoExterior_CodigoEnderecamentoPostal"
      name="Intermediario.EnderecoExterior.CodigoEnderecamentoPostal"
      type="text"
      value=""
    />

    <button id="btn_Intermediario_Inscricao_pesquisar" type="button"></button>
    <button id="btn_Intermediario_Inscricao_historico" type="button"></button>
    <button id="btn_Intermediario_NIF_historico" type="button"></button>

    <button id="btn_Prestador_EnderecoNacional_CEP" type="button"></button>

    <!-- Placeholders globais que existiam no HTML original -->
    <div id="modalLoading" class="modalBgLoading" style="display: none"></div>
    <div id="modalPessoa" class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"></div>
    <div id="navbar" class="navbar-collapse collapse"></div>
  </div>
</template>
