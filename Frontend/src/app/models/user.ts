export interface User {
    id?: number;
    email: string;
    role: string;
    password: string;
    naam?: string;
    achternaam?: string;
    active?: boolean;
}
