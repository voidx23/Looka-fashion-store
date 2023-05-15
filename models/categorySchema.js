const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const categorySchema = new Schema({
  categoryname: {
    type: String,
    required: true,
    unique: true,
  },
 
  values: {
    type: String,
    required: true,
  },
  isListed: {
    type: Boolean,
    default: true,
    required: true,
  },
});

module.exports = mongoose.model("category", categorySchema);
