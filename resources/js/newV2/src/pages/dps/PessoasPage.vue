<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { initLegacyUiBindings, loadLegacyScriptOnce, loadLegacyStyleOnce, removeLegacyTag } from '../../utils/legacyScripts'

const router = useRouter()

removeLegacyTag('legacy-login-css')
removeLegacyTag('legacy-dashboard-css')

loadLegacyStyleOnce({ id: 'legacy-passos-css', href: '/css/Passos.css' })

function setLegacyGlobals() {
  const w = window as any

  w.UrlBase = 'https://www.nfse.gov.br/emissornacional/'
  w.UrlRest = 'https://restnfseprod.srv.cd.serpro'

  w.inscricaoMunicipalEmitente = ''
  w.ehSubstituicao = false
  w.accessToken = ''
  w.tipoInscricao = 'CNPJ'
  w.inscricao = '64388348000180'
  w.codMunRFB = 0
  w.ehAcessoComCertificadoDigital = false
  w.ehPraDesabilitarRegrasAcessoSemCertificado = true
  w.ehCnpjExigeAcessoCertificado = false
  w.ehAmbienteProducao = true
  w.desabilitarTomadorNfseSubsMei = false
  w.desabilitarIntermediarioNfseSubsMei = false
}

onMounted(async () => {
  setLegacyGlobals()
  await loadLegacyScriptOnce({ id: 'legacy-pessoas-js', src: '/js/Pessoas.js' })
  initLegacyUiBindings()
})

function onAvancar() {
  router.push({ name: 'dps-servico' })
}
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
                  value=""
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
                  disabled
                  id="InformarSerieNumeroDPS"
                  name="InformarSerieNumeroDPS"
                  type="checkbox"
                  value="true"
                />
                <input name="InformarSerieNumeroDPS" type="hidden" value="false" />
                <span class="cr"><i class="cr-icon fa fa-check"></i></span>
                <span class="cr-text">Informar série e número da DPS</span>
              </label>
            </div>
          </div>
        </div>

        <div id="pnlTrascricaoDPS" style="display: none">
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
                    ><input checked disabled id="TipoEmitente" name="TipoEmitente" type="radio" value="1" />Prestador<span
                      class="cr"
                      ><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input disabled id="TipoEmitente" name="TipoEmitente" type="radio" value="2" />Tomador<span class="cr"
                      ><i class="cr-icon"></i></span
                  ></label>
                </div>
                <div class="radiobutton">
                  <label
                    ><input disabled id="TipoEmitente" name="TipoEmitente" type="radio" value="3" />Intermediário<span
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
                <option value=""></option>
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
                  value=""
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
                  value=""
                />
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 0 20px 15px; margin-top: 20px">
        <button id="btnMaisInfoEmitente" class="btn btn-lg btn-info" disabled ativo="Ocultar detalhes do emitente" inativo="Exibir detalhes do emitente">
          Exibir detalhes do emitente
        </button>
      </div>
      <div id="pnlMaisInfo" style="display: none; padding: 0 20px"></div>
    </div>

    <div id="pnlTomador" data-tipoPessoa="Tomador" class="pnlCollapse semi-aberto">
      <h2>Tomador do Serviço</h2>
      <div style="padding: 0 20px">
        <div class="form-group form-group-lg">
          <label class="control-label">
            <span>Onde está localizado o estabelecimento/domicílio?<span class="asterisco">*</span></span>
          </label>
          <div class="radio-options">
            <div class="radiobutton inline">
              <label
                ><input checked data-val="true" data-val-number="O campo Onde está localizado o estabelecimento/domicílio? deve ser um número." disabled id="Tomador_LocalDomicilio" name="Tomador.LocalDomicilio" type="radio" value="0" />Tomador não informado<span
                  class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
            <div class="radiobutton inline">
              <label
                ><input disabled id="Tomador_LocalDomicilio" name="Tomador.LocalDomicilio" type="radio" value="1" />Brasil<span class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
            <div class="radiobutton inline">
              <label
                ><input disabled id="Tomador_LocalDomicilio" name="Tomador.LocalDomicilio" type="radio" value="2" />Exterior<span class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
          </div>
        </div>
      </div>
      <div class="retratil" style="padding-top: 0; display: none"></div>
    </div>

    <div id="pnlIntermediario" data-tipoPessoa="Intermediario" class="pnlCollapse semi-aberto">
      <h2>Intermediario do Serviço</h2>
      <div style="padding: 0 20px">
        <div class="form-group form-group-lg">
          <label class="control-label">
            <span>Onde está localizado o estabelecimento/domicílio?<span class="asterisco">*</span></span>
          </label>
          <div class="radio-options">
            <div class="radiobutton inline">
              <label
                ><input checked data-val="true" data-val-number="O campo Onde está localizado o estabelecimento/domicílio? deve ser um número." disabled id="Intermediario_LocalDomicilio" name="Intermediario.LocalDomicilio" type="radio" value="0" />Intermediário não informado<span
                  class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
            <div class="radiobutton inline">
              <label
                ><input disabled id="Intermediario_LocalDomicilio" name="Intermediario.LocalDomicilio" type="radio" value="1" />Brasil<span class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
            <div class="radiobutton inline">
              <label
                ><input disabled id="Intermediario_LocalDomicilio" name="Intermediario.LocalDomicilio" type="radio" value="2" />Exterior<span class="cr"
                  ><i class="cr-icon"></i></span
              ></label>
            </div>
          </div>
        </div>
      </div>
      <div class="retratil" style="padding-top: 0; display: none"></div>
    </div>

    <div class="comandos">
      <button id="btnAvancar" type="submit" class="btn btn-lg btn-primary direita has-spin">
        <span>Avançar</span><img src="/img/btn-avancar.svg" />
      </button>
    </div>
  </form>

  <div id="modalHistoricoPessoas" class="modal fade" tabindex="-1" role="dialog"></div>
</template>
