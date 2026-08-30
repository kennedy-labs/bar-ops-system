export enum UserRole {
  OWNER = 'OWNER',
  WORKER = 'WORKER',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
