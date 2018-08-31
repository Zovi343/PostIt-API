require('./config/config');

const cors = require('cors');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const _ = require('lodash');

const {authenticate} = require('./middleware/authenticate')
const {User} = require('./models/user');
const {Article} = require('./models/article');
const {mongoose} = require('./db/mongoose');

const app = express();
const port = process.env.PORT;

const corsOptions = { // from here is solution https://github.com/axios/axios/issues/746
    origin: ['http://localhost:8080', 'https://postit-right-now.herokuapp.com'],
    allowedHeaders: ['Accept-Version', 'Authorization', 'Credentials', 'Content-Type', 'x-auth'],
    exposedHeaders: ['x-auth'],
}
  
app.all('*', cors(corsOptions))

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('<h1> PostIt-API </h1><p>You can make varios requests to this API and that way store things into DB, but of course you need to have permission first, which you can get from Jakub Zovak ;) email: jakub.zovak343@gmail.com.</p>')
})

app.post('/article', authenticate, async (req, res) => {
    try {
        let newArticle = new Article({
            _creatorId: req.user._id,
            creator: req.user.name,
            createdAt: req.body.createdAt,
            text: req.body.text,
            title: req.body.title
        });

        const article = await newArticle.save();
        res.send({article});
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/articles', async (req, res) => {
    
    try {
        const unsortedArticles = await Article.find();
        const sortedArticles = unsortedArticles.sort((a, b) => {
            return moment(a.createdAt, 'D.M.Y').valueOf() < moment(b.createdAt, 'D.M.Y').valueOf() ? 1 : -1;
        });
        res.send({sortedArticles});
    } catch (e) {
        res.status(400);
    }
});

app.get('/article/:id', async (req, res) => {
    const id = req.params.id;
    
    if (!ObjectID.isValid(id)){
        return res.status(400).send();
    }

    try {
        const article = await Article.findById(id);
        if (!article) {
            return res.status(404).send();
        }
        res.send({article});
    } catch (e) {
        res.status(400).send();
    }
});

app.delete('/article/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    const _creatorId = req.user._id;

    if (!ObjectID.isValid(_id)){
        return res.status(400).send();
    }

    try{
        const removedArticle = await Article.findOneAndRemove({_id, _creatorId});
        
        if (!removedArticle) {
            return res.status(404).send();
        }

        res.send({removedArticle});
    } catch (e) {
        res.status(400).send();
    }
});

// It suppose that you pass both the title and text if not one of them will be null or if you pass empty body both of them will be null 
app.patch('/article/:id', authenticate, async(req, res) => {
    const _id = req.params.id;
    const _creatorId = req.user._id;
    const {title, text, editedAt} = _.pick(req.body, ['title', 'text', 'editedAt']);

    if (!ObjectID.isValid(_id)){
        return res.status(400).send();
    }

    try {
        const updatedArticle = await  Article.findOneAndUpdate({_id, _creatorId}, {title, text, editedAt}, {new: true});
        if (!updatedArticle) {
            return res.status(404).send()
        }
        res.send({updatedArticle});
    } catch (e) {
        res.status(400);
    }

});

app.post('/article/:id/comment', authenticate, async (req, res) => {
    const _id = req.params.id;
    const text = req.body.text;
    const createdAt = req.body.createdAt;

    if (!ObjectID.isValid(_id)){
        return res.status(400).send();
    }

    const comment = {
        _id: new ObjectID(),
        _creatorId: req.user._id,
        creator: req.user.name,
        text,
        createdAt
    }
    try {
        const article = await Article.findById(_id);
        await article.commentArticle(comment);
        res.send({comment});
    } catch(e) {
        res.status(404).send();
    }
});

app.delete('/article/:id/comment/:idOfComment', authenticate, async(req, res) =>{
    const _id = req.params.id;
    const _idOfComment = req.params.idOfComment;
    const _creatorId = req.user._id;

     if (!ObjectID.isValid(_id)){
        return res.status(400).send();
    }
    if (!ObjectID.isValid(_idOfComment)){
        return res.status(400).send();
    }

    try {
        const article = await Article.findById(_id);
        if (!article) {
            throw new Error;
        }
    
        await article.deleteComment(_idOfComment, _creatorId);
        res.send();
    } catch (e) {
        res.status(404).send();
    }
        
});

app.post('/article/:id/like', authenticate, async (req, res) => {
    const _id = req.params.id;
    const _creatorId = req.user._id;

    if (!ObjectID.isValid(_id)){
        return res.status(400).send();
    }

    try {
        const likeExist = await Article.findOne({_id, likes: _creatorId})
        if (likeExist) {
            return res.status(400).send();
        }
        const article = await Article.findById(_id);
        await article.addLike(_creatorId);
        res.send();
    } catch (e) {
        res.status(404).send();
    }
});

app.delete('/article/:id/like', authenticate, async (req, res) => {
    const _id = req.params.id;
    const _creatorId = req.user._id;

    if (!ObjectID.isValid(_id)){
        return res.status(400).send();
    }


    try {
        const article = await Article.findById(_id);
        await article.deleteLike(_creatorId);
        res.send();
    } catch (e) {
        res.status(404).send();
    }

});

app.post('/user', async (req, res) => {
    try {
        const body = _.pick(req.body, ['name', 'password']);
        const user = new User(body);
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send({user});

    } catch (e) {
        res.status(400).send();
    }
});

app.post('/user/login', async (req, res) => {
    const body = _.pick(req.body, ['name', 'password']);
    try {
        const user = await User.findByCredentials(body.name, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send({user});
    } catch (e) {
        res.status(400).send();
    }
});

//there is no test case for this route
app.get('/user/me', authenticate, (req, res) => {
    res.status(200).send({user: req.user})
})

app.delete('/user/logout', authenticate, async (req, res) => {
    try {  
        await req.user.removeToken(req.token);
        res.status(200).send();
    }catch (e) {
        res.status(400).send();
    }
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app}




