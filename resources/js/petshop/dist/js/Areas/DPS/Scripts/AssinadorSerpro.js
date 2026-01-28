class AssinadorSerpro {
    idRascunho;
    mapResponse;
    testInProgress;
    commands;


    Inicializar() {
        this.testInProgress = false;
        this.mapResponse = new Map();
        //Configuraçao dos comandos que serão executados no AssinadorSerpro
        this.commands = [{
                "command": "signxml",
                "type": "xmlBase64",
                "listOfInputData": "",
                "requestId": "",
                outputDataType: "base64",
                textEncoding: "UTF-8"
            },
            {
                "command": "version",
                "type": "text"
            }
        ];
    }

    // Os metodos abaixo utilizou como referência o arquivo serpro-signer-client.js disponibilizado pela equipe do
    // asssinador serpro atraves do endereço: https://www.assinadorserpro.estaleiro.serpro.gov.br/minimalista/tutorial/index.html
    // e arquivo assinador-serpro.service.ts disponibilizado pela equipe Reinf

    /**
     * Verify if Desktop Client is running using a image request
     * to http server. This technique is used because the HTTPS (http + ssl) may not be enabled.
     *
     */
    VerifyIsInstalledAndRunning() {
        let msgErroAssinadorNaoInstalado = "O sistema não conseguiu se comunicar com o aplicativo de assinatura digital. Por favor, verifique se o programa Assinador está instalado e executando.<br> Se seu computador ainda não possui o Assinador instalado, acesse a " + "<a href='https://www.serpro.gov.br/links-fixos-superiores/assinador-digital/assinador-serpro'><b>página do Assinador SERPRO!<b>";
        if (this.testInProgress) {
            const error = new Error("Uma verificação de instalação do assinador serpro está em andamento, aguarde algum tempo para tentar novamente.");
            return Promise.reject(error);
        }

        this.testInProgress = true;
        const imageVerify = new Image();

        return new Promise((resolve, reject) => {
            imageVerify.onload = () => {
                resolve(true);
                this.testInProgress = false;
            };

            imageVerify.onerror = () => {
                const error = new Error(msgErroAssinadorNaoInstalado);
                reject(error);
                this.testInProgress = false;
            };

            imageVerify.src = `http://127.0.0.1:65056/verify.gif?t=${new Date().getTime()}`;
        });
    }


    /**
     * Method used to start connection with local WebSocket server.
     *
     * @instance
     * @{function} callbackOpen - Callback  invoked on OPEN connection.
     * @{function} callbackError - Callback invoked on ERROR connection.
     */
    async Connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return true;
        }

        return new Promise((resolve, reject) => {
            this.ws = new WebSocket("wss://assinador-desktop.serpro.gov.br:65166/signer");

            this.ws.onopen = (event) => {
                resolve(true);
                this.ws.onmessage = (event) => {
                    const responseConnect = JSON.parse(event.data);
                    responseConnect.jsonRecebido = event.data;
                    this.mapResponse.set(responseConnect.requestId, responseConnect);
                };
            };

            this.ws.onerror = (event) => {
                let msgErroConnect = "Se já possui o Assinador instalado e executando, mas ainda esta tendo problemas <br>" +
                    "veja as instruções para adicionar a cadeia de certificado do Assinador aos permitidos pelo navegador, ao final recarregue esta página. <br>" +
                    "<a href='https://127.0.0.1:65156/'>Acesse esse endereço !</a>";
                const error = new Error(msgErroConnect);
                reject(error);
            };
        });
    }

    /**
     * Verify status of connection with WebSocket server.
     *
     * @return {boolean} - True for connection is up, false if is down.
     */
    IsConnected() {
        return this.ws && this.ws.readyState == WebSocket.OPEN ? true : false;
    }


    /**
     * Envia comando que obtem a versão do AssinadorSerpro
     *
     * @return {versao} - String
     */
    Version() {
        let versionCommand = this.commands[1];
        return this.Execute(versionCommand);
    }

    /**
     * Envia um comando para ser executado
     * @param {request} Comando a ser executado
     * @return {requestId} - Numero
     */
    Execute(request) {
        if (this.IsConnected()) {
            if (request.requestId === undefined || request.requestId === "") {
                request.requestId = new Date().getTime();
            }
            this.ws.send(JSON.stringify(request));
            return request.requestId;
        } else {
            return 0;
        }
    }

    /**
     * Retorna o resultado de um comando enviado para o AssinadorSerpro
     * @param {requestId} Id da requisicao enviada para o AssinadorSerpro
     * @param {attempts} Numero de tentativas
     * @return {responseGetMessage} - Conteudo da mensagem
     */
    async GetMessage(requestId, attempts = 0) {
        let responseGetMessage = this.mapResponse.get(requestId);
        if (!responseGetMessage) {
            if (attempts >= 1000) {
                console.log("Resposta não encontrada após varias tentativas");
                return Promise.reject(new Error("Resposta não encontrada após varias tentativas"));
            }
            await new Promise((resolve) => setTimeout(resolve, 3000));
            console.log("-> Chamando GetMessage novamente tentativa:" + (attempts + 1));
            responseGetMessage = await this.GetMessage(requestId, attempts + 1);
        }
        if (responseGetMessage.actionCanceled) {
            return Promise.reject(new Error("Assinatura cancelada pelo usuário"));
        } else if (responseGetMessage.error) {
            console.log("responseGetMessage.error Tentativa:" + attempts);
            return Promise.reject(new Error(responseGetMessage.error));
        }
        console.log("-> Resolvendo GetMessage requestId:" + requestId);
        this.mapResponse.delete(requestId);
        return Promise.resolve(responseGetMessage);
    }

    /**
     * Retorna o resultado de um comando enviado para o AssinadorSerpro
     * @param {dataSign} comando de assinatura
     */
    Sign(dataSign) {
        let cmdSign = this.commands[0];
        cmdSign.listOfInputData = dataSign.ListOfInputData; //XML da NFSe gerado
        return this.Execute(cmdSign);
    }

    /**
     * Retorna o resultado de um comando enviado para o AssinadorSerpro
     * @param {xmlDpsBase64} comando de assinatura
     */
    SignXml(xmlBase64) {
        let cmdSign = this.commands[0];
        cmdSign.listOfInputData = xmlBase64;
        return this.Execute(cmdSign);
    }


    ValidarVersao(versaoAssinador, versaoAssinadorSerpro) {
        return new Promise((resolve, reject) => {
            //Somente a partir da versão 3.0.0 que se tem a funcionalidade de assinatura de XML
            if (versaoAssinador > 300) {
                resolve(true)
            } else {
                reject(new Error(`Assinador Serpro - Versão: ${versaoAssinadorSerpro} - não aceita. Favor instalar a versão mais recente, acesse a <a href='https://www.serpro.gov.br/links-fixos-superiores/assinador-digital/assinador-serpro'><b>página do Assinador SERPRO!<b>`));
            }
        });
    }

}