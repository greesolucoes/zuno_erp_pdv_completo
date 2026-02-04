function AlterarIndicacaoDeExistenciaDeDedRed(n) {
    $("#DeducaoReducao_ValorMonetario").val("");
    $("#DeducaoReducao_ValorPercentual").val("");
    $("#DeducaoReducao_ValorCalculado").val("");
    ExcluirTodosOsDocumentos();
    $("input[type=radio][id=DeducaoReducao_TipoDeducaoReducao]").prop("checked", !1);
    switch (n) {
    case "0":
        $("#pnlDeducaoReducao").slideUp();
        $("#pnlDeducaoValor").slideUp();
        $("#pnlDeducaoPercentual").slideUp();
        $("#pnlDeducaoDocumentos").slideUp();
        AtualizarCalculoISSQN();
        $("#DeducaoReducao_TipoDeducaoReducaoObrigatorio").val("NAO");
        break;
    case "1":
        $("#pnlDeducaoReducao").slideDown();
        $("#DeducaoReducao_TipoDeducaoReducaoObrigatorio").val("SIM")
    }
}
function AlterarOpcaoDedRedSelecionada() {
    switch (window.ValorAnteriorDedRedTipo) {
    case "1":
        $("#pnlDeducaoValor").slideDown();
        $("#pnlDeducaoPercentual").slideUp();
        $("#pnlDeducaoDocumentos").slideUp();
        break;
    case "2":
        $("#pnlDeducaoValor").slideUp();
        $("#pnlDeducaoPercentual").slideDown();
        $("#pnlDeducaoDocumentos").slideUp();
        break;
    case "3":
        $("#pnlDeducaoValor").slideUp();
        $("#pnlDeducaoPercentual").slideUp();
        $("#pnlDeducaoDocumentos").slideDown()
    }
}
function FuncoesBasicasParaDeducao() {
    FuncoesBasicas();
    $(".cep").parent().find(".btn").on("click", function() {
        var n = $(this).closest(".input-group").find("input[type=text]").val().replace(/\D/g, "");
        if (n.length != 8) {
            ExibirAlerta("O CEP informado está incorreto");
            $(".cep").val("");
            return
        }
        BuscarCEP(n, $(this).closest('div[id$="Endereco"]'))
    });
    $(".cep").focusout(function() {
        var n = $(this).val().replace(/\D/g, "");
        if (n.length != 8) {
            ExibirAlerta("O CEP informado está incorreto");
            $(".cep").val("");
            return
        }
        BuscarCEP(n, $(this).closest('div[id$="Endereco"]'))
    });
    $("#modalDeducao #DataEmissao").siblings(".input-group-btn").find("button").on("click", function(n) {
        n.preventDefault();
        $("#DataEmissao").datepicker("show")
    })
}
function HaCamposDedRedInformados() {
    return $("#DeducaoReducao_ValorMonetario").val() != "" ? !0 : $("#DeducaoReducao_ValorPercentual").val() != "" ? !0 : $("#tabelaDeducoes > tbody > tr").length > 0 ? !0 : !1
}
function ExcluirTodosOsDocumentos() {
    var n = $("#hdfIdr").val();
    $.ajax({
        url: window.UrlBase + "DPS/DeducaoDocumento/ExcluirTodos/?idr=" + n,
        method: "POST",
        data: "",
        success: function(n) {
            n.Mensagem != undefined ? ExibirAlerta("Não foi possível excluir a dedução") : ($("#pnlDeducaoReducao .lista").html(n.HTML),
            FuncoesBasicasParaDeducao())
        }
    })
}
window.ValorAnteriorDedRedTipo = null;
window.ValorAnteriorDedRedValor = null;
window.ValorAnteriorDedRedPercentual = null;
$(document).ready(function() {
    window.ValorAnteriorDedRedTipo = $("input[type=radio][id=DeducaoReducao_TipoDeducaoReducao]:checked").val();
    window.ValorAnteriorDedRedValor = $("#ISSQN_ValorMonetarioReducaoBC").val();
    window.ValorAnteriorDedRedPercentual = $("#ISSQN_ValorPercentualReducaoBC").val();
    $("#pnlOperacaoTributavel").on("change", "input[type=radio][id=ISSQN_HaDeducaoReducao]", function() {
        HaCamposDedRedInformados() ? $.confirm({
            icon: "fa fa-warning",
            title: "Confirmação",
            content: "Os dados já informados para a Dedução/Redução serão perdidos.<br/> Deseja continuar?",
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
                        window.ValorAnteriorDedRedTipo = null;
                        AlterarIndicacaoDeExistenciaDeDedRed($("input[type=radio][id=ISSQN_HaDeducaoReducao]:checked").val())
                    }
                },
                nao: {
                    text: "Não",
                    action: function() {
                        switch ($("input[type=radio][id=ISSQN_HaDeducaoReducao]:checked").val()) {
                        case "0":
                            $('input[type=radio][id=ISSQN_HaDeducaoReducao][value="1"]').prop("checked", !0);
                            break;
                        case "1":
                            $('input[type=radio][id=ISSQN_HaDeducaoReducao][value="0"]').prop("checked", !0)
                        }
                    }
                }
            }
        }) : AlterarIndicacaoDeExistenciaDeDedRed($("input[type=radio][id=ISSQN_HaDeducaoReducao]:checked").val())
    });
    $("#pnlDeducaoReducao").on("change", "input[type=radio][id=DeducaoReducao_TipoDeducaoReducao]", function() {
        HaCamposDedRedInformados() ? $.confirm({
            icon: "fa fa-warning",
            title: "Confirmação",
            content: "Os dados já informados para a Dedução/Redução serão perdidos.<br/> Deseja continuar?",
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
                        window.ValorAnteriorDedRedTipo = $("input[type=radio][id=DeducaoReducao_TipoDeducaoReducao]:checked").val();
                        AlterarOpcaoDedRedSelecionada();
                        $("#DeducaoReducao_ValorMonetario").val("");
                        $("#DeducaoReducao_ValorPercentual").val("");
                        $("#DeducaoReducao_ValorCalculado").val("");
                        ExcluirTodosOsDocumentos();
                        AtualizarCalculoISSQN()
                    }
                },
                nao: {
                    text: "Não",
                    action: function() {
                        $('input[type=radio][id=DeducaoReducao_TipoDeducaoReducao][value="' + window.ValorAnteriorDedRedTipo + '"]').prop("checked", !0)
                    }
                }
            }
        }) : (window.ValorAnteriorDedRedTipo = $("input[type=radio][id=DeducaoReducao_TipoDeducaoReducao]:checked").val(),
        AlterarOpcaoDedRedSelecionada(),
        AtualizarCalculoISSQN())
    });
    $("#pnlDeducaoReducao").on("click", "#btnIncluirDocumentoDeducao", function() {
        $("#modalDeducao .modal-content").html("");
        var n = $("#hdfIdr").val();
        $.ajax({
            url: window.UrlBase + "DPS/DeducaoDocumento/ModalInclusao/",
            method: "GET",
            data: {
                idr: n
            },
            success: function(n) {
                $("#modalDeducao .modal-content").html(n);
                $("#modalDeducao").modal({
                    backdrop: "static",
                    keyboard: !1
                });
                FuncoesBasicasParaDeducao();
                AtualizarCalculoISSQN()
            },
            error: function() {}
        })
    });
    $("#pnlDeducaoReducao").on("click", "#tabelaDeducoes .td-opcoes .btnDeducaoEditar", function() {
        var n = $(this).siblings("#hdfDeducaoGuid").val()
          , t = $("#hdfIdr").val();
        return $.ajax({
            url: window.UrlBase + "DPS/DeducaoDocumento/ModalEdicao/",
            method: "GET",
            data: {
                idr: t,
                guid: n
            },
            success: function(n) {
                n.Mensagem != undefined ? ExibirAlerta(n.Mensagem) : ($("#modalDeducao .modal-content").html(n),
                $("#modalDeducao").modal({
                    backdrop: "static",
                    keyboard: !1
                }),
                FuncoesBasicasParaDeducao(),
                AtualizarCalculoISSQN())
            }
        }),
        !1
    });
    $("#pnlDeducaoReducao").on("click", "#tabelaDeducoes .td-opcoes .btnDeducaoExcluir", function() {
        var n = $(this).siblings("#hdfDeducaoGuid").val()
          , t = $("#hdfIdr").val();
        return $.confirm({
            icon: "fa fa-warning",
            title: "Confirmação",
            content: "Deseja excluir esta dedução?",
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
                            url: window.UrlBase + "DPS/DeducaoDocumento/Excluir/",
                            method: "POST",
                            data: {
                                idr: t,
                                guid: n
                            },
                            success: function(n) {
                                n.Mensagem != undefined ? ExibirAlerta("Não foi possível excluir a dedução") : ($("#pnlDeducaoReducao .lista").html(n.HTML),
                                FuncoesBasicasParaDeducao(),
                                AtualizarCalculoISSQN())
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
    $("#DeducaoReducao_ValorMonetario").focusout(function() {
        if (!AtualizarCalculoISSQN()) {
            $(this).val(window.ValorAnteriorDedRedValor);
            return
        }
        window.ValorAnteriorDedRedValor = $(this).val()
    });
    $("#DeducaoReducao_ValorPercentual").focusout(function() {
        if (!AtualizarCalculoISSQN()) {
            $(this).val(window.ValorAnteriorDedRedPercentual);
            return
        }
        window.ValorAnteriorDedRedPercentual = $(this).val()
    });
    $("#modalDeducao").on("change", "#TipoDocumentoDeducao", function() {
        $("#pnlTipoNFe").hide();
        $("#pnlTipoNFSe").hide();
        $("#pnlTipoOutrasNFSe").hide();
        $("#pnlTipoNFNFS").hide();
        $("#pnlTipoOutrosDocumentosFiscais").hide();
        $("#pnlTipoOutrosDocumentos").hide();
        $("#ChaveAcessoNFe").val("");
        $("#ChaveAcessoNFSe").val("");
        $("#CodMunGeradorNFSe").val("");
        $("#NumeroNFSe").val("");
        $("#CodVerificacaoNFSe").val("");
        $("#NumeroOutroDocumento").val("");
        switch (this.value) {
        case "1":
            $("#pnlTipoNFe").show();
            break;
        case "2":
            $("#pnlTipoNFSe").show();
            break;
        case "3":
            $("#pnlTipoOutrasNFSe").show();
            break;
        case "4":
            $("#pnlTipoNFNFS").show();
            break;
        case "5":
            $("#pnlTipoOutrosDocumentosFiscais").show();
            break;
        case "6":
            $("#pnlTipoOutrosDocumentos").show()
        }
    });
    $("#modalDeducao").on("change", "#TipoIdentificacaoDeducao", function() {
        $(this).val() == 99 ? $("#pnlDescricao").slideDown() : $("#pnlDescricao").slideUp()
    });
    $("#modalDeducao").on("click", "#IdentificarFornecedor", function() {
        $(this).is(":checked") ? $("#pnlFornecedor").slideDown() : ($("#pnlFornecedor").slideUp(),
        ReiniciarPessoa($("#pnlFornecedor")))
    });
    $("#modalDeducao").on("change", 'input[type="radio"][id="LocalDomicilio"]', function() {
        var n = $(this).closest("#pnlFornecedor");
        LimparPessoa(n);
        this.value == "1" ? (n.find("#pnlInscricaoBrasil").show(),
        n.find("#pnlInscricaoExterior").hide(),
        $("#pnlEnderecoBrasil").show(),
        $("#pnlEnderecoExterior").hide()) : (n.find("#pnlInscricaoBrasil").hide(),
        n.find("#pnlInscricaoExterior").show(),
        $("#pnlEnderecoBrasil").hide(),
        $("#pnlEnderecoExterior").show())
    });
    $("#modalDeducao").on("click", "#InformarEndereco", function() {
        $(this).is(":checked") ? $("#pnlEndereco").slideDown() : ($("#pnlEndereco").slideUp(),
        LimparEndereco($("#pnlEndereco")))
    });
    $("#modalDeducao").on("click", "#btnIncluir, #btnAlterar", function(n) {
        n.preventDefault();
        $("#modalDeducao .modal-body form").submit()
    });
    $("#modalDeducao").on("submit", ".modal-body form", function(n) {
        n.preventDefault();
        var t = $(this);
        $.ajax({
            url: t.attr("action"),
            method: t.attr("method"),
            data: t.serialize(),
            success: function(n) {
                n.Mensagem != undefined && ($("#modalDeducao").modal("hide"),
                ExibirAlerta("Não foi possível incluir a dedução"));
                n.Sucesso ? ($("#modalDeducao").modal("hide"),
                $("#pnlDeducaoReducao .lista").html(n.HTML),
                FuncoesBasicas(),
                AtualizarCalculoISSQN()) : ($("#modalDeducao .modal-content").html(n.HTML),
                FuncoesBasicasParaDeducao())
            },
            error: function(n) {
                $.alert(n.responseJSON.Message)
            }
        })
    });
    $("#modalDeducao").on("focusout", ".form-control.cpfcnpj", function() {
        var t, i, u, n, f, r;
        if (!$(this).is("[readonly]") && !$(this).is(":disabled")) {
            if (t = $(this).closest("#pnlFornecedor"),
            i = NormalizaValor($(this).val()),
            i.length != 11 && i.length != 14) {
                i.length > 0 && ExibirAlerta("O CPF/CNPJ informado é inválido");
                LimparPessoa(t);
                $(this).closest(".form-group").find("input[type=hidden]").val("");
                return
            }
            if (ExibirLoading(),
            LimparPessoa(t),
            u = $("#DataCompetencia").val().split("/").reverse().join("-"),
            n = i.length == 14 ? RecuperarInfoPessoaJuridicaTomador(i, u) : RecuperarInfoInscricao(i, u),
            n == null) {
                OcultarLoading();
                ExibirAlerta("A inscrição informada não foi encontrada no cadastro de CPF/CNPJ");
                window.UltConsCNC_Inscricao = "";
                window.UltConsCNC_Painel = "";
                return
            }
            if (i.length == 11) {
                if (f = t.find('input[id$="LocalDomicilio"]:checked').val(),
                f == 1 && n.codigopais != 0) {
                    OcultarLoading();
                    ExibirAlerta("Os CPF cadastrados na RFB com endereço no exterior não podem ser utilizados em endereço nacional.");
                    return
                }
                if (f == 2 && n.codigopais == 0) {
                    OcultarLoading();
                    ExibirAlerta("Os CPF cadastrados na RFB com endereço nacional não podem ser utilizados em endereço no exterior.");
                    return
                }
            }
            t.find('input[id$="LocalDomicilio"]:checked').val() == 1 && t.find('input[id$="Inscricao"]').val(n.inscricao);
            t.find('input[id$="Nome"]').val(n.nomerazaosocial);
            t.find('input[id$="Nome"]').closest(".form-group").removeClass("erro");
            t.find('input[id$="Nome"]').closest(".form-group").find(".field-validation-error").hide();
            i.length == 14 && ($("#InformarEndereco").prop("checked", !0),
            t.find("#pnlEndereco").slideDown(),
            r = t.find("#pnlEnderecoBrasil"),
            r.find('input[id$="_Cep"]').val(n.cep),
            r.find('input[id$="_CodigoMunicipio"]').val(n.codigoibgemunicipio),
            r.find('input[id$="_NomeMunicipio"]').val(n.nomemunicipio.toUpperCase()),
            r.find('input[id$="_Bairro"]').val(n.bairro),
            r.find('input[id$="_Logradouro"]').val(n.logradouro),
            r.find('input[id$="_Numero"]').val(n.numero),
            r.find('input[id$="_Complemento"]').val(n.complemento));
            AplicarMascaras();
            OcultarLoading()
        }
    })
})
