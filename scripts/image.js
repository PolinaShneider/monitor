const fs = require('fs');
const gm = require('gm');
const axios = require('axios');
const CronJob = require('cron').CronJob;

const config = require('../config');
const {API_VER, VK_API_URL} = require('./constants');
const {getText} = require('./util');

const ACCESS_TOKEN = config.ACCESS_TOKEN || '';
const MY_ID = config.MY_ID || '';
const ALBUM_ID = config.ALBUM_ID || '';

const downloadImage = async (url, idx) => {
    const response = await axios.get(url, {
        responseType: 'stream',
    });

    try {
        await response.data
            .pipe(fs.createWriteStream(`images/photo-${idx}.jpeg`));
    } catch (e) {
        console.log('error when downloading image')
    }
};

const getUrls = async () => {
    const url = `${VK_API_URL}photos.get?access_token=${ACCESS_TOKEN}&owner_id=${MY_ID}&album_id=${ALBUM_ID}&v=${API_VER}`;
    const photo_ids = await axios.get(url)
        .then(({data: {response}}) => response.items.map((it) => {
            return `${MY_ID}_${it.id}`
        }).join(','));

    const photos_url = `${VK_API_URL}photos.getById?access_token=${ACCESS_TOKEN}&photos=${photo_ids}&v=${API_VER}`;
    return await axios.get(photos_url)
        .then(({data: {response}}) => response).then((result) => {
            return result.map((it) => (it.sizes.find((it) => it.type === 'z')).url);
        }).then((res) => {
            return res.filter(Boolean);
        });

};

const downloadImagesJob = new CronJob('0 */6 * * *', async () => {
    const urls = await getUrls();
    urls.forEach((item, index) => {
        downloadImage(item, index);
    })
}, null, true, 'Europe/Moscow');

const imageMagickJob = new CronJob('0 */12 * * *', async () => {
    const files = fs.readdirSync('./images').filter((it) => it.endsWith('.jpeg'));
    const chosenFile = files[Math.floor(Math.random() * files.length)];
    getText().then((text) => {
        gm(`./images/${chosenFile}`)
            .resize(890, 1000)
            .region(890, 100, 0, 900).colors(1).fill('white').blur(2, 2)
            .font('./font/RobotoBold.ttf', 30)
            .drawText(0, 0, text, "Center")
            .write(`./resized/image.jpeg`, err => {
                if (err) {
                    console.log(err)
                }
            });
    });
}, null, true, 'Europe/Moscow');

module.exports = {
    downloadImagesJob,
    imageMagickJob
};
