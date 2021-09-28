const fs = require('fs'), gm = require('gm');
const plural = require('plural-ru');
const axios = require('axios');
const config = require('./config');

const files = fs.readdirSync('./images').filter((it) => it.endsWith('.jpeg'));
const TIME = config.GENERATE_IMAGE_TIME || 1000 * 60 * 2;

setInterval(() => {
    const chosenFile = files[Math.floor(Math.random() * files.length)];
    getText().then((text) => {
        gm(`./images/${chosenFile}`)
            .resize(890, 1000)
            .region(890, 100, 0, 900).colors(1).fill("white").blur(2,2)
            .font("./font/RobotoBold.ttf", 30)
            .drawText(0, 0, text, "Center")
            .write(`./resized/image.jpeg`, function (err) {
                if (err) {
                    console.log(err)
                }
            });
    });
}, TIME);

async function getWeather() {
    const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const WEATHER_TOKEN = config.WEATHER_TOKEN || "";
    const CITY = "Saint Petersburg, RU";
    const {data} = await axios.get(`${WEATHER_API_URL}?q=${CITY}&APPID=${WEATHER_TOKEN}`);
    const rawWeather = data.weather[0].main;
    return rawWeather ? `:${rawWeather.toLowerCase()}` : ':unknown';
}

async function getText() {
    const nowDate = new Date();
    const nextYear = nowDate.getFullYear() + 1;

    const targetDate = new Date();
    targetDate.setFullYear(nextYear, 0, 1);

    const diff = Math.floor((targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));

    const days = plural(
        diff,
        'день',
        'дня',
        'дней'
    );

    const weather = await getWeather();

    return `До Нового Года ${diff} ${days} | Погода в СПБ — ${weather}`;
}
