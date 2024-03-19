import { jsonParser } from '../../src/express-common.js';
import { delay, uuidv4 } from '../../src/util.js';

/**
 *
 * @param {import('express').Router} router
 */
export async function init(router) {
    console.log('[STAHP]', 'init');

    const uiQueue = [];
    const apiQueue = [];

    router.get('/ex/poll', (request, response) => {
        const queue = [];
        while (uiQueue.length) queue.push(uiQueue.shift());
        return response.send(queue);
    });
    router.post('/ex/response', jsonParser, (request, response) => {
        console.log('[STAHP]', 'response', request.body);
        apiQueue.push(request.body);
        return response.sendStatus(200);
    });

    router.post('/api/slash', jsonParser, async(request, response) => {
        const id = uuidv4();
        console.log('[STAHP]', '/api/slash', request.body);
        uiQueue.push({
            id,
            action: 'executeSlashCommands',
            command: request.body.command
        });
        while (!apiQueue.find(it=>it.id == id)) await delay(100);
        const result = apiQueue.splice(apiQueue.findIndex(it=>it.id==id), 1)[0];
        if (typeof result.result != 'object') {
            result.result = JSON.stringify(result.result);
        }
        return response.send(result.result);
    });
    router.post('/api/send', jsonParser, async(request, response) => {
        const id = uuidv4();
        console.log('[STAHP]', '/api/send', request.body);
        uiQueue.push({
            id,
            action: 'send',
            message: request.body.message
        });
        while (!apiQueue.find(it=>it.id == id)) await delay(100);
        const result = apiQueue.splice(apiQueue.findIndex(it=>it.id==id), 1)[0];
        return response.send(result.result);
    });
    router.get('/api/get-characters', (request, response) => {
        return response.redirect('/characters/all');
    });
}

export async function exit() {
    console.log('[STAHP]', 'exit');
}

const module = {
    init,
    exit,
    info: {
        id: 'stahp',
        name: 'STAHP',
        description: 'SillyTavern API Host Plugin',
    },
};

export default module;
