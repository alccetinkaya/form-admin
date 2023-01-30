import test from 'ava';
import { FormRequest } from '../models/form.data.model';
import { UserData, UserRoleID } from '../models/user.data.model';
import { DatabaseService, DatabaseSvcInterface } from '../services/database.service';
import { FormService, FormSvcInterface } from '../services/form.service';
import { UserService } from '../services/user.service';

const dbSvc: DatabaseSvcInterface = new DatabaseService();
let formSvc: FormSvcInterface = new FormService(dbSvc, new UserService());

const adminUser: UserData = {
    firstName: "formSvcTest",
    lastName: "admin",
    email: "formSvcTest@admin",
    password: "test",
    role: UserRoleID.ADMIN
}

const standardUser: UserData = {
    firstName: "formSvcTest",
    lastName: "user",
    email: "formSvcTest@user",
    password: "test",
    role: UserRoleID.USER
}

const testFormLabel = "formSvcTestLabel";
const testFormTitle = "form-svc-test-title";

test('createFormMissingFormRequest', async t => {
    let req = {};
    let resp = await formSvc.createForm(req);
    t.deepEqual(resp.message, "Form request object is invalid!");

    req["credential"] = { email: "test@email", password: "testpswd" };
    resp = await formSvc.createForm(req);
    t.deepEqual(resp.message, "Form request object is invalid!");

    req["label"] = testFormLabel;
    resp = await formSvc.createForm(req);
    t.deepEqual(resp.message, "Form request object is invalid!");

    req["data"] = { title: testFormTitle };
    resp = await formSvc.createForm(req);
    t.deepEqual(resp.message, "User credential is invalid!");
});

test('createFormUserLoginDataInvalid', async t => {
    let req = {
        credential: {
            email: "test@email"
        },
        label: testFormLabel,
        data: {
            title: testFormTitle
        }
    };
    let resp = await formSvc.createForm(req);
    t.deepEqual(resp.message, "User login data is invalid!");
});

test('createFormUserCredentialInvalid', async t => {
    let req = {
        credential: {
            email: "test@email",
            password: "testpswd"
        },
        label: testFormLabel,
        data: {
            title: testFormTitle
        }
    };
    let resp = await formSvc.createForm(req);
    t.deepEqual(resp.message, "User credential is invalid!");
});

test.serial('createUserStandard', async t => {
    let rval = await dbSvc.createUser(standardUser);
    t.deepEqual(rval, true);
});

test.serial('createFormUnauthUser', async t => {
    let req: FormRequest = {
        credential: {
            email: standardUser.email,
            password: standardUser.password
        },
        label: testFormLabel,
        data: { title: testFormTitle }
    };
    let resp = await formSvc.createForm(req);
    t.deepEqual(resp.message, "User doesn't have authority to create form!");
});

test.serial('deleteFormUnauthUser', async t => {
    let req: FormRequest = {
        credential: {
            email: standardUser.email,
            password: standardUser.password
        },
        label: testFormLabel,
        data: ""
    };
    let resp = await formSvc.deleteForm(req);
    t.deepEqual(resp.message, "User doesn't have authority to delete form!");
});

test.serial('createUserAdmin', async t => {
    let rval = await dbSvc.createUser(adminUser);
    t.deepEqual(rval, true);
});

test.serial('createForm', async t => {
    let req: FormRequest = {
        credential: {
            email: adminUser.email,
            password: adminUser.password
        },
        label: testFormLabel,
        data: { title: testFormTitle }
    };
    let resp = await formSvc.createForm(req);
    t.deepEqual(resp.statusCode, 201);
});

test.serial('recreateForm', async t => {
    let req: FormRequest = {
        credential: {
            email: adminUser.email,
            password: adminUser.password
        },
        label: testFormLabel,
        data: { title: testFormTitle }
    };
    let resp = await formSvc.createForm(req);
    t.deepEqual(resp.message, "Form label is exists!");
});

test.serial('updateForm', async t => {
    let req = {
        "credential": {
            "email": adminUser.email,
            "password": adminUser.password
        },
        "label": testFormLabel,
        "data": {
            "title": testFormTitle,
            "fields": [
                {
                    "properties": {
                        "allow_multiple_selection": true,
                        "allow_other_choice": false,
                        "choices": [
                            {
                                "label": "matrix choice 1"
                            },
                            {
                                "label": "matrix choice 2"
                            }
                        ],
                        "description": "Cool description for the multiple choice in the matrix",
                        "vertical_alignment": false
                    },
                    "ref": "nice_readable_multiple_choice_reference_inside_matrix",
                    "title": "multiple choice",
                    "type": "multiple_choice"
                }
            ]
        }
    }
    let resp = await formSvc.updateForm(req);
    t.deepEqual(resp.statusCode, 200);
});

test.serial('viewForm', async t => {
    let req: FormRequest = {
        credential: {
            email: standardUser.email,
            password: standardUser.password
        },
        label: testFormLabel,
        data: ""
    };
    let resp = await formSvc.viewForm(req);
    t.deepEqual(resp.statusCode, 200);
});

test.serial('deleteForm', async t => {
    let req: FormRequest = {
        credential: {
            email: adminUser.email,
            password: adminUser.password
        },
        label: testFormLabel,
        data: ""
    };
    let resp = await formSvc.deleteForm(req);
    t.deepEqual(resp.statusCode, 204);
});

test.serial('deleteUserStandard', async t => {
    let rval = await dbSvc.deleteUser(standardUser.email);
    t.deepEqual(rval, true);
});

test.serial('deleteUserAdmin', async t => {
    let rval = await dbSvc.deleteUser(adminUser.email);
    t.deepEqual(rval, true);
});