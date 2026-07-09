export interface License {
  key: string;
  status: 'unused' | 'active' | 'revoked' | 'expired';
  hardwareId: string | null;
  durationDays: number | null;
  note: string;
  createdAt: number;
  activatedAt: number | null;
  expiresAt: number | null;
}
