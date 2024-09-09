#!/usr/bin/node
let readline = require('readline');
readline.emitKeypressEvents(process.stdin)

// OBSERVAÇÕES:
// Alterar o WRITETIMEOUT. Padrão 100(ms), não é o suficiente para ler
// a stream completa, e aleatóriamente¹ encerra a conexão do manager.
// ¹ : Não é aleatório, só não sei explicar como funciona ainda.

const AMI_PORT = process.env.AMI_PORT || "5038";
const AMI_HOST = process.env.AMI_HOST;
const AMI_USER = process.env.AMI_USER;
const AMI_PASS = process.env.AMI_PASS;

const colors = require('colors');
const EventEmitter = require('node:events');
let ami = new require('asterisk-manager')(AMI_PORT, AMI_HOST, AMI_USER, AMI_PASS, true);
let participants = {};
let eventEmitter = new EventEmitter();

function call(number) {
    let UNIX_EPOCH = Math.floor(new Date().getTime() / 1000)
    ami.action({
        actionid: 'VoDiAPI' + UNIX_EPOCH,
        action: 'originate',
        channel: `local/${number}@from-internal`, // canal a ser usado pra chamada
        context: 'from-pstn', // contexto ao ser atendido
        exten: 's', // exten quando for atendido
        priority: '1',  // prioridade ao ser atendido
        callerid: number, // callerid
        maxretries: '0', // tentativas de ligações
        retrytime: '5', // segundos entre cada tentativa
        waittime: '5', // tempo de ring até ser considerada abandonada
        async: true,
    });
    // call(number, timeout)
    // call(process.env.MY_PHONE) -> ao finalizar faz callback pra algum lugar (e se nao finalizar?)
    // call(process.env.MY_PHONE) -> retorna o id, pra consulta, e você (app) fica responsável de averiguar se a chamada passou ou não
}

ami.keepConnected();
ami.on('rawevent', function (event) {
    switch (event?.event) {

        case 'Newchannel':
            console.log(JSON.stringify(event).blue.bgBlack)
            participants[event.uniqueid] = { name: event.calleridname, number: event.calleridnum };
            break;

        case 'Dial':
            console.log(JSON.stringify(event).blue.bgBlack)


            switch (event?.subevent) {
                case 'Begin':
                    participants[event.uniqueid]['source'] = event.uniqueid;
                    participants[event.uniqueid]['destination'] = event.destuniqueid;
                    participants[event.uniqueid]['connectedWith'] = event.destuniqueid;

                    participants[event.destuniqueid]['source'] = event.uniqueid;
                    participants[event.destuniqueid]['destination'] = event.destuniqueid;
                    participants[event.destuniqueid]['connectedWith'] = event.uniqueid;
                    break;
                case 'End':
                    participants[event.uniqueid]['dialStatus'] = event.dialstatus;
                    let otherParty = participants[event.uniqueid]['connectedWith']
                    participants[otherParty]['dialStatus'] = event.dialstatus
                    break;
                default:
                    break;
            }
            break;

        case 'Bridge':
            console.log(JSON.stringify(event).blue.bgBlack)
            switch (event?.bridgestate) {
                case 'Link':
                    console.log(`AUDIO CONNECT: <${event.uniqueid1}> e <${event.uniqueid2}>`.black.bgGreen)
                    participants[event.uniqueid1]['audioStatus'] = 'Connected'
                    participants[event.uniqueid2]['audioStatus'] = 'Connected'
                    break;
                case 'Unlink':
                    if (participants[event.uniqueid]) {
                        // MICROSIP (porque?)
                        // [call] -> dial -> bridge link -> bridge unlink -> bridge link -> [call prog] -> hangup request -> bridge unlink -> hangup -> [finish]
                        // ZOIPER
                        // [call -> dial -> bridge link -> [call prog] -> hangup request -> bridge unlink -> hangup -> [finish] 
                        console.log(`AUDIO DISCONNECT: <${event.uniqueid1}> e <${event.uniqueid2}>`.black.bgRed)
                        participants[event.uniqueid1]['audioStatus'] = 'Disconnected'
                        participants[event.uniqueid2]['audioStatus'] = 'Disconnected'
                    }
                    break;
                default:
                    break;
            }
            break;

        // case 'NewAccountCode':
        // console.log(JSON.stringify(event).green.bgBlack)
        // break;

        case 'HangupRequest':
            console.log(JSON.stringify(event).brightYellow.bgBlack)
            break;
        case 'Hangup':
            console.log(JSON.stringify(event).red.bgBlack)
            if (participants[event.uniqueid]) {
                participants[event.uniqueid]['channel'] = event?.channel
                participants[event.uniqueid]['number'] = event?.calleridnum
                participants[event.uniqueid]['name'] = event?.calleridname
                participants[event.uniqueid]['hangupCause'] = event?.cause
                participants[event.uniqueid]['hangupCauseTxt'] = event['cause-txt']
            }
            break;
        case 'Cdr':
            console.log(JSON.stringify(event).magenta.bgBlack)
            break;
        case 'OriginateResponse':
            console.log(JSON.stringify(event).green.bgBlack)
            break;

        // case 'RTCPSent':
        case 'RTCPReceived':
        case 'VarSet':
        case 'Newexten':
        case 'Newstate':
        case 'FullyBooted':
        case 'ExtensionStatus':
        case 'SoftHangupRequest': // pre-hangup
        case 'PeerStatus': // qualify
            break;
        default:
            console.log(JSON.stringify(event).gray)
            break;
    }
});


// Criando a interface de leitura do terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

rl.on('line', (input) => {

    // Separando comandos compostos
    const [command, param] = input.split(':').map(part => part.trim());

    // Ver um ID específico
    if (['show', 's', 'find', 'f'].includes(command) && param) {
        if (participants[param]) {
            console.log(`Dados do participante com ID ${param}:`, participants[param]);
            // Aqui você pode realizar outras operações usando o ID
        } else {
            console.log(`Nenhum participante encontrado com o ID ${param}`);
        }
    }

    // Realizar uma chamada
    if (['call'].includes(command) && param) {
        call(param)
    }

    // Ver tudo que está no array
    if (input == 'participants' | input === 'p') {
        console.log(participants)
    }

    // Limpar participantes
    if (input == 'clear' | input === 'cc') {
        participants = {}
        console.log(participants)
    }

    // Encerrar
    if (input == 'quit') {
        ami.disconnect()
        process.exit()
    }
});


// ami.on('response', function(event) {
//     console.log(`${JSON.stringify(event)}`.green.bgBlack)
// });

// ami.action({'action': 'ping'}, function(err, res) {
//     console.log('Response: ' + JSON.stringify(res))
// });

// ami.disconnect()
