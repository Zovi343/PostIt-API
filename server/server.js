const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser')
const moment = require('moment')

const {Article} = require('./models/article');
const {mongoose} = require('./db/mongoose')

const app = express();

app.use(bodyParser.json());

app.post('/article',  async (req, res) => {
   let currentDate =parseInt(moment().format('DMY'))
    try {
        let article = new Article({
            //_creatorId: new ObjectID(),
            // creator: 'Mike',
            createdAt: currentDate,
            title: req.body.title,
            text: req.body.text,
            likes: [],
            comments:[]
        });

        const doc = await article.save();
        res.send(doc);
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/articles', async (req, res) => {
    
    try {
        const allArticles = await Article.find();
        res.send(allArticles);
    } catch (e) {
        res.status(400);
    }
});


app.listen(3000, () => {
    console.log(`Started on port 3000`);
});

module.exports = {app}





