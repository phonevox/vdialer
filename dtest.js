#!/usr/bin/node

const { CallManager } = require('./manager')

const AMI_PORT = process.env.AMI_PORT || "5038";
const AMI_HOST = process.env.AMI_HOST;
const AMI_USER = process.env.AMI_USER;
const AMI_PASS = process.env.AMI_PASS;

const manager = new CallManager(AMI_PORT, AMI_HOST, AMI_USER, AMI_PASS);

// manager.call() retorna um EMITTER que me dá os eventos que acontecem na chamada
let chamada = manager.call(process.env.MY_PHONE, {config: { outbound_prefix: '0', seconds_timeout: 20 }});
let id = chamada.getId()
console.log('Dialer Call ID: ' + id)

chamada.on('answer', (evt) => {
    console.log(`Call ${id} has been answered!`)
    console.log(evt)
})

// chamada.on('completed') = () => {}
// chamada.on('answer') = () => {}
// chamada.on('fail') = () => {}
// chamada.on('any') = () => {}
