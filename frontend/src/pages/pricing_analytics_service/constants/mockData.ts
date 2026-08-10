// Mock data for CEO/CFO briefing module

export interface QuarterMetric {
  rev_cr: number;
  gm_pct: number;
}

export interface OverallMarginRow {
  segment: string; // e.g., 'Heating', 'Cooling', 'Water'
  label: string;   // e.g., 'Overall', 'Standard', 'Non-standard', 'Spares', 'Membranes'
  baseline_rev_cr: number;
  baseline_gm_pct: number;
  quarters: Record<string, QuarterMetric>;
}

export const overallMarginTableData: OverallMarginRow[] = [
  {
    segment: "Heating",
    label: "Overall",
    baseline_rev_cr: 17.1,
    baseline_gm_pct: 49.8,
    quarters: {
      "Q2 FY 25": { rev_cr: 18.9, gm_pct: 51.9 },
      "Q3 FY 25": { rev_cr: 24.1, gm_pct: 47.7 },
      "Q4 FY 25": { rev_cr: 15.2, gm_pct: 50.4 },
      "Q1 FY 26": { rev_cr: 20.7, gm_pct: 51.7 },
      "Q2 FY 26": { rev_cr: 21.0, gm_pct: 51.9 },
      "Q3 FY 26": { rev_cr: 21.8, gm_pct: 52.2 },
      "Q4 FY 26": { rev_cr: 22.4, gm_pct: 52.2 },
    },
  },
  {
    segment: "Heating",
    label: "Standard",
    baseline_rev_cr: 8.1,
    baseline_gm_pct: 50.6,
    quarters: {
      "Q2 FY 25": { rev_cr: 9.3, gm_pct: 52.1 },
      "Q3 FY 25": { rev_cr: 10.2, gm_pct: 48.6 },
      "Q4 FY 25": { rev_cr: 8.4, gm_pct: 51.7 },
      "Q1 FY 26": { rev_cr: 9.3, gm_pct: 52.8 },
      "Q2 FY 26": { rev_cr: 10.0, gm_pct: 52.7 },
      "Q3 FY 26": { rev_cr: 9.2, gm_pct: 54.1 },
      "Q4 FY 26": { rev_cr: 9.8, gm_pct: 54.1 },
    },
  },
  {
    segment: "Heating",
    label: "Non-standard",
    baseline_rev_cr: 9.0,
    baseline_gm_pct: 49.1,
    quarters: {
      "Q2 FY 25": { rev_cr: 9.6, gm_pct: 51.0 },
      "Q3 FY 25": { rev_cr: 13.9, gm_pct: 47.0 },
      "Q4 FY 25": { rev_cr: 6.9, gm_pct: 48.8 },
      "Q1 FY 26": { rev_cr: 11.4, gm_pct: 50.9 },
      "Q2 FY 26": { rev_cr: 11.0, gm_pct: 51.2 },
      "Q3 FY 26": { rev_cr: 12.7, gm_pct: 50.9 },
      "Q4 FY 26": { rev_cr: 12.6, gm_pct: 50.9 },
    },
  },
  {
    segment: "Cooling",
    label: "Overall",
    baseline_rev_cr: 10.2,
    baseline_gm_pct: 64.9,
    quarters: {
      "Q2 FY 25": { rev_cr: 12.1, gm_pct: 68.5 },
      "Q3 FY 25": { rev_cr: 7.2, gm_pct: 63.5 },
      "Q4 FY 25": { rev_cr: 8.5, gm_pct: 67.3 },
      "Q1 FY 26": { rev_cr: 10.8, gm_pct: 69.2 },
      "Q2 FY 26": { rev_cr: 7.7, gm_pct: 67.7 },
      "Q3 FY 26": { rev_cr: 8.4, gm_pct: 71.0 },
      "Q4 FY 26": { rev_cr: 8.9, gm_pct: 71.0 },
    },
  },
  {
    segment: "Cooling",
    label: "Standard",
    baseline_rev_cr: 4.9,
    baseline_gm_pct: 56.4,
    quarters: {
      "Q2 FY 25": { rev_cr: 1.8, gm_pct: 80.2 },
      "Q3 FY 25": { rev_cr: 3.1, gm_pct: 58.0 },
      "Q4 FY 25": { rev_cr: 5.3, gm_pct: 69.5 },
      "Q1 FY 26": { rev_cr: 5.5, gm_pct: 70.3 },
      "Q2 FY 26": { rev_cr: 3.5, gm_pct: 70.0 },
      "Q3 FY 26": { rev_cr: 4.4, gm_pct: 69.5 },
      "Q4 FY 26": { rev_cr: 4.8, gm_pct: 69.5 },
    },
  },
  {
    segment: "Cooling",
    label: "Non-standard",
    baseline_rev_cr: 5.3,
    baseline_gm_pct: 72.7,
    quarters: {
      "Q2 FY 25": { rev_cr: 10.3, gm_pct: 66.5 },
      "Q3 FY 25": { rev_cr: 4.1, gm_pct: 70.8 },
      "Q4 FY 25": { rev_cr: 3.2, gm_pct: 63.6 },
      "Q1 FY 26": { rev_cr: 5.2, gm_pct: 68.0 },
      "Q2 FY 26": { rev_cr: 4.2, gm_pct: 65.8 },
      "Q3 FY 26": { rev_cr: 4.0, gm_pct: 72.0 },
      "Q4 FY 26": { rev_cr: 4.1, gm_pct: 72.0 },
    },
  },
  {
    segment: "Water",
    label: "Overall",
    baseline_rev_cr: 9.7,
    baseline_gm_pct: 27.7,
    quarters: {
      "Q2 FY 25": { rev_cr: 8.8, gm_pct: 28.7 },
      "Q3 FY 25": { rev_cr: 9.8, gm_pct: 34.5 },
      "Q4 FY 25": { rev_cr: 8.7, gm_pct: 33.6 },
      "Q1 FY 26": { rev_cr: 13.8, gm_pct: 27.6 },
      "Q2 FY 26": { rev_cr: 12.8, gm_pct: 25.8 },
      "Q3 FY 26": { rev_cr: 13.7, gm_pct: 28.5 },
      "Q4 FY 26": { rev_cr: 14.1, gm_pct: 28.5 },
    },
  },
  {
    segment: "Water",
    label: "Spares",
    baseline_rev_cr: 6.8,
    baseline_gm_pct: 34.8,
    quarters: {
      "Q2 FY 25": { rev_cr: 4.6, gm_pct: 42.7 },
      "Q3 FY 25": { rev_cr: 6.6, gm_pct: 45.1 },
      "Q4 FY 25": { rev_cr: 5.3, gm_pct: 40.1 },
      "Q1 FY 26": { rev_cr: 6.7, gm_pct: 41.0 },
      "Q2 FY 26": { rev_cr: 6.2, gm_pct: 41.4 },
      "Q3 FY 26": { rev_cr: 6.6, gm_pct: 49.2 },
      "Q4 FY 26": { rev_cr: 7.0, gm_pct: 49.2 },
    },
  },
  {
    segment: "Water",
    label: "Membranes",
    baseline_rev_cr: 2.9,
    baseline_gm_pct: 11.4,
    quarters: {
      "Q2 FY 25": { rev_cr: 4.2, gm_pct: 13.7 },
      "Q3 FY 25": { rev_cr: 3.2, gm_pct: 12.5 },
      "Q4 FY 25": { rev_cr: 3.4, gm_pct: 13.9 },
      "Q1 FY 26": { rev_cr: 7.1, gm_pct: 14.8 },
      "Q2 FY 26": { rev_cr: 6.6, gm_pct: 11.0 },
      "Q3 FY 26": { rev_cr: 7.1, gm_pct: 9.3 },
      "Q4 FY 26": { rev_cr: 7.1, gm_pct: 9.3 },
    },
  },
];

export const marginTrendChartMock = [
  { quarter: "Q4 FY 24", Heating: 48.1, Cooling: 62.4, Water: 25.1 },
  { quarter: "Q1 FY 25", Heating: 51.2, Cooling: 64.7, Water: 30.5 },
  { quarter: "Q2 FY 25", Heating: 51.9, Cooling: 68.5, Water: 28.7 },
  { quarter: "Q3 FY 25", Heating: 47.7, Cooling: 63.5, Water: 34.5 },
  { quarter: "Q4 FY 25", Heating: 50.4, Cooling: 67.3, Water: 33.6 },
  { quarter: "Q1 FY 26", Heating: 51.7, Cooling: 69.2, Water: 27.6 },
  { quarter: "Q2 FY 26", Heating: 51.9, Cooling: 67.7, Water: 25.8 },
  { quarter: "Q3 FY 26", Heating: 52.2, Cooling: 71.0, Water: 28.5 },
  { quarter: "Q4 FY 26", Heating: 52.4, Cooling: 71.5, Water: 28.9 },
];

export const buClassificationMock: Record<string, any> = {
  heating: {
    quarter: "Q4 FY 26",
    matrix: {
      Proprietary: {
        Low: { families: [{ display_name: "SWITCH 1", baseline_gm_pct: 46.7, target_gm_pct: 52.0, actual_gm_pct: 53.69, revenue_inr: 824000, transactions: 1 }], below_baseline: 0, above_baseline: 1, gm_pct: 53.69, gm_delta_pp: 6.99, revenue_share_pct: 0.4, total_revenue: 824000 },
        Medium: { families: [{ display_name: "Level Controller", baseline_gm_pct: 46.3, target_gm_pct: 52.0, actual_gm_pct: 57.5, revenue_inr: 3475000, transactions: 1 }], below_baseline: 0, above_baseline: 1, gm_pct: 57.50, gm_delta_pp: 11.20, revenue_share_pct: 1.6, total_revenue: 3475000 },
        High: { families: [{ display_name: "Electric Heater", baseline_gm_pct: 57.9, target_gm_pct: 60.0, actual_gm_pct: 63.87, revenue_inr: 720000, transactions: 1 }], below_baseline: 0, above_baseline: 1, gm_pct: 63.87, gm_delta_pp: 5.97, revenue_share_pct: 0.3, total_revenue: 720000 },
      },
      "Value-added": {
        Low: { families: [{ display_name: "Burner 2 (Fab)", baseline_gm_pct: 42.56, target_gm_pct: 50.0, actual_gm_pct: 56.84, revenue_inr: 1190000, transactions: 2 }], below_baseline: 0, above_baseline: 2, gm_pct: 56.84, gm_delta_pp: 14.28, revenue_share_pct: 0.5, total_revenue: 1190000 },
        Medium: { families: [{ display_name: "ID Fan", baseline_gm_pct: 49.36, target_gm_pct: 53.0, actual_gm_pct: 55.94, revenue_inr: 18740000, transactions: 9 }], below_baseline: 0, above_baseline: 9, gm_pct: 55.94, gm_delta_pp: 6.58, revenue_share_pct: 8.6, total_revenue: 18740000 },
        High: { families: [{ display_name: "HE (Shell)", baseline_gm_pct: 50.6, target_gm_pct: 55.0, actual_gm_pct: 56.54, revenue_inr: 7040000, transactions: 1 }], below_baseline: 0, above_baseline: 1, gm_pct: 56.54, gm_delta_pp: 5.94, revenue_share_pct: 3.2, total_revenue: 7040000 },
      },
      Commodity: {
        Low: { families: [{ display_name: "HE (Coil)", baseline_gm_pct: 50.8, target_gm_pct: 53.0, actual_gm_pct: 54.28, revenue_inr: 9860000, transactions: 8 }], below_baseline: 4, above_baseline: 8, gm_pct: 54.28, gm_delta_pp: 3.48, revenue_share_pct: 4.5, total_revenue: 9860000 },
        Medium: { families: [{ display_name: "VALVE 2 (VA)", baseline_gm_pct: 51.76, target_gm_pct: 52.0, actual_gm_pct: 52.23, revenue_inr: 118240000, transactions: 13 }], below_baseline: 7, above_baseline: 13, gm_pct: 52.23, gm_delta_pp: 0.47, revenue_share_pct: 54.2, total_revenue: 118240000 },
        High: { families: [{ display_name: "Furnace", baseline_gm_pct: 51.1, target_gm_pct: 51.0, actual_gm_pct: 50.35, revenue_inr: 424210000, transactions: 16 }], below_baseline: 11, above_baseline: 16, gm_pct: 50.35, gm_delta_pp: -0.75, revenue_share_pct: 19.4, total_revenue: 424210000 },
      },
    },
    summary: {
      total_below_baseline: 22,
      total_above_baseline: 53,
      pooled_actual_gm_pct: 52.24,
      pooled_baseline_gm_pct: 50.8,
      global_delta_pp: 1.44,
      total_revenue_inr: 584614000,
    },
    insights: [
      { type: "success", text: "Commodity - High revenue share +3.0 pp (22.4% -> 19.4%): Cell GM weakened -0.4 pp (50.8% -> 50.4%; portfolio 48.8%). Mix -1.5 pp; margin -0.1 pp. So what: you sold less of this segment and margins inside it also fell — a double pressure on portfolio GM. Family count below baseline is stable; the margin drop is mainly rate/pricing on the same mix of families." },
      { type: "success", text: "Commodity - Medium revenue share -2.2 pp (56.4% -> 54.2%): Cell GM improved +1.5 pp (50.7% -> 52.2%; portfolio 48.8%). Mix -1.1 pp; margin +0.8 pp. So what: share fell but cell GM rose — volume likely shifted to stronger buckets while what you still sell here is priced better." },
      { type: "info", text: "Below-baseline concentration: Q4 FY 26 has 22 product families below baseline across the matrix (31 in Q3 FY 26). 0% of classified heating revenue sits in below-baseline families. So what: fewer families are below baseline; any GM pressure is more about rates inside cells than a wider count of weak families." },
      { type: "info", text: "Families that flipped below baseline: SWITCH 1, Burner 2 (Fab), Level controller, Electric Heater (+ 1 more) were above baseline in Q3 FY 26 but below in Q4 FY 26. So what: these are newly weak performers — check non-standard mix and catalogue price/cost on these names first." }
    ]
  },
  cooling: {
    quarter: "Q4 FY 26",
    matrix: {
      Proprietary: {
        Low: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        Medium: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        High: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
      },
      "Value-added": {
        Low: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        Medium: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        High: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
      },
      Commodity: {
        Low: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        Medium: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        High: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
      },
    },
    summary: {
      total_below_baseline: 10,
      total_above_baseline: 25,
      pooled_actual_gm_pct: 71.0,
      pooled_baseline_gm_pct: 64.9,
      global_delta_pp: 6.1,
      total_revenue_inr: 89000000,
    },
    insights: [
      { type: "success", text: "Cooling segment showed significant improvements in margins, driven mainly by Standard equipment catalog prices." }
    ]
  },
  water: {
    quarter: "Q4 FY 26",
    matrix: {
      Proprietary: {
        Low: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        Medium: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        High: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
      },
      "Value-added": {
        Low: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        Medium: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        High: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
      },
      Commodity: {
        Low: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        Medium: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
        High: { families: [], below_baseline: 0, above_baseline: 0, gm_pct: null, gm_delta_pp: 0, revenue_share_pct: 0, total_revenue: 0 },
      },
    },
    summary: {
      total_below_baseline: 15,
      total_above_baseline: 20,
      pooled_actual_gm_pct: 28.5,
      pooled_baseline_gm_pct: 27.7,
      global_delta_pp: 0.8,
      total_revenue_inr: 141000000,
    },
    insights: [
      { type: "info", text: "Spares segment margin increased to 49.2%, offsetting declines in Membranes." }
    ]
  }
};

export const buLadderMock: Record<string, any> = {
  heating: {
    summary: { total: 75, above: 21, below: 54 },
    chartData: Array.from({ length: 75 }).map((_, i) => ({
      name: `Family ${i + 1}`,
      value: i < 21 ? (20 - i) * 0.8 : -(i - 20) * 0.4
    })),
    insights: [
      { title: "Largest gap vs target", text: "Fan at -19.1 pp below PMA (₹44.92L, 2.1% of quarter revenue). So what: this family alone is the single biggest target miss in Q4 FY 26." },
      { title: "Highest revenue below target", text: "HE (Coil) — ₹450.84L at -11.7 pp (20.7% share). So what: even if not the deepest miss, its size makes it the main lever to lift heating GM." },
      { title: "Chronic drag", text: "HE (Coil) (20.7% share, -11.7 pp); Tube (3.9% share, -6.5 pp); pump 1 (3.5% share, -3.2 pp); Burner 1 (4.9% share, -1.8 pp) (+ 1 more) — below target for 3 consecutive quarter(s) with meaningful share (= ₹0.64 Cr GM at risk). So what: structural underperformance, not a one-off quarter." },
      { title: "HE (Coil) — diagnosis", text: "Standard GM 65.0% (16% of family rev) vs non-standard 49.1%. Non-standard mix is the primary drag — bespoke / non-catalogue volume is running below PMA target, not standard list-price discipline." }
    ],
    families: [
      { name: "He (Shell)", actual: 64.3, target: 52.0, delta: 12.3, revenue: 9.02, share: 0.4 },
      { name: "Furnace", actual: 74.6, target: 64.3, delta: 10.3, revenue: 0.57, share: 0.0 },
      { name: "ID Fan", actual: 51.9, target: 45.9, delta: 6.0, revenue: 21.67, share: 1.0 },
      { name: "VALVE 2 (VA)", actual: 65.6, target: 60.0, delta: 5.6, revenue: 3.71, share: 0.2 },
      { name: "Pneumatic Cylinder", actual: 61.7, target: 56.3, delta: 5.4, revenue: 5.00, share: 0.2 },
      { name: "Screw Feeder", actual: 63.3, target: 58.1, delta: 5.2, revenue: 11.37, share: 0.5 },
      { name: "HE (MPA)", actual: 56.8, target: 52.0, delta: 4.8, revenue: 74.34, share: 3.4 },
      { name: "WEGMAN CONE", actual: 64.2, target: 59.9, delta: 4.3, revenue: 37.98, share: 1.7 },
      { name: "Sight Glass", actual: 63.8, target: 59.5, delta: 4.3, revenue: 0.16, share: 0.0 },
    ]
  },
  cooling: {
    summary: { total: 30, above: 12, below: 18 },
    chartData: Array.from({ length: 30 }).map((_, i) => ({
      name: `Family ${i + 1}`,
      value: i < 12 ? (15 - i) * 1.0 : -(i - 11) * 0.6
    })),
    insights: [
      { title: "Largest gap vs target", text: "Cooling Compressor at -12.5 pp below PMA." },
    ],
    families: [
      { name: "Chiller Overall", actual: 72.0, target: 68.0, delta: 4.0, revenue: 45.0, share: 50.5 },
    ]
  },
  water: {
    summary: { total: 25, above: 8, below: 17 },
    chartData: Array.from({ length: 25 }).map((_, i) => ({
      name: `Family ${i + 1}`,
      value: i < 8 ? (10 - i) * 0.9 : -(i - 7) * 0.5
    })),
    insights: [
      { title: "Membranes performance", text: "Below baseline target due to raw material hikes." },
    ],
    families: [
      { name: "Reverse Osmosis Systems", actual: 29.1, target: 28.0, delta: 1.1, revenue: 82.5, share: 58.5 },
    ]
  }
};

export const buDispersionMock: Record<string, any> = {
  heating: {
    qoqMovement: [
      { quarter: "Q1 FY 26", desc: "Current dispersion lower than baseline", families: "27%", revShare: "27%", activeCount: "20 of 73 families" },
      { quarter: "Q2 FY 26", desc: "Current dispersion lower than baseline", families: "32%", revShare: "21%", activeCount: "24 of 74 families" },
      { quarter: "Q3 FY 26", desc: "Current dispersion lower than baseline", families: "44%", revShare: "36%", activeCount: "32 of 73 families" },
      { quarter: "Q4 FY 26", desc: "Current dispersion lower than baseline", families: "39%", revShare: "20%", activeCount: "28 of 71 families" },
    ],
    selectedFamily: "Air nozzle",
    dispersionCurve: {
      baseline: [10, 15, 30, 60, 95, 120, 110, 80, 45, 20, 5],
      lastQuarter: [8, 12, 25, 55, 90, 130, 115, 75, 40, 15, 4],
      currentQuarter: [6, 10, 20, 50, 85, 140, 125, 70, 35, 12, 3]
    },
    trendLine: [
      { quarter: "Q1 FY 25", mean: 52.4, range: [45.1, 59.7] },
      { quarter: "Q2 FY 25", mean: 51.9, range: [44.8, 59.0] },
      { quarter: "Q3 FY 25", mean: 52.8, range: [46.0, 59.6] },
      { quarter: "Q4 FY 25", mean: 53.5, range: [45.8, 61.2] },
      { quarter: "Q1 FY 26", mean: 54.1, range: [46.5, 61.7] },
      { quarter: "Q2 FY 26", mean: 55.3, range: [47.8, 62.8] },
      { quarter: "Q3 FY 26", mean: 53.9, range: [46.0, 61.8] },
      { quarter: "Q4 FY 26", mean: 54.8, range: [47.1, 62.5] },
    ],
    examples: [
      { category: "GM gone up, Dispersion came down", examples: ["Heat Pump (Unclassified)", "Panel 2 (VA) (Value-added)"] },
      { category: "GM gone up, Dispersion gone up", examples: ["Burner 1 (Commodity)", "PUMP 1 (Commodity)"] },
      { category: "GM flat, dispersion down", examples: ["Pressure switch (Commodity)", "Ignition transformer (Commodity)"] }
    ]
  },
  cooling: {
    qoqMovement: [
      { quarter: "Q4 FY 26", desc: "Current dispersion stable", families: "15%", revShare: "18%", activeCount: "12 of 80 families" },
    ],
    selectedFamily: "Compressor",
    dispersionCurve: {
      baseline: [5, 10, 20, 45, 80, 110, 95, 70, 40, 18, 5],
      lastQuarter: [4, 9, 18, 40, 75, 105, 90, 65, 38, 15, 4],
      currentQuarter: [3, 8, 15, 35, 70, 100, 85, 60, 35, 12, 3]
    },
    trendLine: [
      { quarter: "Q4 FY 26", mean: 65.5, range: [58.0, 73.0] },
    ],
    examples: [
      { category: "GM gone up, Dispersion came down", examples: ["Cooling Fan"] }
    ]
  },
  water: {
    qoqMovement: [
      { quarter: "Q4 FY 26", desc: "Current dispersion slightly higher", families: "22%", revShare: "25%", activeCount: "18 of 75 families" },
    ],
    selectedFamily: "Membranes",
    dispersionCurve: {
      baseline: [15, 20, 35, 55, 75, 90, 80, 60, 40, 22, 10],
      lastQuarter: [12, 18, 30, 50, 70, 85, 75, 55, 35, 20, 8],
      currentQuarter: [10, 15, 25, 45, 65, 80, 70, 50, 30, 18, 6]
    },
    trendLine: [
      { quarter: "Q4 FY 26", mean: 28.5, range: [20.0, 37.0] },
    ],
    examples: [
      { category: "GM flat, dispersion down", examples: ["RO Spares"] }
    ]
  }
};
