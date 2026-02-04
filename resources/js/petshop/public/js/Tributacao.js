function ControlarExibicaoCamposPISCOFINS() {
    if (!usuarioMei) {
        var n = $("#TributacaoFederal_PISCofins_SituacaoTributaria").val() == 4 || $("#TributacaoFederal_PISCofins_SituacaoTributaria").val() == 6
          , t = $('input[type=radio][id="TributacaoFederal_PISCofins_TipoRetencao"]:checked').val() == "1";
        n ? ($.each($("#valoresPISCOFINS input[type=text]"), function() {
            $(this).addClass("aceita-zero");
            $(this).val("0,00");
            BloquearCampo($(this))
        }),
        BloquearCampo($("#TributacaoFederal_PISCofins_AliquotaPIS")),
        BloquearCampo($("#TributacaoFederal_PISCofins_AliquotaCOFINS"))) : ($.each($("#valoresPISCOFINS input[type=text]"), function() {
            $(this).removeClass("aceita-zero");
            $(this).val() == "0,00" && $(this).val("")
        }),
        DesbloquearCampo($("#TributacaoFederal_PISCofins_AliquotaPIS")),
        DesbloquearCampo($("#TributacaoFederal_PISCofins_AliquotaCOFINS")))
    }
}
function BuscarBeneficiosMunicipais() {
    ExibirLoading();
    $.ajax({
        url: window.UrlBase + "api/emissaodps/recuperarbeneficiosvigentes",
        method: "GET",
        data: {
            idConvenio: $("#IdConvenioIncidencia").val(),
            codServico: $("#CodCompletoServico").val(),
            tipoInscricao: $("#TipoInscricaoEmitente").val(),
            inscricao: $("#InscricaoEmitente").val(),
            competencia: $("#DataCompetencia").val()
        },
        error: function(n, t, i) {
            OcultarLoading();
            $('input[type=radio][id=ISSQN_HaBeneficioMunicipal][value="0"]').prop("checked", !0);
            ExibirAlerta("Não foi possível recuperar os Benefícios Municipais");
            console.log(n + " | " + t + " | " + i)
        },
        success: function(n) {
            if (n.length == 0)
                AlterarSelecaoChosen($("#ISSQN_IdBM"), ""),
                $("#pnlBeneficioMunicipal").slideUp(),
                ExibirAlerta("Não há Benefícios Municipais cadastrados pelo município de incidência do ISSQN para o serviço prestado e/ou prestador do serviço na data de competência informada."),
                $('input[type=radio][id=ISSQN_HaBeneficioMunicipal][value="0"]').prop("checked", !0);
            else {
                var t = $("#ISSQN_IdBM");
                t.empty();
                t.append($("<option><\/option>").attr("value", "").text("Selecione..."));
                $.each(n, function(n, i) {
                    t.append($("<option><\/option>").attr("value", i.Value).text(i.Text))
                });
                AlterarSelecaoChosen(t, "");
                $("#pnlBeneficioMunicipal").slideDown()
            }
            OcultarLoading()
        }
    })
}
function BuscarBeneficiosMunicipaisReducaoBC() {
    ExibirLoading();
    $.ajax({
        url: window.UrlBase + "api/emissaodps/recuperarbeneficiosvigentesreducaobc",
        method: "GET",
        data: {
            idConvenio: $("#IdConvenioIncidencia").val(),
            codServico: $("#CodCompletoServico").val(),
            tipoInscricao: $("#TipoInscricaoEmitente").val(),
            inscricao: $("#InscricaoEmitente").val(),
            competencia: $("#DataCompetencia").val()
        },
        error: function(n, t, i) {
            OcultarLoading();
            $('input[type=radio][id=ISSQN_HaBeneficioMunicipal][value="0"]').prop("checked", !0);
            ExibirAlerta("Não foi possível recuperar os Benefícios Municipais de redução de base de cálculo");
            console.log(n + " | " + t + " | " + i)
        },
        success: function(n) {
            if (n.length == 0)
                AlterarSelecaoChosen($("#ISSQN_IdBM"), ""),
                $("#pnlBeneficioMunicipal").slideUp(),
                ExibirAlerta("Não há Benefícios Municipais de redução de base de cálculo cadastrados pelo município de incidência do ISSQN para o serviço prestado e/ou prestador do serviço na data de competência informada."),
                $('input[type=radio][id=ISSQN_HaBeneficioMunicipal][value="0"]').prop("checked", !0);
            else {
                var t = $("#ISSQN_IdBM");
                t.empty();
                t.append($("<option><\/option>").attr("value", "").text("Selecione..."));
                $.each(n, function(n, i) {
                    t.append($("<option><\/option>").attr("value", i.Value).text(i.Text))
                });
                AlterarSelecaoChosen(t, "");
                $("#pnlBeneficioMunicipal").slideDown()
            }
            OcultarLoading()
        }
    })
}
function RecuperarInfoBeneficio() {
    var n = $("#Valores_ValorDescontoIncondicionado").val() == "";
    $.ajax({
        url: window.UrlBase + "api/emissaodps/recuperarbeneficio",
        method: "GET",
        data: {
            codigo: $("#ISSQN_IdBM").val()
        },
        beforeSend: function() {
            ExibirLoading()
        },
        complete: function() {
            OcultarLoading()
        },
        success: function(t) {
            $("#ISSQN_ValorMonetarioReducaoBC").val("");
            $("#ISSQN_ValorPercentualReducaoBC").val("");
            $("#ISSQN_ValorMonetarioReducaoBCObrigatorio").val("False");
            $("#ISSQN_ValorPercentualReducaoBCObrigatorio").val("False");
            switch (t.TipoBeneficio) {
            case 1:
                $("#AliquotaParametrizada").val() != "" ? $("#AliquotaAplicada").val($("#AliquotaParametrizada").val()) : $("#AliquotaAplicada").val($("#ISSQN_AliquotaInformada").val());
                AtualizarCalculoISSQN(null, null, n);
                $("#ISSQN_Valor").val("").prop("placeholder", "-");
                $("#pnlBeneficioMunicipalValor").slideUp();
                $("#pnlBeneficioMunicipalPercentual").slideUp();
                haIsencaoPorBM = !0;
                window.OpcaoAnteriorRetencao = null;
                break;
            case 2:
                haIsencaoPorBM = !1;
                $("#AliquotaParametrizada").val() != "" ? $("#AliquotaAplicada").val($("#AliquotaParametrizada").val()) : $("#AliquotaAplicada").val($("#ISSQN_AliquotaInformada").val());
                switch (t.TipoReducaoBC) {
                case 1:
                    AtualizarCalculoISSQN(null, null, n);
                    var i = t.ReducaoPercentualBC.toFixed(2);
                    $("#ISSQN_spanReducaoBC").text(i);
                    $("#hdfPercentalMaximoDescontoBCPorBM").val(FormataValorMonetario(i));
                    $("#ISSQN_ValorPercentualReducaoBCObrigatorio").val("True");
                    $("#pnlBeneficioMunicipalValor").slideUp();
                    $("#pnlBeneficioMunicipalPercentual").slideDown();
                    break;
                case 2:
                    AtualizarCalculoISSQN(null, null, n);
                    $("#ISSQN_ValorMonetarioReducaoBCObrigatorio").val("True");
                    $("#pnlBeneficioMunicipalValor").slideDown();
                    $("#pnlBeneficioMunicipalPercentual").slideUp();
                    $("#ISSQN_spanBaseDeCalculo").text($("#ISSQN_BaseDeCalculo").val())
                }
                break;
            case 3:
                haIsencaoPorBM = !1;
                $("#AliquotaAplicada").val(t.AliquotaDiferenciada.toString().replace(/\./g, ","));
                AtualizarCalculoISSQN(null, null, n);
                $("#pnlBeneficioMunicipalValor").slideUp();
                $("#pnlBeneficioMunicipalPercentual").slideUp()
            }
        },
        error: function(n, t, i) {
            ExibirAlerta("Ooooooops...  | " + n + " | " + t + " | " + i)
        }
    })
}
function VerificarMensagemParaRetencao() {
    $.ajax({
        url: window.UrlBase + "api/emissaodps/verificarretencoes",
        method: "GET",
        data: {
            codMun: $("#CodMunIncidencia").val(),
            codServ: $("#CodCompletoServico").val(),
            inscTom: $("#InscricaoTomador").val(),
            inscInter: $("#InscricaoIntermediario").val(),
            dtCompet: $("#DataCompetencia").val()
        },
        success: function(n) {
            n.msg != null ? ($("#pnlRetencaoMensagem").html(n.msg),
            $("#pnlRetencaoMensagem").slideDown()) : ($("#pnlRetencaoMensagem").slideUp(),
            $("#pnlRetencaoMensagem").html(""))
        },
        error: function(n, t, i) {
            OcultarLoading();
            ExibirAlerta("Ocorreu um erro: | " + n + " | " + t + " | " + i)
        }
    })
}
function LimparDetalhamentoISSQN() {
    $("#ISSQN_ValorMonetarioReducaoBC").val("");
    $("#ISSQN_ValorPercentualReducaoBC").val("");
    $("#ISSQN_spanReducaoBC").text("");
    LimparCalculoISSQN();
    $("input[type=radio][id=ISSQN_TipoRetencao]").prop("checked", !1)
}
function LimparCamposDasPerguntas() {
    $("#pnlSuspensao").slideUp();
    AlterarSelecaoChosen($("#ISSQN_TipoSuspensaoISSQN"), "");
    $("#ISSQN_NumeroProcesso").val("");
    $("#pnlRetencao").slideUp();
    $('#ISSQN_HaSuspensao[value="2"]').prop("checked", !1);
    $('#ISSQN_HaSuspensao[value="3"]').prop("checked", !1);
    $("#pnlBeneficioMunicipalValor").slideUp();
    $("#pnlBeneficioMunicipalPercentual").slideUp();
    $("#pnlBeneficioMunicipal").slideUp();
    $("#ISSQN_ValorMonetarioReducaoBC").val("");
    $("#ISSQN_ValorPercentualReducaoBC").val("");
    $("#ISSQN_spanReducaoBC").text("");
    $("#AliquotaParametrizada").val() != "" ? $("#AliquotaAplicada").val($("#AliquotaParametrizada").val()) : $("#AliquotaAplicada").val($("#ISSQN_AliquotaInformada").val());
    $("#pnlDeducaoReducao").slideUp();
    $("#DeducaoReducao_ValorMonetario").val("");
    $("#DeducaoReducao_ValorPercentual").val("");
    ExcluirTodosOsDocumentos();
    $("input[type=radio][id=DeducaoReducao_TipoDeducaoReducao]").prop("checked", !1);
    $("#pnlDeducaoValor").slideUp();
    $("#pnlDeducaoPercentual").slideUp();
    $("#pnlDeducaoDocumentos").slideUp()
}
function DesabilitarPerguntasTributacao(n) {
    podeAlterarDeducao && ($('#ISSQN_HaDeducaoReducao[value="0"]').prop("disabled", n),
    $('#ISSQN_HaDeducaoReducao[value="1"]').prop("disabled", n));
    $('#ISSQN_HaBeneficioMunicipal[value="0"]').prop("disabled", n);
    $('#ISSQN_HaBeneficioMunicipal[value="1"]').prop("disabled", n);
    podeAlterarRetencao && ($('#ISSQN_HaRetencao[value="0"]').prop("disabled", n),
    $('#ISSQN_HaRetencao[value="1"]').prop("disabled", n));
    $('#ISSQN_HaSuspensao[value="0"]').prop("disabled", n);
    $('#ISSQN_HaSuspensao[value="1"]').prop("disabled", n);
    podeAlterarDeducao && ($('#ISSQN_HaDeducaoReducao[value="0"]').prop("checked", n),
    $('#ISSQN_HaDeducaoReducao[value="1"]').prop("checked", !1));
    $('#ISSQN_HaBeneficioMunicipal[value="0"]').prop("checked", n);
    $('#ISSQN_HaBeneficioMunicipal[value="1"]').prop("checked", !1);
    podeAlterarRetencao && ($('#ISSQN_HaRetencao[value="0"]').prop("checked", n),
    $('#ISSQN_HaRetencao[value="1"]').prop("checked", !1));
    $('#ISSQN_HaSuspensao[value="0"]').prop("checked", n);
    $('#ISSQN_HaSuspensao[value="1"]').prop("checked", !1)
}
function LimparCalculoISSQN() {
    $("#ISSQN_Aliquota").val("").removeAttr("placeholder");
    $("#ISSQN_BaseDeCalculo").val("").removeAttr("placeholder");
    $("#ISSQN_Valor").val("").removeAttr("placeholder")
}
function ValidarSomaDosDescontos() {
    var n = parseFloat($("#Valores_ValorServico").val().replace(/\./g, "").replace(/\,/g, "."))
      , t = parseFloat($("#Valores_ValorDescontoIncondicionado").val().replace(/\./g, "").replace(/\,/g, "."))
      , i = parseFloat($("#Valores_ValorDescontoCondicionado").val().replace(/\./g, "").replace(/\,/g, "."));
    return (n = isNaN(n) ? 0 : n,
    t = isNaN(t) ? 0 : t,
    i = isNaN(i) ? 0 : i,
    n - t - i < 0) ? (ExibirAlerta("A soma dos descontos condicionado e incondicionado deve ser inferior ao valor do serviço prestado."),
    !1) : !0
}
function ValidarValorServico(n) {
    var t = parseFloat($("#Valores_ValorServico").val().replace(/\./g, "").replace(/\,/g, ".")), u, i, r, f, e;
    return (t = isNaN(t) ? 0 : t,
    u = SomarDIDedRedBm(),
    t < u) ? (ExibirAlerta($("#MensagemValorServicoMenorSomatorioDiDedRedBm").val()),
    !1) : (i = parseFloat($("#Valores_ValorDescontoCondicionado").val().replace(/\./g, "").replace(/\,/g, ".")),
    i = isNaN(i) ? 0 : i,
    r = parseFloat($("#Valores_ValorDescontoIncondicionado").val().replace(/\./g, "").replace(/\,/g, ".")),
    r = isNaN(r) ? 0 : r,
    f = SomarVrIssqnPisCofinsIrrfCsllCp(n),
    e = r + i + f,
    t < e) ? (ExibirAlerta($("#MensagemValorServico").val()),
    !1) : !0
}
function SomarDIDedRedBm() {
    var t = parseFloat($("#Valores_ValorServico").val().replace(/\./g, "").replace(/\,/g, ".")), n, r, i, u, f, e;
    return t = isNaN(t) ? 0 : t,
    n = parseFloat($("#Valores_ValorDescontoIncondicionado").val().replace(/\./g, "").replace(/\,/g, ".")),
    n = isNaN(n) ? 0 : n,
    r = CalcularValorRealDeducaoReducao(),
    i = n + r,
    $("#ISSQN_ValorMonetarioReducaoBC").val() != "" && (u = parseFloat($("#ISSQN_ValorMonetarioReducaoBC").val().replace(/\./g, "").replace(/\,/g, ".")),
    i += u),
    $("#ISSQN_ValorPercentualReducaoBC").val() != "" && (f = t - n - r,
    e = parseFloat($("#ISSQN_ValorPercentualReducaoBC").val().replace(/\./g, "").replace(/\,/g, ".")),
    valorBMCalculado = f * e / 100,
    i += valorBMCalculado),
    i
}
function SomarVrIssqnPisCofinsIrrfCsllCp(n) {
    var r, u, f, e, o = 0, v = $('input[type=radio][id="TributacaoFederal_PISCofins_TipoRetencao"]:checked').val(), s, h, c, i, l, a, t;
    return v == "1" && (s = parseFloat($("#TributacaoFederal_PISCofins_BaseDeCalculo").val().replace(/\./g, "").replace(/\,/g, ".")),
    isNaN(s) || (h = parseFloat($("#TributacaoFederal_PISCofins_AliquotaPIS").val().replace(/\./g, "").replace(/\,/g, ".")),
    c = parseFloat($("#TributacaoFederal_PISCofins_AliquotaCOFINS").val().replace(/\./g, "").replace(/\,/g, ".")),
    isNaN(h) || (i = s * h / 100),
    isNaN(c) || (r = s * c / 100))),
    l = $('input[type=radio][id="ISSQN_HaRetencao"]:checked').val() || n,
    l == "1" && (a = CalcularBCISSQN(),
    t = $("#AliquotaAplicada").val(),
    t != null && t != undefined && (t = $("#AliquotaAplicada").val(),
    typeof t != "number" && (t = parseFloat(t.replace(/\./g, "").replace(/\,/g, "."))),
    u = a * t / 100)),
    u = isNaN(u) ? 0 : u,
    i = isNaN(i) ? 0 : i,
    r = isNaN(r) ? 0 : r,
    f = parseFloat($("#TributacaoFederal_ValorIRRF").val().replace(/\./g, "").replace(/\,/g, ".")),
    f = isNaN(f) ? 0 : f,
    e = parseFloat($("#TributacaoFederal_ValorCSLL").val().replace(/\./g, "").replace(/\,/g, ".")),
    e = isNaN(e) ? 0 : e,
    o = parseFloat($("#TributacaoFederal_ValorCP").val().replace(/\./g, "").replace(/\,/g, ".")),
    o = isNaN(o) ? 0 : o,
    u + i + r + f + e + o
}
function AtualizarCalculoISSQN(n, t, i=true) {
    var f, r, e, o, u;
    if ($("#ISSQN_RegimeEspecial").val() != 0 || usuarioMei || optanteSimplesNacional && regApuTribSN == 1 && $("input[type=radio][id=ISSQN_HaRetencao]:checked").val() == 0 || optanteSimplesNacional && regApuTribSN == 1) {
        if ($("#ISSQN_BaseDeCalculo").val("").prop("placeholder", "-"),
        $("#ISSQN_Valor").val("").prop("placeholder", "-"),
        window.EhObraSinac == !1)
            $("#ISSQN_Aliquota").val("").prop("placeholder", "-"),
            $("#ISSQN_ValorMonetarioReducaoBC").val("0");
        else {
            var s = $("#ISSQN_IdBM option:selected").text()
              , h = s.indexOf("Alíquota diferenciada")
              , c = $("input[type=radio][id=ISSQN_HaBeneficioMunicipal]:checked").val();
            if (c == "1" && h > -1) {
                if ((n == null || n == undefined) && (n = $("#AliquotaAplicada").val(),
                n == ""))
                    return $("#ISSQN_Aliquota").val("").prop("placeholder", "-"),
                    !0;
                typeof n != "number" && (n = parseFloat(n.replace(/\./g, "").replace(/\,/g, ".")));
                $("#ISSQN_Aliquota").val(FormataValorMonetario(n.toFixed(2)))
            } else
                $("#ISSQN_Aliquota").val("").prop("placeholder", "-");
            r = CalcularBCISSQN();
            i == !1 && (f = parseFloat($("#Valores_ValorDescontoIncondicionado").val().replace(/\./g, "").replace(/\,/g, ".")),
            r += f);
            $("#ISSQN_spanBaseDeCalculo").text(r)
        }
        return $("#DeducaoReducao_TipoDeducaoReducao:checked").val() == "2" && CalcularValorRealDeducaoReducao(),
        optanteSimplesNacional && regApuTribSN == 1 && $("input[type=radio][id=ISSQN_HaRetencao]:checked").val() == "1" && $("#ISSQN_AliquotaInformada").val() != "" && ($("#ISSQN_Aliquota").val($("#ISSQN_AliquotaInformada").val()),
        r = CalcularBCISSQN(),
        $("#ISSQN_BaseDeCalculo").val(FormataValorMonetario(r.toFixed(2))),
        n = $("#ISSQN_AliquotaInformada").val(),
        typeof n != "number" && (n = parseFloat(n.replace(/\./g, "").replace(/\,/g, "."))),
        u = r * n / 100,
        $("#ISSQN_Valor").val(FormataValorMonetario(u.toFixed(2)))),
        !0
    }
    return (r = CalcularBCISSQN(),
    (n == null || n == undefined) && (n = $("#AliquotaAplicada").val(),
    n == "")) ? ($("#ISSQN_Aliquota").val("").prop("placeholder", ""),
    $("#ISSQN_BaseDeCalculo").val(FormataValorMonetario(r.toFixed(2))),
    $("#ISSQN_Valor").val("").prop("placeholder", ""),
    !0) : (typeof n != "number" && (n = parseFloat(n.replace(/\./g, "").replace(/\,/g, "."))),
    e = CalcularBCISSQNMinima(n),
    r < e && i == !0) ? (o = $("#CodCompletoServico").val().substring(0, 8),
    window.excecoes.indexOf(o) === -1 ? ExibirAlerta($("#MensagemBaseCalculoMenorPermitido").val()) : ExibirAlerta($("#MensagemValorServico").val()),
    !1) : (munIncidConveniado && AliquotaPeloSimples() != !1 || ($("#ISSQN_BaseDeCalculo").val(FormataValorMonetario(r.toFixed(2))),
    $("#ISSQN_Aliquota").val(FormataValorMonetario(n.toFixed(2))),
    u = r * n / 100,
    $("#ISSQN_Valor").val(FormataValorMonetario(u.toFixed(2)))),
    !0)
}
function AliquotaPeloSimples() {
    return usuarioMei ? !0 : optanteSimplesNacional && !usuarioMei && regApuTribSN == 1 && $("input[type=radio][id=ISSQN_HaRetencao]:checked").val() == 0 ? !0 : !1
}
function CalcularBCISSQN() {
    var i = parseFloat($("#Valores_ValorServico").val().replace(/\./g, "").replace(/\,/g, ".")), t, r, n, u, f;
    return i = isNaN(i) ? 0 : i,
    t = parseFloat($("#Valores_ValorDescontoIncondicionado").val().replace(/\./g, "").replace(/\,/g, ".")),
    t = isNaN(t) ? 0 : t,
    r = CalcularValorRealDeducaoReducao(),
    n = i - t - r,
    $("#ISSQN_ValorMonetarioReducaoBC").val() != "" && (u = parseFloat($("#ISSQN_ValorMonetarioReducaoBC").val().replace(/\./g, "").replace(/\,/g, ".")),
    n -= u),
    $("#ISSQN_ValorPercentualReducaoBC").val() != "" && (f = parseFloat($("#ISSQN_ValorPercentualReducaoBC").val().replace(/\./g, "").replace(/\,/g, ".")),
    n = n * (100 - f) / 100),
    $("#ISSQN_TributacaoISSQN").val() == "4" && (n = 0),
    n
}
function CalcularBCISSQNMinima(n) {
    var t, i, r;
    return optanteSimplesNacional && regApuTribSN == 1 ? 0 : $("#ISSQN_RegimeEspecial").val() != 0 ? 0 : $("#ISSQN_TributacaoISSQN").val() != 1 ? 0 : $("#ISSQN_TributacaoISSQN").val() == 1 && haIsencaoPorBM ? 0 : (t = $("#CodCompletoServico").val().substring(0, 8),
    window.excecoes.indexOf(t) !== -1) ? 0 : ehExportacao ? 0 : (i = parseFloat($("#Valores_ValorServico").val().replace(/\./g, "").replace(/\,/g, ".")),
    r = i * .02 / (n / 100),
    r.toFixed(2))
}
function CalcularValorRealDeducaoReducao() {
    var n = 0, i, t, r;
    switch ($("#DeducaoReducao_TipoDeducaoReducao:checked").val()) {
    case "1":
        n = parseFloat($("#DeducaoReducao_ValorMonetario").val().replace(/\./g, "").replace(/\,/g, "."));
        break;
    case "2":
        if ($("#DeducaoReducao_ValorPercentual").val() == "")
            return 0;
        i = parseFloat($("#DeducaoReducao_ValorPercentual").val().replace(/\./g, "").replace(/\,/g, "."));
        t = parseFloat($("#Valores_ValorServico").val().replace(/\./g, "").replace(/\,/g, "."));
        $("#Valores_ValorDescontoIncondicionado").val() != "" && (r = parseFloat($("#Valores_ValorDescontoIncondicionado").val().replace(/\./g, "").replace(/\,/g, ".")),
        t = t - r);
        n = t * i / 100;
        $("#pnlDeducaoPercentual #DeducaoReducao_ValorCalculado").val(FormataValorMonetario(n.toFixed(2)));
        break;
    case "3":
        $("#ValorTotalDeducao").val() != undefined && (n = parseFloat($("#ValorTotalDeducao").val().replace(/\./g, "").replace(/\,/g, ".")))
    }
    return isNaN(n) ? 0 : n
}
function AbrirmodalPessoaParaRetencao(n, t) {
    $("#modalPessoaParaRetencao .modal-content").html("");
    $.ajax({
        url: window.UrlBase + "dps/modalPessoaParaRetencao/abrir/",
        method: "GET",
        data: {
            idr: n,
            tpPessoa: t
        },
        beforeSend: function() {
            ExibirLoading()
        },
        complete: function() {
            OcultarLoading()
        },
        success: function(n) {
            $("#modalPessoaParaRetencao .modal-content").html(n);
            $("#modalPessoaParaRetencao").modal({
                backdrop: "static",
                keyboard: !1
            });
            window.UltConsmodalPessoaParaRetencao_Inscricao = $("#frmPessoa #Inscricao").val();
            FuncoesBasicas();
            FuncoesBasicasModalPessoaParaRetencao()
        },
        error: function(n) {
            console.log(n.responseText);
            ExibirAlerta("Não foi possível exibir o formulário para inclusão do Tomador/Intermediário")
        }
    })
}
function FuncoesBasicasModalPessoaParaRetencao() {
    $("#modalPessoaParaRetencao").on("click", "#btnFechar", function(n) {
        n.preventDefault();
        $("#hdfTipoValidacao").val() == "1" && ($("#pnlTributacaoMunicipal").slideUp(),
        LimparMunicipioIncidencia(),
        AlterarSelecaoChosen($("#CodigoTributacaoNacional"), ""));
        $("#modalPessoaParaRetencao").modal("hide")
    });
    $("#frmPessoa .cpfcnpj").focusout(function() {
        var i = $("#frmPessoa"), n = NormalizaValor($(this).val()), t;
        if (n.length != 11 && n.length != 14) {
            LimparPessoaModalPessoaParaRetencao();
            LimparEnderecomodalPessoaParaRetencao();
            window.UltConsmodalPessoaParaRetencao_Inscricao = "";
            ExibirAlerta("O CPF/CNPJ informado é inválido.");
            return
        }
        if (window.UltConsmodalPessoaParaRetencao_Inscricao != n) {
            if (ExibirLoading(),
            LimparPessoaModalPessoaParaRetencao(),
            LimparEnderecomodalPessoaParaRetencao(),
            t = RecuperarInfoInscricao(n, dataCompetencia),
            t == null) {
                OcultarLoading();
                ExibirAlerta("A inscrição informada não foi encontrada no cadastro de CPF/CNPJ");
                return
            }
            window.UltConsmodalPessoaParaRetencao_Inscricao = n;
            i.find("#Inscricao").val(t.inscricao);
            i.find("#Nome").val(t.nomerazaosocial);
            OcultarLoading()
        }
    });
    $("#frmPessoa .cep").parent().find(".btn").on("click", function() {
        var n = $(this).closest(".input-group").find("input[type=text]").val().replace(/\D/g, "");
        if (n.length != 8) {
            ExibirAlerta("O CEP informado está incorreto");
            return
        }
        BuscarCEP(n, $("#frmPessoa #pnlEndereco"))
    });
    $("#frmPessoa .cep").focusout(function() {
        var n = $(this).closest(".input-group").find("input[type=text]").val().replace(/\D/g, "");
        if (n.length != 8) {
            ExibirAlerta("O CEP informado está incorreto");
            return
        }
        BuscarCEP(n, $("#frmPessoa #pnlEndereco"))
    });
    $("#modalPessoaParaRetencao").off("click", "#btnSalvar");
    $("#modalPessoaParaRetencao").on("click", "#btnSalvar", function(n) {
        n.preventDefault();
        $("#modalPessoaParaRetencao .modal-body form").submit()
    });
    $("#modalPessoaParaRetencao").off("submit", ".modal-body form");
    $("#modalPessoaParaRetencao").on("submit", ".modal-body form", function(n) {
        n.preventDefault();
        var t = $(this);
        $.ajax({
            url: t.attr("action"),
            method: t.attr("method"),
            data: t.serialize(),
            success: function(n) {
                if (n.Sucesso) {
                    $("#modalPessoaParaRetencao").modal("hide");
                    switch (n.Pessoa.TipoPessoa) {
                    case 1:
                        $("#pnlRetencao #spnPrestador").text(n.Pessoa.NomeExibicao);
                        $("#pnlComandosPessoas").find("[data-tipopessoa='1']").html('<img src="/img/btn-editar.svg" /> Editar Prestador');
                        ExibirAlerta("O prestador do serviço foi atualizado com sucesso");
                        break;
                    case 2:
                        $("#hdfNivelInfoTomador").val("2");
                        $("#pnlRetencao #spnTomador").text(n.Pessoa.NomeExibicao);
                        $("#pnlComandosPessoas").find("[data-tipopessoa='2']").html('<img src="/img/btn-editar.svg" /> Editar Tomador');
                        $("#InscricaoTomador").val(n.Pessoa.Inscricao);
                        VerificarMensagemParaRetencao();
                        ExibirAlerta("O tomador do serviço foi atualizado com sucesso");
                        break;
                    case 3:
                        $("#hdfNivelInfoIntermediario").val("2");
                        $("#pnlRetencao #spnIntermediario").text(n.Pessoa.NomeExibicao);
                        $("#pnlComandosPessoas").find("[data-tipopessoa='3']").html('<img src="/img/btn-editar.svg" /> Editar Intermediário');
                        $("#InscricaoIntermediario").val(n.Pessoa.Inscricao);
                        VerificarMensagemParaRetencao();
                        ExibirAlerta("O intermediário do serviço foi atualizado com sucesso")
                    }
                } else
                    $("#modalPessoaParaRetencao .modal-content").html(n.HTML),
                    FuncoesBasicas(),
                    FuncoesBasicasModalPessoaParaRetencao()
            },
            error: function(n, t, i) {
                console.log(n + "\n" + t + "\n" + i);
                ExibirAlerta("Não foi possível realizar a atualização")
            }
        })
    })
}
function LimparPessoaModalPessoaParaRetencao() {
    $('#frmPessoa input[id$="Inscricao"]').val("");
    $('#frmPessoa input[id$="InscricaoMunicipal"]').val("");
    $('#frmPessoa input[id$="Nome"]').val("")
}
function LimparEnderecomodalPessoaParaRetencao() {
    $('#frmPessoa input[id$="CEP"]').val("");
    AlterarSelecaoChosen($('#frmPessoa select[id$="CodigoMunicipio"]'), "");
    $('#frmPessoa input[id$="Bairro"]').val("");
    $('#frmPessoa input[id$="Logradouro"]').val("");
    $('#frmPessoa input[id$="Numero"]').val("");
    $('#frmPessoa input[id$="Complemento"]').val("")
}
window.ValorAnteriorServico = null;
window.ValorAnteriorDI = null;
window.ValorAnteriorDC = null;
window.ValorAnteriorAliquotaInformada = null;
window.ValorAnteriorBMValor = null;
window.ValorAnteriorBMPercentual = null;
window.ValorAnteriorBCPISCofins = null;
window.OpcaoAnteriorRetencao = null;
window.OpcaoAnteriorRegimeEspecial = null;
window.RegimesEspeciaisQueNaoPermitemRetencao = ["1", "2", "3", "4", "5", "6"];
window.excecoes = ["04.22.01", "04.23.01", "05.09.01", "07.02.01", "07.02.02", "07.05.01", "07.05.02", "09.02.01", "09.02.02", "10.01.01", "10.01.02", "10.01.03", "10.01.04", "10.01.05", "10.02.01", "10.02.02", "10.03.01", "10.04.01", "10.04.02", "10.04.03", "10.05.01", "10.05.02", "10.06.01", "10.07.01", "10.08.01", "10.09.01", "10.10.01", "15.01.01", "15.01.02", "15.01.03", "15.01.04", "15.01.05", "15.10.01", "15.10.02", "15.10.03", "15.10.04", "15.10.05", "16.01.01", "16.01.02", "16.01.03", "16.01.04", "16.02.01", "17.05.01", "17.06.01", "17.10.01", "17.10.02", "17.11.01", "17.11.02", "17.12.01", "21.01.01", "25.03.01"];
window.RegimesEspeciaisQueNaoPermitemRetencao = ["1", "2", "3", "4", "5", "6", "9"];
$(document).ready(function() {
    window.OpcaoAnteriorRetencao = $("input[type=radio][id=ISSQN_TipoRetencao]:checked").val();
    window.OpcaoAnteriorRegimeEspecial = $("#ISSQN_RegimeEspecial").val();
    window.ValorAnteriorServico = $("#Valores_ValorServico").val();
    window.ValorAnteriorDI = $("#Valores_ValorDescontoIncondicionado").val();
    window.ValorAnteriorDC = $("#Valores_ValorDescontoCondicionado").val();
    window.ValorAnteriorBMValor = $("#ISSQN_ValorMonetarioReducaoBC").val();
    window.ValorAnteriorBMPercentual = $("#ISSQN_ValorPercentualReducaoBC").val();
    window.ValorAnteriorBCPISCofins = $("#TributacaoFederal_PISCofins_BaseDeCalculo").val();
    window.EhObraSinac = $("#hdfEhObraSinac").val() == "true";
    window.EhSitEspecialDedReceitaBrutaSinac = $("#hdfEhSitEspecialDedReceitaBrutaSinac").val() == "true";
    $("#TipoInscricaoEmitente").val() === "1" && ($("#pnlTributacaoFederal").find("input, select, textarea").prop("disabled", !0),
    $("#pnlTributacaoFederal").find("select").trigger("chosen:updated"));
    optanteSimplesNacional && $("#ISSQN_TributacaoISSQN").val() == "1" && $("#AliquotaAplicada").val() != "" && regApuTribSN != 1 && AtualizarCalculoISSQN();
    optanteSimplesNacional && regApuTribSN == 1 && $("input[type=radio][id=ISSQN_HaRetencao]:checked").val() == "1" && AtualizarCalculoISSQN();
    usuarioMei && ehNfseSubstituicao && BloquearCampo($("#Valores_ValorServico"));
    $("#Valores_ValorServico").focusout(function() {
        if ($(this).val() != window.ValorAnteriorServico) {
            if (!ValidarSomaDosDescontos()) {
                $(this).val(window.ValorAnteriorServico);
                return
            }
            if ($(this).val() == "") {
                if (CalcularBCISSQN() < 0) {
                    ExibirAlerta($("#MensagemValorServico").val());
                    $(this).val(window.ValorAnteriorServico);
                    return
                }
                $("#Valores_ValorDescontoIncondicionado").val("");
                $("#Valores_ValorDescontoCondicionado").val("");
                BloquearCampo($("#Valores_ValorDescontoIncondicionado"));
                BloquearCampo($("#Valores_ValorDescontoCondicionado"));
                AlterarSelecaoChosen($("#ISSQN_RegimeEspecial"), regEspContrib);
                BloquearCampo($("#ISSQN_RegimeEspecial"));
                regApuTribSN != 1 && regApuTribSN != 2 && (LimparCamposDasPerguntas(),
                DesabilitarPerguntasTributacao(!1));
                $("#ISSQN_AliquotaInformada").val("");
                BloquearCampo($("#ISSQN_AliquotaInformada"));
                podeAlterarDeducao && ($('#ISSQN_HaDeducaoReducao[value="0"]').prop("disabled", !0),
                $('#ISSQN_HaDeducaoReducao[value="1"]').prop("disabled", !0));
                $('#ISSQN_HaBeneficioMunicipal[value="0"]').prop("disabled", !0);
                $('#ISSQN_HaBeneficioMunicipal[value="1"]').prop("disabled", !0);
                podeAlterarRetencao && ($('#ISSQN_HaRetencao[value="0"]').prop("disabled", !0),
                $('#ISSQN_HaRetencao[value="1"]').prop("disabled", !0));
                $('#ISSQN_HaSuspensao[value="0"]').prop("disabled", !0);
                $('#ISSQN_HaSuspensao[value="1"]').prop("disabled", !0);
                $("#ISSQN_Aliquota").val("").prop("placeholder", "-");
                $("#ISSQN_BaseDeCalculo").val("").prop("placeholder", "-");
                $("#ISSQN_Valor").val("").prop("placeholder", "-");
                AlterarSelecaoChosen($("#TributacaoFederal_PISCofins_SituacaoTributaria"), "");
                $("#TributacaoFederal_PISCofins_SituacaoTributaria").change();
                $("#TributacaoFederal_ValorIRRF").val("");
                $("#TributacaoFederal_ValorCSLL").val("");
                $("#TributacaoFederal_ValorCP").val("");
                BloquearCampo($("#TributacaoFederal_PISCofins_SituacaoTributaria"));
                BloquearCampo($("#TributacaoFederal_ValorIRRF"));
                BloquearCampo($("#TributacaoFederal_ValorCSLL"));
                BloquearCampo($("#TributacaoFederal_ValorCP"));
                window.ValorAnteriorServico = "";
                return
            }
            if (usuarioMei || (DesbloquearCampo($("#TributacaoFederal_PISCofins_SituacaoTributaria")),
            DesbloquearCampo($("#TributacaoFederal_ValorIRRF")),
            DesbloquearCampo($("#TributacaoFederal_ValorCSLL")),
            DesbloquearCampo($("#TributacaoFederal_ValorCP"))),
            optanteSimplesNacional && regApuTribSN == 1) {
                DesbloquearCampo($("#Valores_ValorDescontoIncondicionado"));
                DesbloquearCampo($("#Valores_ValorDescontoCondicionado"));
                DesbloquearCampo($("#ISSQN_AliquotaInformada"));
                podeAlterarRetencao && ($('#ISSQN_HaRetencao[value="0"]').prop("disabled", !1),
                $('#ISSQN_HaRetencao[value="1"]').prop("disabled", !1));
                window.EhSitEspecialDedReceitaBrutaSinac == !0 && ($('#ISSQN_HaDeducaoReducao[value="0"]').prop("disabled", !1),
                $('#ISSQN_HaDeducaoReducao[value="1"]').prop("disabled", !1));
                window.EhObraSinac == !0 && ($('#ISSQN_HaBeneficioMunicipal[value="0"]').prop("disabled", !1),
                $('#ISSQN_HaBeneficioMunicipal[value="1"]').prop("disabled", !1));
                window.ValorAnteriorServico = $(this).val();
                optanteSimplesNacional && $("input[type=radio][id=ISSQN_HaRetencao]:checked").val() == "1" && AtualizarCalculoISSQN();
                return
            }
            if (!AtualizarCalculoISSQN()) {
                $(this).val(window.ValorAnteriorServico);
                return
            }
            haMaisDeUmRegime ? DesbloquearCampo($("#ISSQN_RegimeEspecial")) : BloquearCampo($("#ISSQN_RegimeEspecial"));
            $("#ISSQN_TributacaoISSQN").val() != "1" ? (podeAlterarDeducao && ($('#ISSQN_HaDeducaoReducao[value="0"]').prop("disabled", !0),
            $('#ISSQN_HaDeducaoReducao[value="1"]').prop("disabled", !0)),
            $('#ISSQN_HaBeneficioMunicipal[value="0"]').prop("disabled", !0),
            $('#ISSQN_HaBeneficioMunicipal[value="1"]').prop("disabled", !0),
            podeAlterarRetencao && ($('#ISSQN_HaRetencao[value="0"]').prop("disabled", !0),
            $('#ISSQN_HaRetencao[value="1"]').prop("disabled", !0)),
            $('#ISSQN_HaSuspensao[value="0"]').prop("disabled", !0),
            $('#ISSQN_HaSuspensao[value="1"]').prop("disabled", !0)) : $("#ISSQN_RegimeEspecial").val() == "0" && (podeAlterarDeducao && ($('#ISSQN_HaDeducaoReducao[value="0"]').prop("disabled", !1),
            $('#ISSQN_HaDeducaoReducao[value="1"]').prop("disabled", !1)),
            $('#ISSQN_HaBeneficioMunicipal[value="0"]').prop("disabled", !1),
            $('#ISSQN_HaBeneficioMunicipal[value="1"]').prop("disabled", !1),
            podeAlterarRetencao && ($('#ISSQN_HaRetencao[value="0"]').prop("disabled", !1),
            $('#ISSQN_HaRetencao[value="1"]').prop("disabled", !1)),
            $('#ISSQN_HaSuspensao[value="0"]').prop("disabled", !1),
            $('#ISSQN_HaSuspensao[value="1"]').prop("disabled", !1));
            DesbloquearCampo($("#Valores_ValorDescontoIncondicionado"));
            DesbloquearCampo($("#Valores_ValorDescontoCondicionado"));
            DesbloquearCampo($("#ISSQN_AliquotaInformada"));
            window.ValorAnteriorServico = $(this).val()
        }
    });
    $("#Valores_ValorDescontoIncondicionado").focusout(function() {
        if ($(this).val() != window.ValorAnteriorDI) {
            if (!ValidarSomaDosDescontos()) {
                $(this).val(window.ValorAnteriorDI);
                return
            }
            if (!ValidarValorServico()) {
                $(this).val(window.ValorAnteriorDC);
                return
            }
            if (!AtualizarCalculoISSQN(null, null, !1)) {
                $(this).val(window.ValorAnteriorDI);
                return
            }
            window.ValorAnteriorDI = $(this).val()
        }
    });
    $("#Valores_ValorDescontoCondicionado").focusout(function() {
        if ($(this).val() != window.ValorAnteriorDC) {
            if (!ValidarSomaDosDescontos()) {
                $(this).val(window.ValorAnteriorDC);
                return
            }
            if (!ValidarValorServico()) {
                $(this).val(window.ValorAnteriorDC);
                return
            }
            window.ValorAnteriorDC = $(this).val()
        }
    });
    $("#ISSQN_AliquotaInformada").focusout(function() {
        if (!$(this).is("[readonly]")) {
            if ($(this).val() == "") {
                $("#ISSQN_Aliquota").val($(this).val());
                $("#AliquotaAplicada").val($(this).val());
                AtualizarCalculoISSQN();
                window.ValorAnteriorAliquotaInformada = $(this).val();
                return
            }
            var n = parseFloat($(this).val().replace(/\./g, "").replace(/\,/g, "."));
            if (n > 5 && (!optanteSimplesNacional || regApuTribSN != 1)) {
                ExibirAlerta("A alíquota do ISSQN não deve ser superior à 5,00%");
                $(this).val(window.ValorAnteriorAliquotaInformada);
                $("#ISSQN_Aliquota").val("");
                $("#ISSQN_Valor").val("");
                return
            }
            if (n < 2)
                if (optanteSimplesNacional && regApuTribSN == 1) {
                    if (n < 1.8) {
                        ExibirAlerta("A alíquota do ISSQN não deve ser inferior à 1,80% se o prestador for optante do Simples Nacional na data de competência da DPS");
                        $(this).val(window.ValorAnteriorAliquotaInformada);
                        return
                    }
                } else {
                    ExibirAlerta("A alíquota do ISSQN não deve ser inferior à 2,00%");
                    $(this).val(window.ValorAnteriorAliquotaInformada);
                    return
                }
            if ($("#ISSQN_Aliquota").val($(this).val()),
            $("#AliquotaAplicada").val($(this).val()),
            !AtualizarCalculoISSQN()) {
                $(this).val(window.ValorAnteriorAliquotaInformada);
                return
            }
            window.ValorAnteriorAliquotaInformada = $(this).val()
        }
    });
    $("#pnlTribMun").on("change", "#ISSQN_RegimeEspecial", function() {
        if (!AtualizarCalculoISSQN()) {
            AlterarSelecaoChosen($("#ISSQN_RegimeEspecial"), window.OpcaoAnteriorRegimeEspecial);
            return
        }
        if ($("#ISSQN_RegimeEspecial").val() == 0)
            DesabilitarPerguntasTributacao(!1),
            window.OpcaoAnteriorRegimeEspecial = $(this).val();
        else {
            var n = $("input[type=radio][id=ISSQN_HaSuspensao]:checked").val()
              , t = $("input[type=radio][id=ISSQN_HaBeneficioMunicipal]:checked").val()
              , i = $("input[type=radio][id=ISSQN_HaRetencao]:checked").val()
              , r = $("input[type=radio][id=ISSQN_HaDeducaoReducao]:checked").val();
            if (n != "1" && t != "1" && i != "1" && r != "1") {
                DesabilitarPerguntasTributacao(!0);
                return
            }
            $.confirm({
                icon: "fa fa-warning",
                title: "Confirmação",
                content: "As informações sobre Suspensão, Benefícios Municipais, Retenção e Dedução/Redução já preenchidas serão perdidas.<br/> Deseja continuar?",
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
                            LimparCamposDasPerguntas();
                            DesabilitarPerguntasTributacao(!0)
                        }
                    },
                    nao: {
                        text: "Não",
                        action: function() {
                            AlterarSelecaoChosen($("#ISSQN_RegimeEspecial"), window.OpcaoAnteriorRegimeEspecial)
                        }
                    }
                }
            })
        }
    });
    $("#pnlOperacaoTributavel").on("change", "input[type=radio][id=ISSQN_HaSuspensao]", function() {
        switch (this.value) {
        case "0":
            $("#pnlSuspensao").slideUp();
            AlterarSelecaoChosen($("#ISSQN_TipoSuspensaoISSQN"), "");
            $("#ISSQN_NumeroProcesso").val("");
            break;
        case "1":
            if ($("input[type=radio][id=ISSQN_HaRetencao]:checked").val() == 1) {
                ExibirAlerta("Não é permitido informar suspensão da exigibilidade do recolhimento do ISSQN quando for indicada a retenção do imposto pelo Tomador ou Intermediário.");
                $('#ISSQN_HaSuspensao[value="0"]').prop("checked", !0);
                $('#ISSQN_HaSuspensao[value="1"]').prop("checked", !1);
                return
            }
            $("#pnlSuspensao").slideDown()
        }
    });
    $("#pnlOperacaoTributavel").on("change", "input[type=radio][id=ISSQN_HaRetencao]", function() {
        switch (this.value) {
        case "0":
            $("#pnlRetencao").slideUp();
            $('#ISSQN_TipoRetencao[value="2"]').prop("checked", !1);
            $('#ISSQN_TipoRetencao[value="3"]').prop("checked", !1);
            optanteSimplesNacional && !usuarioMei && regApuTribSN == 1 && ($("#pnlAliquotaInformada").slideUp(),
            $("#ISSQN_AliquotaInformada").val(""),
            $("#ISSQN_AliquotaDeveSerInformada").val("False"),
            $("#ISSQN_Aliquota").val("").prop("placeholder", "-"),
            $("#ISSQN_BaseDeCalculo").val("").prop("placeholder", "-"),
            $("#ISSQN_Valor").val("").prop("placeholder", "-"),
            $("#pnlTribMunValores").slideDown());
            break;
        case "1":
            if (usuarioMei) {
                ExibirAlerta("A retenção do ISSQN não é permitida para emitentes optantes pelo Simples Nacional - MEI.");
                $('#ISSQN_HaRetencao[value="0"]').prop("checked", !0);
                $('#ISSQN_HaRetencao[value="1"]').prop("checked", !1);
                return
            }
            if ($("input[type=radio][id=ISSQN_HaSuspensao]:checked").val() == 1) {
                ExibirAlerta("A retenção do ISSQN não é permitida quando houver suspensão da exigibilidade do recolhimento do imposto.");
                $('#ISSQN_HaRetencao[value="0"]').prop("checked", !0);
                $('#ISSQN_HaRetencao[value="1"]').prop("checked", !1);
                return
            }
            $("#pnlRetencao").slideDown();
            optanteSimplesNacional && !usuarioMei && regApuTribSN == 1 && ($("#pnlAliquotaInformada").slideDown(),
            $("#ISSQN_AliquotaDeveSerInformada").val("True"))
        }
    });
    $("#pnlOperacaoTributavel").on("change", "input[type=radio][id=ISSQN_HaBeneficioMunicipal]", function() {
        switch (this.value) {
        case "0":
            $("#pnlBeneficioMunicipalValor").slideUp();
            $("#pnlBeneficioMunicipalPercentual").slideUp();
            $("#pnlBeneficioMunicipal").slideUp();
            AlterarSelecaoChosen($("#ISSQN_IdBM"), "");
            $("#ISSQN_ValorMonetarioReducaoBC").val("");
            $("#ISSQN_ValorPercentualReducaoBC").val("");
            $("#ISSQN_ValorMonetarioReducaoBCObrigatorio").val("False");
            $("#ISSQN_ValorPercentualReducaoBCObrigatorio").val("False");
            $("#ISSQN_spanReducaoBC").text("");
            $("#AliquotaParametrizada").val() != "" ? $("#AliquotaAplicada").val($("#AliquotaParametrizada").val()) : $("#AliquotaAplicada").val($("#ISSQN_AliquotaInformada").val());
            AtualizarCalculoISSQN();
            haIsencaoPorBM = !1;
            break;
        case "1":
            optanteSimplesNacional && regApuTribSN == 1 && $("input[type=radio][id=ISSQN_HaRetencao]:checked").val() == "1" ? BuscarBeneficiosMunicipaisReducaoBC() : BuscarBeneficiosMunicipais()
        }
    });
    $("#pnlTribMun").on("change", "#ISSQN_IdBM", function() {
        var n = $("#Valores_ValorDescontoIncondicionado").val() == "";
        $(this).val() == "" ? ($("#pnlBeneficioMunicipalValor").slideUp(),
        $("#pnlBeneficioMunicipalPercentual").slideUp(),
        $("#pnlBeneficioMunicipal").slideUp(),
        $("#ISSQN_ValorMonetarioReducaoBC").val(""),
        $("#ISSQN_ValorPercentualReducaoBC").val(""),
        $("#ISSQN_spanReducaoBC").text(""),
        AtualizarCalculoISSQN(null, null, n)) : RecuperarInfoBeneficio()
    });
    $("#pnlTribMun #ISSQN_ValorMonetarioReducaoBC").focusout(function(n) {
        if (!AtualizarCalculoISSQN(null, n)) {
            $(this).val(window.ValorAnteriorBMValor);
            return
        }
        window.ValorAnteriorBMValor = $(this).val()
    });
    $("#pnlTribMun #ISSQN_ValorPercentualReducaoBC").focusout(function() {
        var t = $(this).val() == "" ? 0 : parseFloat($(this).val().replace(/\./g, "").replace(/\,/g, "."))
          , n = parseFloat($("#hdfPercentalMaximoDescontoBCPorBM").val().replace(/\./g, "").replace(/\,/g, "."));
        if (t > n) {
            ExibirAlerta("A redução da base de cálculo prevista pelo Benefício Municipal selecionado deve ser igual ou inferior a " + FormataValorMonetario(n.toFixed(2)) + "%.");
            $(this).val("");
            AtualizarCalculoISSQN();
            return
        }
        CalcularBCISSQN() < CalcularBCISSQNMinima(parseFloat($("#AliquotaAplicada").val().replace(",", ".")).toFixed(2)) ? ($(this).val(""),
        AtualizarCalculoISSQN(),
        ExibirAlerta($("#MensagemBaseCalculoMenorPermitido").val())) : AtualizarCalculoISSQN($("#AliquotaAplicada").val(), null)
    });
    $("#pnlTribMun").on("change", "input[type=radio][id=ISSQN_TipoRetencao]", function() {
        var n = !0;
        if (haIsencaoPorBM)
            ExibirAlerta('A retenção do ISSQN não é permitida quando for utilizado um Benefício Municipal do tipo "Isenção"'),
            n = !1;
        else if ($.inArray($("#ISSQN_RegimeEspecial").val(), window.RegimesEspeciaisQueNaoPermitemRetencao) != -1)
            ExibirAlerta('A retenção do ISSQN não é permitida quando o Regime Especial for "' + $("#ISSQN_RegimeEspecial option:selected").text() + '"'),
            n = !1;
        else
            switch (this.value) {
            case "2":
                switch ($("#hdfNivelInfoTomador").val()) {
                case "0":
                    ExibirAlerta('O tomador do serviço não foi informado para esta DPS. Antes de marcar este tipo de retenção, utilize a opção "Incluir Tomador" para informar um tomador cujo endereço seja no município de incidência do ISSQN.');
                    n = !1;
                    break;
                case "1":
                    ExibirAlerta('O tomador do serviço informado para esta DPS não possui um endereço vinculado. Antes de marcar este tipo de retenção, utilize a opção "Editar Tomador" para identificar o endereço do tomador.');
                    n = !1;
                    break;
                case "3":
                    ExibirAlerta('O tomador do serviço informado para esta DPS foi identificado pelo NIF e possui endereço no exterior. Caso haja retenção do ISSQN pelo tomador, o mesmo deve possuir um endereço no território nacional e ser identificado pelo CPF ou CNPJ. Utilize a opção "Editar Tomador" para alterar estas informações.');
                    n = !1
                }
                break;
            case "3":
                switch ($("#hdfNivelInfoIntermediario").val()) {
                case "0":
                    ExibirAlerta('O intermediário do serviço não foi informado para esta DPS. Antes de marcar este tipo de retenção, utilize a opção "Incluir Intermediário" para informar um intermediário cujo endereço seja no município de incidência do ISSQN.');
                    n = !1;
                    break;
                case "1":
                    ExibirAlerta('O intermediário do serviço informado para esta DPS não possui um endereço vinculado. Antes de marcar este tipo de retenção, utilize a opção "Editar Intermediário" para identificar o endereço do intermediário.');
                    n = !1;
                    break;
                case "3":
                    ExibirAlerta('O intermediário do serviço informado para esta DPS foi identificado pelo NIF e possui endereço no exterior. Caso haja retenção do ISSQN pelo intermediário, o mesmo deve possuir um endereço no território nacional e ser identificado pelo CPF ou CNPJ. Utilize a opção "Editar Intermediário" para alterar estas informações.');
                    n = !1
                }
            }
        if (!n) {
            window.OpcaoAnteriorRetencao != undefined ? $('input[type=radio][id=ISSQN_TipoRetencao][value="' + window.OpcaoAnteriorRetencao + '"]').prop("checked", !0) : $("input[type=radio][id=ISSQN_TipoRetencao]").prop("checked", !1);
            return
        }
        window.OpcaoAnteriorRetencao = this.value
    });
    $("#pnlTributacaoFederal").on("change", "#TributacaoFederal_PISCofins_SituacaoTributaria", function() {
        $.inArray($(this).val(), ["1", "2", "3", "4", "5", "6", "7"]) != -1 ? $("#pnlTributacaoFederalValoresObrig").slideDown() : ($("#pnlTributacaoFederalValoresObrig").slideUp(),
        $('input[type=radio][id="TributacaoFederal_PISCofins_TipoRetencao"]').prop("checked", !1),
        $("#TributacaoFederal_PISCofins_BaseDeCalculo").val(""),
        $("#TributacaoFederal_PISCofins_AliquotaPIS").val(""),
        $("#TributacaoFederal_PISCofins_ValorPIS").val(""),
        $("#TributacaoFederal_PISCofins_AliquotaCOFINS").val(""),
        $("#TributacaoFederal_PISCofins_ValorCOFINS").val(""));
        ControlarExibicaoCamposPISCOFINS()
    });
    $("#TributacaoFederal_PISCofins_BaseDeCalculo, #TributacaoFederal_PISCofins_AliquotaPIS, #TributacaoFederal_PISCofins_AliquotaCOFINS").focusout(function(n) {
        var f = $("#TributacaoFederal_PISCofins_SituacaoTributaria").val(), t, i, r, u, e, o;
        if (f != 4 && f != 6) {
            if (t = parseFloat($("#TributacaoFederal_PISCofins_BaseDeCalculo").val().replace(/\./g, "").replace(/\,/g, ".")),
            isNaN(t)) {
                $("#TributacaoFederal_PISCofins_ValorPIS").val("");
                $("#TributacaoFederal_PISCofins_ValorCOFINS").val("");
                return
            }
            if (n.target.id == "TributacaoFederal_PISCofins_BaseDeCalculo") {
                if ($(this).val() == window.ValorAnteriorBCPISCofins)
                    return;
                i = parseFloat($("#Valores_ValorServico").val().replace(/\./g, "").replace(/\,/g, "."));
                i = isNaN(i) ? 0 : i;
                t > i ? (ExibirAlerta("O valor da BC para Pis/Cofins deve ser menor ou igual ao valor do serviço informado."),
                $(this).val(window.ValorAnteriorBCPISCofins)) : window.ValorAnteriorBCPISCofins = $(this).val()
            } else if (!ValidarValorServico()) {
                $(this).val("");
                n.target.id == "TributacaoFederal_PISCofins_AliquotaPIS" ? $("#TributacaoFederal_PISCofins_ValorPIS").val("") : $("#TributacaoFederal_PISCofins_ValorCOFINS").val("");
                return
            }
            r = parseFloat($("#TributacaoFederal_PISCofins_AliquotaPIS").val().replace(/\./g, "").replace(/\,/g, "."));
            u = parseFloat($("#TributacaoFederal_PISCofins_AliquotaCOFINS").val().replace(/\./g, "").replace(/\,/g, "."));
            isNaN(r) ? $("#TributacaoFederal_PISCofins_ValorPIS").val("") : (e = ArredondarValorToEven(t * r / 100),
            $("#TributacaoFederal_PISCofins_ValorPIS").val(FormataValorMonetario(e.toFixed(2))),
            $("#TributacaoFederal_PISCofins_ValorPIS").closest(".form-group").removeClass("erro"),
            $("#TributacaoFederal_PISCofins_ValorPIS").closest(".form-group").find(".field-validation-error").hide());
            isNaN(u) ? $("#TributacaoFederal_PISCofins_ValorCOFINS").val("") : (o = ArredondarValorToEven(t * u / 100),
            $("#TributacaoFederal_PISCofins_ValorCOFINS").val(FormataValorMonetario(o.toFixed(2))),
            $("#TributacaoFederal_PISCofins_ValorCOFINS").closest(".form-group").removeClass("erro"),
            $("#TributacaoFederal_PISCofins_ValorCOFINS").closest(".form-group").find(".field-validation-error").hide())
        }
    });
    $("#pnlTotal").on("change", "#Totais_TipoImpressao", function() {
        $("#Totais_FederalReais").val("");
        $("#Totais_EstadualReais").val("");
        $("#Totais_MunicipalReais").val("");
        $("#Totais_FederalPercentual").val("");
        $("#Totais_EstadualPercentual").val("");
        $("#Totais_MunicipalPercentual").val("");
        switch (this.value) {
        case "1":
            $("#pnlTotaisEmReais").show();
            $("#pnlTotaisPercentual").hide();
            break;
        case "2":
            $("#pnlTotaisPercentual").show();
            $("#pnlTotaisEmReais").hide()
        }
        $("#pnlTotaisValores").slideDown()
    });
    $("#pnlValorTributos").on("change", 'input[type="radio"][id="ValorTributos_TipoValorTributos"]', function() {
        $("#ValorTributos_ValorTotalFederal").val("");
        $("#ValorTributos_ValorTotalEstadual").val("");
        $("#ValorTributos_ValorTotalMunicipal").val("");
        $("#ValorTributos_PercentualTotalFederal").val("");
        $("#ValorTributos_PercentualTotalEstadual").val("");
        $("#ValorTributos_PercentualTotalMunicipal").val("");
        $("#ValorTributos_AliquotaSN").val("");
        switch (this.value) {
        case "1":
            $("#pnlValoresMonetarios").slideDown();
            $("#pnlValoresPercentuais").slideUp();
            $("#pnlValorAliquotaSN").slideUp();
            break;
        case "2":
            $("#pnlValoresMonetarios").slideUp();
            $("#pnlValoresPercentuais").slideDown();
            $("#pnlValorAliquotaSN").slideUp();
            $("#ValorTributos_PercentualTotalFederal").val($("#ConfigPercentualFederal").val());
            $("#ValorTributos_PercentualTotalEstadual").val($("#ConfigPercentualEstadual").val());
            $("#ValorTributos_PercentualTotalMunicipal").val($("#ConfigPercentualMunicipal").val());
            break;
        case "3":
            $("#pnlValoresMonetarios").slideUp();
            $("#pnlValoresPercentuais").slideUp();
            $("#pnlValorAliquotaSN").slideUp();
            break;
        case "4":
            $("#pnlValoresMonetarios").slideUp();
            $("#pnlValoresPercentuais").slideUp();
            $("#pnlValorAliquotaSN").slideDown();
            $("#ValorTributos_AliquotaSN").val($("#ConfigAliquotaSimplesNacional").val())
        }
    });
    $("#pnlTribMun").on("click", ".btnAlterarPessoa", function() {
        var n = $(this).data("idr")
          , t = $(this).data("tipopessoa");
        AbrirmodalPessoaParaRetencao(n, t)
    });
    $('input[type="radio"][id="TributacaoFederal_PISCofins_TipoRetencao"]').change(function() {
        ControlarExibicaoCamposPISCOFINS();
        var n = $('input[type=radio][id="TributacaoFederal_PISCofins_TipoRetencao"]:checked').val();
        ValidarValorServico() || n == "1" && ($("#TributacaoFederal_PISCofins_BaseDeCalculo").val(""),
        $("#TributacaoFederal_PISCofins_AliquotaPIS").val(""),
        $("#TributacaoFederal_PISCofins_ValorPIS").val(""),
        $("#TributacaoFederal_PISCofins_AliquotaCOFINS").val(""),
        $("#TributacaoFederal_PISCofins_ValorCOFINS").val(""))
    });
    $("#TributacaoFederal_ValorIRRF, #TributacaoFederal_ValorCSLL, #TributacaoFederal_ValorCP").focusout(function() {
        if (!ValidarValorServico()) {
            $(this).val("");
            $("#TributacaoFederal_PISCofins_AliquotaCOFINS").val("");
            return
        }
    });
    $("#pnlOperacaoTributavel").on("click", "input[type=radio][id=ISSQN_HaRetencao]", function(n) {
        if (this.value == "1" && ValidarValorServico(!0) == !1) {
            n.preventDefault();
            return
        }
    })
});
window.UltConsmodalPessoaParaRetencao_Inscricao = ""
