function ContarCaracteres(n) {
    var t = n.val().length;
    n.siblings(".contador").find("span").text(t)
}
function VerificarCenarioDeExportacao() {
    var e, s;
    if ($("input[type=radio][id=ServicoPrestado_HaExportacaoImunidadeNaoIncidencia]:checked").val() == undefined || $("input[type=radio][id=ServicoPrestado_HaExportacaoImunidadeNaoIncidencia]:checked").val() == "1" && $("#ServicoPrestado_MotivoNaoTributacao").val() == "")
        return !0;
    var n = $("#hdfTomadorNoExterior").val() == "true"
      , t = $("#hdfIntermediarioNoExterior").val() == "true"
      , i = $("#LocalPrestacao_CodigoPaisPrestacao").val() != "BR"
      , r = $("#MunicipioIncidencia_Tipo").val()
      , f = $("input[type=radio][id=ServicoPrestado_HaExportacaoImunidadeNaoIncidencia]:checked").val() == "0"
      , u = $("input[type=radio][id=ServicoPrestado_HaExportacaoImunidadeNaoIncidencia]:checked").val() == "1" && $("#ServicoPrestado_MotivoNaoTributacao").val() == "3"
      , o = "O sistema considera este cenário para a prestação de serviço informado na DPS uma Operação Tributável. Não é permitido ao emitente da DPS informar que este cenário de prestação de serviço se trata de uma operação de Exportação de Serviço.";
    return !n && !t && !i && r == 3 && u ? (ExibirAlerta(o),
    !1) : !n && !t && !i && r == 2 && u ? (ExibirAlerta(o),
    !1) : !n && t && !i && r == 3 && u ? (ExibirAlerta(o),
    !1) : !n && t && !i && r == 2 && u ? (ExibirAlerta(o),
    !1) : n && !t && !i && r == 2 && u ? (ExibirAlerta(o),
    !1) : n && t && !i && r == 2 && u ? (ExibirAlerta(o),
    !1) : (e = "O sistema considera este cenário para a prestação de serviço informado na DPS uma Exportação de Serviço. Não é permitido ao emitente da DPS informar que que este cenário de prestação de serviço se trata de uma Operação Tributável.",
    !n && !t && i && r == 2 && f) ? (ExibirAlerta(e),
    !1) : !n && t && i && r == 2 && f ? (ExibirAlerta(e),
    !1) : n && !t && i && r == 3 && f ? (ExibirAlerta(e),
    !1) : n && !t && i && r == 2 && f ? (ExibirAlerta(e),
    !1) : n && t && i && r == 3 && f ? (ExibirAlerta(e),
    !1) : n && t && i && r == 2 && f ? (ExibirAlerta(e),
    !1) : (s = "Para este cenário em que foi informado que o tomador do serviço está no exterior e o serviço prestado é devido no local do estabelecimento do tomador, o sujeito passivo será o prestador do serviço e o local de incidência do ISSQN será o local da prestação do serviço, conforme os parágrafos 1º e 2º do Art. 127 do CTN.",
    n && !t && !i && r == 3 && f ? (window.UsuarioAlterouServico = !1,
    window.SubstituiIncidenciaNoTomador = !0,
    ExibirAlerta(s)) : n && t && !i && r == 3 && f ? (window.UsuarioAlterouServico = !1,
    window.SubstituiIncidenciaNoTomador = !0,
    ExibirAlerta(s)) : window.SubstituiIncidenciaNoTomador = !1,
    n || t || i || !n && !t && !i && r == 1 && u ? ($("#pnlComercioExterior").slideDown(),
    $("#ExigeGrupoCOMEX").val("SIM")) : (LimparPnlCOMEX(),
    $("#pnlComercioExterior").slideUp(),
    $("#ExigeGrupoCOMEX").val("NAO"),
    $("#pnlMsgGrupoCOMEX").slideUp()),
    !n && !t && !i && r == 1 && u || !n && t && !i && r == 1 && u || n && !t && !i && r == 1 && u || n && !t && !i && r == 3 && u || n && t && !i && r == 1 && u || n && t && !i && r == 3 && u ? ($("#pnlResultadoExportacaoPais").slideDown(),
    $("#ServicoPrestado_CodigoPaisResultadoEhObrigatorio").val("True")) : ($("#pnlResultadoExportacaoPais").slideUp(),
    $("#ServicoPrestado_CodigoPaisResultadoEhObrigatorio").val("False")),
    !0)
}
function VerificarIncidenciaDoImposto() {
    $("#hdfCodMunIncid").val() != $("#LocalPrestacao_CodigoMunicipioPrestacao").val() && ($("#hdfCodMunIncid").val($("#LocalPrestacao_CodigoMunicipioPrestacao").val()),
    $("#hdfInformadoCodTribMun").val(""),
    TratarExibicaoCodigoTributacaoMunicipal(null));
    var i = $("#hdfCodMunEmi").val()
      , r = $("#hdfCodMunToma").val()
      , u = $("#LocalPrestacao_CodigoPaisPrestacao").val()
      , n = $("#LocalPrestacao_CodigoMunicipioPrestacao").val() != "" ? $("#LocalPrestacao_CodigoMunicipioPrestacao").val() : null
      , t = $("#ServicoPrestado_CodigoTributacaoNacional").val()
      , f = $("#ServicoPrestado_CodigoComplementarMunicipal").val()
      , e = $("#hdfEhEmpresaMei").val() == "true";
    if (t != "" && t != null && (u != "BR" || n != "" && n != null)) {
        if (n == "999" && t.startsWith("20.01")) {
            AlterarSelecaoChosen($("#ServicoPrestado_CodigoTributacaoNacional"), "");
            ExibirAlerta('Para atender o Art.3º, §3º da LC 1116/03, que estabelece que os serviço prestados em "Águas Marítimas" terão o município de incidência do ISSQN o local do estabelecimento do prestador, os serviços do subitem 20.01 não podem ter local de prestação "Águas Marítimas", já que pelo inciso XXI dos mesmos artigo e lei, o município de incidência dos subitens do item 20 é o local da prestação do serviço.');
            return
        }
        $.ajax({
            url: window.UrlBase + "api/emissaodps/VerificarIncidencia",
            type: "GET",
            async: !1,
            cache: !1,
            timeout: 1e4,
            dataType: "json",
            data: {
                cMunEmi: i,
                cMunTom: r,
                cMunPre: n,
                cTribNac: t,
                cTribMun: f,
                dtCompet: $("#DataCompetenciaFormat").val(),
                cEhOptanteMei: e
            },
            beforeSend: function() {
                ExibirLoading()
            },
            complete: function() {
                OcultarLoading()
            },
            success: function(n) {
                if (AtualizarMunicipioDeIncidencia(n),
                window.UsuarioAlterouServico) {
                    var t = $("#MunicipioIncidencia_Tipo").val();
                    if ($("#MunicipioIncidencia_Tipo").val(n.TipoMunicipioIncidencia),
                    !VerificarCenarioDeExportacao()) {
                        window.UsuarioAlterouServico = !1;
                        VoltarCampoSelect2ParaOpcaoAnterior($("#ServicoPrestado_CodigoTributacaoNacional"));
                        $("#MunicipioIncidencia_Tipo").val(t);
                        return
                    }
                }
            },
            error: function(n) {
                try {
                    var t = n && n.responseJSON ? n.responseJSON : null
                      , i = t && (t.Message || t.message) ? t.Message || t.message : null;
                    i && console.log(i)
                } catch (r) {}
                ExibirAlerta("Não foi possível determinar o município de incidência do ISSQN para esta NFS-e")
            }
        })
    }
}
function AtualizarMunicipioDeIncidencia(n) {
    if (n.HaIncidenciaDeISSQN == !1 && n.Codigo != 0) {
        if (n.ListaTributacaoMunicipal == 0) {
            $("#pnlTributacaoMunicipal").slideUp();
            TratarNaoIncidencia();
            VerificarInformacoesComplementaresParaServico(n.EhAtividadeObra, n.EhAtividadeEvento);
            return
        }
        if (TratarExibicaoCodigoTributacaoMunicipal(n),
        $("#hdfInformadoCodTribMun").val() == "true") {
            TratarNaoIncidencia();
            VerificarInformacoesComplementaresParaServico(n.EhAtividadeObra, n.EhAtividadeEvento);
            return
        }
    }
    if (TratarExibicaoCodigoTributacaoMunicipal(n),
    n.ListaTributacaoMunicipal == 0 || $("#hdfInformadoCodTribMun").val() == "true") {
        if (n.Mensagem != null) {
            if (n.ServicoRequerTomador) {
                SolicitarInclusaoDeTomador();
                return
            }
            $("#pnlMsgMunIncidencia").html(n.Mensagem);
            $("#pnlMsgMunIncidencia").slideDown()
        } else
            $("#pnlMsgMunIncidencia").slideUp(),
            $("#pnlMsgMunIncidencia").html("");
        LimparMunicipioIncidencia();
        (window.CodigoServicoAnterior.startsWith("99") && window.UsuarioAlterouServico || !window.CodigoServicoAnterior.startsWith("99") && $("#ServicoPrestado_MotivoNaoTributacao").val() == 4) && LimparCamposDeNaoTributacao();
        window.UsuarioAlterouServico = !1;
        $("#MunicipioIncidencia_Tipo").val(n.TipoMunicipioIncidencia);
        $("#MunicipioIncidencia_Nome").val(n.Nome);
        $("#MunicipioIncidencia_Codigo").val(n.Codigo != null ? n.Codigo : "0");
        $("#MunicipioIncidencia_EhConveniado").val(n.Conveniado);
        $("#MunicipioIncidencia_EhConvenioVigente").val(n.EhConvenioVigente);
        $("input[type=radio][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").is(":enabled") && $("input[type=hidden][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").remove();
        $("#ServicoPrestado_MotivoNaoTributacao").val() != 4 && $("input[type=radio][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").prop("disabled", !1);
        window.CodigoServicoAnterior = $("#ServicoPrestado_CodigoTributacaoNacional").val();
        window.DescricaoServicoAnterior = $("#ServicoPrestado_CodigoTributacaoNacional").select2("data")[0].text
    }
    VerificarInformacoesComplementaresParaServico(n.EhAtividadeObra, n.EhAtividadeEvento)
}
function LimparMunicipioIncidencia() {
    $("#MunicipioIncidencia_Codigo").val("");
    $("#MunicipioIncidencia_Nome").val("");
    $("#MunicipioIncidencia_EhConveniado").val("")
}
function SolicitarInclusaoDeTomador() {
    var n = "";
    switch ($("#hdfNivelInfoTomador").val()) {
    case "0":
        n = "O Código de Tributação Nacional selecionado exige que o tomador do serviço seja informado.<br/>Deseja incluir as informações do tomador do serviço?";
        break;
    case "1":
        n = "O Código de Tributação Nacional selecionado exige que o tomador do serviço seja informado com um endereço válido. O tomador atual não possui um endereço especificado.<br/>Deseja editar as informações deste tomador do serviço?";
        break;
    default:
        return
    }
    $.confirm({
        icon: "fa fa-warning",
        title: "Confirmação",
        content: n,
        animation: "opacity",
        closeAnimation: "opacity",
        animateFromElement: !1,
        columnClass: "medium",
        backgroundDismissAnimation: "none",
        bgOpacity: .7,
        draggable: !1,
        offsetTop: 150,
        buttons: {
            sim: {
                text: "Sim",
                btnClass: "btn-blue",
                action: function() {
                    var n = $("#hdfIdr").val();
                    AbrirModalTomador(n, 2, "cpfcnpj", 1);
                    return
                }
            },
            nao: {
                text: "Não",
                action: function() {
                    VoltarCampoSelect2ParaOpcaoAnterior($("#ServicoPrestado_CodigoTributacaoNacional"));
                    return
                }
            }
        }
    })
}
function toggleInformarEnderecoEvento() {
    $("#Evento_InformarEndereco").is(":checked") ? $("#Evento_Identificacao").val() != "" ? $.confirm({
        icon: "fa fa-warning",
        title: "Confirmação",
        content: 'Para Atividade de Evento você deve informar o campo "Identificação" ou "Endereço". As informações de Identificação serão perdidas. Deseja continuar?',
        animation: "opacity",
        closeAnimation: "opacity",
        animateFromElement: !1,
        columnClass: "medium",
        backgroundDismissAnimation: "none",
        bgOpacity: .7,
        draggable: !1,
        offsetTop: 150,
        buttons: {
            sim: {
                text: "Sim",
                btnClass: "btn-blue",
                action: function() {
                    $("#Evento_Identificacao").val("");
                    BloquearCampo($("#Evento_Identificacao"))
                }
            },
            nao: {
                text: "Não",
                action: function() {
                    $("input[type=checkbox][id=Evento_InformarEndereco]").prop("checked", !1)
                }
            }
        }
    }) : ($("#Evento_Identificacao").val(""),
    BloquearCampo($("#Evento_Identificacao")),
    $("#pnlEventoEndereco").slideDown(),
    $("#pnlEventoEnderecoNacional").show(),
    $("#Evento_EhObrigatorioEnderecoNacional").val("True")) : (DesbloquearCampo($("#Evento_Identificacao")),
    $("#Evento_EhObrigatorioEnderecoNacional").val("False"),
    $("#pnlEventoEndereco").slideUp(),
    $("#Evento_CEP").val(""),
    $("#Evento_Bairro").val(""),
    $("#Evento_Logradouro").val(""),
    $("#Evento_Numero").val(""),
    $("#Evento_Complemento").val(""))
}
function BuscarCepParaEventoEObra(n, t) {
    if ($("#LocalPrestacao_CodigoMunicipioPrestacao").val() == null) {
        t.find('input[id$="_CEP"]').val("");
        ExibirAlerta("Antes de informar o CEP, informe acima o município do local de prestação do serviço");
        return
    }
    $.ajax({
        url: window.UrlBase + "api/emissaodps/cep/" + n,
        type: "GET",
        headers: {
            Authorization: sessionStorage.getItem("accessToken")
        },
        dataType: "json",
        beforeSend: function() {
            ExibirLoading()
        },
        complete: function() {
            OcultarLoading()
        },
        success: function(n) {
            var r = $("#LocalPrestacao_CodigoMunicipioPrestacao").val() != null ? $("#LocalPrestacao_CodigoMunicipioPrestacao").val() : 0, i;
            n.CodigoCompletoMunicipio != r ? (i = $("#LocalPrestacao_CodigoMunicipioPrestacao").select2("data")[0].text,
            ExibirAlerta("O CEP informado não pertence ao município definido como local da prestação do serviço (" + i + ")."),
            LimparEnderecoDeObra(),
            LimparEnderecoDeEvento()) : (t.find('input[id$="_CodigoMunicipio"]').val(n.CodigoCompletoMunicipio),
            t.find('input[id$="_NomeMunicipio"]').val(n.Municipio + "/" + n.SiglaUF),
            t.find('input[id$="_Bairro"]').val(n.Bairro),
            t.find('input[id$="_Logradouro"]').val(n.Logradouro),
            t.find(".bairro").val(n.Bairro),
            t.find(".logradouro").val(n.Logradouro))
        },
        error: function(n) {
            LimparEnderecoDeObra();
            n.status == 429 ? ExibirAlerta("Você atingiu o limite de consultas ao CEP. Aguarde alguns minutos e tente novamente.") : n.status == 404 ? ExibirAlerta("O CEP informado não encontrado.") : ExibirAlerta("Não foi possível obter as informações do CEP informado. Aguarde alguns minutos e tente novamente.")
        }
    })
}
function VoltarCampoSelect2ParaOpcaoAnterior(n) {
    $(n).empty();
    var t = $("<option selected><\/option>").val(window.CodigoServicoAnterior).text(window.DescricaoServicoAnterior);
    $(n).append(t).trigger("change")
}
function VerificarInformacoesComplementaresParaServico(n, t) {
    n || $("#ServicoPrestado_CodigoTributacaoNacional").val().startsWith("99") ? ($("#pnlObra").slideDown(),
    $("#ServicoPrestado_CodigoTributacaoNacional").val().startsWith("99") ? ($("#pnlObraParaServico99").slideDown(),
    $("#pnlObraInformada").slideUp(),
    $("#Obra_EhObrigatorio").val("False"),
    $("#InformarDadosObra").prop("checked", !1)) : ($("#Obra_EhObrigatorio").val("True"),
    $("#pnlObraParaServico99").slideUp(),
    $("#pnlObraInformada").slideDown())) : OcultarPnlObra();
    t || $("#ServicoPrestado_CodigoTributacaoNacional").val().startsWith("99") ? ($("#pnlEvento").slideDown(),
    $("#ServicoPrestado_CodigoTributacaoNacional").val().startsWith("99") ? ($("#pnlEventoParaServico99").slideDown(),
    $("#pnlEventoInformado").slideUp(),
    $("#Evento_EhObrigatorio").val("False"),
    $("#InformarDadosEvento").prop("checked", !1)) : ($("#Evento_EhObrigatorio").val("True"),
    $("#pnlEventoParaServico99").slideUp(),
    $("#pnlEventoInformado").slideDown())) : ($("#Evento_TipoInformacao").prop("checked", !1),
    $("#pnlEvento").slideUp())
}
function LimparCamposDeNaoTributacao() {
    $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="0"]').prop("checked", !1);
    $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="1"]').prop("checked", !1);
    window.MotivoNaoTributacaoAnterior = "";
    AlterarSelecaoChosen($("#ServicoPrestado_MotivoNaoTributacao"), "");
    $("#pnlMotNaoIncid").slideUp();
    AlterarSelecaoChosen($("#ServicoPrestado_TipoImunidade"), "");
    $("#pnlTipoImunidade").slideUp();
    AlterarSelecaoChosen($("#ServicoPrestado_CodigoPaisResultado"), "");
    $("#ServicoPrestado_CodigoPaisResultadoEhObrigatorio").val("false");
    $("#pnlResultadoExportacao").slideUp();
    $("#pnlResultadoExportacaoPais").slideDown()
}
function OcultarPnlObra() {
    $("#pnlObra").slideUp();
    $("#InformarDadosObra").prop("checked", !1);
    $("#Obra_EhObrigatorio").val("False");
    $("#pnlObraInformada").slideUp();
    ReiniciarPnlObra()
}
function ReiniciarPnlObra() {
    $("#pnlObraDetalhes").slideUp();
    $("#pnlObraCodigoObra").slideUp();
    $("#pnlObraCodigoCIB").slideUp();
    $("#pnlObraEndereco").slideUp();
    $("#pnlObraEnderecoNacional").slideUp();
    $("#pnlObraEnderecoExterior").slideUp();
    $("input[type=radio][id=Obra_TipoInformacao]").prop("checked", !1);
    window.TipoObraAnterior = "";
    $("#Obra_CodigoObra").val("");
    $("#Obra_CodigoCIB").val("");
    LimparEnderecoDeObra();
    $("#Obra_InscricaoImobiliaria").val("");
    $("#ServicoPrestado_CodigoTributacaoNacional").val().startsWith("99") && ($("#pnlObraParaServico99").show(),
    $("#InformarDadosObra").prop("checked", !1))
}
function LimparEnderecoDeObra() {
    $('#pnlObraDetalhes input[id^="Obra_"]').val("")
}
function OcultarPnlEvento() {
    $("#pnlEvento").slideUp();
    $("#InformarDadosEvento").prop("checked", !1);
    $("#Evento_EhObrigatorio").val("False");
    $("#pnlEventoInformado").slideUp();
    ReiniciarPnlEvento()
}
function ReiniciarPnlEvento() {
    $("#pnlEventoDetalhes").slideUp();
    $("#pnlEventoIdentificacao").slideUp();
    $("#pnlEventoEndereco").slideUp();
    $("#pnlEventoEnderecoNacional").slideUp();
    $("#pnlEventoEnderecoExterior").slideUp();
    $('#Evento_TipoInformacao[value="1"]').prop("checked", !1);
    $('#Evento_TipoInformacao[value="3"]').prop("checked", !1);
    $('#Evento_TipoInformacao[value="4"]').prop("checked", !1);
    window.TipoEventoAnterior = "";
    $("#Evento_Identificacao").val("");
    LimparEnderecoDeEvento();
    $("#Evento_DataInicial").val("");
    $("#Evento_DataFinal").val("");
    $("#Evento_Descricao").val("");
    $("#ServicoPrestado_CodigoTributacaoNacional").val().startsWith("99") && ($("#pnlEventoParaServico99").show(),
    $("#InformarDadosEvento").prop("checked", !1))
}
function LimparEnderecoDeEvento() {
    $('#pnlEventoDetalhes input[id^="Evento_"]').val("")
}
function OcultarPnlCOMEX() {
    $("#pnlComercioExterior").slideUp();
    $("#ExigeGrupoCOMEX").val("NAO");
    LimparPnlCOMEX()
}
function LimparPnlCOMEX() {
    AlterarSelecaoChosen($("#ComercioExterior_ModoPrestacao"), "");
    AlterarSelecaoChosen($("#ComercioExterior_VinculoPrestacao"), "");
    $("#ComercioExterior_TipoMoeda").val("");
    $("#ComercioExterior_ValorServicoMoedaEstrangeira").val("");
    AlterarSelecaoChosen($("#ComercioExterior_MecanismoApoioPrestador"), "");
    AlterarSelecaoChosen($("#ComercioExterior_MecanismoApoioTomador"), "");
    AlterarSelecaoChosen($("#ComercioExterior_MovimentacaoTempBens"), "");
    $("#pnlNumeroRE").slideUp();
    $("#pnlNumeroDI").slideUp();
    $("#ComercioExterior_NumeroDI").val("");
    $("#ComercioExterior_NumeroRE").val("");
    $('#ComercioExterior_CompartilharComMDIC[value="0"]').prop("checked", !1);
    $('#ComercioExterior_CompartilharComMDIC[value="1"]').prop("checked", !1)
}
function TratarNaoIncidencia() {
    LimparMunicipioIncidencia();
    $("#pnlMunIncid").slideUp();
    LimparCamposDeNaoTributacao();
    $("input[type=radio][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").prop("disabled", !0);
    $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="1"]').prop("checked", !0);
    $("<input>").attr({
        type: "hidden",
        id: "ServicoPrestado_HaExportacaoImunidadeNaoIncidencia",
        name: "ServicoPrestado.HaExportacaoImunidadeNaoIncidencia",
        value: "SIM"
    }).appendTo("#pnlServicoPrestado");
    AlterarSelecaoChosen($("#ServicoPrestado_MotivoNaoTributacao"), "4");
    BloquearCampo($("#ServicoPrestado_MotivoNaoTributacao"));
    $("#pnlMotNaoIncid").slideDown();
    $("#ServicoPrestado_CodigoComplementarMunicipalObrigatorio").val("false");
    $("#ServicoPrestado_DescricaoCodigoTributacaoNacional").val($("#ServicoPrestado_CodigoTributacaoNacional").select2("data")[0].text);
    DesbloquearCampo("#ServicoPrestado_Descricao");
    DesbloquearCampo("#ServicoPrestado_CodigoNBS");
    window.CodigoServicoAnterior = $("#ServicoPrestado_CodigoTributacaoNacional").val();
    window.DescricaoServicoAnterior = $("#ServicoPrestado_CodigoTributacaoNacional").select2("data")[0].text;
    $("#ServicoPrestado_CodigoTributacaoNacional").val().startsWith("99") && VerificarInformacoesComplementaresParaServico(!1, !1)
}
function TratarExibicaoCodigoTributacaoMunicipal(n) {
    if (n == null || n.ListaTributacaoMunicipal == null || n.ListaTributacaoMunicipal.length == 0) {
        $("#ServicoPrestado_CodigoComplementarMunicipal").empty();
        $("#ServicoPrestado_CodigoComplementarMunicipalObrigatorio").val("false");
        AlterarSelecaoChosen($("#ServicoPrestado_CodigoComplementarMunicipal"), "");
        $("#pnlTributacaoMunicipal").slideUp();
        return
    }
    ($("#hdfInformadoCodTribMun").val() != "true" || n.Conveniado != !0) && ($("#ServicoPrestado_CodigoComplementarMunicipal").empty(),
    $("#ServicoPrestado_CodigoComplementarMunicipal").val(""),
    $.each(n.ListaTributacaoMunicipal, function(n, t) {
        $("#ServicoPrestado_CodigoComplementarMunicipal").append($("<option><\/option>").attr("value", t.Codigo).text(t.Descricao))
    }),
    AlterarSelecaoChosen($("#ServicoPrestado_CodigoComplementarMunicipal"), ""),
    $("#ServicoPrestado_CodigoComplementarMunicipalObrigatorio").val("true"),
    $("#hdfCodigoComplementarMunicipal").val() != "" && (AlterarSelecaoChosen($("#CodigoComplementarMunicipal"), $("#hdfCodigoComplementarMunicipal").val()),
    $("#hdfCodigoComplementarMunicipal").val("")),
    $("#pnlTributacaoMunicipal").slideDown())
}
function ReiniciarOpcoesAposAlterarCodigoTributacaoNacional() {
    LimparCamposDeNaoTributacao();
    $("input[type=radio][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").prop("disabled", !0);
    LimparMunicipioIncidencia();
    $("#pnlMunIncid").slideUp();
    $("#pnlMsgMunIncidencia").html("");
    $("#pnlMsgMunIncidencia").slideUp();
    $("#ServicoPrestado_Descricao").val("");
    BloquearCampo("#ServicoPrestado_Descricao");
    AlterarSelecaoChosen($("#ServicoPrestado_CodigoNBS"), "");
    BloquearCampo("#ServicoPrestado_CodigoNBS");
    OcultarPnlObra();
    OcultarPnlEvento();
    OcultarPnlCOMEX();
    window.UsuarioAlterouServico = !0;
    $("#hdfCodigoComplementarMunicipal").val("");
    $("#ServicoPrestado_CodigoComplementarMunicipalObrigatorio").val("false");
    $("#ServicoPrestado_CodigoComplementarMunicipal").empty();
    $("#ServicoPrestado_CodigoPaisResultadoEhObrigatorio").val("false");
    AlterarSelecaoChosen($("#ServicoPrestado_CodigoPaisResultado"), "");
    $("input[type=hidden][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").remove()
}
function ExcluirTodosOsItensPedido() {
    $.confirm({
        icon: "fa fa-warning",
        title: "Confirmação",
        content: "Todos os itens do pedido serão apagados,<br />Deseja continuar?",
        animation: "opacity",
        closeAnimation: "opacity",
        animateFromElement: !1,
        columnClass: "medium",
        backgroundDismissAnimation: "none",
        bgOpacity: .7,
        draggable: !1,
        offsetTop: 250,
        buttons: {
            sim: {
                text: "Sim",
                btnClass: "btn-blue",
                action: function() {
                    var n = $("#hdfIdr").val();
                    $.ajax({
                        url: window.UrlBase + "DPS/Pedido/ExcluirTodos/?idr=" + n,
                        method: "POST",
                        data: "",
                        success: function(n) {
                            return n.Mensagem != undefined ? (ExibirAlerta("Não foi possível excluir os itens"),
                            !1) : ($("#pnlItensPedido .lista").html(n.HTML),
                            $("#pnlItensPedido").slideUp(),
                            !0)
                        }
                    })
                }
            },
            nao: {
                text: "Não",
                action: function() {
                    return this.close(),
                    !1
                }
            }
        }
    })
}
function AbrirModalTomador(n) {
    $("#modalTomador").html("");
    $.ajax({
        url: window.UrlBase + "dps/modaltomador/abrir/",
        method: "GET",
        data: {
            idr: n
        },
        beforeSend: function() {
            ExibirLoading()
        },
        complete: function() {
            OcultarLoading()
        },
        success: function(n) {
            $("#modalTomador").html(n);
            $("#LocalDomicilio:checked").val() == undefined && $("#frmPessoa").closest(".modal-content").find("#btnSalvar").prop("disabled", !0);
            $("#modalTomador").modal({
                backdrop: "static",
                keyboard: !1
            });
            window.UltimaInscricaoPesquisadaModalTomador = $("#frmPessoa #Inscricao").val();
            FuncoesBasicas();
            FuncoesBasicasModalTomador()
        },
        error: function(n) {
            console.log(n.responseText);
            ExibirAlerta("Não foi possível exibir o formulário para inclusão do Tomador/Intermediário")
        }
    })
}
function FuncoesBasicasModalTomador() {
    $("#frmPessoa").on("change", 'input[type="radio"][id$="LocalDomicilio"]', function() {
        window.UltimaInscricaoPesquisadaModalTomador = "";
        $("#frmPessoa").closest(".modal-content").find("#btnSalvar").prop("disabled", !1);
        var n = $(this).closest(".modal-body");
        ReiniciarPessoa(n);
        n.find('[id$="NumeroNIF"]').slideUp();
        n.find('[id$="MotivoNaoInformacaoNIF"]').slideUp();
        n.find(".form-group").removeClass("erro").find(".field-validation-error").empty();
        switch (this.value) {
        case "1":
            n.find(".retratil").slideDown();
            n.find("#pnlInscricaoBrasil").show();
            n.find("#pnlInscricaoExterior").hide();
            BloquearCampo(n.find('[id$="Nome"]'));
            n.find("#pnlEnderecoBrasil").show();
            n.find("#pnlEnderecoExterior").hide();
            n.find("#EnderecoNacional_PessoaInformarEndereco").val("True");
            n.find("#EnderecoExterior_PessoaInformarEndereco").val("False");
            break;
        case "2":
            n.find(".retratil").slideDown();
            n.find("#pnlInscricaoBrasil").hide();
            n.find("#pnlInscricaoExterior").show();
            DesbloquearCampo(n.find('[id$="Nome"]'));
            n.find("#pnlEnderecoBrasil").hide();
            n.find("#pnlEnderecoExterior").show();
            n.find("#EnderecoNacional_PessoaInformarEndereco").val("False");
            n.find("#EnderecoExterior_PessoaInformarEndereco").val("True")
        }
    });
    $("#frmPessoa").on("change", 'input[type="radio"][id$="NIFInformado"]', function() {
        var n = $(this).closest(".modal-body");
        switch ($(this).val()) {
        case "0":
            n.find('div[id$="NumeroNIF"]').slideUp();
            n.find('[id$="NIF"]').val("");
            n.find('div[id$="MotivoNaoInformacaoNIF"]').slideDown();
            break;
        case "1":
            n.find('div[id$="NumeroNIF"]').slideDown();
            n.find('div[id$="MotivoNaoInformacaoNIF"]').slideUp();
            n.find('[id$="MotivoNaoInformacaoNIF"]').val("")
        }
    });
    $("#frmPessoa .cpfcnpj").focusout(function() {
        var t = $("#frmPessoa"), n = NormalizaValor($(this).val()), i;
        if (n.length != 11 && n.length != 14) {
            $("#frmPessoa #Inscricao").val(window.UltimaInscricaoPesquisadaModalTomador);
            window.UltimaInscricaoPesquisadaModalTomador == "" && (LimparPessoaModalPessoa(),
            LimparEnderecoModalPessoa());
            n.length > 0 && ExibirAlerta("Por favor, informe um CPF/CNPJ válido");
            return
        }
        if (window.UltimaInscricaoPesquisadaModalTomador == n) {
            ExibirAlerta("Informe um CPF/CNPJ diferente para buscar novas informações");
            return
        }
        if (ExibirLoading(),
        LimparPessoaModalPessoa(),
        LimparEnderecoModalPessoa(),
        i = RecuperarInfoInscricao(n, dataCompetencia),
        i == null) {
            OcultarLoading();
            $("#frmPessoa #Inscricao").val(window.UltimaInscricaoPesquisadaModalTomador);
            window.UltimaInscricaoPesquisadaModalTomador == "" && (LimparPessoaModalPessoa(),
            LimparEnderecoModalPessoa());
            ExibirAlerta("A inscrição informada não foi encontrada no cadastro de CPF/CNPJ");
            return
        }
        window.UltimaInscricaoPesquisadaModalTomador = n;
        t.find("#Inscricao").val(i.inscricao);
        t.find("#Nome").val(i.nomerazaosocial);
        t.find("#Nome").closest(".form-group").removeClass("erro");
        t.find("#Nome").closest(".form-group").find(".field-validation-error").hide();
        OcultarLoading()
    });
    $("#frmPessoa .cep").parent().find(".btn").on("click", function() {
        var n = $(this).closest(".input-group").find("input[type=text]").val().replace(/\D/g, "");
        if (n.length != 8) {
            ExibirAlerta("O CEP informado está incorreto");
            return
        }
        BuscarCEP(n, $("#frmPessoa #pnlEnderecoBrasil"))
    });
    $("#frmPessoa .cep").focusout(function() {
        var n = $(this).closest(".input-group").find("input[type=text]").val().replace(/\D/g, "");
        if (n.length != 8) {
            ExibirAlerta("O CEP informado está incorreto");
            return
        }
        BuscarCEP(n, $("#frmPessoa #pnlEnderecoBrasil"))
    });
    $("#frmPessoa #EnderecoExterior_CodigoPais").on("change", function(n) {
        n.preventDefault();
        var t = $("#frmPessoa #EnderecoExterior_CodigoPais option:selected").text().trim();
        $("#frmPessoa #EnderecoExterior_NomePais").val(t)
    });
    $("#modalTomador").on("click", "#btnFechar", function(n) {
        n.preventDefault();
        VoltarCampoSelect2ParaOpcaoAnterior($("#ServicoPrestado_CodigoTributacaoNacional"));
        $("#modalTomador").modal("hide")
    });
    $("#modalTomador").off("click", "#btnSalvar");
    $("#modalTomador").on("click", "#btnSalvar", function(n) {
        n.preventDefault();
        $("#modalTomador .modal-body form").submit()
    });
    $("#modalTomador").off("submit", ".modal-body form");
    $("#modalTomador").on("submit", ".modal-body form", function(n) {
        n.preventDefault();
        var t = $(this);
        $.ajax({
            url: t.attr("action"),
            method: t.attr("method"),
            data: t.serialize(),
            success: function(n) {
                n.Sucesso ? ($("#modalTomador").modal("hide"),
                $("#hdfCodMunToma").val(n.Pessoa.EnderecoNacional.CodigoMunicipio),
                $("#hdfCMunTomador").val(n.Pessoa.EnderecoNacional.CodigoMunicipio),
                $("#MunicipioIncidencia_Tipo").val("3"),
                ExibirAlerta("O tomador do serviço foi atualizado com sucesso")) : ($("#modalTomador").html(n.HTML),
                FuncoesBasicas(),
                FuncoesBasicasModalTomador())
            },
            error: function() {
                ExibirAlerta("Não foi possível realizar a atualização do Tomador de serviço")
            }
        })
    })
}
function LimparPessoaModalPessoa() {
    $('#frmPessoa input[id$="Inscricao"]').val("");
    $('#frmPessoa input[id$="InscricaoMunicipal"]').val("");
    $('#frmPessoa input[id$="Telefone"]').val("");
    $('#frmPessoa input[id$="Email"]').val("")
}
function LimparEnderecoModalPessoa() {
    $('#frmPessoa input[id$="CEP"]').val("");
    $('#frmPessoa input[id$="CodigoMunicipio"]').val("");
    $('#frmPessoa input[id$="NomeMunicipio"]').val("");
    $('#frmPessoa input[id$="Bairro"]').val("");
    $('#frmPessoa input[id$="Logradouro"]').val("");
    $('#frmPessoa input[id$="Numero"]').val("");
    $('#frmPessoa input[id$="Complemento"]').val("")
}
window.TipoObraAnterior = null;
window.TipoEventoAnterior = null;
window.MotivoNaoTributacaoAnterior = null;
window.CodigoServicoAnterior = null;
window.DescricaoServicoAnterior = null;
window.PaisPrestacaoAnterior = null;
window.UsuarioAlterouServico = !1;
window.SubstituiIncidenciaNoTomador = !1;
function ServicoLegacyInitBase() {
    window.dataCompetencia = $("#DataCompetenciaFormat").val();
    window.PaisPrestacaoAnterior = $("#LocalPrestacao_CodigoPaisPrestacao").val();
    window.TipoObraAnterior = $("input[type=radio][id=Obra_TipoInformacao]:checked").val();
    window.TipoEventoAnterior = $("input[type=radio][id=Evento_TipoInformacao]:checked").val();
    window.MotivoNaoTributacaoAnterior = $("#ServicoPrestado_MotivoNaoTributacao").val();
    window.EhExportacao = $("#hdfEhExportacao").val() != 0;
    window.EhSubstituicao = $("#hdfEhSubstituicao").val() != 0;
    window.ExigiuGrupoComexNfseSubsituida = $("#hdfExigiuGrupoComexNfseSubsituida").val() != "NAO";
    ContarCaracteres($("#ServicoPrestado_Descricao"));
    ContarCaracteres($("#Complemento_InformacoesComplementares"));
    ContarCaracteres($("#Evento_Descricao"));
    window.EhSubstituicao && window.EhExportacao && window.ExigiuGrupoComexNfseSubsituida == !1 && VerificarCenarioDeExportacao();
    $("#ServicoPrestado_Descricao").on("keyup", function() {
        ContarCaracteres($("#ServicoPrestado_Descricao"))
    });
    $("#Complemento_InformacoesComplementares").on("keyup", function() {
        ContarCaracteres($("#Complemento_InformacoesComplementares"))
    });
    $("#Evento_Descricao").on("keyup", function() {
        ContarCaracteres($("#Evento_Descricao"))
    });
    (function() {
        if (!window.$ || !window.$.fn || !window.$.fn.select2)
            return;
        var n = $("select[id=LocalPrestacao_CodigoMunicipioPrestacao]");
        n.length && !n.hasClass("select2-hidden-accessible") && n.select2({
            ajax: {
                url: window.UrlBase + "api/emissaodps/BuscarNomeMunicipio",
                dataType: "json",
                delay: 500
            },
            minimumInputLength: 3,
            language: {
                inputTooShort: function() {
                    return "Digite pelo menos 3 caracteres para realizar a busca."
                },
                searching: function() {
                    return "Buscando..."
                },
                noResults: function() {
                    return "Não foram encontrados resultados."
                },
                errorLoading: function() {
                    return "Ocorreu um erro ao realizar a busca."
                }
            }
        });
        var t = $("select[id=ServicoPrestado_CodigoTributacaoNacional]");
        t.length && !t.hasClass("select2-hidden-accessible") && t.select2({
            ajax: {
                url: window.UrlBase + "api/emissaodps/BuscarNomeServico",
                dataType: "json",
                delay: 500
            },
            minimumInputLength: 3,
            language: {
                inputTooShort: function() {
                    return "Digite pelo menos 3 caracteres para realizar a busca."
                },
                searching: function() {
                    return "Buscando..."
                },
                noResults: function() {
                    return "Não foram encontrados resultados."
                },
                errorLoading: function() {
                    return "Ocorreu um erro ao realizar a busca."
                }
            }
        })
    })();
    window.CodigoServicoAnterior = $("#ServicoPrestado_CodigoTributacaoNacional").val();
    window.CodigoServicoAnterior != null && (window.DescricaoServicoAnterior = $("#ServicoPrestado_CodigoTributacaoNacional").select2("data")[0].text);
    $("#LocalPrestacao_CodigoPaisPrestacao").on("change", function() {
        if (!VerificarCenarioDeExportacao()) {
            AlterarSelecaoChosen($("#LocalPrestacao_CodigoPaisPrestacao"), window.PaisPrestacaoAnterior);
            return
        }
        switch ($(this).val()) {
        case "":
            $("#LocalPrestacao_CodigoMunicipioPrestacao").empty();
            $("#LocalPrestacao_CodigoMunicipioPrestacao").prop("disabled", !0);
            $("#LocalPrestacao_CodigoMunicipioPrestacao").siblings(".control-label").find(".asterisco").hide();
            $("#LocalPrestacao_CodigoMunicipioPrestacao").closest(".form-group").removeClass("erro");
            $("#LocalPrestacao_CodigoMunicipioPrestacao").closest(".form-group").find(".field-validation-error").hide();
            $("#LocalPrestacao_NomeMunicipioPrestacao").val("");
            $("#ServicoPrestado_CodigoTributacaoNacional").empty();
            $("#ServicoPrestado_CodigoTributacaoNacional").prop("disabled", !0);
            LimparCamposDeNaoTributacao();
            $("input[type=radio][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").prop("disabled", !0);
            LimparMunicipioIncidencia();
            $("#pnlMunIncid").slideUp();
            $("#pnlMsgMunIncidencia").html("");
            $("#pnlMsgMunIncidencia").slideUp();
            $("#ServicoPrestado_Descricao").val("");
            BloquearCampo("#ServicoPrestado_Descricao");
            AlterarSelecaoChosen($("#ServicoPrestado_CodigoNBS"), "");
            BloquearCampo("#ServicoPrestado_CodigoNBS");
            OcultarPnlObra();
            OcultarPnlEvento();
            OcultarPnlCOMEX();
            break;
        case "BR":
            $("#LocalPrestacao_CodigoMunicipioPrestacao").prop("disabled", !1);
            $("#LocalPrestacao_CodigoMunicipioPrestacao").siblings(".control-label").find(".asterisco").show();
            $("#LocalPrestacao_NomeMunicipioPrestacao").val("");
            VerificarIncidenciaDoImposto();
            break;
        default:
            $("#LocalPrestacao_CodigoMunicipioPrestacao").empty();
            $("#LocalPrestacao_CodigoMunicipioPrestacao").prop("disabled", !0);
            $("#LocalPrestacao_CodigoMunicipioPrestacao").siblings(".control-label").find(".asterisco").hide();
            $("#LocalPrestacao_CodigoMunicipioPrestacao").closest(".form-group").removeClass("erro");
            $("#LocalPrestacao_CodigoMunicipioPrestacao").closest(".form-group").find(".field-validation-error").hide();
            $("#LocalPrestacao_NomeMunicipioPrestacao").val("");
            var n = $("#LocalPrestacao_CodigoPaisPrestacao option:selected").text().trim();
            $("#LocalPrestacao_NomePaisPrestacao").val(n);
            $("#ServicoPrestado_CodigoTributacaoNacional").prop("disabled", !1);
            VerificarIncidenciaDoImposto()
        }
        ReiniciarPnlObra();
        ReiniciarPnlEvento();
        window.PaisPrestacaoAnterior = $("#LocalPrestacao_CodigoPaisPrestacao").val()
    });
    $("#LocalPrestacao_CodigoMunicipioPrestacao").on("change", function() {
        var n = $("#LocalPrestacao_CodigoMunicipioPrestacao").select2("data")[0].text;
        $("#LocalPrestacao_DescricaoMunicipioPrestacao").val(n);
        $("#ServicoPrestado_CodigoTributacaoNacional").prop("disabled", !1);
        $("#ServicoPrestado_CodigoTributacaoNacional").val() != "" && (VerificarIncidenciaDoImposto(),
        ReiniciarPnlObra(),
        ReiniciarPnlEvento())
    });
    $("#ServicoPrestado_CodigoTributacaoNacional").on("change", function() {
        if ($("#hdfInformadoCodTribMun").val("false"),
        ReiniciarPnlObra(),
        ReiniciarPnlEvento(),
        $("#ServicoPrestado_CodigoTributacaoNacional").val().startsWith("99") || $("#hdfInformadoCodTribMun").val() == "true") {
            TratarNaoIncidencia();
            $("#hdfInformadoCodTribMun").val() == "false" && TratarExibicaoCodigoTributacaoMunicipal(null);
            return
        }
        ReiniciarOpcoesAposAlterarCodigoTributacaoNacional();
        VerificarIncidenciaDoImposto();
        $("#ServicoPrestado_DescricaoCodigoTributacaoNacional").val($("#ServicoPrestado_CodigoTributacaoNacional").select2("data")[0].text)
    });
    $("#ServicoPrestado_CodigoComplementarMunicipal").on("change", function() {
        $("#hdfInformadoCodTribMun").val("true");
        $("input[type=hidden][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").remove();
        LimparCamposDeNaoTributacao();
        $("#pnlMunIncid").slideUp();
        VerificarIncidenciaDoImposto()
    });
    $("#pnlServicoPrestado").on("change", "input[type=radio][id=ServicoPrestado_HaExportacaoImunidadeNaoIncidencia]", function() {
        if ($("#LocalPrestacao_CodigoPaisPrestacao").val() == "BR" && $("#LocalPrestacao_CodigoMunicipioPrestacao").val() == "") {
            ExibirAlerta("Por favor, informe o município onde ocorreu a prestação do serviço");
            $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="0"]').prop("checked", !1);
            $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="1"]').prop("checked", $("#pnlMotNaoIncid").is(":visible"));
            return
        }
        if (!VerificarCenarioDeExportacao()) {
            $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="0"]').prop("checked", !1);
            $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="1"]').prop("checked", $("#pnlMotNaoIncid").is(":visible"));
            return
        }
        DesbloquearCampo("#ServicoPrestado_Descricao");
        DesbloquearCampo("#ServicoPrestado_CodigoNBS");
        switch (this.value) {
        case "0":
            $("#pnlMotNaoIncid").slideUp();
            $("#pnlTipoImunidade").slideUp();
            $("#pnlResultadoExportacao").slideUp();
            AlterarSelecaoChosen($("#ServicoPrestado_MotivoNaoTributacao"), "");
            AlterarSelecaoChosen($("#ServicoPrestado_TipoImunidade"), "");
            window.MotivoNaoTributacaoAnterior = "";
            $("#pnlMunIncid").slideDown();
            DesbloquearCampo($("#ServicoPrestado_MotivoNaoTributacao"));
            VerificarIncidenciaDoImposto();
            break;
        case "1":
            AlterarSelecaoChosen($("#ServicoPrestado_MotivoNaoTributacao"), "");
            DesbloquearCampo($("#ServicoPrestado_MotivoNaoTributacao"));
            $("#pnlMotNaoIncid").slideDown();
            LimparMunicipioIncidencia();
            $("#pnlMunIncid").slideUp()
        }
        $("#ServicoPrestado_MotivoNaoTributacao").val() != 3 ? $("#pnlMsgGrupoCOMEX").slideDown() : $("#pnlMsgGrupoCOMEX").slideUp()
    });
    $("#ServicoPrestado_MotivoNaoTributacao").on("change", function() {
        if ($(this).val() == "4") {
            ExibirAlerta('A opção "Não Incidência" para a tributação do ISSQN somente é válida quando o código de tributação nacional selecionado corresponder ao código de serviço 99.01.01 - Serviço sem incidência de ISSQN e ICMS ou para códigos de serviço configurados como não ocorrência de ISSQN.');
            AlterarSelecaoChosen($("#ServicoPrestado_MotivoNaoTributacao"), window.MotivoNaoTributacaoAnterior);
            return
        }
        if (!VerificarCenarioDeExportacao()) {
            AlterarSelecaoChosen($("#ServicoPrestado_MotivoNaoTributacao"), window.MotivoNaoTributacaoAnterior);
            return
        }
        switch ($(this).val()) {
        case "2":
            $("#pnlTipoImunidade").slideDown();
            $("#pnlResultadoExportacao").slideUp();
            window.MotivoNaoTributacaoAnterior = $(this).val();
            break;
        case "3":
            $("#pnlTipoImunidade").slideUp();
            $("#pnlResultadoExportacao").slideDown();
            AlterarSelecaoChosen($("#ServicoPrestado_TipoImunidade"), "");
            window.MotivoNaoTributacaoAnterior = $(this).val();
            AlterarSelecaoChosen($("#ServicoPrestado_CodigoPaisResultado"), "");
            break;
        default:
            $("#pnlTipoImunidade").slideUp();
            $("#pnlResultadoExportacao").slideUp();
            AlterarSelecaoChosen($("#ServicoPrestado_TipoImunidade"), "");
            window.MotivoNaoTributacaoAnterior = ""
        }
        $("#ServicoPrestado_MotivoNaoTributacao").val() != 3 ? $("#pnlMsgGrupoCOMEX").slideDown() : $("#pnlMsgGrupoCOMEX").slideUp()
    });
    $("form").on("click", "#btnServicosFavoritos", function() {
        $.ajax({
            url: window.UrlBase + "/DPS/Servico/ModalServicosFavoritos/",
            method: "POST",
            data: {},
            beforeSend: function() {
                ExibirLoading()
            },
            complete: function() {
                OcultarLoading()
            },
            success: function(n) {
                $("#modalServicosFavoritos").html(n);
                $("#modalServicosFavoritos").modal({
                    backdrop: "static",
                    keyboard: !1
                });
                FuncoesBasicas()
            },
            error: function(n) {
                console.log(n.responseText);
                ExibirAlerta("Não foi possível recuperar os seus serviços favoritos")
            }
        })
    });
    $("#modalServicosFavoritos").on("click", ".table tr", function(n) {
        n.preventDefault();
        $(this).siblings("tr").find('input[type="radio"]').each(function() {
            $(this).closest("tr").removeClass("selecionada")
        });
        $(this).find('input[type="radio"]').is(":checked") ? ($(this).find('input[type="radio"]').prop("checked", !1),
        $(this).removeClass("selecionada"),
        $("#modalServicosFavoritos #btnImportar").prop("disabled", !0)) : ($(this).find('input[type="radio"]').prop("checked", !0),
        $(this).addClass("selecionada"),
        $("#modalServicosFavoritos #btnImportar").prop("disabled", !1))
    });
    $("#modalServicosFavoritos").on("click", '.table input[type="radio"]', function(n) {
        n.preventDefault();
        $(this).closest("tr").siblings("tr").find('input[type="radio"]').each(function() {
            $(this).closest("tr").removeClass("selecionada")
        });
        $(this).is(":checked") ? ($(this).closest("tr").addClass("selecionada"),
        $("#modalServicosFavoritos #btnImportar").prop("disabled", !1)) : ($(this).closest("tr").removeClass("selecionada"),
        $("#modalServicosFavoritos #btnImportar").prop("disabled", !0))
    });
    $("#modalServicosFavoritos").on("click", "#btnImportar", function(n) {
        var i, r;
        n.preventDefault();
        $("#modalServicosFavoritos").modal("hide");
        var t = $("#modalServicosFavoritos table").find('input[type="radio"]:checked').closest("tr")
          , u = t.find("#hdfCodigoNacional").val()
          , f = t.find("#hdfCodigoMunicipal").val();
        $("#hdfCodigoComplementarMunicipal").val(f);
        i = t.find("#hdfCodigoNBS").val();
        r = t.find("#hdfDescricao").val();
        AlterarSelecaoChosen($("#ServicoPrestado_CodigoTributacaoNacional"), u);
        AlterarSelecaoChosen($("#ServicoPrestado_CodigoNBS"), i);
        $("#ServicoPrestado_Descricao").val(r);
        VerificarIncidenciaDoImposto();
        $("input[type=radio][id='ServicoPrestado_HaExportacaoImunidadeNaoIncidencia']").prop("disabled", !1);
        $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="0"]').prop("checked", !1);
        $('#ServicoPrestado_HaExportacaoImunidadeNaoIncidencia[value="1"]').prop("checked", !1);
        $("#pnlMotNaoIncid").slideUp();
        AlterarSelecaoChosen($("#ServicoPrestado_MotivoNaoTributacao"), "");
        DesbloquearCampo($("#ServicoPrestado_MotivoNaoTributacao"));
        $("#pnlTipoImunidade").slideUp();
        AlterarSelecaoChosen($("#ServicoPrestado_TipoImunidade"), "");
        $("#pnlResultadoExportacao").slideUp();
        AlterarSelecaoChosen($("#ServicoPrestado_CodigoPaisResultado"), "");
        window.MotivoNaoTributacaoAnterior = ""
    });
    $("#pnlObra").on("change", "input[type=radio][id=Obra_TipoInformacao]", function() {
        $("#pnlObraDetalhes").show();
        var n = $("#LocalPrestacao_CodigoPaisPrestacao").val() == "BR";
        switch ($(this).val()) {
        case "1":
            if (!n) {
                ExibirAlerta("Não é possível informar um código de obra quando o local da prestação do serviço for no exterior");
                $("input[type=radio][id=Obra_TipoInformacao]").prop("checked", !1);
                $('input[type=radio][id=Obra_TipoInformacao][value="' + window.TipoObraAnterior + '"]').prop("checked", !0);
                return
            }
            $("#pnlObraCodigoObra").slideDown();
            $("#pnlObraCodigoCIB").slideUp();
            $("#pnlObraEndereco").slideUp();
            LimparEnderecoDeObra();
            break;
        case "3":
            if (!n) {
                ExibirAlerta("Não é possível informar um endereço no Brasil quando o local da prestação do serviço for no exterior");
                $("input[type=radio][id=Obra_TipoInformacao]").prop("checked", !1);
                $('input[type=radio][id=Obra_TipoInformacao][value="' + window.TipoObraAnterior + '"]').prop("checked", !0);
                return
            }
            $("#pnlObraCodigoObra").slideUp();
            $("#pnlObraCodigoCIB").slideUp();
            $("#pnlObraEndereco").show();
            $("#pnlObraEnderecoNacional").slideDown();
            $("#pnlObraEnderecoExterior").slideUp();
            $("#Obra_CodigoObra").val("");
            LimparEnderecoDeObra();
            break;
        case "4":
            if (n) {
                ExibirAlerta("Não é possível informar um endereço no exterior quando o local da prestação do serviço for no Brasil");
                $("input[type=radio][id=Obra_TipoInformacao]").prop("checked", !1);
                $('input[type=radio][id=Obra_TipoInformacao][value="' + window.TipoObraAnterior + '"]').prop("checked", !0);
                return
            }
            $("#pnlObraCodigoObra").slideUp();
            $("#pnlObraCodigoCIB").slideUp();
            $("#pnlObraEndereco").slideDown();
            $("#pnlObraEnderecoNacional").slideUp();
            $("#pnlObraEnderecoExterior").slideDown();
            $("#Obra_CodigoObra").val("");
            LimparEnderecoDeObra();
            break;
        case "5":
            if (!n) {
                ExibirAlerta("Não é possível informar um código CIB quando o local da prestação do serviço for no exterior");
                $("input[type=radio][id=Obra_TipoInformacao]").prop("checked", !1);
                $('input[type=radio][id=Obra_TipoInformacao][value="' + window.TipoObraAnterior + '"]').prop("checked", !0);
                return
            }
            $("#pnlObraCodigoObra").slideUp();
            $("#pnlObraCodigoCIB").slideDown();
            $("#pnlObraEndereco").slideUp();
            LimparEnderecoDeObra()
        }
        window.TipoObraAnterior = $("input[type=radio][id=Obra_TipoInformacao]:checked").val()
    });
    $("#pnlEvento").on("change", "input[type=radio][id=Evento_TipoInformacao]", function() {
        $("#pnlEventoDetalhes").show();
        var n = $("#LocalPrestacao_CodigoPaisPrestacao").val() == "BR";
        switch ($(this).val()) {
        case "1":
            if (!n) {
                ExibirAlerta("Não é possível informar o identificador do evento quando o local da prestação do serviço for no exterior");
                $("input[type=radio][id=Evento_TipoInformacao]").prop("checked", !1);
                $('input[type=radio][id=Evento_TipoInformacao][value="' + window.TipoEventoAnterior + '"]').prop("checked", !0);
                return
            }
            $("#pnlEventoIdentificacao").slideDown();
            $("#pnlEventoEndereco").slideUp();
            LimparEnderecoDeEvento();
            break;
        case "3":
            if (!n) {
                ExibirAlerta("Não é possível informar um endereço no Brasil quando o local da prestação do serviço for no exterior");
                $("input[type=radio][id=Evento_TipoInformacao]").prop("checked", !1);
                $('input[type=radio][id=Evento_TipoInformacao][value="' + window.TipoEventoAnterior + '"]').prop("checked", !0);
                return
            }
            $("#pnlEventoIdentificacao").slideUp();
            $("#pnlEventoEndereco").show();
            $("#pnlEventoEnderecoNacional").slideDown();
            $("#pnlEventoEnderecoExterior").slideUp();
            $("#Evento_Identificacao").val("");
            LimparEnderecoDeEvento();
            break;
        case "4":
            if (n) {
                ExibirAlerta("Não é possível informar um endereço no exterior quando o local da prestação do serviço for no Brasil");
                $("input[type=radio][id=Evento_TipoInformacao]").prop("checked", !1);
                $('input[type=radio][id=Evento_TipoInformacao][value="' + window.TipoEventoAnterior + '"]').prop("checked", !0);
                return
            }
            $("#pnlEventoIdentificacao").slideUp();
            $("#pnlEventoEndereco").slideDown();
            $("#pnlEventoEnderecoNacional").slideUp();
            $("#pnlEventoEnderecoExterior").slideDown();
            $("#Evento_Identificacao").val("");
            LimparEnderecoDeEvento()
        }
        window.TipoEventoAnterior = $("input[type=radio][id=Evento_TipoInformacao]:checked").val()
    });
    $(".cep").focusout(function() {
        $(this).parent().find(".btn").click()
    });
    $(".cep").parent().find(".btn").on("click", function() {
        var t = $(this).closest('div[id$="Endereco"]')
          , n = $(this).closest(".input-group").find("input[type=text]").val().replace(/\D/g, "");
        if (n == "") {
            LimparEnderecoDeObra();
            LimparEnderecoDeEvento();
            return
        }
        if (n.length != 8) {
            ExibirAlerta("O CEP informado está incorreto");
            LimparEnderecoDeObra();
            LimparEnderecoDeEvento();
            return
        }
        BuscarCepParaEventoEObra(n, t)
    });
    $("#pnlEvento").on("click", "#Evento_InformarEndereco", function() {
        toggleInformarEnderecoEvento()
    });
    $("#ComercioExterior_MovimentacaoTempBens").on("change", function() {
        $(this).val() == 1 && ($("#pnlNumeroRE").slideUp(),
        $("#pnlNumeroDI").slideUp(),
        $("#ComercioExterior_NumeroDI").val(""),
        $("#ComercioExterior_NumeroRE").val(""));
        $(this).val() == 2 && ($("#pnlNumeroRE").slideUp(),
        $("#pnlNumeroDI").slideDown(),
        $("#ComercioExterior_NumeroRE").val(""));
        $(this).val() == 3 && ($("#pnlNumeroRE").slideDown(),
        $("#pnlNumeroDI").slideUp(),
        $("#ComercioExterior_NumeroDI").val(""))
    });
    $("#InformarDadosObra").on("change", function() {
        if ($("#InformarDadosObra").is(":checked")) {
            if ($("#InformarDadosEvento").is(":checked")) {
                $("#InformarDadosObra").prop("checked", !1);
                ExibirAlerta("Não é permitido informar dados de obra e dados de evento na mesma NFS-e.<br/>Caso queira informar dados de obra, remova os dados de evento.");
                return
            }
            $("#Obra_EhObrigatorio").val("True");
            $("#pnlObraInformada").slideDown()
        } else
            $("#Obra_EhObrigatorio").val("False"),
            $("#pnlObraInformada").slideUp(),
            ReiniciarPnlObra()
    });
    $("#InformarDadosEvento").on("change", function() {
        if ($("#InformarDadosEvento").is(":checked")) {
            if ($("#InformarDadosObra").is(":checked")) {
                $("#InformarDadosEvento").prop("checked", !1);
                ExibirAlerta("Não é permitido informar dados de obra e dados de evento na mesma NFS-e.<br/>Caso queira informar dados de evento, remova os dados de obra.");
                return
            }
            $("#Evento_EhObrigatorio").val("True");
            $("#Evento_EhObrigatorio").closest(".retratil").slideDown();
            $("#pnlEventoInformado").slideDown()
        } else
            $("#Evento_EhObrigatorio").val("False"),
            $("#Evento_EhObrigatorio").closest(".retratil").slideUp(),
            ReiniciarPnlEvento()
    });
    $("#Obra_CodigoCIB").mask("SSSSSSS-S", {
        translation: {
            S: {
                pattern: /[a-zA-Z0-9]/,
                recursive: !0
            }
        }
    });
    $("#Complemento_Pedido_NumeroPedido").mask("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", {
        translation: {
            S: {
                pattern: /[a-zA-Z0-9 !@#$%¨&*()\-= _+\[\]{}\/;<>.,?:*|\\]/,
                recursive: !0
            }
        }
    });
    $("#Complemento_Pedido_NumeroPedido").on("change", function() {
        $(this).val($.trim($(this).val()));
        $(this).val() != "" ? $("#pnlItensPedido").slideDown() : !ExcluirTodosOsItensPedido()
    })
}
function ServicoLegacyInitItensPedido() {
    $("#pnlItensPedido").on("click", "#btnIncluirItemPedido", function() {
        $("#modalItensPedido .modal-content").html("");
        var n = $("#hdfIdr").val();
        $.ajax({
            url: window.UrlBase + "DPS/Pedido/ModalInclusao/",
            method: "GET",
            data: {
                idr: n
            },
            success: function(n) {
                $("#modalItensPedido .modal-content").html(n);
                $("#modalItensPedido").modal({
                    backdrop: "static",
                    keyboard: !1
                })
            },
            error: function() {}
        })
    });
    $("#pnlItensPedido").on("click", "#tabelaItensPedido .td-opcoes .btnItensEditar", function() {
        var n = $(this).siblings("#hdfItensGuid").val()
          , t = $("#hdfIdr").val();
        return $.ajax({
            url: window.UrlBase + "DPS/Pedido/ModalEdicao/",
            method: "GET",
            data: {
                idr: t,
                guid: n
            },
            success: function(n) {
                n.Mensagem != undefined ? ExibirAlerta(n.Mensagem) : ($("#modalItensPedido .modal-content").html(n),
                $("#modalItensPedido").modal({
                    backdrop: "static",
                    keyboard: !1
                }))
            }
        }),
        !1
    });
    $("#pnlItensPedido").on("click", "#tabelaItensPedido .td-opcoes .btnItensExcluir", function() {
        var n = $(this).siblings("#hdfItensGuid").val()
          , t = $("#hdfIdr").val();
        return $.confirm({
            icon: "fa fa-warning",
            title: "Confirmação",
            content: "Deseja excluir este item?",
            animation: "opacity",
            closeAnimation: "opacity",
            animateFromElement: !1,
            columnClass: "medium",
            backgroundDismissAnimation: "none",
            bgOpacity: .7,
            draggable: !1,
            offsetTop: 150,
            buttons: {
                sim: {
                    text: "Sim",
                    btnClass: "btn-blue",
                    action: function() {
                        $.ajax({
                            url: window.UrlBase + "DPS/Pedido/Excluir/",
                            method: "POST",
                            data: {
                                idr: t,
                                guid: n
                            },
                            success: function(n) {
                                n.Mensagem != undefined ? ExibirAlerta("Não foi possível excluir o item") : $("#pnlItensPedido .lista").html(n.HTML)
                            }
                        })
                    }
                },
                nao: {
                    text: "Não",
                    action: function() {}
                }
            }
        }),
        !1
    });
    $("#pnlItensPedido").on("click", "#tabelaItensPedido .th-opcoes .btnExcluirItensPedido", function() {
        return ExcluirTodosOsItensPedido(),
        !1
    });
    $("#modalItensPedido").on("click", "#btnIncluir, #btnAlterar", function(n) {
        n.preventDefault();
        $("#modalItensPedido .modal-body form").submit()
    });
    $("#modalItensPedido").on("submit", ".modal-body form", function(n) {
        n.preventDefault();
        var t = $(this);
        $.ajax({
            url: t.attr("action"),
            method: t.attr("method"),
            data: t.serialize(),
            success: function(n) {
                n.Mensagem != undefined && ($("#modalItensPedido").modal("hide"),
                ExibirAlerta("Não foi possível incluir o item"));
                n.Sucesso ? ($("#modalItensPedido").modal("hide"),
                $("#pnlItensPedido .lista").html(n.HTML),
                FuncoesBasicas()) : $("#modalItensPedido .modal-content").html(n.HTML)
            },
            error: function(n) {
                $.alert(n.responseJSON.Message)
            }
        })
    });
    $("#Item").mask("SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS", {
        translation: {
            S: {
                pattern: /[a-zA-Z0-9 !@#$%¨&*()\-= _+\[\]{}\/;<>.,?:*|\\]/,
                recursive: !0
            }
        }
    })
}
window.ServicoLegacyInit = function() {
    try {
        ServicoLegacyInitBase()
    } catch (n) {}
    try {
        ServicoLegacyInitItensPedido()
    } catch (n) {}
}
$(document).ready(function() {
    window.ServicoLegacyInit && window.ServicoLegacyInit()
});
window.UltimaInscricaoPesquisadaModalTomador = "";
$(document).ready(function() {})
