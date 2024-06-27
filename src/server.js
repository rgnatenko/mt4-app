
const express = require('express');
const http = require('http');
const WS = require('ws');
const axios = require('axios');

const app = express();

const server = http.createServer(app);

const wss = new WS.WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async () => {
        try {
            ws.send(JSON.stringify({ status: 'Connecting to backend...' }));

            setTimeout(() => {
                ws.send(JSON.stringify({ status: 'Get Master trade... Ping Lambda Function' }));
            }, 2000);

            const { data: tradeDetails } = await axios.get('https://pdzsl5xw2kwfmvauo5g77wok3q0yffpl.lambda-url.us-east-2.on.aws/');

            ws.send(JSON.stringify({ message: 'Replicating Master Trade...' }));
            const { data: connectionData } = await axios.get('https://mt4.mtapi.io/Connect?user=44712225&password=tfkp48&host=18.209.126.198&port=443');
            const connectionId = connectionData.id;

            const replicateTradeUrl = `https://mt4.mtapi.io/OrderSend?id=${connectionId}&symbol=${tradeDetails.symbol}&operation=${tradeDetails.operation}&volume=${tradeDetails.volume}&takeprofit=${tradeDetails.takeprofit}&comment=${tradeDetails.comment}`;
            const { data: replicatedTradeResult } = await axios.get(replicateTradeUrl);

            setTimeout(() => {
                ws.send(JSON.stringify({ status: 'Successfully Replicated Master Trade' }));
            }, 3000);

            setTimeout(() => {
                ws.send(JSON.stringify({ status: 'Displaying trade details:' }));
            }, 4000);

            setTimeout(() => {
                ws.send(JSON.stringify({ replicatedTradeResult }));
            }, 5000);

        } catch (e) {
            ws.send(JSON.stringify({ status: 'Error', error: e }));
        }
    })
});

wss.on('close', () => {
    console.log('Client disconnected');
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
