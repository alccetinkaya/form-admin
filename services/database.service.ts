import { PrismaClient } from '@prisma/client'
import { UserData } from '../models/user.data.model'
const prisma = new PrismaClient()

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

        if (!rval) {
            return false;
        }

        return true;
    }
}