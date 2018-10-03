# PostIt-API

This is an API which I built with Nodejs, Express, MongoDB, Mongose, JSON Web Token. I also wrote tests for it with Mocha.
You can make various requests on this API and that way manage data in the database, I am actually using it with my another project PostIt-App which you can find also in my repository.

### Installing

```
1. install dependencies:
    npm install
    
2. start your MongoDB

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

    Note that your MongoDB can start on diffrent host than localhost:27017!

3. run script:
    npm start
```

## Running the tests

npm test or npm test-watch
