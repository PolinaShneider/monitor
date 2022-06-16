const fs = require('fs');
const gm = require('gm');
const axios = require('axios');
const CronJob = require('cron').CronJob;

const config = require('../config');
const {API_VER, VK_API_URL} = require('./constants');
const {getStatusText} = require('./status');

const ACCESS_TOKEN = config.ACCESS_TOKEN || '';
const MY_ID = config.MY_ID || '';
const ALBUM_ID = config.ALBUM_ID || '';

const SIZES = {
    width: 960,
    height: 1280,
};

const downloadImage = async (url, idx) => {
    const response = await axios.get(url, {
        responseType: 'stream',
    });

    try {
        await response.data
            .pipe(fs.createWriteStream(`./images/photo-${idx}.jpeg`));
    } catch (e) {
        console.log('error when downloading image')
    }
};

const getUrls = async () => {
    await getProfilePhotoSize();
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

const getProfilePhotoSize = async () => {
    const photos_url = `${VK_API_URL}users.get?access_token=${ACCESS_TOKEN}&fields=photo_id&v=${API_VER}`;
    axios.get(photos_url).then(({data}) => {
        return data.response[0].photo_id;
    }).then(res => {
        const profile_url = `${VK_API_URL}photos.getById?access_token=${ACCESS_TOKEN}&photo_sizes=1&photos=${res}&v=${API_VER}`;
        return axios.get(profile_url)
    }).then(({data}) => {
        const sizes = data.response[0].sizes;
        const {width, height} = sizes.reduce((total, item) => {
            if (item.height > total.height) {
                total.height = item.height;
                total.width = item.width;
            }
            return total;
        }, {
            width: 0,
            height: 0
        });

        SIZES.width = width;
        SIZES.height = height;
    })
};

const imageMagick = async (cb) => {
    const files = fs.readdirSync('./images').filter((it) => it.endsWith('.jpeg'));
    const chosenFile = files[Math.floor(Math.random() * files.length)];
    const text = await getStatusText();

    gm(`./images/${chosenFile}`)
        .resize(SIZES.width, SIZES.height)
        .region(SIZES.width, 100, 0, SIZES.height - 100).colors(1).fill('white').blur(2, 2)
        .font('./font/RobotoBold.ttf', 30)
        .drawText(0, 0, text, "Center")
        .write(`./resized/image.jpeg`, err => {
            if (err) {
                console.log(err)
            } else {
                cb();
            }
        });
};


const downloadImagesJob = new CronJob('0 0 */6 * * *', async () => {
    const urls = await getUrls();
    urls.forEach((item, index) => {
        downloadImage(item, index);
    })
}, null, true, 'Europe/Moscow');

getUrls().then((urls) => {
    urls.forEach(async (item, index) => {
        await downloadImage(item, index);
    });
    return true;
}).then(() => {
    imageMagick(() => {console.log('done preparing the image')}).then();
});

const imageMagickJob = new CronJob('*/2 * * * *', async () => {
    await imageMagick(() => {console.log('has created new avatar')});
}, null, true, 'Europe/Moscow');


module.exports = {
    imageMagickJob,
    downloadImagesJob
};
