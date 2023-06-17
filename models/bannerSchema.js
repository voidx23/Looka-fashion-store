const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imgName: [{
        type: String,
        required: true
    }],
    currentBanner: {
        type: Boolean,
        required: true,
        default: false
    }
},
    {
        timestamps: true,
        collection: 'banners'
    })

module.exports = mongoose.model('Banner', bannerSchema)