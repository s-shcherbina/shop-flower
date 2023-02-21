export interface PayloadToken {
  id: number;
  role: string;
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

export interface QueryOrderParams {
  userId: number;
  completed: boolean;
}

export interface QueryOrderGoodParams {
  goodId: number;
  orderId: number;
}
