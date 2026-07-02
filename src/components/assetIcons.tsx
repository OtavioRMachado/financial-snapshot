import {
  TrendingUp,
  ShieldCheck,
  Coins,
  Landmark,
  PiggyBank,
  Wallet,
  LineChart,
  Building2,
  DollarSign,
  Bitcoin,
  Gem,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

export const ASSET_ICONS: Record<string, LucideIcon> = {
  'trending-up': TrendingUp,
  'shield-check': ShieldCheck,
  coins: Coins,
  landmark: Landmark,
  'piggy-bank': PiggyBank,
  wallet: Wallet,
  'line-chart': LineChart,
  'building-2': Building2,
  'dollar-sign': DollarSign,
  bitcoin: Bitcoin,
  gem: Gem,
  sprout: Sprout,
};

export const ASSET_ICON_KEYS = Object.keys(ASSET_ICONS);

export function getAssetIcon(key: string): LucideIcon {
  return ASSET_ICONS[key] ?? Wallet;
}
