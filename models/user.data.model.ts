export enum UserRoleID {
    ADMIN,
    USER
}

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string;
    role: UserRoleID;
}

export interface UserLoginData {
    email: string,
    password: string
}