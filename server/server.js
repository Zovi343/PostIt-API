require('./config/config');

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

app.use(bodyParser.json());

app.post('/article', async (req, res) => {
   let currentDate = moment().format('D. M. Y')
    try {
        let newArticle = new Article({
            //_creatorId: new ObjectID(),
            // creator: 'Mike',
            createdAt: currentDate,
            title: req.body.title,
            text: req.body.text,
            likes: [],
            comments:[]
        });

        const article = await newArticle.save();
        res.send({article});
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/articles', async (req, res) => {
    
    try {
        const allArticles = await Article.find();
        res.send({allArticles});
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

app.delete('/article/:id', async (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)){
        return res.status(400).send();
    }

    try{
        const removedArticle = await Article.findOneAndRemove({_id: id});
        
        if (!removedArticle) {
            return res.status(404).send();
        }

        res.send({removedArticle});
    } catch (e) {
        res.status(400).send();
    }
});

// It suppose that you pass both the title and text if not one of them will be null or if you pass empty body both of them will be undefined 
app.patch('/article/:id', async(req, res) => {
    const id = req.params.id;
    const {title, text} = _.pick(req.body, ['title', 'text']);

    if (!ObjectID.isValid(id)){
        return res.status(400).send();
    }

    try {
        const updatedArticle = await  Article.findOneAndUpdate({_id: id}, {title, text}, {new: true});
        if (!updatedArticle) {
            return res.status(404).send()
        }
        res.send({updatedArticle});
    } catch (e) {
        res.status(400);
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

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app}





