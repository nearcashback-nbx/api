import { CashbackCurrency } from "../core/enums";

export const PRICE_MAPPING: Record<CashbackCurrency, number> = {
  [CashbackCurrency.NEAR]: 1,
  [CashbackCurrency.EUR]: 1.6,
  [CashbackCurrency.USD]: 1.65,
};
