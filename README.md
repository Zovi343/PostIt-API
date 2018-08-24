# PostIt-API

This is a API which I built using Nodejs, Express, MongoDB, Mongose, JSON Web Token. I also wrote tests for it with Mocha.
You can make various CRUD requests on this API, I am actually using it with my another project PostIt-App which you can find also in my repository.

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
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
```

## Running the tests

npm test or npm test-watch
