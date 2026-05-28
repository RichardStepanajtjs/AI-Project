export interface Prospectlist {
    id?: number;
    user_id?: number;
    form_id?: number | null;
    naam: string;
    jobdomein?: string;
    company_ids?: number[];
    accuracy_scores?: number[];
    created_at?: string;
}
