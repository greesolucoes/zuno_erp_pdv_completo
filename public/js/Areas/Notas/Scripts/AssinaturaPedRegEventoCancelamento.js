async function InicializarAssinatura(data) {
    let responseProcessamentoPedRegEvento;
    //Esconde painel responsável pela exibição dos erros ocorridos no processo da Assinatura digital da DPS utilizando o AssinadorSerpro
    $("#erroAssinatura").hide();

    ExibirLoading();

    assinadorSerpro = new AssinadorSerpro();
    assinadorSerpro.Inicializar();

    console.clear();
    console.log("Iniciando Processamento do PedRegEvento !");

    try {
        responseProcessamentoPedRegEvento = await Assinar(data);
    } catch (errorAssinatura) {
        if (errorAssinatura instanceof Error) {
            console.log("OcultarLoading");
            OcultarLoading();
            $('#modalCancelamento').modal('hide');
            ExibirMensagemErro(errorAssinatura.message);
        }
    }

    if (responseProcessamentoPedRegEvento instanceof Error) {
        console.log("OcultarLoading");
        OcultarLoading();
        $('#modalCancelamento').modal('hide');
        ExibirMensagemErro(responseProcessamentoPedRegEvento.message);
    } else {
        console.log("Final do Processamento !");
        // Fecha a janela de cancelamento
        $('#modalCancelamento').modal('hide');

        //Se processado com SUCESSO
        if (responseProcessamentoPedRegEvento.Status == 1) {
            // Atualiza a linha da tabela de NFS-e emitidas mudando o ícone da situação e removendo opções do menu suspenso
            var linha = $('.table > tbody > tr[data-chave="' + responseProcessamentoPedRegEvento.ChaveAcesso + '"]');
            linha.find('.td-opcoes .btnSubstituir').remove();
            linha.find('.td-opcoes .btnCancelar').remove();
            var mensagem = '';
            switch (responseProcessamentoPedRegEvento.TipoEvento) {
                case 101101:
                    linha.find('.td-situacao').html('<img data-toggle="tooltip" src="' + window.UrlBase + '/img/tb-cancelada.svg" title="" data-original-title="NFS-e Cancelada">');
                    mensagem = 'A NFS-e foi cancelada com sucesso';
                    break;
                case 101103:
                    linha.find('.td-situacao').html('<img data-toggle="tooltip" src="' + window.UrlBase + '/img/tb-pendente.svg" title="" data-original-title="NFS-e sob análise fiscal">');
                    mensagem = 'O pedido de análise fiscal para cancelamento foi registrado com sucesso.';
                    break;
            }
            // Exibe mensagem de sucesso ao usuário
            ExibirAlerta(mensagem);

        } else { //Em caso de processado status = 2 - 'PROCESSADO_COM_ERROS' com erro ou falha, status = 3 - 'FALHA_NO_PROCESSAMENTO'
            ExibirMensagemErro(responseProcessamentoPedRegEvento.Mensagem);
        }
        console.log("OcultarLoading");
        OcultarLoading();
    }
}