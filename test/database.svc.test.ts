import test from 'ava';
import { AuthID } from '../models/role.data.model';
import { UserData, UserLoginData, UserRoleID } from '../models/user.data.model';
import { DatabaseService, DatabaseSvcInterface } from '../services/database.service';

const dbSvc: DatabaseSvcInterface = new DatabaseService;

const adminUser: UserData = {
    firstName: "test",
    lastName: "admin",
    email: "test@admin",
    password: "test",
    role: UserRoleID.ADMIN
}

const standardUser: UserData = {
    firstName: "test",
    lastName: "user",
    email: "test@user",
    password: "test",
    role: UserRoleID.USER
}

test('isUserEmailExists', async t => {
    let rval = await dbSvc.isUserEmailExists("test@test");
    t.deepEqual(rval, false);
});

test.serial('createUserAdmin', async t => {
    let rval = await dbSvc.createUser(adminUser);
    t.deepEqual(rval, true);
});

test.serial('loginUserAdmin', async t => {
    let userLogin: UserLoginData = { email: adminUser.email, password: adminUser.password };
    let rval = await dbSvc.loginUser(userLogin);
    t.deepEqual(rval, true);
});

test.serial('getUserAdminRole', async t => {
    let userLogin: UserLoginData = { email: adminUser.email, password: adminUser.password };
    let rval = await dbSvc.getUserRole(userLogin);
    t.deepEqual(rval, UserRoleID.ADMIN);
});

test.serial('adminUserHasAuth', async t => {
    let rval = await dbSvc.userHasAuth(adminUser.role, AuthID.CREATE_QUESTION);
    t.deepEqual(rval, true);
});

test.serial('deleteUserAdmin', async t => {
    let rval = await dbSvc.deleteUser(adminUser.email);
    t.deepEqual(rval, true);
});

test.serial('createUserStandard', async t => {
    let rval = await dbSvc.createUser(standardUser);
    t.deepEqual(rval, true);
});

test.serial('standardUserHasAuth', async t => {
    let rval = await dbSvc.userHasAuth(standardUser.role, AuthID.CREATE_QUESTION);
    t.deepEqual(rval, false);
});

test.serial('deleteUserStandard', async t => {
    let rval = await dbSvc.deleteUser(standardUser.email);
    t.deepEqual(rval, true);
});

const testFormLabel = "dbSvcTestLabel";
const testFormId = "dbSvcTestFormId";

test.serial('addForm', async t => {
    let rval = await dbSvc.addForm(testFormLabel, testFormId);
    t.deepEqual(rval, true);
});

test.serial('getForm', async t => {
    const formData = await dbSvc.getForm(testFormLabel);
    t.deepEqual(formData.label, testFormLabel);
    t.deepEqual(formData.formId, testFormId);
});

test.serial('isFormExistsTrue', async t => {
    let rval = await dbSvc.isFormExists(testFormLabel);
    t.deepEqual(rval, true);
});

test.serial('deleteForm', async t => {
    let rval = await dbSvc.deleteForm(testFormLabel);
    t.deepEqual(rval, true);
});

test.serial('isFormExistsFalse', async t => {
    let rval = await dbSvc.isFormExists(testFormLabel);
    t.deepEqual(rval, false);
});