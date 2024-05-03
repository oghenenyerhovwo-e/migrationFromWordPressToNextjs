const fs = require('fs');
const xml2js = require('xml2js');


// models and helpers and database
const Article = require('./models/Article');
const User = require('./models/User');
const Comment = require('./models/Comment');
const helpers = require('./helpers');
const connectDB = require('./connectDB');


// configurations
require('dotenv').config();
connectDB()


// functions
const {
    targetArray,
    htmlToString,
    makeSlug,
    filterNicenameValues,
    cleanWordPressContent,
    addImagesToArticleArray,
} = helpers

// const deleteAll = async () => {
//     const deletedComments = await Comment.deleteMany({})
//     const deletedArticles = await Article.deleteMany({})
//     console.log(deletedComments)
//     console.log(deletedArticles)
// }
// deleteAll()


// Read XML file
fs.readFile('exported_content.xml', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Convert XML to JSON
  xml2js.parseString(data, async (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const foundUser = await User.findOne({email: "ndujiheclifford@gmail.com"})

    const articles = result.rss.channel[0].item; // Assuming RSS format
    const articlesWithContent = articles.filter(article => article["content:encoded"][0])
    const articlesWithImg = articles.filter(article => article["wp:attachment_url"])
    const mappedArticles = addImagesToArticleArray(articlesWithContent, articlesWithImg)

    // Iterate through articles and save to MongoDB
    for (const articleData of mappedArticles) {
        const articleComments = []
        if (articleData['wp:comment']) {
            const comments = articleData['wp:comment'].map(comment => {
                return {
                text: comment["wp:comment_content"] && comment["wp:comment_content"][0],
                email: comment["wp:comment_author_email"] && comment["wp:comment_author_email"][0],
                fullName: "Anonymous",
                ip: comment["wp:comment_author_IP"] && comment["wp:comment_author_IP"][0],
                publishedDate: (comment["wp:comment_date"] && comment["wp:comment_date"][0]) || new Date(),
                modifiedDate: (comment["wp:comment_date"] && comment["wp:comment_date"][0]) || new Date(),
                };
            });

            for (const comment of comments) {
                try {
                    const newComment = new Comment({ ...comment });
                    const savedComment = await newComment.save();
                    articleComments.push(savedComment._id);
                } catch (error) {
                    console.error("Error saving comment:", error);
                }
            }
        }

        const defaultUrl = "https://res.cloudinary.com/dwxmqcikz/image/upload/v1714616464/thetruthblog/news_article_1_vgem2c.jpg"
        let uploadUrl;
        const imageUrl = articleData['wp:attachment_url'] && articleData['wp:attachment_url'][0];
        if(imageUrl){
            const data = new FormData();
            data.append("file", imageUrl);
            data.append(
                "upload_preset",
                process.env.CLOUDINARY_PRESET_NAME
            );
            data.append("cloud_name", process.env.CLOUDINARY_CLOUD_NAME);
            data.append("folder", "thetruthblog");

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: data,
                    }
                );
                const res = await response.json();
                uploadUrl = res.secure_url
            } catch (error) {
                console.log(error)
            }
        }

        let articleCategory = []
        if(!articleData.category){
            articleCategory = ["News"]
        } else {
            articleCategory = filterNicenameValues(articleData.category[0], targetArray)
        }

        const cleanedContent = cleanWordPressContent(articleData['content:encoded'][0])
        
        try {
            const newArticle = new Article({
                title: articleData.title[0],
                slug: makeSlug(articleData.title[0]), // You'll need to define generateSlug function
                headline: (articleData["content:encoded"] && articleData["excerpt:encoded"][0]) || htmlToString(cleanedContent), // Assuming you have a "headline" field in your XML/JSON
                category: articleCategory,
                author: foundUser._id,
                content: cleanedContent,
                image: uploadUrl || defaultUrl,
                comments: articleComments,
                publishedDate: (articleData["pubDate"] && articleData["pubDate"][0]) || new Date(),
                modifiedDate: (articleData["post_modified"] && articleData["post_modified"][0]) || new Date(),
            });

            await newArticle.save();
            console.log('Article saved:', newArticle.title);
        } catch (err) {
            console.error('Error saving article:', err);
        }
    }
  });
});

// const searchResult = async () => {
//     const allArticles = await Article.find({})
//     const allArticlesWithPlaceHolderImage = await Article.find({image: "https://res.cloudinary.com/dwxmqcikz/image/upload/v1714616464/thetruthblog/news_article_1_vgem2c.jpg"})
//     console.log("allArticles.length")
//     console.log(allArticles.length)
//     console.log("allArticlesWithPlaceHolderImage.length")
//     console.log(allArticlesWithPlaceHolderImage.length)
// }
// searchResult()