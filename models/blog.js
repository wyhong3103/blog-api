const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    body : {
        type : String,
        required : true
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required :true
    },
    date : {
        type : Date,
        required : true
    },
    comments : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Comment'
        }
    ]
})

module.exports = mongoose.model('Blog', blogSchema);
