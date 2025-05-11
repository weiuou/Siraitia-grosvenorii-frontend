export interface ApiKey {
  createdAt: Date | undefined;
  id: string;
  description: string;
  key: string;
  userId: string;
}

export interface CreateApiKeyRequest {
  api_key_data: {
    description: string;
    name: string;
    permissions?: string[];
  };
  current_user: {
    username: string;
    id: number;
  };
}

export interface ApiKeyResponse {
  success: boolean;
  data?: ApiKey | ApiKey[];
  message?: string;
  error?: string;
}