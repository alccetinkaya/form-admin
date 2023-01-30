import test from 'ava';
import { FormRequest } from '../models/form.data.model';
import { DatabaseService } from '../services/database.service';
import { FormService } from '../services/form.service';
import { UserService } from '../services/user.service';

const dbSvc = new DatabaseService();
const userSvc = new UserService(dbSvc);
const formSvc = new FormService(dbSvc, userSvc);

const adminUser = {
    first_name: "formSvcTest",
    last_name: "admin",
    email: "formSvcTest@admin",
    password: "test",
    role: "Admin"
}

const standardUser = {
    first_name: "formSvcTest",
    last_name: "user",
    email: "formSvcTest@user",
    password: "test",
    role: "User"
}

const testFormLabel = "formSvcTestLabel";
const testFormTitle = "form-svc-test-title";

test('createFormMissingFormRequest', async t => {
    let req = {};
    let resp = await formSvc.createForm(req);
    t.deepEqual(resp.status, false);

    req["credential"] = { email: "test@email", password: "testpswd" };
    resp = await formSvc.createForm(req);
    t.deepEqual(resp.status, false);

    req["label"] = testFormLabel;
    resp = await formSvc.createForm(req);
    t.deepEqual(resp.status, false);
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
    t.deepEqual(resp.status, false);
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
    t.deepEqual(resp.status, false);
});

test.serial('createUserStandard', async t => {
    let resp = await userSvc.create(standardUser);
    t.deepEqual(resp.status, true);
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
    t.deepEqual(resp.status, false);
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
    t.deepEqual(resp.status, false);
});

test.serial('createUserAdmin', async t => {
    let resp = await userSvc.create(adminUser);
    t.deepEqual(resp.status, true);
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
    t.deepEqual(resp.status, true);
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
    t.deepEqual(resp.status, false);
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
    t.deepEqual(resp.status, true);
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
    t.deepEqual(resp.status, true);
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
    t.deepEqual(resp.status, true);
});

test.serial('deleteUserStandard', async t => {
    let resp = await userSvc.delete({ email: standardUser.email });
    t.deepEqual(resp.status, true);
});

test.serial('deleteUserAdmin', async t => {
    let resp = await userSvc.delete({ email: adminUser.email });
    t.deepEqual(resp.status, true);
});