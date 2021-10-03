const axios = require('axios');
const CronJob = require('cron').CronJob;

const {API_VER, CITATIONS, VK_API_URL} = require('./constants');
const config = require('../config');
const VK_ADMIN_TOKEN = config.VK_ADMIN_TOKEN || '';
const ACCESS_TOKEN = config.ACCESS_TOKEN || '';
const audios = [];

const getAudios = () => {
    const url = `${VK_API_URL}audio.get?access_token=${VK_ADMIN_TOKEN}&v=${API_VER}`;
    axios.get(url)
        .then(({data: {response}}) => {
            response.items.forEach((it) => {
                if (it.ads) {
                    audios.push(it.ads.content_id)
                }
            });
            console.log(`Got ${audios.length} audios`);
        })
        .catch(error => {
            // handle error
            console.log(error);
        });
};

getAudios();

const getRandomTrack = () => {
    const idx = Math.floor(Math.random() * audios.length);
    return audios[idx] || '257580685_456239222';
};

const getTextStatus = () => {
    return CITATIONS[Math.floor(Math.random() * CITATIONS.length)];
};

const changeStatus = () => {
    const url = `${VK_API_URL}status.set?access_token=${ACCESS_TOKEN}&v=${API_VER}&text=${encodeURIComponent(getTextStatus())}`;
    const musicUrl = `${VK_API_URL}status.set?access_token=${ACCESS_TOKEN}&v=${API_VER}&audio=${getRandomTrack()}`;
    const targetUrl = Math.random() > 0.5 ? url : musicUrl;
    axios.get(targetUrl)
        .then(function ({data: {response}}) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
};

const getAudiosJob = new CronJob('0 */6 * * *', async () => {
    getAudios();
}, null, true, 'Europe/Moscow');

const changeStatusJob = new CronJob('*/2 * * * * *', async () => {
    changeStatus();
}, null, true, 'Europe/Moscow');

module.exports = {
    getAudiosJob,
    changeStatusJob,
};
