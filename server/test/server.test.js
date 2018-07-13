const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server'); 
const {Article} = require('./../models/article');
const {articles, populateArticles} = require('./seed/seed');

beforeEach(populateArticles);

describe(' /POST article', () => {
    it('should create arcticle and add it to the db', (done) => {
        let title = 'Klein bottle ?'
        let text = 'Have you already bought it ?'

        request(app)
        .post('/article')
        .send({title, text})
        .expect(200)
        .expect((res) => {
            expect(res.body.title).toBe(title);
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err)
            } 

            Article.find({title, text}).then((article) => {
                expect(article.length).toBe(1);
                expect(article[0].text).toBe(text);
                expect(article[0].title).toBe(title);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create article and add it to the db with invalid data', (done) => {
        let title = 'In this article is only title no text';

        request(app)
        .post('/article')
        .send({title})
        .expect(400)
        .end((err, res) =>{
            if (err){
                return done(err); 
            } 

            Article.find({title}).then((article) => {
                expect(article.length).toBe(0);
                done()
            }).catch ((e) => done(e));
        });
    });
});

describe('GET/ articles', () => {
    it('should fetch back all articles', (done) => {
        request(app)
        .get('/articles')
        .expect(200)
        .expect((res) => {
            expect(res.body.length).toBe(2)
        })
        .end(done);
    });
});

