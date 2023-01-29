const express = require('express');
const app = express();
app.use(express.json());

import { DatabaseService } from './services/database.service';
import { FormService } from './services/form.service';
import { UserService } from './services/user.service';

const PORT = 3000;

const userSvc = new UserService();
const dbSvc = new DatabaseService();
const formSvc = new FormService(dbSvc, userSvc);

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

app.post('/form/create', async (req, res) => {
    let resp = await formSvc.createForm(req.body);
    res.status(resp.statusCode).send(resp.message);
})

app.put('/form/update', async (req, res) => {
    let resp = await formSvc.updateForm(req.body);
    res.status(resp.statusCode).send(resp.message);
})

app.delete('/form/delete', async (req, res) => {
    let resp = await formSvc.deleteForm(req.body);
    res.status(resp.statusCode).send(resp.message);
})

app.get('/form/view', async (req, res) => {
    let resp = await formSvc.viewForm(req.body);
    res.status(resp.statusCode).send(resp.message);
})