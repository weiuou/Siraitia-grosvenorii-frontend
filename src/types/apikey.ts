export interface ApiKey {
  id: string;
  description: string;
  key: string;
  userId: string;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions?: string[];
}

export interface ApiKeyResponse {
  success: boolean;
  data?: ApiKey | ApiKey[];
  message?: string;
  error?: string;
}