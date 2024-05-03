const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, "Please provide text"],
    },
    ip: {
        type: String,
        required: [true, "Please provide text"],
    },
    fullName: {
        type: String,
        default: "Anonymous",
    },
    email: {
        type: String,
    },
    publishedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date, default: Date.now }
},{
    timestamps: true,
})

const Comment = mongoose.models.comments || mongoose.model("comments", commentSchema);

module.exports= Comment;