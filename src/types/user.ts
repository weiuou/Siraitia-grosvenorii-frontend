export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
