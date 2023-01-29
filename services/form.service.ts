const dotenv = require('dotenv').config();
import axios from 'axios';
import { FormRequest } from '../models/form.data.model';
import { AuthID } from '../models/role.data.model';
import { DatabaseSvcInterface } from './database.service';
import { UserSvcInterface } from './user.service';

const token = "tfp_2LUpHW6MpUg61o7w39NXXeGFVTLpvFagjwhzd4WqDUmN_3spq6ere2cEnrj";
const config = {
    headers: { Authorization: `Bearer ${token}` }
};

export interface FormSvcResp {
    statusCode: number;
    message: string;
}

export class FormService {
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
        let userLogin = this._userSvc.getUserLoginData(formReq.credential);
        if (!userLogin) {
            console.log("User login data is invalid!");
            return { statusCode: 404, message: "User login data is invalid!" };
        }
        if (!await this._dbSvc.loginUser(userLogin)) {
            console.log("User credential is invalid!");
            return { statusCode: 404, message: "User credential is invalid!" };
        }

        // check if user has authority to create form
        let userRole = await this._dbSvc.getUserRole(userLogin);
        let auth = await this._dbSvc.userHasAuth(userRole, AuthID.CREATE_FORM);
        if (!auth) {
            console.log("User doesn't have authority to create form!");
            return { statusCode: 404, message: "User doesn't have authority to create form!" };
        }

        // check if form label is exists
        let formLabel = formReq.label;
        if (await this._dbSvc.isFormExists(formLabel)) {
            console.log("Form label is exists!");
            return { statusCode: 404, message: "Form label is exists!" };
        }

        return { statusCode: 200, message: null };
    }

    async createForm(body: any): Promise<FormSvcResp> {
        try {
            // get form request data
            let formReq = this.getFormRequest(body);
            if (!formReq) {
                return { statusCode: 404, message: "Form request object is invalid!" };
            }

            // validate request
            let resp = await this.validateCreateFormRequest(body);
            if (resp.statusCode !== 200) {
                return resp;
            }

            // send create form request
            const response = await axios.post(process.env.FORM_URL + "/forms", formReq.data, config);
            await this._dbSvc.addForm(formReq.label, response.data.id);
            return { statusCode: response.status, message: "Form has successfully created" };
        } catch (error) {
            console.log(`Couldn't created form: ${error}`);
            return { statusCode: 500, message: `Couldn't created form: ${error}` };
        }
    }
}