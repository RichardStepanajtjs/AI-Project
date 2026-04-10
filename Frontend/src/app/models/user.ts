export interface User {
    id?: number;
    email: string;
    role: string;
    password: string;
    active?: boolean;
}
