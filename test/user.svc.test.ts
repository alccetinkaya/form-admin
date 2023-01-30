import test from 'ava';
import { UserData, UserRoleID } from '../models/user.data.model';
import { DatabaseService, DatabaseSvcInterface } from '../services/database.service';
import { UserDataKeys, UserService, UserSvcInterface } from '../services/user.service';

const dbSvc: DatabaseSvcInterface = new DatabaseService();
const userSvc: UserSvcInterface = new UserService(dbSvc);

const adminUser: UserData = {
    firstName: "userSvcTest",
    lastName: "admin",
    email: "userSvcTest@admin",
    password: "test",
    role: UserRoleID.ADMIN
}

test.serial('createUserInvalidData', async t => {
    let obj = {};

    // check empty object
    let resp = await userSvc.create(obj);
    t.deepEqual(resp.status, false);

    // check invalid first name
    obj[UserDataKeys.FIRST_NAME] = 123;
    resp = await userSvc.create(obj);
    t.deepEqual(resp.status, false);
    obj[UserDataKeys.FIRST_NAME] = adminUser.firstName;

    // check invalid last name
    obj[UserDataKeys.LAST_NAME] = 1234;
    resp = await userSvc.create(obj);
    t.deepEqual(resp.status, false);
    obj[UserDataKeys.LAST_NAME] = adminUser.lastName;

    // check invalid email
    obj[UserDataKeys.EMAIL] = 123;
    resp = await userSvc.create(obj);
    t.deepEqual(resp.status, false);
    obj[UserDataKeys.EMAIL] = adminUser.email;

    // check invalid password
    obj[UserDataKeys.PASSWORD] = {};
    resp = await userSvc.create(obj);
    t.deepEqual(resp.status, false);
    obj[UserDataKeys.PASSWORD] = adminUser.password

    //check invalid role
    obj[UserDataKeys.ROLE] = 123;
    resp = await userSvc.create(obj);
    t.deepEqual(resp.status, false);
    obj[UserDataKeys.ROLE] = "123";
    resp = await userSvc.create(obj);
    t.deepEqual(resp.status, false);
});

test.serial('createUser', async t => {
    let obj = {};
    obj[UserDataKeys.FIRST_NAME] = adminUser.firstName;
    obj[UserDataKeys.LAST_NAME] = adminUser.lastName;
    obj[UserDataKeys.EMAIL] = adminUser.email;
    obj[UserDataKeys.PASSWORD] = adminUser.password;
    obj[UserDataKeys.ROLE] = "Admin";
    let resp = await userSvc.create(obj);
    t.deepEqual(resp.status, true);
});

test.serial('recreateUser', async t => {
    let obj = {};
    obj[UserDataKeys.FIRST_NAME] = adminUser.firstName;
    obj[UserDataKeys.LAST_NAME] = adminUser.lastName;
    obj[UserDataKeys.EMAIL] = adminUser.email;
    obj[UserDataKeys.PASSWORD] = adminUser.password;
    obj[UserDataKeys.ROLE] = "Admin";
    let resp = await userSvc.create(obj);
    t.deepEqual(resp.status, false);
});

test.serial('loginUser', async t => {
    let obj = {};
    obj[UserDataKeys.EMAIL] = adminUser.email;
    obj[UserDataKeys.PASSWORD] = adminUser.password;
    let resp = await userSvc.login(obj);
    t.deepEqual(resp.status, true);
});

test.serial('deleteUser', async t => {
    let obj = {};
    obj[UserDataKeys.EMAIL] = adminUser.email;
    let resp = await userSvc.delete(obj);
    t.deepEqual(resp.status, true);
});