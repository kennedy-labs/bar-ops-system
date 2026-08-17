export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}
