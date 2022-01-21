const config = require('../config');
const {BOT_TOKEN = '', MARKET_TOKEN = '', OWNER_ID} = config;

const {VK, Attachment, AttachmentType, API} = require('vk-io');

const vk = new VK({
    token: BOT_TOKEN
});

const api = new API({
    token: MARKET_TOKEN,
});

vk.updates.on('message_new', async (context) => {
    switch (context.text) {
        case '/start': {
            await context.send(`что я умею:
            
		/cat - Коську мне
		/music - Песню мне 
		/goods — Показать товары
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
        case '/goods': {
            const goods = await api.market.get({
                owner_id: OWNER_ID,
            });
            await Promise.all([
                context.send('В наличии есть немножко магии'),

                goods.items.forEach((item) => {
                    context.send(`ID товара ${item.id}`, {
                        attachment: new Attachment({
                            type: AttachmentType.MARKET,
                            api,
                            payload: {
                                id: item.id,
                                owner_id: item.owner_id,
                            }
                        })
                    })
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
