const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../../models/user');
const {Article} = require('./../../models/article');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const articles = [
    {
     _id: new ObjectID(),
    _creatorId: userOneId,
    creator: 'UserOne',
    title: 'Graphene silicon of the future?',
    text: 'Will be graphene material of future ?',
    likes: [],
    comments:[{
        _id: new ObjectID(),
        _creatorId: userOneId,
        creator: 'UserOne',
        text: 'Comment of UserOne',
        createdAt: '7. 7. 2018'
    }]
    },{
    _id: new ObjectID(),
    _creatorId: userTwoId,
    creator: 'UserTwo',
    title: 'Is fusion finaly here ?',
    text: 'Or is it still 20 yeras away.',
    likes: [],
    comments:[]
    }

];

const users = [
    {
        _id: userOneId,
        name: 'UserOne',
        password: 'UserOnePassword',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET)
        }]
    }, {
        _id: userTwoId,
        name: 'UserTwo',
        password: 'UserTwoPassword',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access:'auth'}, process.env.JWT_SECRET)
        }]
    }
]

const populateArticles = async () => {
    try {
        await Article.remove({});
        await Article.insertMany(articles);
    } catch (e) {}
};

const populateUsers = async () => {
    try {
        await User.remove({});
        await new User(users[0]).save();
        await new User(users[1]).save();
    } catch (e) {

    }
};

module.exports = {articles, populateArticles, users, populateUsers}