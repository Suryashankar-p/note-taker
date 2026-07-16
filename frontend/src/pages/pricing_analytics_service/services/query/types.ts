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
  channel_direct?: string;
  channel?: string;
  channel_or_direct?: string;
  overall_actual?: number;
  overall_target?: number;
  overall_margin_actual?: number;
  overall_target_pf?: number;
  notional_loss?: number;
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
  channel_direct?: string;
  channel?: string;
  channel_or_direct?: string;
  list_price?: number;
  actual_price?: number;
  price_deviation?: number;
  list_cost?: number;
  actual_cost?: number;
  cost_deviation?: number;
  overall_margin_actual?: number;
  overall_target_pf?: number;
  [key: string]: unknown;
}

export interface SkuQuarterData {
  quarter: string;
  standard_rows: SkuStandardRow[];
  nonstd_rows: SkuNonStdRow[];
  summary?: {
    total_standard_count: number;
    total_nonstd_count: number;
    total_standard_revenue: number;
    total_nonstd_revenue: number;
    total_notional_loss: number;
    std_rows_returned: number;
    nonstd_rows_returned: number;
  };
}

export interface ClassificationFamilyItem {
  family_nk: string;
  display_name: string;
  actual_gm_pct: number;
  baseline_gm_pct: number;
  target_gm_pct: number;
  revenue_inr: number;
  transactions?: number;
  transaction_count?: number;
}

export interface ClassificationCellData {
  gm_pct: number | null;
  revenue_share_pct: number;
  families: ClassificationFamilyItem[];
  total_revenue?: number;
  weighted_baseline_gm_pct?: number | null;
  gm_delta_pp?: number | null;
  below_baseline?: number;
  above_baseline?: number;
}

export interface QoqMatrixCell {
  count: number;
  color: string;
  families: string[];
  familyData: any[];
}

export type QoqMatrixData = Record<string, Record<string, QoqMatrixCell>>;
