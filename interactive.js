const readline = require('readline');
const ansiEscapes = require('ansi-escapes');
const { CallManager } = require('./manager')
// --

const AMI_PORT = process.env.AMI_PORT || "5038";
const AMI_HOST = process.env.AMI_HOST;
const AMI_USER = process.env.AMI_USER;
const AMI_PASS = process.env.AMI_PASS;

// --

// Configurar o readline para capturar o input do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ' // O prompt que será exibido para o usuário
});

// Função para interpretar comandos
function interpretCommand(command) {
    const [action, params] = command.split(':');

    switch (action) {
        case 'r':
        case 'report':
            console.log(`[DEBUG] Reporting calls done`)
            console.log(manager.dialerReportGet())
            break;
        case 'cc':
        case 'clear':
            console.log(`[DEBUG] Clearing calls`)
            manager.calls = {}
            break;
        case 'c':
        case 'calls':
            console.log(`[DEBUG] Displaying all calls`)
            console.log(manager.calls)
            break;
        case 'f':
        case 'find':
            console.log(`[DEBUG] Searching uniqueid "${params}"`)
            console.log(manager.getCallByUniqueid(params))
            break;
        case 'd':
        case 'dial':
            console.log(`[DEBUG] Sending call to "${params}"`)
            manager.call(params);
            break;
        case 'conn':
        case 'connections':
            console.log(`[DEBUG] Displaying connections`)
            manager._showConnections();
            break;
        case 'q':
        case 'dc':
        case 'quit':
            console.log(`[DEBUG] Disconnecting all manager sessions.`)
            manager._disconnectAll();
            break;
        default:
            break;
    }

    // console.log(`Função "${action}" chamada com parâmetros: ${params}`);
}

// Capturar o input do usuário
rl.on('line', (input) => {
    interpretCommand(input.trim());
    rl.prompt(); // Reposiciona o prompt na última linha após processar o comando
});

// --

const manager = new CallManager(AMI_PORT, AMI_HOST, AMI_USER, AMI_PASS);
