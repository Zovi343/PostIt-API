const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


var ArticleSchema = new mongoose.Schema({
    _creatorId: {
        type: ObjectId,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    title:{
        type: String,
        trim: true,
        required: true,
        minlength: 3
    },
    text: {
        type: String,
        trim: true,
        required: true
    },
    createdAt: {
        type: String,
        default: null,
        required: true
    },
    editedAt: {
        type: String,
        default: null
    },
    likes: [],
    comments: [{
        _creatorId:{
            type: ObjectId,
            required: true
        },
        creator:{
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: String,
            required: true,
            default: null
        }

    }]
});

ArticleSchema.methods.commentArticle = function (comment) {
    const article = this;

    return article.update({
        $push:{
            comments: comment
        }
    });
};

ArticleSchema.methods.deleteComment = async function (_id, _creatorId) {
    let article = this;
    
    try {
        const numOfComments = article.comments.length;

        await article.update({
            $pull:{
                comments: {_id, _creatorId}
            }
        });
        
        article = await Article.findById(article._id);

        if (numOfComments === article.comments.length){
            throw new Error;
        }

        return Promise.resolve();
    } catch (e) {
        return Promise.reject();
    }

};

ArticleSchema.methods.addLike = function (_creatorId) {
    const article = this;

    return article.update({
        $push: {
            likes: _creatorId
        }
    });
};

ArticleSchema.methods.deleteLike = async function (_creatorId) {
    let article = this;
    
    try {
        const numOfLikes = article.likes.length;

        await article.update({
            $pull:{
                likes: _creatorId
            }
        });
        
        article = await Article.findById(article._id);

        if (numOfLikes === article.likes.length){
            throw new Error;
        }

        return Promise.resolve();
    } catch (e) {
        return Promise.reject();
    }
}

const Article = mongoose.model('Articles', ArticleSchema);


module.exports = {Article}
