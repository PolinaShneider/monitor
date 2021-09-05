const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const VK_API_URL = 'https://api.vk.com/method/';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';
const API_VER = 5.131;
const CITATIONS = [
    'За решёткой есть жизнь, и на кладбище есть плюсы',
    '2^16 способов отстрелить себе конечности',
    'Отладка даёт представление о вечности',
    'Дивергенция ротора и ротор дивергенции',
    'Перепрошью икс-бокс, утюг чугунный и стиралку',
    'Главный архитектор делает пуш',
    'Если есть реквест, то я найду респонс'
];
const TIME = 2  * 1000 * 60;
const audios = [];

const VK_ADMIN_TOKEN = process.env.VK_ADMIN_TOKEN || '';

const getAudios = () => {
    const url = `${VK_API_URL}audio.get?access_token=${VK_ADMIN_TOKEN}&v=${API_VER}`;
    axios.get(url)
        .then(function ({data: {response}}) {
            response.items.forEach((it) => {
                if (it.ads) {
                    audios.push(it.ads.content_id)
                }
            });
            console.log(`Got ${audios.length} audios`);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
};

const getRandomTrack = () => {
    const idx = Math.floor(Math.random() * audios.length);
    return audios[idx] || '257580685_456239222';
};

const getTextStatus = () => {
    return CITATIONS[Math.floor(Math.random() * CITATIONS.length)];
};

getAudios();

setInterval(() => {
    const url = `${VK_API_URL}status.set?access_token=${ACCESS_TOKEN}&v=${API_VER}&text=${encodeURIComponent(getTextStatus())}`;
    const musicUrl = `${VK_API_URL}status.set?access_token=${ACCESS_TOKEN}&v=${API_VER}&audio=${getRandomTrack()}`;
    const targetUrl = Math.random() > 0 ? url : musicUrl;
    axios.get(targetUrl)
        .then(function ({data: {response}}) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
}, TIME);

app.listen(port);

