const approot = require('app-root-path');
const TAG = __filename.slice(__dirname.length + 1, -3);
const logger = require(`${approot}/config/winston`)(TAG);
const config = require(`${approot}/config/config`);
const Course = require(`${approot}/models/Course`);
const buildErrorResponse = require(`${approot}/controllers/utils/build_error_response`);
const parseComparisonOpt = require(`${approot}/controllers/utils/parse_comparison_opt`);
const parseLimit = require(`${approot}/controllers/utils/parse_limit`);

module.exports = async (req, res, next) => {
    try {
        logger.setId(req.id);

        const {subject, catalog_number, cursor} = req.query;
        let {limit, keywords} = req.query;

        limit = parseLimit(limit);

        const queryObj = {};

        if (cursor) {
            queryObj._id = {$lt: cursor};
        }

        if (keywords) {
            keywords = keywords.toLowerCase().split(' ');
            const $and = [];
            for (const keyword of keywords) {
                $and.push({keywords: {$regex: `^${keyword}`}});
            }
            queryObj.$and = $and;
        }

        if (subject) {
            queryObj.subject = subject;
        }

        parseComparisonOpt(catalog_number, 'catalog_number', queryObj);

        const courses = await Course.find(queryObj).sort({'liked_rating.count': -1}).limit(limit);
        const response = {
            data: courses,
        };

        if (courses.length > 0) {
            response.cursor = courses[courses.length - 1]._id;
        }

        logger.info('Returning 200');
        res.status(200)
            .send(response);
    } catch (err) {
        if (err.name === 'CastError' && err.kind === 'ObjectId') {
            return next(buildErrorResponse('INVALID_OBJECT_ID', 400));
        }
        next(err);
    }
};
