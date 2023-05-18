import { text, intro, cancel, isCancel } from '@clack/prompts';
import axios from 'axios';
import WebSocket from 'ws';
import chalk from 'chalk';

const blockchainApiUrl = 'http://localhost:3000';
const wsUrl = 'ws://localhost:8088';

const createWebSocketConnection = (url: string, onOpen: () => void, onMessage: (message: Buffer) => void): void => {
    const ws = new WebSocket(url);
    ws.on('open', onOpen);
    ws.on('message', onMessage);
};

const startMining = (minerAddress: string) => {
    let blockCount = 0;
    const startTime = Date.now();

    createWebSocketConnection(wsUrl, 
        () => axios.post(`${blockchainApiUrl}/mine`, { minerAddress }),
        (message: Buffer) => {
            try {
                const progress = JSON.parse(message.toString());
                if (progress.message === 'Block mined') {
                    blockCount++;
                    const elapsedTime = (Date.now() - startTime) / 1000;  // in seconds
                    const speed = blockCount / elapsedTime;
                    const performanceMessage = `Block count: ${blockCount}\nElapsed time: ${elapsedTime.toFixed(2)}s\nMining speed: ${speed.toFixed(2)} blocks/s`;
                    console.log(chalk.green(`\n\n*=========================================*\n${performanceMessage}\n*=========================================*\n\n`));
                    axios.post(`${blockchainApiUrl}/mine`, { minerAddress });
                } else {
                    console.log(chalk.blue(`Mining... Current hash: ${progress.hash}, nonce: ${progress.nonce}`));
                }
            } catch (error) {
                console.error(chalk.red(`Error parsing message: ${message}`));
            }
        }
    );
};

intro('Blockchain Miner');

async function bootstrap() {
    const minerAddress = await text({
        message: 'Please enter the miner\'s address:',
        validate: value => value.length === 0 ? 'Address is required!' : undefined
    });

    if (isCancel(minerAddress)) {
        cancel('Operation cancelled.');
        process.exit(0);
    }

    try {
        startMining(minerAddress);
    } catch (error) {
        console.error(chalk.red(error));
    }
}

bootstrap();
