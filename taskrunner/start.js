const config = require('./config/config');
const cron = require('node-cron');

const path = require('path');
const TAG = path.basename(__filename);

const mongoose = require('mongoose');
const immutable = require('mongoose-immutable-plugin');
mongoose.plugin(immutable);

const requireDir = require('requiredir');
const uwopendataTasks = requireDir('./uwopendata/tasks');
const logger = require('./config/winston')(TAG);
const fs = require('fs');

mongoose.connect(`${config.db.host}:${config.db.port}/${config.db.name}`, {useNewUrlParser: true, useCreateIndex: true});

mongoose.connection.on('error', () => {
    logger.error('Connection error: unable to connect to uwcourseapi database');
});

// Start scheduling tasks when the database connects
mongoose.connection.once('open', async () => {
    logger.info('Successfully connected to database uwcourseapi');

    if (!fs.existsSync('./uwopendata/data')) {
        fs.mkdirSync('./uwopendata/data');
    }

    await uwopendataTasks.scrape_terms();
    await uwopendataTasks.scrape_courses();
    await uwopendataTasks.scrape_class_schedule();
    await uwopendataTasks.scrape_courses_enrollment();

    // Scrape term list on the 15th day of every month
    cron.schedule('0 0 15 * *', async () => {
        await uwopendataTasks.scrape_terms();
    });

    // Scrape courses on the first day of every 1 month
    cron.schedule('0 0 1 * *', async () => {
        await uwopendataTasks.scrape_courses();
    });

    // Scrape class schedules on the first day of every month
    cron.schedule('0 1 1 * *', async () => {
        await uwopendataTasks.scrape_class_schedule();
    });

    // Scrape enrollment every hour
    cron.schedule('0 * * * *', async () => {
        await uwopendataTasks.scrape_courses_enrollment();
    });
});
