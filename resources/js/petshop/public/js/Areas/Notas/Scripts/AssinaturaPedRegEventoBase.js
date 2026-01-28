function ProcessarPedRegEvento(tipoEvento, xmlPedRegEvento) {
    return new Promise((resolve, reject) => {

        // Chama a API
        $.ajax({
            url: window.UrlBase + 'AssinaturaPedRegEvento/ProcessarPedRegEvento',
            type: 'POST',
            dataType: 'json',
            data: {
                tipoEvento: tipoEvento,
                pedRegEventoXmlStringBase64: xmlPedRegEvento
            },
            success: function(data) {
                resolve(data);
                //Se processado com SUCESSO 
                if (data.Status != 1) {
                    const error = new Error(data.Mensagem);
                    reject(error);
                }
            },
            error: function(x, y, z) {
                const error = new Error('Ocorreu um erro:' + ' | ' + x + ' | ' + y + ' | ' + z);
                reject(error);
            }
        });

    });

}

function ExibirMensagemErro(mensagem) {
    OcultarLoading();
    $("#erroAssinatura").show();
    $("#erroAssinatura").empty();
    document.getElementById('erroAssinatura').innerHTML += '<span class="icone"></span>';
    document.getElementById('erroAssinatura').innerHTML += mensagem;
    document.getElementById('erroAssinatura').innerHTML += '<a class="close" href="javascript: void (0);"></a>';
    $(window).scrollTop(0);
}

//Funcão principal controla todo o Fluxo do Processamento da assinatura de um PedRegEvento utilizando o Assinador Serpro
async function Assinar(data) {

    console.log("->Iniciando VerifyIsInstalledAndRunning");

    try {
        await assinadorSerpro.VerifyIsInstalledAndRunning();
    } catch (errorVerifyIsInstalled) {
        return errorVerifyIsInstalled;
    }

    console.log("#Finalizando VerifyIsInstalledAndRunning");

    console.log("#Iniciando Connect");

    try {
        await assinadorSerpro.Connect();
    } catch (errorConnect) {
        if (errorConnect instanceof Error) {
            return errorConnect;
        }
    }

    console.log("Finalizando Connect");


    console.log("Iniciando Version()");

    if (!this.versaoAssinador) {
        const requestIdVersao = assinadorSerpro.Version();
        try {
            ExibirLoading();
            const response = await assinadorSerpro.GetMessage(requestIdVersao);
            versaoAssinadorSerpro = response.version;
            versaoAssinador = parseFloat(response.version.replace(/\./g, '').replace(/\,/g, '.'));
        } catch (errorObtemVersaoAssinador) {
            if (errorObtemVersaoAssinador instanceof Error) {
                console.log(errorObtemVersaoAssinador.message);
                return false;
            }
        }
    }

    console.log("Finalizando Version()");

    var respostaValicaoAssinatura;
    try {
        //Assinatura de base64 retornando um xml com a assinatura
        console.log("Inicio ValidarVersao");
        respostaValicaoAssinatura = await assinadorSerpro.ValidarVersao(versaoAssinador, versaoAssinadorSerpro);
        console.log("Fim ValidarVersao");
    } catch (error) {
        if (error instanceof Error) {
            return error;
        }
    }

    requestId = new Date().getTime();


    console.log('-> Chamando Assinador Serpro');

    var responseAssinador;
    const requestIdAssinador = assinadorSerpro.Sign(data);
    try {
        ExibirLoading();
        responseAssinador = await assinadorSerpro.GetMessage(requestIdAssinador);
    } catch (error) {
        if (error instanceof Error) {
            return error;
        }
    }

    console.log("Pedido de registro de evento !" + requestId);
    var pedRegEventoAssinado = responseAssinador.listOfSignatures[0];

    var respostaProcessamentoPedRegEvento;
    try {
        //Assinatura de base64 retornando um xml com a assinatura
        console.log("-> Inicio ProcessarPedRegEvento");
        respostaProcessamentoPedRegEvento = await ProcessarPedRegEvento(data.TipoEvento, pedRegEventoAssinado);
        console.log("-> Fim ProcessarPedRegEvento");
    } catch (error) {
        if (error instanceof Error) {
            return error;
        }
    }


    //Retorna resultado do processamento da NFSe assinada pelo Assinador Serpro 
    return respostaProcessamentoPedRegEvento;
}