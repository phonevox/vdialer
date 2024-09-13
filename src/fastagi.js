#!/usr/bin/node
const colors = require('colors');
const fastagi = require('./pvx-fagi');
const express = require('express');
const path = require('path');
const PORT = process.env.FASTAGI_PORT || 4573
const EXPR_PORT = process.env.EXPR_PORT || 3987

const expr = express();
const app = fastagi();

const audioDir = path.join(__dirname, 'audio');
expr.use('/audio', express.static(audioDir));

app.agi("/test", async (channel) => {
    console.log('--- TEST CONNECTION STARTED ---')

    // These listeners are optional
    channel.on('hangup', function () {
        console.log('channel hangup');
    });

    channel.on('close', function () {
        console.log('channel closed');
    });

    channel.on('error', function (err) {
        console.log('error!', err);
    });

    // params are in the channel object
    console.log('Parameters:')
    console.log(channel.params);



    console.log(' --- test start --- ');
    await channel.playbackFromFAGI('ola-tudo-bem');
    await channel.playbackFromFAGI('notei-divergencia-cadastro');
    await channel.downloadAudioFAGI('1-atendente-2-normal');
    let dtmf = await channel.getData('vdialer/1-atendente-2-normal', 5, 1)
    switch (dtmf.result) {
        case 0:
            console.log('Cliente não interagiu, ou digitou 0.')
            break;
        case 1:
            console.log('Cliente quer falar com atendente')
            break;
        case 2:
            console.log('Cliente informa que já pagou')
            break;
        default:
            console.log('Algum erro ocorreu, não caiu em nenhum ponto do switch-case.')
            break;
    }

    // channel.exec('DumpChan')

    channel.close()
});

expr.listen(EXPR_PORT, () => {
    console.log(`Express listening on port ${EXPR_PORT}`)
})
app.listen(PORT, () => {
    console.log(`FastAGI listening on port ${PORT}`);
});