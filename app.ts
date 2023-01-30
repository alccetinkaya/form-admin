const express = require('express');
const app = express();
app.use(express.json());

import { DatabaseService } from './services/database.service';
import { FormService } from './services/form.service';
import { UserService } from './services/user.service';

const PORT = 3000;

const dbSvc = new DatabaseService();
const userSvc = new UserService(dbSvc);
const formSvc = new FormService(dbSvc, userSvc);

// run the server!
app.listen({ port: PORT }, (err) => {
    if (err) throw err
    console.log(`Server is now listening on ${PORT}`);
})

app.post('/user/create', async (req, res) => {
    let resp = await userSvc.create(req.body);
    res.status(resp.statusCode).send(resp.message);
})

app.post('/user/login', async (req, res) => {
    let resp = await userSvc.login(req.body);
    res.status(resp.statusCode).send(resp.message);
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