export enum UserRole {
    ADMIN,
    USER
}

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string;
    role: UserRole;
}

export interface UserLoginData {
    email: string,
    password: string
}