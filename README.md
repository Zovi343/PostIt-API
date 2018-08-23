# PostIt-API

This is simple API which I built using Nodejs, Express, MongoDB, Mongose, JSON Web Token. I also wrote whole test suite for it with Mocha.
You can make various CRUD requests on this API, I am actually using it with my another project PostIt-App which you can find also in my repository.

# How to use it 

1. install dependencies:
    npm install

2. create config.json in config folder, it should look like this: 
    {
    "test": {
        "PORT": 3000,
        "MONGODB_URI": "mongodb://localhost:27017/PostItAppTest",
        "JWT_SECRET": "Some secrete"
    },
    "development": {
        "PORT": 3000,
        "MONGODB_URI": "mongodb://localhost:27017/PostItApp",
        "JWT_SECRET": "Another Secret"
        }
    }

3. run script:
    npm start

