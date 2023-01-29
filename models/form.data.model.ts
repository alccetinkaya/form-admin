import { UserLoginData } from "./user.data.model";

export interface FormRequest {
    credential: UserLoginData;
    label: string;
    data: any;
}

export interface FormTable {
    id: number;
    label: string;
    formId: string;
}