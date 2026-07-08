export interface SkuStandardRow {
  product_family: string;
  order_no: string;
  item_code: string;
  description: string;
  list_price?: number;
  actual_price?: number;
  price_deviation?: number;
  list_cost?: number;
  actual_cost?: number;
  cost_deviation?: number;
  [key: string]: unknown;
}

export interface SkuNonStdRow {
  product_family: string;
  order_no: string;
  item_code: string;
  description: string;
  actual_nonstd_margin: number;
  target_nonstd_margin: number;
  deviation_pp: number;
  overall_actual: number;
  overall_target: number;
  notional_loss: number;
  revenue_inr: number;
}

export interface SkuQuarterData {
  quarter: string;
  standard_rows: SkuStandardRow[];
  nonstd_rows: SkuNonStdRow[];
}
