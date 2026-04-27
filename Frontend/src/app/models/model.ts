export interface ModelResponse {
  success: boolean;
  data: Model[];
  count: number;
}

export interface Model {
  id: number;
  version_label: string;
  is_active: boolean;
  created_at: string | Date;
  f1_score: number;
  description?: string;
}