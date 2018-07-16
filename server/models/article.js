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
}

ArticleSchema.methods.deleteComment = function (_id, _creatorId) {
    const article = this;
    
    return article.update({
        $pull:{
            comments: {_id, _creatorId}
        }
    });
};

const Article = mongoose.model('Articles', ArticleSchema);


module.exports = {Article}


// Testing Article
// let test = new Article({
//     _creatorId: new ObjectID(),
//     creator: 'Mike',
//     title: 'Testing Article',
//     text: 'Test',
//     createdAt: 123,
//     likes: [],
//     comments:[{
//         _id: new ObjectID(),
//         _creatorId: new ObjectID (),
//         creator: 'Cliff',
//         text: 'test',
//         createdAt: 321
//     }]
// })

// test.save().then((doc) => {
//     console.log('Saved article', doc);
// }).catch ((e) => {
//     console.log('Error:', e);
// });