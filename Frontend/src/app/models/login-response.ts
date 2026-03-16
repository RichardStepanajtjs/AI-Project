export interface LoginResponse {
    success: boolean,
    message: string,
    token: string,
    data: { id: number, email: string, role: string }
}
