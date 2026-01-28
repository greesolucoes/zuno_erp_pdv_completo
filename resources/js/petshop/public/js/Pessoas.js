/* CÓDIGO JAVASCRIPT RESPONSÁVEL PELO FUNCIONAMENTO DO PASSO DE IDENTIFICAÇÃO NO DPS */
// Variável global para identificar o tipo de emitente selecionado antes de ele ser modificado pelo usuário
window.TipoEmitenteAnterior = null;
window.DtCompetAnterior = null;
window.PrestadorAlterado = false;
window.TomadorAlterado = false;
window.IntermediarioAlterado = false;
window.UltConsCNC_Inscricao = '';
window.UltConsCNC_Painel = '';
window.LocalTomador = '';
window.LocalIntermediario = '';
window.PrestadorCepAnterior = '';
// Variáveis globais para armazenar os valores iniciais dos campos
window.PrestadorEnderecoOriginal = {
    CEP: null,
    Logradouro: null,
    Numero: null,
    Complemento: null,
    Bairro: null,
};

function DesabilitarPessoa(painel) {
    var tipoPessoa = painel.data('tipopessoa');
    // Desabilita todos os inputs exceto os hidden
    painel.find('input:not([type="hidden"])[id$="LocalDomicilio"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="Inscricao"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="InscricaoExterior"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="InscricaoMunicipal"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="NIF"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="Nome"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="Telefone"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="Email"]').prop('disabled', true);
    nome = '#' + tipoPessoa + '_MotivoNaoInformacaoNIF';
    BloquearCampo(nome);
    painel.find('input:not([type="hidden"])[id$="NIFInformado"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="InformarEndereco"]').prop('disabled', true);
    DesabilitarEndereco(painel);
    // Detecta o tipo de pessoa e desabilita o botão histórico correspondente
    var tipoPessoa = painel.data('tipopessoa');
    painel.find('#btn_' + tipoPessoa + '_Inscricao_historico').prop('disabled', true);
    painel.find('#btn_' + tipoPessoa + '_EnderecoNacional_CEP').prop('disabled', true);
    painel.find('#btn_' + tipoPessoa + '_NIF_historico').prop('disabled', true);
}

function DesabilitarEndereco(painel) {
    // Endereço nacional
    painel.find('input:not([type="hidden"])[id$="CEP"]').prop('disabled', true);        // Detecta o tipo de pessoa e desabilita o botão de busca de cep
    var tipoPessoa = painel.data('tipopessoa');
    painel.find('select[id$="CodigoMunicipio"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="CEP"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="CodigoMunicipio"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="NomeMunicipio"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="Bairro"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="Logradouro"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="Numero"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="Complemento"]').prop('disabled', true);

    // Endereço exterior
    painel.find('input:not([type="hidden"])[id$="EnderecoExterior_Logradouro"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="EnderecoExterior_Numero"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="EnderecoExterior_Complemento"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="EnderecoExterior_Bairro"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="EnderecoExterior_Cidade"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="EnderecoExterior_CodigoEnderecamentoPostal"]').prop('disabled', true);
    painel.find('input:not([type="hidden"])[id$="EnderecoExterior_EstadoProvinciaRegiao"]').prop('disabled', true);
    painel.find('select[id$="EnderecoExterior_CodigoPais"]').prop('disabled', true);
    var tipoPessoa = painel.data('tipopessoa');
    nome = painel.find('#' + tipoPessoa + '_EnderecoExterior_CodigoPais').prop('disabled', true);
    BloquearCampo(nome);
    nome = painel.find('#' + tipoPessoa + '_LocalDomicilio').prop('disabled', true);
    BloquearCampo(nome);
}

// Funções executadas ao final do carregamento da página
$(document).ready(function () {
    // Carrega informações iniciais
    window.DtCompetAnterior = $('#DataCompetencia').val();
    window.TipoEmitenteAnterior = $('input[type=radio][id=TipoEmitente]:checked').val();
    InicializarValoresOriginais();
    ////
    //if ($('#Prestador_EnderecoNacional_CodigoMunicipio').val() != '') {
    //    var nomeMunicipio = $("#Prestador_EnderecoNacional_CodigoMunicipio option:selected").text().trim();
    //    $('#Prestador_EnderecoNacional_NomeMunicipio').val(nomeMunicipio);
    //}
    //

    //Desabilitar assinatura digital 30/09/2025
    //Só desabilita regras de Acesso com certificado digital
    //Se nao for ambiente ambiente de produção
    //Se o usuário logou com senha(sem certificado digital)
    //e se esta configurado pra desabilitar as regras de acesso com Certificado Digital
    //if (ehAmbienteProducao == false &&
    //    ehCnpjExigeAcessoCertificado == false &&
    //    ehAcessoComCertificadoDigital == false && 
    //    ehPraDesabilitarRegrasAcessoSemCertificado == true) {
    //    ehAcessoComCertificadoDigital = false;
    //}
    ehAcessoComCertificadoDigital = true;
    if (desabilitarTomadorNfseSubsMei) {
        DesabilitarPessoa($('#pnlTomador'));
    }
    if (desabilitarIntermediarioNfseSubsMei) {
        DesabilitarPessoa($('#pnlIntermediario'));
    }


    if ($('#DataCompetencia').val() == '') {
        $('#Prestador_EnderecoNacional_CodigoMunicipio').empty();
        $('#Prestador_EnderecoNacional_NomeMunicipio').val('');
        var $im = $('#Prestador_InscricaoMunicipal');
        $im.empty();
        $im.append($('<option></option>').attr('value', '').text(''));
        AlterarSelecaoChosen($im, '');
    }
    // Inicialização do campo de seleção do mês de competência 
    $('#DataCompetencia').datepicker({
        language: "pt-BR",
        autoclose: "true",
        showOnFocus: "false",
        endDate: '0d',
        icons: {
            previous: 'glyphicon glyphicon-chevron-left',
            next: 'glyphicon glyphicon-chevron-right'
        },
    });

    // Evento click do botão vinculado ao campo Mês de Competência
    $('#DataCompetencia').siblings('.input-group-btn').find('button').on("click", function (event) {
        event.preventDefault();
        $("#DataCompetencia").datepicker("show");
    });
    // Evento click do botão vinculado ao campo Mês de Competência
    $('#DataCompetencia').on('change', function (e) {
        e.preventDefault();
        var dtCompetencia = $(this).val();
        // Se a nova data de competência for igual a anterior, não faz nada
        if (window.DtCompetAnterior == dtCompetencia) {
            return;
        }
        // 
        if (dtCompetencia.length != 10 && dtCompetencia != '') {
            // 
            $('#InformarSerieNumeroDPS').prop('checked', false);
            $("#SerieDPS").val('');
            $("#NumeroDPS").val('');
            $('#pnlTrascricaoDPS').slideUp();
            ReiniciarPainel($('#pnlTomador'));
            ReiniciarPainel($('#pnlIntermediario'));
            BloquearFormulario();
            ExibirAlerta('A data de competência informada é inválida');
            window.DtCompetAnterior = dtCompetencia;
            return;
        }
        // Se algum dado do formulário já tiver sido informado
        if (($('#Prestador_EnderecoNacional_CodigoMunicipio').val() != null && $('#Prestador_EnderecoNacional_CodigoMunicipio').val() != '')
            || $('#Tomador_LocalDomicilio:checked').val() != '0'
            || $('#Intermediario_LocalDomicilio:checked').val() != '0') {
            // 
            $.confirm({
                icon: 'fa fa-warning',
                title: 'Confirmação',
                content: 'Ao alterar a data de competência, os demais dados já informados serão perdidos.<br/><br/>Deseja continuar?',
                animation: 'opacity',
                closeAnimation: 'opacity',
                animateFromElement: false,
                columnClass: 'medium',
                backgroundDismissAnimation: 'none',
                bgOpacity: 0.7,
                draggable: false,
                offsetTop: 150,
                buttons: {
                    sim: {
                        text: 'Sim',
                        btnClass: 'btn-blue',
                        action: function () {
                            ExibirLoading();
                            $('#InformarSerieNumeroDPS').prop('disabled', false);
                            ReiniciarPainel($('#pnlTomador'));
                            ReiniciarPainel($('#pnlIntermediario'));
                            LimparInfoEmitente();
                            if (dtCompetencia.length == 10 || dtCompetencia != '') {
                                setTimeout(function () {
                                    ListarMunicipiosParaEmissao();
                                }, 500);
                            } else {
                                BloquearFormulario();
                            }
                            setTimeout(function () {
                                window.DtCompetAnterior = dtCompetencia;
                                OcultarLoading();
                                window.UltConsCNC_Inscricao = '';
                            }, 500);
                            return;
                        }
                    },
                    nao: {
                        text: 'Não',
                        action: function () {
                            // 
                            $('#DataCompetencia').val(window.DtCompetAnterior);
                            return;
                        }
                    }
                }
            });
        } else {
            ExibirLoading();
            if (dtCompetencia != '') {
                setTimeout(function () {
                    $('#InformarSerieNumeroDPS').prop('disabled', false);
                    ListarMunicipiosParaEmissao();
                    window.DtCompetAnterior = dtCompetencia;
                }, 500);
            } else {
                BloquearFormulario();
            }
            setTimeout(function () {
                window.DtCompetAnterior = dtCompetencia;
                OcultarLoading();
            }, 500);
        }
    });
    // 
    $('#InformarSerieNumeroDPS').on('click', function () {
        // 
        if ($('#InformarSerieNumeroDPS').is(':checked')) {
            $('#pnlTrascricaoDPS').slideDown();
        } else {
            $("#SerieDPS").val('');
            $("#NumeroDPS").val('');
            $('#pnlTrascricaoDPS').slideUp();
        }
    });
    // Evento click do botão vinculado ao campo Mês de Competência
    $('#Prestador_EnderecoNacional_CodigoMunicipio').on('change', function (e) {
        e.preventDefault();
        var codMun = $(this).val();
        ExibirLoading();
        AtualizarEstabelecimentos(codMun);
        var nomeMunicipio = $("#Prestador_EnderecoNacional_CodigoMunicipio option:selected").text().trim();
        $('#Prestador_EnderecoNacional_NomeMunicipio').val(nomeMunicipio);
        OcultarLoading();
    });
    // 
    $('#Prestador_InscricaoMunicipal').on('change', function (e) {
        e.preventDefault();
        var im = $(this).val();
        ExibirLoading();
        AtualizarInfoEstabelecimento(im);
        OcultarLoading();
    });
    // Expande/Recolhe o painel com os dados do emitente
    $('#btnMaisInfoEmitente').on('click', function (e) {
        e.preventDefault();
        // 
        if ($('#pnlMaisInfo').is(":hidden")) {
            $('#pnlMaisInfo').slideDown();
        } else {
            $('#pnlMaisInfo').slideUp();
        }
    });

    // Método chamado quando usuário altera o valor do campo 'Tipo Emitente'
    $('form').on('change', 'input[type=radio][id=TipoEmitente]', function () {
        // TODO: Limita a seleção para apenas a primeira opção (prestador). Nos próximos releases essa restrição será removida.
        if (this.value == '2' || this.value == '3') {
            // 
            ExibirAlerta('A NFS-e poderá ser emitida por um Prestador, Tomador ou Intermediário. No entanto, as emissões de NFS-e por Tomador e Intermediário não estão disponíveis. A funcionalidade será disponibilizada em uma versão futura.');
            $('input[type=radio][id=TipoEmitente][value=1]').prop("checked", true);
            return;
        }
        // 
        switch (this.value) {
            case '1':
                if (!window.PrestadorAlterado) {
                    AtualizarPrestador();
                } else {
                    ConfirmarAlteracaoTipoEmitente('Prestador');
                }
                break;
            case '2':
                if (!window.TomadorAlterado) {
                    AtualizarTomador();
                } else {
                    ConfirmarAlteracaoTipoEmitente('Tomador');
                }
                break;
            case '3':
                if (!window.IntermediarioAlterado) {
                    AtualizarIntermediario();
                } else {
                    ConfirmarAlteracaoTipoEmitente('Intermediário');
                }
                break;
        }
    });
    // 
    $('#pnlPrestador').on('change', '.form-control:not(.cpfcnpj)', function () {
        window.PrestadorAlterado = true;
    });
    $('#pnlPrestador').on('keydown', '.form-control.cpfcnpj', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode != 9) {
            $('#btnAvancar').prop('disabled', true);
        }
    });
    // 
    $('#pnlTomador').on('change', '.form-control:not(.cpfcnpj)', function () {
        window.TomadorAlterado = true;
    });
    $('#pnlTomador').on('keydown', '.form-control.cpfcnpj', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode != 9) {
            $('#btnAvancar').prop('disabled', true);
        }
    });
    // 
    $('#pnlIntermediario').on('change', '.form-control:not(.cpfcnpj)', function () {
        window.IntermediarioAlterado = true;
    });
    $('#pnlIntermediario').on('keydown', '.form-control.cpfcnpj', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode != 9) {
            $('#btnAvancar').prop('disabled', true);
        }
    });
    // 
    $('form').on('click', '[id$="Inscricao_historico"]', function () {
        // 
        AbrirModalSelecaoPessoa($(this), 1);
    });
    // 
    $('form').on('click', '#btn_Prestador_NIF_historico, #btn_Tomador_NIF_historico, #btn_Intermediario_NIF_historico', function () {
        // 
        AbrirModalSelecaoPessoa($(this), 3);
    });
    // 
    $('form').on('change', 'input[type="radio"][id$="_LocalDomicilio"]', function () {
        // 
        var painel = $(this).closest('.pnlCollapse');
        // 
        ReiniciarPessoa(painel);
        painel.find('[id$="NumeroNIF"]').slideUp();
        painel.find('[id$="MotivoNaoInformacaoNIF"]').slideUp();
        // 
        switch (this.value) {
            case '0':
                painel.find('.retratil').slideUp();
                window.UltConsCNC_Inscricao = '';
                window.UltConsCNC_Painel = '';
                break;
            case '1':
                painel.find('#pnlInscricaoBrasil').show();
                painel.find('#pnlInscricaoExterior').hide();
                BloquearCampo(painel.find('[id$="_Nome"]'));
                //Bairro e Logradouro não devem ser mais bloqueado
                //BloquearCampo(painel.find('[id$="_Bairro"]'));
                //BloquearCampo(painel.find('[id$="_Logradouro"]'));
                painel.find('div[id$="EnderecoBrasil"]').show();
                painel.find('div[id$="EnderecoExterior"]').hide();
                painel.find('.retratil').slideDown();
                painel.find('div[id$="InformarEnderecoCheck"]').show();
                break;
            case '2':
                painel.find('#pnlInscricaoBrasil').hide();
                painel.find('#pnlInscricaoExterior').show();
                DesbloquearCampo(painel.find('[id$="_Nome"]'));
                DesbloquearCampo(painel.find('input[id$="EnderecoExterior_Bairro"]'));
                DesbloquearCampo(painel.find('input[id$="EnderecoExterior_Logradouro"]'));
                DesbloquearCampo(painel.find('input[id$="EnderecoExterior_Numero"]'));
                DesbloquearCampo(painel.find('input[id$="EnderecoExterior_Complemento"]'));
                painel.find('div[id$="EnderecoBrasil"]').hide();
                painel.find('div[id$="EnderecoExterior"]').show();
                painel.find('.retratil').slideDown();
                painel.find('input[type="checkbox"][id$="_InformarEndereco"]').prop("checked", true);
                painel.find('div[id$="InformarEnderecoCheck"]').hide();
                $(this).closest('.pnlCollapse').find('div[id$="Endereco"]').slideDown();
                break;
        }
    });
    // 
    $('form').on('click', 'input[type="checkbox"][id$="_InformarEndereco"]', function (e) {
        if ($(this).is(':checked')) {
            $(this).closest('.pnlCollapse').find('div[id$="Endereco"]').slideDown();
        }
        else {
            if ($("#pnlTomadorEnderecoBrasil").is(":visible"))
            {
                var painelTomador = $('#pnlTomador');
                var inscricaotomador = NormalizaValor(painelTomador.find('#Tomador_Inscricao').val());

                if (inscricaotomador.length == 14) {
                    e.preventDefault();
                    ExibirAlerta('Para tomador do tipo pessoa jurídica (CNPJ), o endereço é obrigatório.');
                    return false;
                }
                else {
                    var painel = $(this).closest('.pnlCollapse').find('div[id$="Endereco"]');
                    painel.slideUp();
                    LimparEndereco(painel);
                }
           }
            else {
                var painel = $(this).closest('.pnlCollapse').find('div[id$="Endereco"]');
                painel.slideUp();
                LimparEndereco(painel);
            }
        }
    });

    $('form').on('change', 'input[type="radio"][id$="_NIFInformado"]', function () {
        var painel = $(this).closest('.pnlCollapse');
        switch ($(this).val()) {
            case '0':
                painel.find('div[id$="NumeroNIF"]').slideUp();
                painel.find('[id$="_NIF"]').val('');
                painel.find('div[id$="MotivoNaoInformacaoNIF"]').slideDown();
                break;
            case '1':
                painel.find('div[id$="NumeroNIF"]').slideDown();
                painel.find('div[id$="MotivoNaoInformacaoNIF"]').slideUp();
                painel.find('[id$="_MotivoNaoInformacaoNIF"]').val('');
                break;
        }     
    });
    
    $('.cep').parent().find('.btn').on('click', function () {
        // 
        var cep = $(this).closest(".input-group").find("input[type=text]").val().replace(/\D/g, '');
        // 
        if (cep.length == 0) {
            ExibirAlerta('Informe um CEP para consulta');
            return;
        }
        // 
        if (cep.length != 8) {
            ExibirAlerta('O CEP informado está incorreto');
            return;
        }
        // 
        BuscarCEP(cep, $(this).closest(".enderecoBrasil"));
    });

    // Eventos para rastrear alterações nos campos
    $('#Prestador_EnderecoNacional_CEP, #Prestador_EnderecoNacional_Logradouro, #Prestador_EnderecoNacional_Numero, #Prestador_EnderecoNacional_Complemento, #Prestador_EnderecoNacional_Bairro').on('focus', function () {
        window.PrestadorCepAnterior = $(this).val();
        // Armazena o valor original do campo ao receber o foco
        const campo = $(this).attr('id');
        window.PrestadorEnderecoOriginal[campo.split('_').pop()] = $(this).val();
    });

    $('#Prestador_EnderecoNacional_CEP, #Prestador_EnderecoNacional_Logradouro, #Prestador_EnderecoNacional_Numero, #Prestador_EnderecoNacional_Complemento, #Prestador_EnderecoNacional_Bairro').on('change', function () {
        // Verifica alterações quando o valor do campo é alterado
        VerificarEnderecoPrestadorEditado();
    });

    $('#Prestador_EnderecoNacional_CEP').on('change', function () {
        var cep = $(this).val().replace(/\D/g, '');
        var codMun = $('#Prestador_EnderecoNacional_CodigoMunicipio').val();

        if (cep.length !== 8 || !codMun) {
            ExibirAlerta('O CEP informado não é válido.');
            $(this).val(window.PrestadorCepAnterior);
            return;
        }

        // Chame a função de validação
        ValidarCepMunicipio(cep, codMun, $(this).closest(".enderecoBrasil"));
    });
    //
    $('form .cpfcnpj, form .cpf').focusout(function () {
        if ($(this).is('[readonly]') || $(this).is(':disabled')) {
            return;
        }
        // 
        var painel = $(this).closest(".pnlCollapse");
        var inscricao = NormalizaValor($(this).val());
        var painelAtual = painel.data('tipopessoa');
        // 
        if (inscricao.length != 11 && inscricao.length != 14) {
            if (inscricao.length > 0) {
                ExibirAlerta('O CPF/CNPJ informado é inválido');
            }
            // 
            LimparPessoa(painel);
            // 
            $(this).closest('.form-group').find('input[type=hidden]').val('');
            window.UltConsCNC_Inscricao = '';
            window.UltConsCNC_Painel = '';
            // 
            $('#btnAvancar').prop('disabled', false);
            return;
        }
        var retorno = ValidarInscricoesDocumento(this);
        if (retorno == 1) {
            LimparPessoa(painel);
            return;
        }

        // 
        if (window.UltConsCNC_Inscricao == inscricao) {
            if (window.UltConsCNC_Painel == painelAtual) {
                return;
            } else {
                ExibirAlerta('Não é permitido informar o mesmo CPF/CNPJ mais de uma vez na mesma NFS-e');
                $(this).val('');
                $('#btnAvancar').prop('disabled', false);
                return;
            }
        }

        // 
        ExibirLoading();
        LimparPessoa(painel);
        $('#btnAvancar').prop('disabled', false);

        var data = $('#DataCompetencia').val().split("/").reverse().join('-');
        var dados;

        //Se dados do tomador que está sendo pesquisado for CNPJ tem que já
        //trazer todas as informações referentes ao endereço

        if ((painelAtual == 'Tomador' || painelAtual == 'Intermediario')  && inscricao.length == 14) {
            dados = RecuperarInfoPessoaJuridicaTomador(inscricao, data);
        }             
        else {
            dados = RecuperarInfoInscricao(inscricao, data);
        }

        if (dados == null) {
            OcultarLoading();
            ExibirAlerta('A inscrição informada não foi encontrada no cadastro de CPF/CNPJ');
            window.UltConsCNC_Inscricao = '';
            window.UltConsCNC_Painel = '';
            return;
        }
        // 
        if (inscricao.length == 11) {
            var localDomicilio = painel.find('input[id$="_LocalDomicilio"]:checked').val();
            if (localDomicilio == 1 && dados.codigopais != 0) {
                OcultarLoading();
                ExibirAlerta('Os CPF cadastrados na RFB com endereço no exterior não podem ser utilizados em endereço nacional.');
                return;
            }
            if (localDomicilio == 2 && dados.codigopais == 0) {
                OcultarLoading();
                ExibirAlerta('Os CPF cadastrados na RFB com endereço nacional não podem ser utilizados em endereço no exterior.');
                return;
            }
        }

        if ((painelAtual == 'Tomador' || painelAtual == 'Intermediario') && inscricao.length == 14) {
            if (painelAtual == 'Tomador') 
                $('#Tomador_InformarEndereco').prop('checked', true);
            else
                $('#Intermediario_InformarEndereco').prop('checked', true);
            $(this).closest('.pnlCollapse').find('div[id$="Endereco"]').slideDown();
        }

        $(this).closest('.form-group').find('input[type=hidden]').val(inscricao);
        window.UltConsCNC_Inscricao = inscricao;
        window.UltConsCNC_Painel = painel.data('tipopessoa');

        if (painel.find('input[id$="_LocalDomicilio"]:checked').val() == 1) {
            painel.find('input[id$="_Inscricao"]').val(dados.inscricao);
        }

        painel.find('input[id$="_Nome"]').val(dados.nomerazaosocial);
        painel.find('input[id$="_Nome"]').closest('.form-group').removeClass('erro');
        painel.find('input[id$="_Nome"]').closest('.form-group').find('.field-validation-error').hide();
        painel.find('input[id$="_InscricaoMunicipal"]').focus();

        //Se dados do tomador que está sendo pesquisado for CNPJ tem que já
        //trazer preenchido o endereço e não deixar o usuário desmarcar o check de endereço
        //se o usuário tentar desmarcar a opção de endereço nacional exibir a mensagem
        //Tomador CNPJ o endereço é obrigatório
        if ((painelAtual == 'Tomador' || painelAtual == 'Intermediario') && inscricao.length == 14) {

            var painelEnderecoNacional;
            if (painelAtual == 'Tomador') {
                $('Tomador.InformarEndereco').prop("checked", true);
                painelEnderecoNacional = $('#pnlTomadorEnderecoBrasil');
            }
            else {
                $('Intermediario.InformarEndereco').prop("checked", true);
                painelEnderecoNacional = $('#pnlIntermediarioEnderecoBrasil');
            }


            painelEnderecoNacional.find('input[id$="_CEP"]').val(dados.cep);

            //AlterarSelecaoChosen(painelEnderecoNacional.find('select[id$="_CodigoMunicipio"]'), dados.codigoibgemunicipio);
            //$(painelEnderecoNacional.find('select[id$="_CodigoMunicipio"]')).append('<option value=' + dados.codigoibgemunicipio + '>' + dados.nomemunicipio + '</option>');
            //AlterarSelecaoChosen(painelEnderecoNacional.find('select[id$="_CodigoMunicipio"]'), dados.codigoibgemunicipio);

            painelEnderecoNacional.find('input[id$="_CodigoMunicipio"]').val(dados.codigoibgemunicipio);
            painelEnderecoNacional.find('input[id$="_NomeMunicipio"]').val(dados.nomemunicipio.toUpperCase());

            painelEnderecoNacional.find('input[id$="_Bairro"]').val(dados.bairro);
            painelEnderecoNacional.find('input[id$="_Logradouro"]').val(dados.logradouro);
            painelEnderecoNacional.find('input[id$="_Numero"]').val(dados.numero);
            painelEnderecoNacional.find('input[id$="_Complemento"]').val(dados.complemento);

        }

        // 
        AplicarMascaras();
        // 
        OcultarLoading();
    });
    // 
    $('#modalHistoricoPessoas').on('click', '.table tr', function (e) {
        e.preventDefault();
        // Limpa a seleção atual
        $(this).siblings('tr').find('input[type="radio"]').each(function () {
            //$(this).prop("checked", false);
            $(this).closest('tr').removeClass('selecionada');
        });
        // Marca ou desmarca a opção clicada
        if ($(this).find('input[type="radio"]').is(':checked')) {
            $(this).find('input[type="radio"]').prop('checked', false);
            $(this).removeClass('selecionada');
            $('#modalHistoricoPessoas #btnImportar').prop('disabled', true);
        }
        else {
            $(this).find('input[type="radio"]').prop('checked', true);
            $(this).addClass('selecionada');
            $('#modalHistoricoPessoas #btnImportar').prop('disabled', false);
        }
    });
    // Evento click dos checkboxes existentes na lista de serviços favoritos do modal específico
    $('#modalHistoricoPessoas').on('click', '.table input[type="radio"]', function (e) {
        e.preventDefault();
        // Limpa a seleção atual
        $(this).closest('tr').siblings('tr').find('input[type="radio"]').each(function () {
            //$(this).prop("checked", false);
            $(this).closest('tr').removeClass('selecionada');
        });
        // Marca ou desmarca a opção clicada
        if ($(this).is(':checked')) {
            $(this).closest('tr').addClass('selecionada');
            $('#modalHistoricoPessoas #btnImportar').prop('disabled', false);
        }
        else {
            $(this).closest('tr').removeClass('selecionada');
            $('#modalHistoricoPessoas #btnImportar').prop('disabled', true);
        }
    });
    // 
    $('#modalHistoricoPessoas').on('click', '#btnImportar', function (event) {
        event.preventDefault();
        // 
        var selecao = $('#modalHistoricoPessoas table').find('input[type="radio"]:checked').closest('tr');
        var historicoPessoa = JSON.parse($(selecao).find('input[type=hidden]').val());
        var tipoPessoa = $(selecao).closest('.modal-body').find('#hdfTipoPessoa').val();
        var tipoHistorico = $(selecao).closest('.modal-body').find('#hdfTipoHistorico').val();
        // 
        LimparPessoa($('#pnl' + tipoPessoa));
        // 
        $('#' + tipoPessoa + '_Nome').val(historicoPessoa.NomeRazaoSocial);
        $('#' + tipoPessoa + '_Telefone').val(historicoPessoa.Telefone);
        $('#' + tipoPessoa + '_Email').val(historicoPessoa.Email);
        switch (tipoHistorico) {
            case '1':
                $('#' + tipoPessoa + '_Inscricao').val(historicoPessoa.InscricaoPessoa);
                $('#' + tipoPessoa + '_InscricaoMunicipal').val(historicoPessoa.InscricaoMunicipal);
                var retorno = ValidarInscricoesDocumento($('#' + tipoPessoa + '_Inscricao'));
                if (retorno == 1) {
                    LimparPessoa($('#pnl' + tipoPessoa));
                    return;
                }
                break;
            case '2':
                $('#' + tipoPessoa + '_CPF').val(historicoPessoa.InscricaoPessoa);
                break;
            case '3':
                $('#' + tipoPessoa + '_NIF').val(historicoPessoa.InscricaoPessoa);
                break;
        }

        if (historicoPessoa.CEP != null) {
            $('#' + tipoPessoa + '_EnderecoNacional_CEP').val(historicoPessoa.CEP);
            $('#' + tipoPessoa + '_EnderecoNacional_CodigoMunicipio').val(historicoPessoa.CodigoMunicipio);
            $('#' + tipoPessoa + '_EnderecoNacional_NomeMunicipio').val(historicoPessoa.NomeMunicipio ?? '');
            $('#' + tipoPessoa + '_EnderecoNacional_Bairro').val(historicoPessoa.Bairro);
            $('#' + tipoPessoa + '_EnderecoNacional_Logradouro').val(historicoPessoa.Logradouro);
            $('#' + tipoPessoa + '_EnderecoNacional_Numero').val(historicoPessoa.Numero);
            $('#' + tipoPessoa + '_EnderecoNacional_Complemento').val(historicoPessoa.Complemento);
            $('#' + tipoPessoa + '_InformarEndereco').prop("checked", true);
            $('#pnl' + tipoPessoa + 'EnderecoBrasil').show();
            $('#pnl' + tipoPessoa + 'EnderecoExterior').hide();
            $('#pnl' + tipoPessoa + 'Endereco').slideDown();
        } else if (historicoPessoa.CodigoPais != null) {
            AlterarSelecaoChosen($('#' + tipoPessoa + '_EnderecoExterior_CodigoPais'), historicoPessoa.CodigoPais);
            $('#' + tipoPessoa + '_EnderecoExterior_Descricao').val(historicoPessoa.EnderecoExterior);
            $('#' + tipoPessoa + '_InformarEndereco').prop("checked", true);
            $('#pnl' + tipoPessoa + 'EnderecoBrasil').hide();
            $('#pnl' + tipoPessoa + 'EnderecoExterior').show();
            $('#pnl' + tipoPessoa + 'Endereco').slideDown();
        } else {
            $('#' + tipoPessoa + '_InformarEndereco').prop("checked", false);
            $('#pnl' + tipoPessoa + 'EnderecoBrasil').show();
            $('#pnl' + tipoPessoa + 'EnderecoExterior').hide();
            $('#pnl' + tipoPessoa + 'Endereco').slideUp();
        }
        // 
        AplicarMascaras();
        // 
        if (tipoPessoa == 'Prestador') {
            window.PrestadorAlterado = true
        }
        else if (tipoPessoa == 'Tomador') {
            window.TomadorAlterado = true;
            window.UltConsCNC_Painel = 'Tomador';
        }
        else {
            window.IntermediarioAlterado = true;
            window.UltConsCNC_Painel = 'Intermediario';
        }
        // 
        window.UltConsCNC_Inscricao = NormalizaValor(historicoPessoa.InscricaoPessoa);
        $('#modalHistoricoPessoas').modal('hide');
    });
    // 
    $('#Tomador_EnderecoExterior_CodigoPais').on('change', function (e) {
        e.preventDefault();
        var nomePais = $("#Tomador_EnderecoExterior_CodigoPais option:selected").text().trim();
        $('#Tomador_EnderecoExterior_NomePais').val(nomePais);
    });
    // 
    $('#Intermediario_EnderecoExterior_CodigoPais').on('change', function (e) {
        e.preventDefault();
        var nomePais = $("#Intermediario_EnderecoExterior_CodigoPais option:selected").text().trim();
        $('#Intermediario_EnderecoExterior_NomePais').val(nomePais);
    });
    // 
    $(window).keydown(function (event) {
        if ((event.which == 13) && ($(event.target)[0] != $("input")[0])) {
            event.preventDefault();
            return false;
        }
    });
});
// 
function RecuperarOpcaoSN() {
    $.ajax({
        url: window.UrlBase + 'api/emissaodps/recuperaropcaosn',
        method: 'GET',
        async: false,
        cache: false,
        timeout: 30000,
        data: {
            tpInsc: tipoInscricao,
            insc: inscricao,
            dtCompet: $('#DataCompetencia').val()
        },
        success: function (dados) {
            $('#SimplesNacional_Opcao').val(dados.Tipo);
            $('#txtOpcaoSN').val(dados.Descricao);
            //Se for optante pelo Simples Nacional
            if (dados.Tipo == 3) {
                $('#pnlRegimeApuracaoTributosSN').show();
             //Desabilitar assinatura digital 30/09/2025
            //    if (!ehAcessoComCertificadoDigital) {
            //        $('#btnAvancar').prop('disabled', true);
            //        ExibirAlerta('A emissão de nota fiscal só é permitida ao acessar o sistema utilizando certificado digital, com exceção de contribuintes MEI e Pessoa Física.');
            //    }
            } else {

                $('#pnlRegimeApuracaoTributosSN').hide();
                $('#SimplesNacional_RegimeApuracaoTributosSN').val('').trigger('chosen:updated');

                //Desabilitar assinatura digital 30/09/2025
                //Se for nao optante pelo Simples Nacional
            //    if (dados.Tipo == 1) {
            //        if (!ehAcessoComCertificadoDigital) {
            //            $('#btnAvancar').prop('disabled', true);
            //            ExibirAlerta('A emissão de nota fiscal só é permitida ao acessar o sistema utilizando certificado digital, com exceção de contribuintes MEI e Pessoa Física.');
            //        }
            //    } 
            }
        },
        error: function (x, y, z) {
            // 
            //ExibirAlerta('Ooooooops... ' + ' | ' + x + ' | ' + y + ' | ' + z);
            ExibirAlerta('Não foi possível recuperar informações do contribuinte');
        }
    });
}
// 
function ReiniciarCampoChosen(selector) {
    selector.empty();
    selector.append($('<option></option>').attr('value', '').text(''));
    AlterarSelecaoChosen(selector, '');
    BloquearCampo(selector);
}
// Busca na base de dados uma lista com todos os municípios onde o contribuinte pode emitir uma NFS-e na data de competência informada.
function ListarMunicipiosParaEmissao() {
    // 
    $.ajax({
        url: window.UrlBase + 'api/emissaodps/ListarMunicipiosParaEmissao',
        method: 'GET',
        async: false,
        cache: false,
        timeout: 30000,
        data: {
            tpInsc: tipoInscricao,
            insc: inscricao,
            dtCompet: $('#DataCompetencia').val()
        },
        success: function (itens) {
            // 
            var $el = $('#Prestador_EnderecoNacional_CodigoMunicipio');
            $el.empty();
            $el.append($('<option></option>').attr('value', '').text(''));
            $('#Prestador_EnderecoNacional_NomeMunicipio').val('');
            var $im = $('#Prestador_InscricaoMunicipal');
            $im.empty();
            $im.append($('<option></option>').attr('value', '').text(''));
            $('#SimplesNacional_Opcao').val('0');
            $('#txtOpcaoSN').val('');
            // 
            if (itens.length == 0) {
                BloquearCampo($el);
                BloquearCampo($im);
                ExibirAlerta('Na data de competência informada, o cadastro referente à inscrição "' + inscricao + '" não foi encontrado ou não está habilitado para emissão de NFS-e, dentre os municípios conveniados ao Sistema Nacional da NFS-e. <br/>Por favor, informe outra data de competência.');
                $('#btnMaisInfoEmitente').attr('disabled', true);
                $('#pnlMaisInfo').slideUp();
            } else if (itens.length == 1) {
                // 
                $el.append($("<option></option>").attr('value', itens[0].Codigo).text(itens[0].Nome));
                AlterarSelecaoChosen($el, itens[0].Codigo);
                var nomeMunicipio = $("#Prestador_EnderecoNacional_CodigoMunicipio option:selected").text().trim();
                $('#Prestador_EnderecoNacional_NomeMunicipio').val(nomeMunicipio);
                BloquearCampo($el);
                AtualizarEstabelecimentos(itens[0].Codigo);
                LiberarFormulario();
                // Busca a opção do SN do CNPJ na data de competência informada
                if (tipoInscricao == 'CNPJ') {
                    RecuperarOpcaoSN();
                }
            } else {
                // 
                $el.append($('<option></option>').attr('value', '').text('Selecione...'));
                $.each(itens, function (key, value) {
                    $el.append($('<option></option>').attr('value', value.Codigo).text(value.Nome));
                });
                // 
                AlterarSelecaoChosen($el, '');
                DesbloquearCampo($el);
                $('#btnMaisInfoEmitente').attr('disabled', true);
                $('#pnlMaisInfo').slideUp();
                LiberarFormulario();
                // 
                AlterarSelecaoChosen($im, '');
                BloquearCampo($im);
                // Busca a opção do SN do CNPJ na data de competência informada
                if (tipoInscricao == 'CNPJ') {
                    RecuperarOpcaoSN();
                }
            }
        },
        error: function (x, y, z) {
            // 
            ExibirAlerta('Não foi possível recuperar a lista de municípios.');
        }
    });
}
// 
function AtualizarEstabelecimentos(codMun) {
    // 
    if (codMun != '') {
        // 
        ListarEstabelecimentosParaEmissao(codMun);
    } else {
        var $el = $('#Prestador_InscricaoMunicipal');
        $el.empty();
        $el.append($('<option></option>').attr('value', '').text(''));
        BloquearCampo($el);
        LimparInfoEmitente();
        $('#btnMaisInfoEmitente').attr('disabled', true);
    }
}
// Busca na base de dados uma lista com todos os estabelecimentos do contribuinte no município selecionado na data de competência informada.
function ListarEstabelecimentosParaEmissao(codMun) {
    $.ajax({
        url: window.UrlBase + 'api/emissaodps/ListarEstabelecimentosParaEmissao',
        method: 'GET',
        data: {
            tpInsc: tipoInscricao,
            insc: inscricao,
            codMun: codMun,
            dtCompet: $('#DataCompetencia').val()
        },
        success: function (dados) {
            // 
            var itens = dados.Lista;
            var $el = $('#Prestador_InscricaoMunicipal');
            $el.empty();
            LimparInfoEmitente();
            // 
            if (dados.TpDados == 'RFB') {
                RecuperarInfoEstabelecimento();
                $('#lblIMPrestador').find('.asterisco').hide();
                $('#btnMaisInfoEmitente').attr('disabled', false);
                var $el = $('#Prestador_InscricaoMunicipal');
                $el.empty();
                $el.append($('<option></option>').attr('value', '').text(''));
                BloquearCampo($el);
            } else {
                $('#lblIMPrestador').find('.asterisco').show();
                // 
                if (itens.length == 0) {
                    var $el = $('#Prestador_InscricaoMunicipal');
                    $el.empty();
                    $el.append($('<option></option>').attr('value', '').text(''));
                    $('#lblIMPrestador').find('.asterisco').hide();
                    BloquearCampo($el);
                    RecuperarInfoEstabelecimento();
                } else {
                    if (itens.length == 1) {
                        //
                        $el.append($("<option></option>").attr('value', itens[0].Codigo).text(itens[0].Nome));
                        AlterarSelecaoChosen($el, itens[0].Codigo);
                        BloquearCampo($el);
                        RecuperarInfoEstabelecimento();
                        $('#btnMaisInfoEmitente').attr('disabled', false);
                    } else {
                        // 
                        $el.append($('<option></option>').attr('value', '').text('Selecione...'));
                        $.each(itens, function (key, value) {
                            $el.append($('<option></option>').attr('value', value.Codigo).text(value.Nome));
                        });
                        // 
                        AlterarSelecaoChosen($el, '');
                        DesbloquearCampo($el);
                        $('#btnMaisInfoEmitente').attr('disabled', true);
                        $('#pnlMaisInfo').slideUp();
                    }
                }
            }
        },
        error: function (x, y, z) {
            // 
            //ExibirAlerta('Ooooooops... ' + ' | ' + x + ' | ' + y + ' | ' + z);
            ExibirAlerta('Não foi possível recuperar informações do contribuinte');
        }
    });
}
//
function AtualizarInfoEstabelecimento(im) {
    //console.log('Atualizando info do estabelecimento.');
    if (im != '') {
        RecuperarInfoEstabelecimento();
    } else {
        $('#pnlMaisInfo').slideUp();
        LimparInfoEmitente();
        $('#btnMaisInfoEmitente').attr('disabled', true);
    }
}
// Busca informações detalhadas do estabelecimento/contribuinte selecionado
function RecuperarInfoEstabelecimento() {
    var dtCompet = $('#DataCompetencia').val();
    var codMun = $('#Prestador_EnderecoNacional_CodigoMunicipio').val();
    var im = $('#Prestador_InscricaoMunicipal').val();

    //console.log('Recuperando info do estabelecimento. IM: ' + im);

    $.ajax({
        url: window.UrlBase + 'api/emissaodps/RecuperarInfoEstabelecimento',
        method: 'GET',
        //beforeSend: function () {
        //    ExibirLoading();
        //},
        //complete: function () {
        //    OcultarLoading();
        //},
        data: {
            tpInsc: tipoInscricao,
            insc: inscricao,
            codMun: codMun,
            inscMun: im,
            dtCompet: dtCompet
        },
        success: function (cadastro) {
            //console.log('Info do estabelecimento recuperada com sucesso.');
            //console.log(cadastro);
            CarregarInfoEmitente(cadastro);
            $('#btnMaisInfoEmitente').attr('disabled', false);
            //$('#pnlMaisInfo').slideDown();
        },
        error: function (x, y, z) {
            // 
            //ExibirAlerta('Ooooooops... ' + ' | ' + x + ' | ' + y + ' | ' + z);
            ExibirAlerta('Não foi possível recuperar informações do contribuinte');
        }
    });
}
// 
function AtualizarPrestador() {
    // 
    $('#pnlPrestador').hide();
    ReiniciarPessoa($('#pnlPrestador'));
    $('#Prestador_LocalDomicilio[value=1]').prop("checked", true);
    CarregarInfoEmitente('Prestador');
    if (window.TipoEmitenteAnterior == '2') {
        ReiniciarPessoa($('#pnlTomador'));
        $('#Tomador_LocalDomicilio[value=0]').prop("checked", true);
    }
    else if (window.TipoEmitenteAnterior == '3') {
        ReiniciarPessoa($('#pnlIntermediario'));
        $('#Intermediario_LocalDomicilio[value=0]').prop("checked", true);
    }
    $('#pnlTomador').show();
    $('#pnlIntermediario').show();
    window.TipoEmitenteAnterior = '1';
    window.PrestadorAlterado = false;
}
// 
function AtualizarTomador() {
    // 
    $('#pnlTomador').hide();
    ReiniciarPessoa($('#pnlTomador'));
    $('#Tomador_LocalDomicilio[value=0]').prop("checked", true);
    CarregarInfoEmitente('Tomador');
    if (window.TipoEmitenteAnterior == '1') {
        ReiniciarPessoa($('#pnlPrestador'));
        $('#Prestador_LocalDomicilio[value=1]').prop("checked", true);
    }
    else if (window.TipoEmitenteAnterior == '3') {
        ReiniciarPessoa($('#pnlIntermediario'));
        $('#Intermediario_LocalDomicilio[value=0]').prop("checked", true);
    }
    $('#pnlPrestador').show();
    $('#pnlIntermediario').show();
    window.TipoEmitenteAnterior = '2';
    window.TomadorAlterado = false;
}
// 
function AtualizarIntermediario() {
    // 
    $('#pnlIntermediario').hide();
    ReiniciarPessoa($('#pnlIntermediario'));
    $('#Intermediario_LocalDomicilio[value=0]').prop("checked", true);
    CarregarInfoEmitente('Intermediario');
    if (window.TipoEmitenteAnterior == '1') {
        ReiniciarPessoa($('#pnlPrestador'));
        $('#Prestador_LocalDomicilio[value=1]').prop("checked", true);
    }
    else if (window.TipoEmitenteAnterior == '2') {
        ReiniciarPessoa($('#pnlTomador'));
        $('#Tomador_LocalDomicilio[value=0]').prop("checked", true);
    }
    $('#pnlPrestador').show();
    $('#pnlTomador').show();
    window.TipoEmitenteAnterior = '3';
    window.IntermediarioAlterado = false;
}
// 
function ConfirmarAlteracaoTipoEmitente(novoTipo) {
    $.confirm({
        icon: 'fa fa-warning',
        title: 'Confirmação',
        content: 'Os dados já informados para o ' + novoTipo + ' do Serviço serão perdidos. Deseja continuar?',
        animation: 'opacity',
        closeAnimation: 'opacity',
        animateFromElement: false,
        columnClass: 'medium',
        backgroundDismissAnimation: 'none',
        bgOpacity: 0.7,
        draggable: false,
        offsetTop: 150,
        buttons: {
            sim: {
                text: 'Sim',
                btnClass: 'btn-blue',
                action: function () {
                    switch (novoTipo) {
                        case 'Prestador':
                            AtualizarPrestador();
                            break;
                        case 'Tomador':
                            AtualizarTomador();
                            break;
                        case 'Intermediário':
                            AtualizarIntermediario();
                            break;
                    }
                }
            },
            nao: {
                text: 'Não',
                action: function () {
                    $('input[type=radio][id=TipoEmitente][value="' + window.TipoEmitenteAnterior + '"]').prop("checked", true);
                }
            }
        }
    });
}
// 
function ReiniciarPainel(painel) {
    // 
    ReiniciarPessoa(painel);
    LimparEndereco(painel);
    painel.find('input[type="radio"][id$="_LocalDomicilio"][value="0"]').prop('checked', true);
    painel.find('.retratil').slideUp();
}
// 
function LiberarFormulario() {
    // 
    $("input[type=radio][id='TipoEmitente']").prop('disabled', false);
    $("input[type=radio][id='Tomador_LocalDomicilio']").prop('disabled', false);
    $("input[type=radio][id='Intermediario_LocalDomicilio']").prop('disabled', false);
}
// 
function BloquearFormulario() {
    // 
    $('#InformarSerieNumeroDPS').prop('disabled', true);
    // 
    $("input[type=radio][id='TipoEmitente']").prop('disabled', true);
    $("input[type=radio][id='Tomador_LocalDomicilio']").prop('disabled', true);
    $("input[type=radio][id='Intermediario_LocalDomicilio']").prop('disabled', true);
    // 
    var $codMun = $('#Prestador_EnderecoNacional_CodigoMunicipio');
    $codMun.empty();
    $('#Prestador_EnderecoNacional_NomeMunicipio').val('');
    $codMun.append($('<option></option>').attr('value', '').text('Selecione...'));
    AlterarSelecaoChosen($codMun, '');
    BloquearCampo($codMun);
    // 
    var $im = $('#Prestador_InscricaoMunicipal');
    $im.empty();
    $im.append($('<option></option>').attr('value', '').text('Selecione...'));
    AlterarSelecaoChosen($im, '');
    BloquearCampo($im);
    //
    $('#lblIMPrestador').find('.asterisco').hide();
    $('#btnMaisInfoEmitente').attr('disabled', true);
    $('#pnlMaisInfo').slideUp();
    // 
    $('#SimplesNacional_Opcao').val('0');
    $('#txtOpcaoSN').val('');
    $('#pnlLimiteSimplesNacional').slideUp();
}
// 
function CarregarInfoEmitente(cadastro) {
    $('#Prestador_Inscricao').val(cadastro.InfCad.Inscricao);
    AplicarMascara('.cpfcnpj', ['999.999.999-99', '99.999.999/9999-99']);
    $('#Prestador_Nome').val(cadastro.InfCad.RazaoSocial);
    $('#Prestador_Telefone').val(cadastro.InfCad.Telefone);
    $('#Prestador_Email').val(cadastro.InfCad.Email);
    $('#Prestador_EnderecoNacional_CEP').val(cadastro.InfCad.InfoEndereco.CEP);
    $('#Prestador_EnderecoNacional_Bairro').val(cadastro.InfCad.InfoEndereco.Bairro);
    $('#Prestador_EnderecoNacional_Logradouro').val(cadastro.InfCad.InfoEndereco.Logradouro);
    $('#Prestador_EnderecoNacional_Numero').val(cadastro.InfCad.InfoEndereco.Numero);
    $('#Prestador_EnderecoNacional_Complemento').val(cadastro.InfCad.InfoEndereco.Complemento);
    $(this).text('Ocultar detalhes do emitente');
}
// 
function LimparInfoEmitente() {
    $('#Prestador_Inscricao').val('');
    $('#Prestador_Nome').val('');
    $('#Prestador_Telefone').val('');
    $('#Prestador_Email').val('');
    $('#Prestador_EnderecoNacional_CEP').val('');
    $('#Prestador_EnderecoNacional_Bairro').val('');
    $('#Prestador_EnderecoNacional_Logradouro').val('');
    $('#Prestador_EnderecoNacional_Numero').val('');
    $('#Prestador_EnderecoNacional_Complemento').val('');
    $(this).text('Exibir detalhes do emitente');
}
// 
function AbrirModalSelecaoPessoa(selector, tipoHistorico) {
    // 
    var tipoPessoa = selector.closest('.pnlCollapse').data('tipopessoa');
    // 
    $.ajax({
        url: window.UrlBase + '/DPS/Pessoas/ModalHistoricoPessoas/',
        method: 'POST',
        data: {
            tpPessoa: tipoPessoa,
            tpHistorico: tipoHistorico
        },
        beforeSend: function () {
            ExibirLoading();
        },
        complete: function () {
            OcultarLoading();
        },
        success: function (view) {
            // 
            $("#modalHistoricoPessoas").html(view);
            // 
            $('#modalHistoricoPessoas').modal({
                backdrop: 'static',
                keyboard: false
            });
            // 
            FuncoesBasicas();
        },
        error: function (x, y, z) {
            //console.log(x.responseText);
            ExibirAlerta('Não foi possível recuperar seu histórico de pessoas');
        }
    });
}

function ValidarInscricoesDocumento(e) {

    var inscricaoPrestador = NormalizaValor($('#Prestador_Inscricao').val());
    var inscricaoTomador = NormalizaValor($('#Tomador_Inscricao').val());
    var inscricaoIntermediario = $('#Intermediario_Inscricao').val().replace('-', '').replace('.', '').replace('.', '').replace('/', '');


    if (inscricaoPrestador != '') {

        if (inscricaoTomador != '') {
            if (inscricaoPrestador == inscricaoTomador) {
                ExibirAlerta('Não é permitido informar o mesmo CPF/CNPJ mais de uma vez na mesma NFS-e');
                e.value = '';
                window.UltConsCNC_Inscricao = '';
                window.UltConsCNC_Painel = '';
                return 1; // Indicador limpar panel
            }

            if (inscricaoIntermediario != '') {
                if (inscricaoPrestador == inscricaoIntermediario) {
                    ExibirAlerta('Não é permitido informar o mesmo CPF/CNPJ mais de uma vez na mesma NFS-e');
                    e.value = '';
                    window.UltConsCNC_Inscricao = '';
                    window.UltConsCNC_Painel = '';
                    return 1; // Indicador limpar panel
                }
            }
        }
        if (inscricaoTomador != '') {

            if (inscricaoIntermediario != '') {
                if (inscricaoTomador == inscricaoIntermediario) {
                    ExibirAlerta('Não é permitido informar o mesmo CPF/CNPJ mais de uma vez na mesma NFS-e');
                    e.value = '';
                    window.UltConsCNC_Inscricao = '';
                    window.UltConsCNC_Painel = '';
                    return 1; // Indicador limpar panel
                }
            }
        }
        return 0; //Indicador que não precisa limpar panel

    }
}

function ValidarCepMunicipio(cep, codMunicipio, painel) {
    $.ajax({
        url: window.UrlBase + 'api/EmissaoDPS/Cep/' + cep,
        headers: { 'Authorization': sessionStorage.getItem("accessToken") },
        type: 'GET',
        dataType: 'json',
        beforeSend: function () {
            ExibirLoading();
        },
        complete: function () {
            OcultarLoading();
        },
        success: function (data) {
            var codMun = data.CodigoCompletoMunicipio;
            if (codMun != codMunicipio) {
                ExibirAlerta('O CEP informado não pertence ao município selecionado.');
                $('#Prestador_EnderecoNacional_CEP').val(window.PrestadorCepAnterior);
                $('#Prestador_EnderecoNacional_CEP').focus();
                return;
            }
            painel.find('input[id$="_Bairro"]').val(data.Bairro);
            painel.find('input[id$="_Logradouro"]').val(data.TipoLogradouro + " " + data.Logradouro);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $('#Prestador_EnderecoNacional_CEP').val(window.PrestadorCepAnterior);
            $('#Prestador_EnderecoNacional_CEP').focus();
            if (jqXHR.status == 429) {
                ExibirAlerta('Você estourou o limite de consultas ao CEP. Tente novamente mais tarde.');
            } else if (jqXHR.status == 404) {
                ExibirAlerta('CEP não encontrado.');
            } else {
                ExibirAlerta('Não foi possível obter os dados do CEP consultado');
            }
        }
    });
}

// Função para verificar alterações nos campos de endereço do prestador
function VerificarEnderecoPrestadorEditado() {
    var cepAtual = $('#Prestador_EnderecoNacional_CEP').val();
    var logradouroAtual = $('#Prestador_EnderecoNacional_Logradouro').val();
    var numeroAtual = $('#Prestador_EnderecoNacional_Numero').val();
    var complementoAtual = $('#Prestador_EnderecoNacional_Complemento').val();
    var bairroAtual = $('#Prestador_EnderecoNacional_Bairro').val();

    var cepAlterado = window.PrestadorEnderecoOriginal.CEP !== cepAtual;
    var logradouroAlterado = window.PrestadorEnderecoOriginal.Logradouro !== logradouroAtual;
    var numeroAlterado = window.PrestadorEnderecoOriginal.Numero !== numeroAtual;
    var complementoAlterado = window.PrestadorEnderecoOriginal.Complemento !== complementoAtual;
    var bairroAlterado = window.PrestadorEnderecoOriginal.Bairro !== bairroAtual;

    // Atualiza o indicador na tela
    if (cepAlterado || logradouroAlterado || numeroAlterado || complementoAlterado || bairroAlterado) {
        $('#Prestador_EnderecoNacional_IndicadorEnderecoAlterado').val(true);
    } else {
        $('#Prestador_EnderecoNacional_IndicadorEnderecoAlterado').val(false);
    }
}

// Função para inicializar os valores originais dos campos
function InicializarValoresOriginais() {
    window.PrestadorEnderecoOriginal.CEP = $('#Prestador_EnderecoNacional_CEP').val();
    window.PrestadorEnderecoOriginal.Logradouro = $('#Prestador_EnderecoNacional_Logradouro').val();
    window.PrestadorEnderecoOriginal.Numero = $('#Prestador_EnderecoNacional_Numero').val();
    window.PrestadorEnderecoOriginal.Complemento = $('#Prestador_EnderecoNacional_Complemento').val();
    window.PrestadorEnderecoOriginal.Bairro = $('#Prestador_EnderecoNacional_Bairro').val();
}


