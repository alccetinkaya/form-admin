import { PrismaClient } from '@prisma/client'
import { FormTable } from '../models/form.data.model';
import { AuthID, RoleAuthData } from '../models/role.data.model';
import { UserData, UserLoginData, UserRoleID } from '../models/user.data.model'
const prisma = new PrismaClient()

export interface DatabaseSvcInterface {
    isUserEmailExists(email: string): Promise<boolean>;
    createUser(userData: UserData): Promise<boolean>;
    loginUser(userLoginData: UserLoginData): Promise<boolean>;
    getUserRole(userLoginData: UserLoginData): Promise<UserRoleID>;
    userHasAuth(roleId: UserRoleID, authId: AuthID): Promise<boolean>;
    addForm(label: string, formId: string): Promise<boolean>;
    getForm(label: string): Promise<FormTable>;
    isFormExists(label: string): Promise<boolean>;
}

export class DatabaseService {
    async isUserEmailExists(email: string): Promise<boolean> {
        const users = await prisma.user.findMany({
            where: { email: email }
        }).catch(async (e) => {
            console.log(`DB svc get user by email failed: ${e.message}`);
        });

        const usersData = users as unknown as Array<UserData>;
        return usersData.length ? true : false;
    }

    async createUser(userData: UserData): Promise<boolean> {
        let isMailExists = await this.isUserEmailExists(userData.email);
        if (isMailExists) {
            console.log(`User email is exists!`);
            return false;
        }

        const rval = await prisma.user.create({
            data: {
                first_name: userData.firstName,
                last_name: userData.lastName,
                email: userData.email,
                password: userData.password,
                role_id: userData.role
            }
        }).catch(async (e) => {
            console.log(`DB svc create user failed: ${e.message}`);
        })

        return rval ? true : false;
    }

    async loginUser(userLoginData: UserLoginData): Promise<boolean> {
        const login = await prisma.user.findFirst({
            where: {
                email: userLoginData.email,
                password: userLoginData.password
            }
        });

        return login ? true : false;
    }

    async getUserRole(userLoginData: UserLoginData): Promise<UserRoleID> {
        const user = await prisma.user.findFirst({
            where: {
                email: userLoginData.email,
                password: userLoginData.password
            }
        });

        return user ? user.role_id : null;
    }

    async userHasAuth(roleId: UserRoleID, authId: AuthID): Promise<boolean> {
        const roleAuth = await prisma.role_authority.findFirst({
            where: {
                role_id: roleId,
                auth_id: authId
            }
        });

        if (roleAuth === null) return false;
        return roleAuth.is_active;
    }

    async addForm(label: string, formId: string): Promise<boolean> {
        const rval = await prisma.form.create({
            data: {
                label: label,
                form_id: formId
            }
        }).catch(async (e) => {
            console.log(`DB svc create form failed: ${e.message}`);
        })

        return rval ? true : false;
    }

    async getForm(label: string): Promise<FormTable> {
        const form = await prisma.form.findFirst({
            where: {
                label: label
            }
        });

        return !form ? null : {
            id: form.id as unknown as number,
            label: form.label,
            formId: form.form_id
        };
    }

    async isFormExists(label: string): Promise<boolean> {
        let form = await this.getForm(label);
        if (form === null) return false;
        if (form.label === label) return true;
        return false;
    }
}