const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide a title"],
        unique: true,
    },
    slug: {
        type: String,
        required: [true, "Please provide a title"],
        unique: true,
    },
    headline: {
        type: String,
        required: [true, "Please provide a headline"],
    },
    category: {
        type: Array,
        required: [true, "Article must have category(s)"],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "An Article must have an author"],
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments",
    }],
    content: {
        type: String,
        required: [true, "Article must have content"],
    },
    image: {
        type: String,
        required: [true, "Article must have an image"],
    },
    source: {
        type: String,
    },
    tags: {
        type: String,
    },
    publishedDate: { type: Date, default: Date.now },
    modifiedDate: { type: Date, default: Date.now }
},{
    timestamps: true,
})

const Article = mongoose.models.articles || mongoose.model("articles", articleSchema);

module.exports= Article;