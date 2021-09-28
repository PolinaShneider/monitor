const express = require('express');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const config = require('./config');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const VK_API_URL = 'https://api.vk.com/method/';
const ACCESS_TOKEN = config.ACCESS_TOKEN || '';
const MY_ID = config.MY_ID || '';
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
const files = fs.readdirSync('./images').filter((it) => it.endsWith('.jpeg'));
const TIME = config.PERIOD || 2  * 1000 * 60;
const CHANGE_AVATAR_TIME = config.CHANGE_AVATAR_TIME || 2 * 1000 * 60 * 60;
const audios = [];

let photoToDelete = '';

const VK_ADMIN_TOKEN = config.VK_ADMIN_TOKEN || '';

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
}, TIME);

const preparePhotoForUpload = (fileName) => {
    const formData = new FormData();
    const prefix = (fileName === 'image.jpeg') ? 'resized' : 'images';
    formData.append('photo', fs.createReadStream(`${prefix}/${fileName}`));
    return formData;
};

const deleteOldAvatar = () => {
    if (!photoToDelete) {
        return;
    }

    const DELETE_PHOTO_URL = `${VK_API_URL}photos.delete?access_token=${ACCESS_TOKEN}&v=${API_VER}&owner_id=${MY_ID}&photo_id=${photoToDelete}`;
    axios.get(DELETE_PHOTO_URL).then(({data: {response}}) => {
        if (response) {
            photoToDelete = '';
        }
    })
};

const deleteWallPost = (postId) => {
    const DELETE_POST_URL = `${VK_API_URL}wall.delete?access_token=${ACCESS_TOKEN}&v=${API_VER}&owner_id=${MY_ID}&post_id=${postId}`;
    axios.get(DELETE_POST_URL);
};

const savePhotoID = () => {
    const GET_PHOTO_URL = `${VK_API_URL}users.get?access_token=${ACCESS_TOKEN}&v=${API_VER}&user_ids=${MY_ID}&fields=photo_id`;
    axios.get(GET_PHOTO_URL).then(({data: {response}}) => {
        photoToDelete = response[0]['photo_id'].split('_').pop();
    })
};

const getServerUrl = async () => {
    const avatarWithData = fs.readdirSync('./resized')[0];
    const chosenFile = avatarWithData || files[Math.floor(Math.random() * files.length)];
    const formData = preparePhotoForUpload(chosenFile);

    const SERVER_URL = `${VK_API_URL}photos.getOwnerPhotoUploadServer?access_token=${ACCESS_TOKEN}&v=${API_VER}`;
    const {data: {response}} = await axios.get(SERVER_URL);

    const {data: {photo, hash, server}} = await axios.post(response.upload_url, formData, {
        headers: formData.getHeaders()
    });
    deleteOldAvatar();

    const UPDATE_AVATAR_URL = `${VK_API_URL}photos.saveOwnerPhoto?access_token=${ACCESS_TOKEN}&v=${API_VER}&server=${server}&photo=${encodeURIComponent(photo)}&hash=${hash}`;
    const {data: {response: result}} = await axios.get(UPDATE_AVATAR_URL);
    const {saved, post_id} = result;
    if (saved) {
        deleteWallPost(post_id);
        savePhotoID();
    }
};

setInterval(getServerUrl, CHANGE_AVATAR_TIME);

app.listen(port);

