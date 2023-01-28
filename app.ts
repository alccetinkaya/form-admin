const express = require('express');
const app = express();
app.use(express.json());

import { DatabaseService } from './services/database.service';
import { UserService } from './services/user.service';

const PORT = 3000;

const userSvc = new UserService();
const dbSvc = new DatabaseService();

// run the server!
app.listen({ port: PORT }, (err) => {
    if (err) throw err
    console.log(`Server is now listening on ${PORT}`);
})

app.post('/user/create', async (req, res) => {
    let userData = userSvc.getUserData(req.body);
    if (!userData) {
        res.status(401).send("Create user data is invalid!");
        return;
    }

    let rval = await dbSvc.createUser(userData);
    if (!rval) {
        res.status(404).send("User couldn't be created!");
        return;
    }

    res.send("User has successfully created");
})

app.post('/user/login', async (req, res) => {
    let userLoginData = userSvc.getUserLoginData(req.body);
    if (!userLoginData) {
        res.status(401).send("User login data is invalid!");
        return;
    }

    let rval = await dbSvc.loginUser(userLoginData);
    if (!rval) {
        res.status(404).send("User couldn't be logged in!");
        return;
    }

    res.send("User has successfully logged in");
})