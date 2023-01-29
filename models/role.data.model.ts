import { UserRoleID } from "./user.data.model";

export enum AuthID {
    CREATE_FORM = 1,
    EDIT_FORM,
    VIEW_FORM,
    DELETE_FORM,
    CREATE_QUESTION,
    EDIT_QUESTION,
    DELETE_QUESTION,
    VIEW_QUESTION,
    CREATE_OPTIONS,
    EDIT_OPTIONS,
    DELETE_OPTIONS,
    VIEW_OPTIONS,
    SUBMIT_RESP,
    VIEW_SUBMITTED_RESP
}

export interface RoleAuthData {
    roleID: UserRoleID;
    authID: AuthID;
    isActive: boolean;
}