$(document).ready(function() {
    // 
    $('.table').on('click', 'tbody > tr > .td-opcoes .btnSubstituir', function() {

        var linha = $(this).closest('tr'); // Obtém a linha selecionada
        var situacao = linha.find('.td-situacao img').data('original-title'); // Obtém o valor do atributo data-original-title

        // Verifica se a situação é "NFS-e sob análise fiscal"
        if (situacao === "NFS-e com cancelamento sob análise fiscal") {
            ExibirAlerta("Não é possível substituir a NFS-e pois existe um Evento de Solicitação de Análise Fiscal para Cancelamento de NFS-e pendente de análise pelo fisco.");
            return; // Impede a execução da substituição
        }

        ExibirLoading();
        // Chama a API que monta a janela modal
        $.ajax({
            url: window.UrlBase + 'Notas/Emitidas/VerificarSubstituicao/',
            method: 'POST',
            async: false,
            data: {
                chave: $(this).closest('tr').data('chave'),
                bypass: $(this).data('bypass')
            },
            success: function(data) {
                if (data.Sucesso) {
                    // 
                    window.location = window.UrlBase + data.Url;
                } else {
                    OcultarLoading();
                    ExibirAlerta(data.Mensagem);
                }
            }
        });
    });
    // Evento do botão cancelar existente em cada linha da tabela de notas emitidas
    $('.table').on('click', 'tbody > tr > .td-opcoes .btnCancelar', function() {
        // Limpa o conteúdo atual da janela modal de cancelamento
        $("#modalCancelamento .modal-body").html('');
        // Identifica a chave de acesso
        var chaveAcesso = $(this).closest('tr').data('chave');
        // Chama a API que monta a janela modal
        $.ajax({
            url: window.UrlBase + 'Notas/Emitidas/ModalCancelamento/',
            method: 'POST',
            data: {
                chave: chaveAcesso
            },
            success: function(data) {
                if (data.Sucesso == true) {
                    if (data.TipoEvento == 101103) {
                        // Caso não seja um cenário de cancelamento normal (caiu em alguma regra do cancelamento)                        
                        $.confirm({
                            icon: 'fa fa-warning',
                            title: 'Confirmação',
                            content: data.Mensagem + ' Neste caso, a NFS-e poderá ser cancelada apenas mediante análise fiscal do município.<br/><br/>Deseja solicitar uma análise fiscal?',
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
                                    action: function() {
                                        // Atualiza o HTML da janela modal
                                        $("#modalCancelamento").html(data.Html);
                                        // 
                                        $('#modalCancelamento').modal({
                                            backdrop: 'static',
                                            keyboard: false
                                        });
                                    }
                                },
                                nao: {
                                    text: 'Não',
                                    action: function() {
                                        return;
                                    }
                                }
                            }
                        });
                    } else {
                        // Atualiza o HTML da janela modal
                        $("#modalCancelamento").html(data.Html);
                        // Caso seja um cancelamento normal
                        $('#modalCancelamento').modal({
                            backdrop: 'static',
                            keyboard: false
                        });
                    }
                } else {
                    // 
                    ExibirAlerta(data.Mensagem);
                }
            }
        });
    });
    // 
    $("#modalCancelamento").on("click", "#btnSubmit", function(e) {
        e.preventDefault();
        // 
        $("#modalCancelamento form").submit();
    });
    // 
    $("#modalCancelamento").on("submit", ".modal-body form", function(e) {
        e.preventDefault();
        // Chama o método post para persistir o cancelamento
        var form = $(this);
        $.ajax({
            url: form.attr("action"),
            method: form.attr("method"),
            data: form.serialize(),
            beforeSend: function() {
                ExibirLoading();
            },
            success: function(data) {
                if (data.AssinarPedRegEvento) {
                    InicializarAssinatura(data);
                } else { // Se o pedido não foi processado
                    if (!data.Processado) {
                        // Exibe as informações da janela modal atualizadas
                        $("#modalCancelamento").html(data.HTML);
                        FuncoesBasicas();
                    } else {
                        // Se o pedido foi processado
                        if (data.Processado) {
                            // Se houve sucesso
                            if (data.Sucesso) {
                                // Atualiza a linha da tabela de NFS-e emitidas mudando o ícone da situação e removendo opções do menu suspenso
                                var linha = $('.table > tbody > tr[data-chave="' + data.Chave + '"]');
                                linha.find('.td-opcoes .btnSubstituir').remove();
                                linha.find('.td-opcoes .btnCancelar').remove();
                                var mensagem = '';
                                switch (data.TipoEvento) {
                                    case 101101:
                                        linha.find('.td-situacao').html('<img data-toggle="tooltip" src="' + window.UrlBase + '/img/tb-cancelada.svg" title="" data-original-title="NFS-e Cancelada">');
                                        mensagem = 'A NFS-e foi cancelada com sucesso';
                                        break;
                                    case 101103:
                                        linha.find('.td-situacao').html('<img data-toggle="tooltip" src="' + window.UrlBase + '/img/tb-pendente.svg" title="" data-original-title="NFS-e sob análise fiscal">');
                                        mensagem = 'O pedido de análise fiscal para cancelamento foi registrado com sucesso.';
                                        break;
                                }
                                // Fecha a janela de cancelamento
                                $('#modalCancelamento').modal('hide');
                                // Exibe mensagem de sucesso ao usuário
                                ExibirAlerta(mensagem);
                            } else {
                                // Fecha a janela de cancelamento
                                $('#modalCancelamento').modal('hide');
                                // Exibe mensagem de sucesso ao usuário
                                ExibirAlerta('Não foi possível realizar esta operação.<br/>' + data.Mensagem);
                            }
                        }
                    }
                }
                //
                OcultarLoading();
            },
            error: function(jqXHR, status, err) {
                // Oculta o modal loading
                OcultarLoading();
                // TODO: Escreve na console o erro ocorrido para facilitar sua identificação
                //console.log(x + '\n' + y + '\n' + z);
                $.alert(jqXHR.responseJSON.Message);
            }
        });
    });
    // 
    $("#modalCancelamento").on("click", ".link-mais-detalhes", function(e) {
        e.preventDefault();
        // 
        if ($('.pnlDetalhes').is(":visible")) {
            $('.pnlDetalhes').slideUp();
            $(this).html('<i class="fa fa-angle-double-down"></i> Exibir detalhes da NFS-e');
            $('#ExibirDetalhes').val('False')

        } else {
            $('.pnlDetalhes').slideDown();
            $(this).html('<i class="fa fa-angle-double-up"></i> Ocultar detalhes da NFS-e');
            $('#ExibirDetalhes').val('True')
        }
    });
});