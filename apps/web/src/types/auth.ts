export type UserRole = 'CUSTOMER' | 'ORGANIZER' | 'GATEKEEPER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}