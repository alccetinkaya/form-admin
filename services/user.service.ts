import { UserData, UserLoginData, UserRoleID } from "../models/user.data.model";

const UserDataKeys = {
    FIRST_NAME: "first_name",
    LAST_NAME: "last_name",
    EMAIL: "email",
    PASSWORD: "password",
    ROLE: "role"
}

export interface UserSvcInterface {
    getUserData(data: any): UserData;
    getUserLoginData(data: any): UserLoginData;
}

export class UserService implements UserSvcInterface {
    validateUserData(data: any): boolean {
        // check if is there any missing key in create user data
        for (const key of Object.values(UserDataKeys)) {
            if (data[key] === null || data[key] === undefined) {
                console.log(`User data object doesn't have '${key}' key!`);
                return false;
            }
        }

        // check first name type
        if (typeof data[UserDataKeys.FIRST_NAME] !== 'string') {
            console.log(`User data first name isn't string!`);
            return false;
        }

        // check last name type
        if (typeof data[UserDataKeys.LAST_NAME] !== 'string') {
            console.log(`User data last name isn't string!`);
            return false;
        }

        // check email type
        if (typeof data[UserDataKeys.EMAIL] !== 'string') {
            console.log(`User data email isn't string!`);
            return false;
        }

        // check password type
        const userPswd = data[UserDataKeys.PASSWORD];
        if (typeof userPswd !== 'string' && typeof userPswd !== 'number') {
            console.log(`User data password isn't string or number!`);
            return false;
        }
        if (typeof userPswd === 'number') {
            data[UserDataKeys.PASSWORD] = userPswd.toString();
        }

        // check role type
        const userRole = data[UserDataKeys.ROLE];
        if (typeof userRole !== 'string') {
            console.log(`User data role isn't string!`);
            return false;
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
            console.log(`User data role is invalid!`);
            return false;
        }

        return true;
    }

    validateUserLoginData(data: any) {
        const keys = [UserDataKeys.EMAIL, UserDataKeys.PASSWORD];
        for (const key of keys) {
            if (data[key] === null || data[key] === undefined) {
                console.log(`User login data object doesn't have '${key}' key!`);
                return false;
            }
        }

        // check email type
        if (typeof data[UserDataKeys.EMAIL] !== 'string') {
            console.log(`User login data email isn't string!`);
            return false;
        }

        // check password type
        const userPswd = data[UserDataKeys.PASSWORD];
        if (typeof userPswd !== 'string' && typeof userPswd !== 'number') {
            console.log(`User data password isn't string or number!`);
            return false;
        }
        if (typeof userPswd === 'number') {
            data[UserDataKeys.PASSWORD] = userPswd.toString();
        }

        return true;
    }

    getUserData(data: any): UserData {
        if (!this.validateUserData(data)) {
            return null;
        }

        return {
            firstName: data[UserDataKeys.FIRST_NAME],
            lastName: data[UserDataKeys.LAST_NAME],
            email: data[UserDataKeys.EMAIL],
            password: data[UserDataKeys.PASSWORD],
            role: data[UserDataKeys.ROLE]
        };
    }

    getUserLoginData(data: any): UserLoginData {
        if (!this.validateUserLoginData(data)) {
            return null;
        }

        return {
            email: data[UserDataKeys.EMAIL],
            password: data[UserDataKeys.PASSWORD],
        };
    }
}