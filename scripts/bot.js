const config = require('../config');
const BOT_TOKEN = config.BOT_TOKEN || '';

const {VK} = require('vk-io');

const vk = new VK({
    token: BOT_TOKEN
});

vk.updates.on('message_new', async (context) => {
    switch (context.text) {
        case '/start': {
            await context.send(`что я умею:
            
		/cat - Коську мне
		/music - Песню мне 
		/time - Время скажи`);
            break;
        }
        case '/cat': {
            await Promise.all([
                context.send('Держи коську'),

                context.sendPhotos({
                    value: 'https://loremflickr.com/400/300/'
                })
            ]);
            break;
        }
        case '/music': {
            const catsPurring = [
                'http://ronsen.org/purrfectsounds/purrs/trip.mp3',
                'http://ronsen.org/purrfectsounds/purrs/maja.mp3',
                'http://ronsen.org/purrfectsounds/purrs/chicken.mp3'
            ];
            const link = catsPurring[Math.floor(Math.random() * catsPurring.length)];
            await Promise.all([
                context.send('Ты просил песню, получи песню'),

                context.sendAudioMessage({
                    value: link
                })
            ]);
            break;
        }
        case '/time': {
            await context.send(String(new Date()));
            break;
        }
        default: {
            await vk.api.messages.markAsRead({peer_id: context.peerId});
            break;
        }
    }
});

vk.updates.startPolling().catch(console.log);
