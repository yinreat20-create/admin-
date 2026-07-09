import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { License } from './types';

const listLicensesFn = httpsCallable<void, { licenses: License[] }>(functions, 'listLicenses');
const createLicenseFn = httpsCallable<{ durationDays: number | null; note: string }, { key: string }>(
  functions,
  'createLicense'
);
const revokeLicenseFn = httpsCallable<{ key: string }, { ok: true }>(functions, 'revokeLicense');
const extendLicenseFn = httpsCallable<{ key: string; additionalDays: number }, { expiresAt: number }>(
  functions,
  'extendLicense'
);
const resetLicenseDeviceFn = httpsCallable<{ key: string }, { ok: true }>(functions, 'resetLicenseDevice');

export const licenseAdminApi = {
  async list(): Promise<License[]> {
    const result = await listLicensesFn();
    return result.data.licenses;
  },
  async create(durationDays: number | null, note: string): Promise<string> {
    const result = await createLicenseFn({ durationDays, note });
    return result.data.key;
  },
  async revoke(key: string): Promise<void> {
    await revokeLicenseFn({ key });
  },
  async extend(key: string, additionalDays: number): Promise<number> {
    const result = await extendLicenseFn({ key, additionalDays });
    return result.data.expiresAt;
  },
  async resetDevice(key: string): Promise<void> {
    await resetLicenseDeviceFn({ key });
  },
};
