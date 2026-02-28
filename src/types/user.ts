export interface User {
  uid: string;
  name: string;
  email: string;
  weeklyPoints: number;
  createdAt: Date;
  level: number;
  weekId: number;
  xp: number;
  collectibles: any[];
}