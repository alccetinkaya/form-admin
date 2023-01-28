import { UserData, UserRole } from "../models/user.data.model";

const CreateUserKeys = {
    FIRST_NAME: "FirstName",
    LAST_NAME: "LastName",
    EMAIL: "Email",
    PASSWORD: "Password",
    ROLE: "Role"
}

export class UserService {
    validateCreateUserData(data: any): boolean {
        // check if is there any missing key in create user data
        for (const key of Object.values(CreateUserKeys)) {
            if (data[key] === null || data[key] === undefined) {
                console.log(`Create user data object doesn't have '${key}' key!`);
                return false;
            }
        }

        // check first name type
        if (typeof data[CreateUserKeys.FIRST_NAME] !== 'string') {
            console.log(`Create user data first name isn't string!`);
            return false;
        }

        // check last name type
        if (typeof data[CreateUserKeys.LAST_NAME] !== 'string') {
            console.log(`Create user data last name isn't string!`);
            return false;
        }

        // check email type
        if (typeof data[CreateUserKeys.EMAIL] !== 'string') {
            console.log(`Create user data email isn't string!`);
            return false;
        }

        // check password type
        const userPswd = data[CreateUserKeys.PASSWORD];
        if (typeof userPswd !== 'string' && typeof userPswd !== 'number') {
            console.log(`Create user data password isn't string or number!`);
            return false;
        }
        if (typeof userPswd === 'number') {
            data[CreateUserKeys.PASSWORD] = userPswd.toString();
        }

        // check role type
        const userRole = data[CreateUserKeys.ROLE];
        if (typeof userRole !== 'string') {
            console.log(`Create user data role isn't string!`);
            return false;
        }
        // check if role is valid
        let validRole = false;
        if (userRole === "Admin") {
            validRole = true;
            data[CreateUserKeys.ROLE] = UserRole.ADMIN;
        } else if (userRole === "User") {
            validRole = true;
            data[CreateUserKeys.ROLE] = UserRole.USER;
        } else {
            validRole = false;
        }
        if (validRole == false) {
            console.log(`Create user data role is invalid!`);
            return false;
        }

        return true;
    }

    getUserData(data: any): UserData {
        if (!this.validateCreateUserData(data)) {
            return null;
        }

        return {
            firstName: data[CreateUserKeys.FIRST_NAME],
            lastName: data[CreateUserKeys.LAST_NAME],
            email: data[CreateUserKeys.EMAIL],
            password: data[CreateUserKeys.PASSWORD],
            role: data[CreateUserKeys.ROLE]
        };

    }
}