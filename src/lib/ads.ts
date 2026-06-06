export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADSTERRA_ENABLED === 'true';

export const AD_KEYS = {
  popunder: process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_KEY ?? '',
  socialBar: process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_KEY ?? '',
  inPagePush: process.env.NEXT_PUBLIC_ADSTERRA_INPAGE_PUSH_KEY ?? '',
  interstitial: process.env.NEXT_PUBLIC_ADSTERRA_INTERSTITIAL_KEY ?? '',
  banner300x250: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300x250_KEY ?? '',
  banner728x90: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_728x90_KEY ?? '',
  banner160x300: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_160x300_KEY ?? '',
  native: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY ?? '',
  smartlink: process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URL ?? '',
  ecpmAd1: process.env.NEXT_PUBLIC_ECPM_AD_1_URL ?? '',
  ecpmAd2: process.env.NEXT_PUBLIC_ECPM_AD_2_URL ?? '',
  ecpmNativeKey: process.env.NEXT_PUBLIC_ECPM_NATIVE_KEY ?? '',
  ecpmNativeScript: process.env.NEXT_PUBLIC_ECPM_NATIVE_SCRIPT_URL ?? ''
} as const;

export function hasAd(key: keyof typeof AD_KEYS): boolean {
  if (!ADS_ENABLED) return false;
  return Boolean(AD_KEYS[key]);
}
