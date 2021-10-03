const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const CronJob = require('cron').CronJob;

const config = require('../config');
const {API_VER, VK_API_URL} = require('./constants');
const {imageMagick} = require('./image');

const ACCESS_TOKEN = config.ACCESS_TOKEN || '';
const MY_ID = config.MY_ID || '';

let photoToDelete = '';

const preparePhotoForUpload = (fileName) => {
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(`resized/${fileName}`));
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

const updateAvatar = async () => {
    const avatarWithData = fs.readdirSync('./resized')[0];
    const formData = preparePhotoForUpload(avatarWithData);

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

const updateAvatarJob = new CronJob('30 0 */6 * * *', async () => {
    await imageMagick();
    await updateAvatar();
}, null, true, 'Europe/Moscow');

module.exports = {
    updateAvatarJob,
};
