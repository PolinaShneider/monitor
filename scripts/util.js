const plural = require('plural-ru');
const moment = require('moment');
const axios = require('axios');
const config = require('../config');

const getWeather = async () => {
    const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
    const WEATHER_TOKEN = config.WEATHER_TOKEN || "";
    const CITY = "Saint Petersburg, RU";
    const {data} = await axios.get(`${WEATHER_API_URL}?q=${CITY}&APPID=${WEATHER_TOKEN}`);
    const rawWeather = data.weather[0].main;
    return rawWeather ? `:${rawWeather.toLowerCase()}` : ':unknown';
};

const getText = async () => {
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

    const lastUpdatedText = moment().format('DD.MM.YYYY в HH:mm');

    const weather = await getWeather();

    return `Обновлено: ${lastUpdatedText} | Погода в СПБ — ${weather}`;
};

module.exports = {
  getWeather,
  getText,
};
