const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    name:{
        type : String,
        require : true
    },
    gender:{
        type : String,
        required : true
    },
    description:{
        type : String,
        required : true
    },
    moreInfo:{
        type: String,
        required : true
    },
    color:{
        type : String,
        required : true
    },
    pattern:{
        type: String,
        required: true
    },
    productType:{
        type: String,
        required: true
    },
    productCategory:{
        type: String,
        required: true
    },
   
    price:{
        type : Number,
        required : true
    },
    Quantity: {
        type: Object,
        small: {
          type: Number,
        },
        medium: {
          type: Number,
        },
        large: {
          type: Number,
        },
        extraLarge: {
          type: Number,
        },
      },
    isActive: {
        type: Boolean,
        default: true,
        required: true,
      },
    images:[
        { type : String }
    ]
})

//model name: "Product" will be used to turn into a collection name in DB
//"Product" => 'product' + 's' => products
module.exports = mongoose.model('Product',productSchema)