export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'ADMIN' | 'INTERN';
  accessToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  register(data: RegisterData): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  refreshToken(): Promise<AuthTokens>;
  getSession(): Promise<any>;
}
