import { UserData, UserLoginData, UserRoleID } from "../models/user.data.model";
import { DatabaseSvcInterface } from "./database.service";

export const UserDataKeys = {
    FIRST_NAME: "first_name",
    LAST_NAME: "last_name",
    EMAIL: "email",
    PASSWORD: "password",
    ROLE: "role"
}

export interface UserSvcResp {
    status: boolean;
    statusCode: number;
    message: string;
}

interface ValidationResp {
    status: boolean;
    message: string;
}

export interface UserSvcInterface {
    create(data: any): Promise<UserSvcResp>;
    login(data: any): Promise<UserSvcResp>;
    delete(data: any): Promise<UserSvcResp>;
}

export class UserService implements UserSvcInterface {
    _dbSvc: DatabaseSvcInterface;

    constructor(dbSvc: DatabaseSvcInterface) {
        this._dbSvc = dbSvc;
    }

    validateUserData(data: any): ValidationResp {
        // check if is there any missing key in create user data
        for (const key of Object.values(UserDataKeys)) {
            if (data[key] === null || data[key] === undefined) {
                let msg = `User data object doesn't have '${key}' key!`;
                console.log(msg);
                return { status: false, message: msg };
            }
        }

        // check first name type
        if (typeof data[UserDataKeys.FIRST_NAME] !== 'string') {
            let msg = `User data first name isn't string!`;
            console.log(msg);
            return { status: false, message: msg };
        }

        // check last name type
        if (typeof data[UserDataKeys.LAST_NAME] !== 'string') {
            let msg = `User data last name isn't string!`;
            console.log(msg);
            return { status: false, message: msg };
        }

        // check email type
        if (typeof data[UserDataKeys.EMAIL] !== 'string') {
            let msg = `User data email isn't string!`;
            console.log(msg);
            return { status: false, message: msg };
        }

        // check password type
        const userPswd = data[UserDataKeys.PASSWORD];
        if (typeof userPswd !== 'string' && typeof userPswd !== 'number') {
            let msg = `User data password isn't string or number!`;
            console.log(msg);
            return { status: false, message: msg };
        }
        if (typeof userPswd === 'number') {
            data[UserDataKeys.PASSWORD] = userPswd.toString();
        }

        // check role type
        const userRole = data[UserDataKeys.ROLE];
        if (typeof userRole !== 'string') {
            let msg = `User data role isn't string!`;
            console.log(msg);
            return { status: false, message: msg };
        }
        // check if role is valid
        let validRole = false;
        if (userRole === "Admin") {
            validRole = true;
            data[UserDataKeys.ROLE] = UserRoleID.ADMIN;
        } else if (userRole === "User") {
            validRole = true;
            data[UserDataKeys.ROLE] = UserRoleID.USER;
        } else {
            validRole = false;
        }
        if (validRole == false) {
            let msg = `User data role is invalid!`;
            console.log(msg);
            return { status: false, message: msg };
        }

        return { status: true, message: null };
    }

    validateUserLoginData(data: any): ValidationResp {
        const keys = [UserDataKeys.EMAIL, UserDataKeys.PASSWORD];
        for (const key of keys) {
            if (data[key] === null || data[key] === undefined) {
                let msg = `User login data object doesn't have '${key}' key!`;
                console.log(msg);
                return { status: false, message: msg };
            }
        }

        // check email type
        if (typeof data[UserDataKeys.EMAIL] !== 'string') {
            let msg = `User login data email isn't string!`;
            console.log(msg);
            return { status: false, message: msg };
        }

        // check password type
        const userPswd = data[UserDataKeys.PASSWORD];
        if (typeof userPswd !== 'string' && typeof userPswd !== 'number') {
            let msg = `User data password isn't string or number!`;
            console.log(msg);
            return { status: false, message: msg };
        }
        if (typeof userPswd === 'number') {
            data[UserDataKeys.PASSWORD] = userPswd.toString();
        }

        return { status: true, message: null };
    }

    validateUserDeleteData(data: any): ValidationResp {
        const keys = [UserDataKeys.EMAIL];
        for (const key of keys) {
            if (data[key] === null || data[key] === undefined) {
                let msg = `User login data object doesn't have '${key}' key!`;
                console.log(msg);
                return { status: false, message: msg };
            }
        }

        // check email type
        if (typeof data[UserDataKeys.EMAIL] !== 'string') {
            let msg = `User login data email isn't string!`;
            console.log(msg);
            return { status: false, message: msg };
        }

        return { status: true, message: null };
    }

    getUserData(data: any): UserData {
        return {
            firstName: data[UserDataKeys.FIRST_NAME],
            lastName: data[UserDataKeys.LAST_NAME],
            email: data[UserDataKeys.EMAIL],
            password: data[UserDataKeys.PASSWORD],
            role: data[UserDataKeys.ROLE]
        };
    }

    getUserLoginData(data: any): UserLoginData {
        return {
            email: data[UserDataKeys.EMAIL],
            password: data[UserDataKeys.PASSWORD],
        };
    }

    async create(data: any): Promise<UserSvcResp> {
        let rval = this.validateUserData(data);
        if (!rval.status) {
            return { status: false, statusCode: 403, message: rval.message };
        }

        let userData = this.getUserData(data);

        let isMailExists = await this._dbSvc.isUserEmailExists(userData.email);
        if (isMailExists) {
            return { status: false, statusCode: 403, message: "User email is exists!" };
        }

        let success = await this._dbSvc.createUser(userData);
        return success ? { status: true, statusCode: 200, message: "User has successfully created" } : { status: false, statusCode: 500, message: "Couldn't created user" };
    };

    async login(data: any): Promise<UserSvcResp> {
        let rval = this.validateUserLoginData(data);
        if (!rval.status) {
            return {
                status: false,
                statusCode: 403,
                message: rval.message
            };
        }

        let userLoginData = this.getUserLoginData(data);
        let success = await this._dbSvc.loginUser(userLoginData);
        return success ? { status: true, statusCode: 200, message: "User has successfully logged in" } : { status: false, statusCode: 500, message: "Couldn't logged in user" };
    };

    async delete(data: any): Promise<UserSvcResp> {
        let rval = this.validateUserDeleteData(data);
        if (!rval.status) {
            return { status: false, statusCode: 403, message: rval.message };
        }

        let success = await this._dbSvc.deleteUser(data[UserDataKeys.EMAIL]);
        return success ? { status: true, statusCode: 200, message: "User has successfully deleted" } : { status: false, statusCode: 500, message: "Couldn't deleted user" };
    };
}