const dotenv = require('dotenv').config();
import axios from 'axios';
import { FormRequest } from '../models/form.data.model';
import { AuthID } from '../models/role.data.model';
import { DatabaseSvcInterface } from './database.service';
import { UserSvcInterface } from './user.service';

const token = process.env.TOKEN;
const config = {
    headers: { Authorization: `Bearer ${token}` }
};

export interface FormSvcResp {
    status: boolean;
    statusCode: number;
    message: string;
}

export interface FormSvcInterface {
    createForm(data: any): Promise<FormSvcResp>;
    updateForm(data: any): Promise<FormSvcResp>;
    deleteForm(data: any): Promise<FormSvcResp>;
    viewForm(data: any): Promise<FormSvcResp>;
}

export class FormService implements FormSvcInterface {
    _dbSvc: DatabaseSvcInterface;
    _userSvc: UserSvcInterface;

    constructor(dbSvc: DatabaseSvcInterface, userSvc: UserSvcInterface) {
        this._dbSvc = dbSvc;
        this._userSvc = userSvc;
    }

    validateFormRequest(data: any) {
        let keys = ["credential", "label", "data"];
        for (const key of keys) {
            if (data[key] === null || data[key] === undefined) {
                console.log(`Form data object should contain'${key}' key!`);
                return false;
            }
        }

        // check credential type
        if (typeof data.credential !== 'object') {
            console.log(`Form data credential isn't object!`);
            return false;
        }

        // check label type
        if (typeof data.label !== 'string') {
            console.log(`Form data label isn't string!`);
            return false;
        }

        return true;
    }

    getFormRequest(data: any): FormRequest {
        if (!this.validateFormRequest(data)) {
            return null;
        }

        return {
            credential: data.credential,
            label: data.label,
            data: data.data
        }
    }

    async validateCreateFormRequest(formReq: FormRequest): Promise<FormSvcResp> {
        // check if user credential is valid
        let resp = await this._userSvc.login(formReq.credential);
        if (!resp.status) {
            return { status: false, statusCode: resp.statusCode, message: resp.message };
        }

        // check if user has authority to create form
        let userRole = await this._dbSvc.getUserRole(formReq.credential);
        let auth = await this._dbSvc.userHasAuth(userRole, AuthID.CREATE_FORM);
        if (!auth) {
            console.log("User doesn't have authority to create form!");
            return { status: false, statusCode: 404, message: "User doesn't have authority to create form!" };
        }

        // check if form label is exists
        let formLabel = formReq.label;
        if (await this._dbSvc.isFormExists(formLabel)) {
            console.log("Form label is exists!");
            return { status: false, statusCode: 404, message: "Form label is exists!" };
        }

        return { status: true, statusCode: 200, message: null };
    }

    async validateUpdateFormRequest(formReq: FormRequest): Promise<FormSvcResp> {
        // check if user credential is valid
        let resp = await this._userSvc.login(formReq.credential);
        if (!resp.status) {
            return { status: false, statusCode: resp.statusCode, message: resp.message };
        }

        // check if user has authority to edit form
        let userRole = await this._dbSvc.getUserRole(formReq.credential);
        let auth = await this._dbSvc.userHasAuth(userRole, AuthID.EDIT_FORM);
        if (!auth) {
            console.log("User doesn't have authority to edit form!");
            return { status: false, statusCode: 404, message: "User doesn't have authority to edit form!" };
        }

        // check question types. it should be a single choise and multiple selection
        for (const obj of formReq.data.fields) {
            if (obj.properties.allow_other_choice) {
                console.log("It isn't allowed other choices!");
                return { status: false, statusCode: 404, message: "It isn't allowed other choices!" };
            }
        }

        return { status: true, statusCode: 200, message: null };
    }

    async validateDeleteFormRequest(formReq: FormRequest): Promise<FormSvcResp> {
        // check if user credential is valid
        let resp = await this._userSvc.login(formReq.credential);
        if (!resp.status) {
            return { status: false, statusCode: resp.statusCode, message: resp.message };
        }

        // check if user has authority to delete form
        let userRole = await this._dbSvc.getUserRole(formReq.credential);
        let auth = await this._dbSvc.userHasAuth(userRole, AuthID.DELETE_FORM);
        if (!auth) {
            console.log("User doesn't have authority to delete form!");
            return { status: false, statusCode: 404, message: "User doesn't have authority to delete form!" };
        }

        return { status: true, statusCode: 200, message: null };
    }

    async validateViewFormRequest(formReq: FormRequest): Promise<FormSvcResp> {
        // check if user credential is valid
        let resp = await this._userSvc.login(formReq.credential);
        if (!resp.status) {
            return { status: false, statusCode: resp.statusCode, message: resp.message };
        }

        // check if user has authority to view form
        let userRole = await this._dbSvc.getUserRole(formReq.credential);
        let auth = await this._dbSvc.userHasAuth(userRole, AuthID.VIEW_FORM);
        if (!auth) {
            console.log("User doesn't have authority to view form!");
            return { status: false, statusCode: 404, message: "User doesn't have authority to view form!" };
        }

        return { status: true, statusCode: 200, message: null };
    }

    async createForm(data: any): Promise<FormSvcResp> {
        try {
            // get form request data
            let formReq = this.getFormRequest(data);
            if (!formReq) {
                return { status: false, statusCode: 404, message: "Form request object is invalid!" };
            }

            // validate request
            let resp = await this.validateCreateFormRequest(data);
            if (!resp.status) {
                return resp;
            }

            // send create form request
            const response = await axios.post(process.env.FORM_URL + "/forms", formReq.data, config);
            const statusCode = response.status;
            if (statusCode >= 200 && statusCode <= 300) {
                if (!await this._dbSvc.addForm(formReq.label, response.data.id)) {
                    return { status: false, statusCode: 500, message: "Form couldn't created in database" };
                }
            }
            return { status: true, statusCode: response.status, message: "Form has successfully created" };
        } catch (error) {
            console.log(`Couldn't created form: ${error}`);
            return { status: false, statusCode: 500, message: `Couldn't created form: ${error}` };
        }
    }

    async updateForm(data: any): Promise<FormSvcResp> {
        try {
            // get form request data
            let formReq = this.getFormRequest(data);
            if (!formReq) {
                return { status: false, statusCode: 404, message: "Form request object is invalid!" };
            }

            // validate request
            let resp = await this.validateUpdateFormRequest(formReq);
            if (!resp.status) {
                return resp;
            }

            // get form id
            let formData = await this._dbSvc.getForm(formReq.label);
            if (!formData) {
                console.log("Couldn't found form label!");
                return { status: false, statusCode: 404, message: "Couldn't found form label!" };
            }

            // send update form request
            const response = await axios.put(process.env.FORM_URL + "/forms/" + formData.formId, formReq.data, config);
            return { status: true, statusCode: response.status, message: "Form has successfully updated" };
        } catch (error) {
            console.log(`Couldn't updated form: ${error}`);
            return { status: false, statusCode: 500, message: `Couldn't updated form: ${error}` };
        }
    }

    async deleteForm(data: any): Promise<FormSvcResp> {
        try {
            // get form request data
            let formReq = this.getFormRequest(data);
            if (!formReq) {
                return { status: false, statusCode: 404, message: "Form request object is invalid!" };
            }

            // validate request
            let resp = await this.validateDeleteFormRequest(formReq);
            if (!resp.status) {
                return resp;
            }

            // get form id
            let formData = await this._dbSvc.getForm(formReq.label);
            if (!formData) {
                console.log("Couldn't found form label!");
                return { status: false, statusCode: 404, message: "Couldn't found form label!" };
            }

            // send delete form request
            const response = await axios.delete(process.env.FORM_URL + "/forms/" + formData.formId, config);
            if (response.status === 204) {
                if (!await this._dbSvc.deleteForm(formData.label)) {
                    return { status: false, statusCode: 500, message: "Form couldn't deleted from database" };
                }
            }
            return { status: true, statusCode: response.status, message: "Form has successfully deleted" };
        } catch (error) {
            console.log(`Couldn't deleted form: ${error}`);
            return { status: false, statusCode: 500, message: `Couldn't deleted form: ${error}` };
        }
    }

    async viewForm(data: any): Promise<FormSvcResp> {
        try {
            // get form request data
            let formReq = this.getFormRequest(data);
            if (!formReq) {
                return { status: false, statusCode: 404, message: "Form request object is invalid!" };
            }

            // validate request
            let resp = await this.validateViewFormRequest(formReq);
            if (!resp.status) {
                return resp;
            }

            // get form id
            let formData = await this._dbSvc.getForm(formReq.label);
            if (!formData) {
                console.log("Couldn't found form label!");
                return { status: false, statusCode: 404, message: "Couldn't found form label!" };
            }

            // send view form request
            const response = await axios.get(process.env.FORM_URL + "/forms/" + formData.formId, config);
            return { status: true, statusCode: response.status, message: response.data };
        } catch (error) {
            console.log(`Couldn't viewed form: ${error}`);
            return { status: false, statusCode: 500, message: `Couldn't viewed form: ${error}` };
        }
    }
}