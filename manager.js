#!/usr/bin/node
const colors = require('colors');
const { Tests } = require('./tests.js');
const EventEmitter = require('node:events');
const test = new Tests(true);

function getCurrDate() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function differenceBetweenDates(date1, date2) {
    // Converta as strings de datas em objetos Date
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    // Obtenha a diferença em milissegundos
    const diffMs = Math.abs(d1 - d2);

    // Converta a diferença para segundos, minutos, horas e dias
    const diffSeconds = Math.floor((diffMs / 1000) % 60);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return {
        milliseconds: diffMs,
        days: diffDays,
        hours: diffHours,
        minutes: diffMinutes,
        seconds: diffSeconds
    };
  }

class CallEmitter extends EventEmitter {
    constructor(id) {
        super();
        this.id = id;
    }

    // @NOTE: 
    // Alterando a função de emitir eventos, para permitir repassar um array com nomes à emitir.
    // EMITTER.emit(['batata', 'frita'], {cliente: 'um'}) // A edição faz com que isso passe a ser permitido.
    // EMITTER.emit('frita', {cliente: 'um'})
    emit(events, ...args) {
        if (Array.isArray(events)) {
            // Se for um array, emitimos cada evento separadamente
            events.forEach(event => {
                super.emit(event, ...args);
            });
        } else {
            // Caso contrário, emitimos normalmente
            super.emit(events, ...args);
        }
    }

    getId() {
        return this.id;
    }
}

// Classe que representa uma chamada que ocorreu. Em específico, representa um UNIQUEID.
class Call {
    constructor(uniqueid, channel = null, name = null, number = null) {
        this.uniqueid = uniqueid;
        this.channel = channel;
        this.name = name;
        this.number = number;
        this.connectedWith = null;
        this.audioStatus = null;
        this.hangupCause = null;
        this.hangupCauseTxt = null;
        this.extras = {};
    }

    set(parameter, newValue) {
        this[parameter] = newValue;
        return this;
    }

}

// Classe que controla as conexões com a AMI, registra as chamadas e toma ações sob elas.
class CallManager {
    constructor(AMI_PORT, AMI_HOST, AMI_USER, AMI_PASS) {
        // AMI management
        this.config = {
            port: AMI_PORT,
            host: AMI_HOST,
            username: AMI_USER,
            password: AMI_PASS,
            events: true,
            eventDisplay: {
                "_disabled": ["VarSet", "Newexten", "NewAccountCode", "NewCallerid", "ChannelUpdate", "SoftHangupRequest"],
                "_default": { color: 'gray', disable: false },
                "Newchannel": { color: 'green', bgColor: 'bgBlack' },
                "LocalBridge": { color: 'cyan', bgColor: 'bgBlack' },
                "HangupRequest": { color: 'brightYellow', bgColor: 'bgBlack' },
                "Hangup": { color: 'red', bgColor: 'bgBlack' },
                "Cdr": { color: 'black', bgColor: 'bgMagenta' },
                "OriginateResponse": { color: 'magenta', bgColor: 'bgBlack' },
                "Dial": {
                    "Begin": { color: 'green', bgColor: 'bgBlack' },
                    "End": { color: 'red', bgColor: 'bgBlack' },
                    "default": { color: 'blue', bgColor: 'bgBlack' }
                },
                "Bridge": {
                    "Link": { color: 'black', bgColor: 'bgGreen' },
                    "Unlink": { color: 'black', bgColor: 'bgRed' },
                    "default": { color: 'blue', bgColor: 'bgBlack' }
                }
            }
        }
        this._connections = {};

        // Call management
        this.calls = {};
        this.tempMap = new Map();

        // array temporário de testes
        this._dialerReport = {};

    }

    // - REPORT ----------------------------------------------

    dialerReportInsert(actionid, uniqueid = null, number = null, status = null, duration = null, reason = null) {
        this._dialerReport[actionid] = {
            actionid: actionid,
            uniqueid: uniqueid,
            number: number,
            status: status,
            duration: duration,
            reason: reason,
        };
        return this._dialerReport;
    }

    dialerReportGet() {
        return this._dialerReport;
    }

    dialerReportDelete(actionid) {
        delete this._dialerReport[actionid];
        return this._dialerReport;
    }

    // - AMI CONNECTION HANDLERS -----------------------------

    _login() {
        let AMI = new require('asterisk-manager')(this.config.port, this.config.host, this.config.username, this.config.password, this.config.events);
        let CONN_NUM = Object.keys(this._connections).length + 1;
        this._connections[CONN_NUM] = AMI;
        return AMI
    }

    _disconnect(AMI) {
        // encontrar a key
        const connectionKey = Object.keys(this._connections).find(key => this._connections[key] === AMI);

        if (connectionKey) {
            AMI.disconnect();

            // confirmando que desconectou pra remover do array
            if (!AMI.isConnected()) {
                console.log(`Connection ${connectionKey} disconnected.`);
                delete this._connections[connectionKey];
            } else {
                console.log(`Connection ${connectionKey} was not disconnected.`);
            }
        } else {
            console.log('Connection not found.');
        }

        return this;
    }

    _showConnections() {
        console.log(this._connections)
        return;
    }

    _disconnectAll() {
        for (const [CONN_NUM, AMI] of Object.entries(this._connections)) {
            AMI.disconnect()
            if (!AMI.isConnected()) {
                console.log(`Connection ${CONN_NUM} disconnected.`)
                delete this._connections[CONN_NUM];
            } else {
                console.log(`Connection ${CONN_NUM} was not disconnected.`)
            }
        }
        return this;
    }


    // - AMI ACTION HANDLERS -----------------------------

    _handleNewchannel(event) {
        let call = this.getCall(event); if (!call) return;

        return;
    }

    // @NOTE: Involves 2 calls, can't use "this.getCall"
    _handleLocalBridge(event) {
        let InboundCall = this.getCallByUniqueid(event.uniqueid1); // cliente -> servidor
        let OutboundCall = this.getCallByUniqueid(event.uniqueid2); // servidor -> cliente
        return;
    }

    // @NOTE: Involves 2 calls, can't use "this.getCall"
    _handleMasquerade(event) {
        // @NOTE:
        // Decisão: Se ao mascarar o canal, eu preservo o CHAN1 -> CHAN2 -> MASQ(CHAN1)
        // ou se simplifico pra CHAN1 <-> CHAN2, já que o MASQ(CHAN1) basicamente apontaria pra CHAN1 denovo.
        // Vou fazer do modo simplificado.
        // Basicamente o original vai virar o clone, e o clone vai morrer        

        let callOriginal = this.getCallByChannel(event.original);
        let callCloned = this.getCallByChannel(event.clone);

        this.callMasq(callOriginal, callCloned)
        return
    }

    _handleRename(event) {
        let call = this.getCall(event); if (!call) return;

        call.channel = event.newname;
    }

    _handleNewCallerid(event) {
        let call = this.getCall(event); if (!call) return;

        call.number = event.calleridnum;
        call.name = event.calleridname;
    }

    _handleChannelUpdate(event) {
        // @NOTE:
        // Não acho que seja usado pra nada.
        let call = this.getCall(event); if (!call) return;
        call.extras.sipcallid = event.sipcallid;
        call.extras.channeltype = event.channeltype;
    }

    // @NOTE: Involves 2 calls, can't use "this.getCall"
    _handleDial(event) {
        let caller = this.getCallByUniqueid(event.uniqueid) // Origem
        let callee = this.getCallByUniqueid(event.destuniqueid) // Destino

        // Descobrindo se é o início, ou finalização de um Dial
        switch (event?.subevent) {
            case 'Begin':
                this.callConnect(caller, callee);
                break;
            case 'End':
            default:
                break;
        }
    }

    // @NOTE: Involves 2 calls, can't use "this.getCall"
    _handleBridge(event) {
        let caller = this.getCallByUniqueid(event.uniqueid1) // Origem
        let callee = this.getCallByUniqueid(event.uniqueid2) // Destino

        switch (event?.bridgestate) {
            case 'Link':
                this.callAudioConnect(caller, callee);
                break;
            case 'Unlink':
                this.callAudioDisconnect(caller, callee);
                break;
            default:
                break;
        }

        return;
    }

    _handleHangup(event) {
        let call = this.getCall(event); if (!call) return;

        call.hangupCause = event.cause
        call.hangupCauseTxt = event['cause-txt']
        if (call?.audioStatus === 'connected') { call.audioStatus = 'disconnected' } // WHY STILL CONNECTED??????

        return;
    }

    // - CALL MANAGEMENT FUNCTIONS -----------------------------

    getCall(event) {
        let uniqueid = event?.uniqueid
        let channel = event?.channel
        let name = event?.calleridname
        let number = event?.calleridnum
        let call

        call = this.getCallByUniqueid(uniqueid)
        if (call) {
            // console.log('[DEBUG] Call found: uniqueid')
            return call;
        }

        call = this.getCallByChannel(channel)
        if (call) {
            // console.log('[DEBUG] Call found: channel')
            return call;
        }

        if (uniqueid | channel) {
            // console.log('[DEBUG] Call created.');
            return this.callCreate(new Call(uniqueid, channel, name, number))

        }

        console.log(`[DEBUG] Could not create call for event: ${event}`)
        return undefined;
    }

    getCallByChannel(channel) {
        return this.tempMap.get(channel)
    }

    getCallByUniqueid(uniqueid) {
        return this.tempMap.get(uniqueid)
    }

    callCreate(call) {
        // this.calls = { '1111432432': CallObject }
        this.calls[call.uniqueid] = call;
        if (call.channel) {
            this.tempMap.set(call.channel, call);
        }
        this.tempMap.set(call.uniqueid, call);
        return this.tempMap.get(call.uniqueid)
    }

    callConnect(caller, callee) {
        try {
            caller.connectedWith = callee.uniqueid;
            callee.connectedWith = caller.uniqueid;
        } catch (error) {
            console.log(`Não foi possível conectar a chamada entre "${caller.uniqueid}" e "${callee.uniqueid}"`)
            return false
        }
        return true
    }

    callAudioConnect(caller, callee) {
        try {
            // Respeitando a AMI
            caller.audioStatus = 'connected';
            callee.audioStatus = 'connected';
        } catch (error) {
            console.log(`Não foi possível conectar o áudio entre "${caller.uniqueid}" e "${callee.uniqueid}"`)
            console.error(error);
            return false
        }
        return true
    }

    callAudioDisconnect(caller, callee) {
        try {
            // MICROSIP (porque?)
            // [call] -> dial -> bridge link -> bridge unlink -> bridge link -> [call prog] -> hangup request -> bridge unlink -> hangup -> [finish]

            // ZOIPER
            // [call -> dial -> bridge link -> [call prog] -> hangup request -> bridge unlink -> hangup -> [finish] 
            // console.log(`EMIT: Call disconnected (${calls[event.uniqueid1]}, ${calls[event.uniqueid2]})`)

            // Respeitando o Manager
            caller.audioStatus = 'disconnected';
            callee.audioStatus = 'disconnected';

        } catch (error) {
            console.log(`Não foi possível desconectar o áudio entre "${caller.uniqueid}" e "${callee.uniqueid}"`);
            console.error(error);
            return false
        }
        return true
    }

    // @TODO:
    // Botar isso pra outro lugar, não faz sentido ficar aqui
    callMasq(original, clone) {
        // Replicando o canal Clone, porém mantendo o UID
        let newOriginal = { ...clone }
        newOriginal.uniqueid = original.uniqueid

        // Substituindo tudo da nova chamada para a chamada atual
        // @NOTE: se 'newOriginal' tiver mais dados que 'original'
        // pode haver "vazamento" de restos.
        // ex: X={a, b} -masq-> Y={a, b, c} :: X vai receber um valor que nao tinha antes: c
        for (const key in newOriginal) {
            if (key !== 'uniqueid' && newOriginal.hasOwnProperty(key)) {
                original[key] = newOriginal[key];
            }
        }

        // Atualizando quem estava conectado ao Clone, para apontar para newOriginal
        let ConnectedToClone = this.getCallByUniqueid(clone.connectedWith);
        ConnectedToClone.connectedWith = original.uniqueid // Quem estiver conectado com o clone, aponto pro novo uid 
    }


    // - STREAM HANDLING -----------------------------

    _displayEvents(event, eventConfig = {}) {
        const defaultConfig = { color: 'gray', disable: false };

        // Usando a configuração `_default` ou `defaultConfig` se não estiver definida
        const globalDefaultConfig = eventConfig._default || defaultConfig;

        // Se o evento estiver na lista `_disabled`, cancelo a execução
        if (eventConfig._disabled?.includes(event.event)) return;

        // Inicializando a configuração como nula
        let config = null;

        // Verificando se o evento possui subevento e definindo a configuração correta
        if (event.event === 'Dial' && event.subevent) {
            config = eventConfig[event.event]?.[event.subevent] || eventConfig[event.event]?._default || globalDefaultConfig;
        } else if (event.event === 'Bridge' && event.bridgestate) {
            config = eventConfig[event.event]?.[event.bridgestate] || eventConfig[event.event]?._default || globalDefaultConfig;
        } else {
            // Para outros eventos ou se não houver subevento
            config = eventConfig[event.event] || globalDefaultConfig;
        }

        // se tiver desabilitado, cancelo por aqui
        if (config.disable) return;

        // fazendo o display
        const { color, bgColor } = config;
        if (bgColor) {
            console.log(JSON.stringify(event)[color][bgColor]);
        } else {
            console.log(JSON.stringify(event)[color]);
        }
    }

    _handleAllEvents(event) {
        const handlers = {
            'Newchannel': this._handleNewchannel,
            'LocalBridge': this._handleLocalBridge,
            'Masquerade': this._handleMasquerade,
            'Rename': this._handleRename,
            'NewCallerid': this._handleNewCallerid,
            'ChannelUpdate': this._handleChannelUpdate,
            'Dial': this._handleDial,
            'Bridge': this._handleBridge,
            'Hangup': this._handleHangup,
        };

        const handler = handlers[event?.event];
        if (handler) {
            handler.call(this, event);
        } else {
            // console.log(`${JSON.stringify(event)}`.gray)
        }
    }


    // - UTILITARY -----------------------------

    showCalls() {

    }


    // - FEATURES -----------------------------

    /**
     * Realiza uma chamada telefônica via Asterisk AMI (Asterisk Manager Interface).
     *
     * Esta função inicia uma chamada telefônica através de um canal configurado e monitora os eventos relacionados à chamada
     * para capturar respostas de sucesso ou falha. Ela também gera um `CallEmitter` que pode ser usado para escutar eventos
     * da chamada, como "answered" (atendida), "noAnswer" (falha) e "completed" (completada).
     *
     * @param {string} number - O número de telefone para o qual a chamada será feita.
     * @param {object} [USER_CONFIG={config: {}}] - Um objeto de configuração opcional para customizar os parâmetros da chamada.
     * 
     * @returns {CallEmitter} - Um objeto `CallEmitter` que emite eventos relacionados à chamada.
     *
     * @example
     * const callEmitter = call('1234567890', {
     *   config: {
     *     outbound_prefix: '9',
     *     seconds_timeout: 30
     *   }
     * });
     * 
     * callEmitter.on('answered', (evt) => {
     *   console.log('Chamada atendida!', evt);
     * });
     * 
     * callEmitter.on('noAnswer', (evt) => {
     *   console.log('Falha na chamada!', evt);
     * });
     */
    call(number, USER_CONFIG = { config: {} }) {
        const CONFIG = {
            outbound_prefix: '',
            outbound_postfix: '',
            outbound_context: 'from-internal',
            inbound_context: 'from-pstn',
            inbound_extension: 'PHONEVOXTEST',
            inbound_priority: 1,
            seconds_timeout: 20,
            event_name: {
                answered: 'answered', // cliente está conectado
                noAnswer: 'noAnswer', // em algum momento, a chamada falhou e não pode prosseguir
                connected: 'connected', // callback conectou com uma aplicação
                deadend: 'deadend', // A chamada foi atendida, mas não há destino/aplicação, é um hangup direto.

                failed: 'failed', // chamada pode ser considerada como falha no dialer
                completed: 'completed', // chamada pode ser considerada como completada no dialer
                any: 'any' // reporte qualquer evento
            },
            ...USER_CONFIG.config
        }

        let AMI = this._login();
        let UNIX_EPOCH = Math.floor(new Date().getTime() / 1000); // só pra gerar id rsrs
        let ACTIONID = 'VDIALER' + UNIX_EPOCH;

        let CALL_EMITTER = new CallEmitter(ACTIONID);
        let CALL_START_TIME
        let CALL_FINISH_TIME

        const registerEveryCall = (evt) => {
            this._handleAllEvents(evt) // para registrar as chamadas em this.call
        };

        const logColoredEvents = (evt) => {
            this._displayEvents(evt, this.config.eventDisplay)
        };

        const emitCallResponse = (evt) => {
            if (evt.event === 'OriginateResponse' && evt.actionid === ACTIONID) {
                console.log(`[DEBUG] Expected response found.`.blue)
                // console.log(`${JSON.stringify(evt)}`.black.bgMagenta)
                if (evt.response === 'Failure') {
                    CALL_EMITTER.emit(CONFIG.event_name.noAnswer, evt);
                } else if (evt.response === 'Success') {
                    CALL_EMITTER.emit(CONFIG.event_name.answered, evt);

                    // Iniciar contagem de duração da chamada
                } else {
                    console.log('UID:Unknown response from OriginateResponse.');
                }
            }
        };

        const onCallAnswer = (evt) => {
            console.log(`[DEBUG] [UID:${evt?.uniqueid}] Call answered.`.green);
            // console.log(`${JSON.stringify(evt)}`.black.bgMagenta)
            this.dialerReportInsert(ACTIONID, evt?.uniqueid, number, evt?.response, 'answered', null)

            const cleanTempListeners = () => {
                AMI.removeListener('masquerade', findAndEmitCallConnect)
                AMI.removeListener('hangup', findAndEmitCallDeadend)
            }

            const findAndEmitCallConnect = (evtMasq) => {
                if (evtMasq.original === evt.channel) {
                    CALL_EMITTER.emit(CONFIG.event_name.connected, evt)
                    cleanTempListeners()
                }
            }

            const findAndEmitCallDeadend = (evtHangup) => {
                if (evtHangup.channel === evt.channel) {
                    // Observação: como não houve o masquerade, as informações ainda estão no canal ;1
                    CALL_EMITTER.emit(CONFIG.event_name.deadend, evt)
                    cleanTempListeners()
                }
            }

            AMI.on('masquerade', findAndEmitCallConnect)
            AMI.on('hangup', findAndEmitCallDeadend)
        };

        const onCallNoAnswer = (evt) => {
            const reasonMap = {
                0: "Unknown",
                1: "Unallocated",
                3: "No route destination, or timeout",
                4: "Answer",
                5: "Busy",
                8: "Congestion",
                18: "No user response"
            };
            console.log(`[UID:${evt?.uniqueid}] Call wasn't answered. (Reason: ${reasonMap[evt?.reason] || evt?.reason})`.red);
            // console.log(`${JSON.stringify(evt)}`.black.bgMagenta)
            this.dialerReportInsert(ACTIONID, null, number, evt.response, null, `${reasonMap[evt?.reason] || evt?.reason}`);
            AMI.removeAllListeners();
            this._disconnect(AMI);
        };

        const onCallConnected = (evt) => {
            console.log(`[DEBUG] Call connected with application.`.green);
            CALL_START_TIME = getCurrDate();
            // console.log(`${JSON.stringify(evt)}`.black.bgMagenta)
            // começo a timear a chamada, e no próximo hangup eu assumo que a chamada foi completada.

            const cleanTempListeners = () => {
                AMI.removeListener('hangup', onHangup);
            }

            const onHangup = (evtHangup) => {
                if (evtHangup?.uniqueid === evt.uniqueid) {
                    // Observação: como não houve o masquerade, as informações ainda estão no canal ;1
                    CALL_EMITTER.emit(CONFIG.event_name.completed, evt)
                    cleanTempListeners()
                }
            }

            AMI.on('hangup', onHangup);

        };

        const onCallDeadend = (evt) => {
            console.log(`[DEBUG] Call went to deadend. Clearing connection...`);
            // console.log(`${JSON.stringify(evt)}`.black.bgMagenta)
            AMI.removeAllListeners();
            this._disconnect(AMI);
        };

        const onCallCompleted = (evt) => {
            CALL_FINISH_TIME = getCurrDate();
            console.log(`[DEBUG] Call finished. (Duration : ${differenceBetweenDates(CALL_START_TIME, CALL_FINISH_TIME).milliseconds})`.green)
            // console.log(`${JSON.stringify(evt)}`.black.bgMagenta)
            AMI.removeAllListeners();
            this._disconnect(AMI);

            console.log('Call start: ' + CALL_START_TIME);
            console.log('Call finish: ' + CALL_FINISH_TIME);
        };

        // começo a registrar todo fluxo da AMI
        AMI.on('managerevent', registerEveryCall);
        // AMI.on('managerevent', logColoredEvents);

        // monitoro eventos de resposta, pra saber se a chamada que farei completou ou não
        AMI.on('response', emitCallResponse);

        // o que faço baseado no status da chamada
        CALL_EMITTER.on(CONFIG.event_name.answered, onCallAnswer); // progress, basicamente
        CALL_EMITTER.on(CONFIG.event_name.noAnswer, onCallNoAnswer); // chamada falhou
        CALL_EMITTER.on(CONFIG.event_name.connected, onCallConnected); // aqui de fato a chamada tá ocorrendo, e é do cliente
        CALL_EMITTER.on(CONFIG.event_name.deadend, onCallDeadend); // chamada não se conectou, direto pra um hangup
        CALL_EMITTER.on(CONFIG.event_name.completed, onCallCompleted); // chamada completou

        // enquanto estou registrando o fluxo da AMI, faço minha chamada, para cair nesse fluxo
        AMI.action({
            actionid: ACTIONID,
            action: 'originate',
            channel: `local/${CONFIG.outbound_prefix}${number}${CONFIG.outbound_postfix}@${CONFIG.outbound_context}`, // canal a ser usado pra chamada
            // context: CONFIG.inbound_context, // contexto ao ser atendido
            // exten: CONFIG.inbound_extension, // exten quando for atendido
            // priority: CONFIG.inbound_priority,  // prioridade ao ser atendido
            variable: `DIALER_ACTIONID=${ACTIONID}`,
            variable: `CALLERID(name)=${ACTIONID}`,
            application: `AGI`,
            data: `agi://${process.env.FASTAGI_HOST}:${process.env.FASTAGI_PORT}/test?param=123&param=321`,
            callerid: number, // callerid
            timeout: 1000 * CONFIG.seconds_timeout, // tempo em milisegundos pra aguardar a chamada (incluindo roteamento ao tronco e ringtime)
            async: true,
        });

        return CALL_EMITTER;
    }

}

module.exports = {
    CallManager
}
