export interface TokenPayload {
  userId: string;
  email: string;
  role: string; // admin, user, teacher, etc
  iat?: number;
  exp?: number;
}
