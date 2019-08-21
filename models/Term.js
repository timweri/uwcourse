const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Term Schema
 */

const TermSchema = new Schema({
    next: {
        type: Schema.Types.ObjectId,
        ref: 'Term',
        default: null,
    },
    previous: {
        type: Schema.Types.ObjectId,
        ref: 'Term',
        default: null,
    },
    uw_term_id: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    season: {
        type: String,
        required: true,
        enum: {
            values: ['Spring', 'Fall', 'Winter'],
        },
    },
    updated_at: {
        type: Date,
        default: new Date(),
    },
    created_at: {
        type: Date,
        immutable: true,
        default: new Date(),
    },
});

module.exports = mongoose.model('Term', TermSchema);
