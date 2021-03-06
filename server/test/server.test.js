const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server'); 
const {User} = require('./../models/user');
const {Article} = require('./../models/article');
const {articles, populateArticles, users, populateUsers} = require('./seed/seed');

beforeEach(populateArticles);
beforeEach(populateUsers);

describe(' /POST article', () => {
    it('should create arcticle and add it to the db', (done) => {
        let title = 'Klein bottle ?';
        let text = 'Have you already bought it ?';
        const createdAt = '2.7.1970';

        request(app)
        .post('/article')
        .set('x-auth', users[0].tokens[0].token)
        .send({title, text, createdAt})
        .expect(200)
        .expect((res) => {
            expect(res.body.article.title).toBe(title);
            expect(res.body.article.text).toBe(text);
            expect(res.body.article.createdAt).toBe(createdAt);
        })
        .end((err, res) => {
            if (err) {
                return done(err)
            } 

            Article.find({title, text}).then((article) => {
                expect(article.length).toBe(1);
                expect(article[0].creator).toBe(users[0].name);
                expect(article[0]._creatorId).toEqual(users[0]._id);
                done();
            }).catch((e) => done(e));
        });
    });

    it('should not create article and add it to the db with invalid data', (done) => {
        let title = 'In this article is only title no text';

        request(app)
        .post('/article')
        .set('x-auth', users[0].tokens[0].token)
        .send({title})
        .expect(400)
        .end((err, res) =>{
            if (err){
                return done(err); 
            } 

            Article.find().then((articles) => {
                expect(articles.length).toBe(2);
                done()
            }).catch ((e) => done(e));
        });
    });

    it('should not create an article if user is unathorized', (done) => {
        request(app)
        .post('/article')
        .set('x-auth', '123456789')
        .expect(401)
        .end(done);
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
        .set('x-auth', users[0].tokens[0].token)
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

    it('should not be possible to delete article of UserTwo while loged in as UserOne', (done) => {
        let id = articles[1]._id;

        request(app) 
        .delete(`/article/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 404 if id is not matched', (done) => {
        let id = new ObjectID();

        request(app)
        .delete(`/article/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 400 if non-valid id was provided', (done) => {
        const id = 1236545;

        request(app)
        .delete(`/article/${id}`)
        .set('x-auth', users[0].tokens[0].token)
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
        const editedAt = '27.2.2018'

        request(app)
        .patch(`/article/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({title, text, editedAt})
        .expect(200)
        .expect((res) => {
            expect(res.body.updatedArticle.text).not.toBe(article.text);
            expect(res.body.updatedArticle.editedAt).toBe(editedAt);
        })
        .end(done);

    });

    it('should not be possible to delete article of UserTwo while loged in as UserOne' , (done) => {
        const id = articles[1]._id;
        const article = articles[0];
        const title = 'New title';
        const text = 'New text';

        request(app)
        .patch(`/article/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({title, text})
        .expect(404)
        .end(done);
    });

    it('should return 404 if id not found', (done) => {
        const id = new ObjectID;

        request(app)
        .patch(`/article/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    it('should return 400 if non-valid id was passed', (done) => {
        const id = 1236545;

        request(app)
        .patch(`/article/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(400)
        .end(done);
    });
});

describe('POST/article/:id/comment', () => {
    it('should post comment if user is authenticated and provide correct id', (done) => {
        const text = 'Testing commenting!';
        const createdAt = '5.1.1970'
        const id = articles[1]._id;

        request(app)
        .post(`/article/${id}/comment`)
        .set('x-auth', users[0].tokens[0].token)
        .send({text, createdAt})
        .expect(200)
        .expect((res) => {
            expect(res.body.comment.text).toBe(text);
            expect(res.body.comment.createdAt).toBe(createdAt);
        })
        .end( async (err, res) => {
            if(err) {
                return done(err);
            }
            try {
                const article = await Article.findById(id);
                expect(article.comments.length).toBe(1);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('should not post comment if id is not correct', (done) => {
        const id = 13254;
        const text = 'This should not work';

        request(app)
        .post(`/article/${id}/comment`)
        .set('x-auth', users[0].tokens[0].token)
        .send(text)
        .expect(400)
        .end(done);
        
    });

    it('should not post comment if id is not matched', (done) => {
        const id = new ObjectID();
        const text = 'This should not work';

        request(app)
        .post(`/article/${id}/comment`)
        .set('x-auth', users[0].tokens[0].token)
        .send(text)
        .expect(404)
        .end(done);
        
    });

    it('should not post comment user is not authenticated', (done) => {
        const id = new ObjectID();
        const text = 'This should not work';

        request(app)
        .post(`/article/${id}/comment`)
        .set('x-auth', '1646516464')
        .send(text)
        .expect(401)
        .end(done);
        
    });
});

describe('POST/user', () => {
    it('should create user', (done) => {
        const name = 'Mike';
        const password = 'mike123';

        request(app) 
        .post('/user')
        .send({name, password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body.user._id).toBeTruthy();
            expect(res.body.user.name).toBe(name)
        })
        .end((err, res) => {
            User.findOne({name}).then((user) => {
                expect(user).toBeTruthy();
                expect(user.password).not.toBe(password);
                done()
            }).catch((e) => done(e));
        });
    });

    it('should not create user if he pass invalid data', (done) => {
        const name = 'Jakub';
        const password = '!';

        request(app) 
        .post('/user')
        .send({name, password})
        .expect(400)
        .end(done);
    });

    it('should not create user if name is alredy in use', (done) =>{
        const name = 'UserOne';
        const password = '123abc';

        request(app)
        .post('/user')
        .send({name, password})
        .expect(400)
        .end(done);
    });
});

describe('POST/user/login', () =>{
    it('should login user if he passed correct data', (done) => {
        const name = 'UserOne';
        const password = 'UserOnePassword';

        request(app)
        .post('/user/login')
        .send({name, password})
        .expect(200)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeTruthy();
            expect(res.body.user._id).toBeTruthy();
            expect(res.body.user.name).toBe(name);
        })
        .end(done); 
    });

    it('should not login user if the password was invalid', (done) => {
        const name = 'UserOne';
        const password = 'WorngPassword';

        request(app)
        .post('/user/login')
        .send({name, password})
        .expect(400)
        .end(done);
    }); 

    it('should not login user if the name was invalid', (done) => {
        const name = 'WorngName';
        const password = 'UserOnePassword';

        request(app)
        .post('/user/login')
        .send({name, password})
        .expect(400)
        .end(done);
    }); 
});

describe('DELETE/user/logout', () => {
    it('should delete token if user is authenticated', (done) => {
        request(app)
        .delete('/user/logout')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(async (err, res) => {
            try {
                const user = await User.findById(users[0]._id);
                expect(user.tokens.length).toBe(0);
                done();
            } catch (e) {
                done(e);
            }
        });
    });
});

describe('DELETE/article/:id/comment/:idOfComment', () => {
    it('should delete comment if user owns that comment', (done) => {
        const id = articles[0]._id;
        const idOfComment = articles[0].comments[0]._id;
        request(app)
        .delete(`/article/${id}/comment/${idOfComment}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end( async (err, res) => {
            try {
                const article = await Article.findById(id);
                expect(article.comments.length).toBe(0);
                done();

            } catch (e) {
                done(e);
            }
        });
    });

    it('should not delete comment if user does not own that comment', (done) => {
        const id = articles[0]._id;
        const idOfComment = articles[0].comments[0]._id;
        request(app)
        .delete(`/article/${id}/comment/${idOfComment}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end( async (err, res) => {
            try {
                const article = await Article.findById(id);
                expect(article.comments.length).toBe(1);
                done();

            } catch (e) {
                done(e);
            }
        });
    });

    it('should return 404 if wrong commentId is provided', (done) => {
        const id = articles[0]._id;
        const idOfComment = new ObjectID();
        request(app)
        .delete(`/article/${id}/comment/${idOfComment}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end( async (err, res) => {
            try {
                const article = await Article.findById(id);
                expect(article.comments.length).toBe(1);
                done();

            } catch (e) {
                done(e);
            }
        });
    });

    it('should return 404 if wrong articleId is provided', (done) => {
        const id = new ObjectID();
        const idOfComment = articles[0].comments[0]._id;
        request(app)
        .delete(`/article/${id}/comment/${idOfComment}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('POST/article/:id/like', () => {
    it('should add like', (done) => {
        const id = articles[1]._id;

        request(app)
        .post(`/article/${id}/like`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(async (err, res) => {
            try {
                const article = await Article.findById(id);
                expect(article.likes.length).toBe(1);
                done();
            } catch (e) {
                done(e)
            }
        });

    });

    it('should not add like if user already liked article', (done) => {
        const id = articles[0]._id;

        request(app)
        .post(`/article/${id}/like`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(400)
        .end(done);
    });

    it('should not add like if id is not matched', (done) => {
        const id = new ObjectID();

        request(app)
        .post(`/article/${id}/like`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('DELETE/article/:id/like', () => {
    it('should delete like', (done) => {
        const id = articles[0]._id;

        request(app)
        .delete(`/article/${id}/like`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .end(async (err, res) => {
            try {
                const article = await Article.findById(id);
                expect(article.likes.length).toBe(0);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('UserTwo should not be able to delete like of UserOne', (done) => {
        const id = articles[0]._id;

        request(app)
        .delete(`/article/${id}/like`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(async (err, res) => {
            try {
                const article = await Article.findById(id);
                expect(article.likes.length).toBe(1);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('should return 404 when there is no like to be deleted', (done) => {
        const id = articles[1]._id;

        request(app)
        .delete(`/article/${id}/like`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

    
    it('should return 404 when article is not found', (done) => {
        const id = new ObjectID;

        request(app)
        .delete(`/article/${id}/like`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
});
