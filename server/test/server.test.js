const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

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
            expect(res.body.article.title).toBe(title);
            expect(res.body.article.text).toBe(text);
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

describe('GET/articles', () => {
    it('should fetch back all articles', (done) => {
        request(app)
        .get('/articles')
        .expect(200)
        .expect((res) => {
            expect(res.body.allArticles.length).toBe(2)
        })
        .end(done);
    });
});

describe('GET/article/:id', () => {
    it('should find article by its id', (done) => {
        let article = articles[0];
        let id = articles[0]._id;

        request(app)
        .get(`/article/${id}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.article.title).toBe(article.title);
        })
        .end(done);
    });

    it('should return 404 if id was not found in any article', (done) => {
        let id = new ObjectID();

        request(app)
        .get(`/article/${id}`)
        .expect(404)
        .end(done);
    });

    it('should return 400 if non-valid id was provided', (done) => {
        let id = 4597;

        request(app)
        .get(`/article/${id}`)
        .expect(400)
        .end(done);
    });
});

describe('DELETE/article/:id', () => {
    it('should delete article by id', (done) => {
        let id = articles[0]._id;
        let article = articles[0];

        request(app) 
        .delete(`/article/${id}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.removedArticle.title).toBe(article.title);
        })
        .end(async (err, res) => {
            if (err) {
                return done(err);
            }

            try {
                const allArticles = await Article.find({});
                expect(allArticles.length).toBe(1);
                done();
            } catch(e) {
                done(e);
            }
        });
    });

    it('should return 404 if id is not matched', (done) => {
        let id = new ObjectID();

        request(app)
        .delete(`/article/${id}`)
        .expect(404)
        .end(done);
    });

    it('should return 400 if non-valid id was provided', (done) => {
        const id = 1236545;

        request(app)
        .delete(`/article/${id}`)
        .expect(400)
        .end(done);

    });
});

describe('PATCH/article/:id', () => {
    it('should update article', (done) => {
        const id = articles[0]._id;
        const article = articles[0];
        const title = 'New title';
        const text = 'New text';

        request(app)
        .patch(`/article/${id}`)
        .send({title, text})
        .expect(200)
        .expect((res) => {
            expect(res.body.updatedArticle.text).not.toBe(article.text);
        })
        .end(done);

    });

    it('should return 404 if id not found', (done) => {
        const id = new ObjectID;

        request(app)
        .patch(`/article/${id}`)
        .expect(404)
        .end(done);
    });

    it('should return 400 if non-valid id was passed', (done) => {
        const id = 1236545;

        request(app)
        .patch(`/article/${id}`)
        .expect(400)
        .end(done);
    });
});

