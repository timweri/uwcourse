const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Course Schedule Schema Subdocuments
 */

const CourseScheduleReserveSchema = new Schema({
    reserve_group: {
        type: String,
        required: true,
    },
    enrollment_capacity: {
        type: Number,
    },
    enrollment_total: {
        type: Number,
    },
}, {_id: false});

const ClassScheduleSchema = new Schema({
    date: new Schema({
        start_time: String,
        end_time: String,
        weekdays: String,
        start_date: String,
        end_date: String,
        is_tba: Boolean,
        is_cancelled: Boolean,
        is_closed: Boolean,
    }, {_id: false}),
    location: new Schema({
        building: String,
        room: String,
    }, {_id: false}),
    instructors: [{
        _id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Instructor',
        },
        name: {
            type: String,
            required: true,
        },
    }],
}, {_id: false});

/**
 * Course Schedule Schema
 */

const CourseScheduleSchema = new Schema({
    subject: {
        type: String,
        required: true,
        index: true,
    },
    catalog_number: {
        type: String,
        required: true,
        index: true,
    },
    term_id: {
        type: String,
        index: true,
        required: true,
    },
    class_number: {
        type: String,
        required: true,
        index: true,
    },
    section: {
        type: String,
        required: true,
    },
    campus: {
        type: String,
        required: true,
    },
    enrollment_capacity: {
        type: Number,
    },
    enrollment_total: {
        type: Number,
    },
    waiting_capacity: {
        type: Number,
    },
    waiting_total: {
        type: Number,
    },
    reserves: [CourseScheduleReserveSchema],
    classes: [ClassScheduleSchema],
    note: String,
    updated_at: {
        type: Date,
        required: true,
    },
});

module.exports = mongoose.model('CourseSchedule', CourseScheduleSchema);
