const {imageMagickJob, downloadImagesJob} = require('./image');
const {changeStatusJob, getAudiosJob} = require('./status');
require('./bot');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

/**
 * Start jobs
 */
downloadImagesJob.start();
imageMagickJob.start();
changeStatusJob.start();
getAudiosJob.start();


app.listen(port);

