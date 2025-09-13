export interface ITwoFactor {
  userId: string;
  secret: string;
  enabled: boolean;
  backupCodes: string[];
  tempSecret?: string | null;
  lastAuthenticatedAt?: Date | null;
  setupCompletedAt: Date;
  disabledAt?: Date | null;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  manualEntryKey: string;
}

export interface TwoFactorVerifyResponse {
  backupCodes: string[];
  message: string;
}
