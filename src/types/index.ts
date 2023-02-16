export interface PayloadToken {
  id: number;
  role: string;
  phone: string;
}

export interface AuthResponse {
  userData: PayloadToken;
  accessToken: string;
  refreshToken: string;
}

export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
  SuperUser = 'SUPER_USER',
}
