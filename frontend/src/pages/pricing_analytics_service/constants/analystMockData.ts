// Mock data for Pricing Analyst module

const mockHeatmap = [
  {
    quarter: "Q4 FY 26",
    total_rev: 218300000,
    total_families: 8,
    group_b: { count: 2, rev_pct: 25 },
    group_a: { count: 6, rev_pct: 75 },
    cells: [
      [{ count: 1, rev: 20000000 }, { count: 0, rev: 0 }, { count: 2, rev: 40000000 }],
      [{ count: 0, rev: 0 }, { count: 1, rev: 50000000 }, { count: 0, rev: 0 }],
      [{ count: 1, rev: 30000000 }, { count: 0, rev: 0 }, { count: 3, rev: 78300000 }]
    ]
  }
];

export const analystOverallMarginMock: Record<string, any> = {
  heating: {
    bridge_table: [
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
        baseline_gm_pct: 50.8,
        quarters: {
          "Q2 FY 25": { rev_cr: 9.3, gm_pct: 52.1 },
          "Q3 FY 25": { rev_cr: 10.2, gm_pct: 49.8 },
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
    ],
    margin_trend: [
      { quarter: "Q4 FY 24", overall_gm_pct: 49.7, baseline_gm_pct: 49.7 },
      { quarter: "Q1 FY 25", overall_gm_pct: 50.3, baseline_gm_pct: 49.7 },
      { quarter: "Q2 FY 25", overall_gm_pct: 49.7, baseline_gm_pct: 49.7 },
      { quarter: "Q3 FY 25", overall_gm_pct: 51.8, baseline_gm_pct: 49.7 },
      { quarter: "Q4 FY 25", overall_gm_pct: 48.1, baseline_gm_pct: 49.7 },
      { quarter: "Q1 FY 26", overall_gm_pct: 50.3, baseline_gm_pct: 49.7 },
      { quarter: "Q2 FY 26", overall_gm_pct: 51.5, baseline_gm_pct: 49.7 },
      { quarter: "Q3 FY 26", overall_gm_pct: 51.9, baseline_gm_pct: 49.7 },
      { quarter: "Q4 FY 26", overall_gm_pct: 52.2, baseline_gm_pct: 49.7 },
    ],
    revenue_vs_cogs: [
      { quarter: "Q4 FY 24", revenue_inr: 204800000, cogs_inr: 103100000, transactions: 5718 },
      { quarter: "Q1 FY 25", revenue_inr: 137700000, cogs_inr: 68500000, transactions: 4850 },
      { quarter: "Q2 FY 25", revenue_inr: 162700000, cogs_inr: 81800000, transactions: 5891 },
      { quarter: "Q3 FY 25", revenue_inr: 189000000, cogs_inr: 91400000, transactions: 5987 },
      { quarter: "Q4 FY 25", revenue_inr: 245400000, cogs_inr: 125200000, transactions: 6289 },
      { quarter: "Q1 FY 26", revenue_inr: 152500000, cogs_inr: 75800000, transactions: 5142 },
      { quarter: "Q2 FY 26", revenue_inr: 207100000, cogs_inr: 100500000, transactions: 5551 },
      { quarter: "Q3 FY 26", revenue_inr: 210300000, cogs_inr: 101100000, transactions: 5582 },
      { quarter: "Q4 FY 26", revenue_inr: 218300000, cogs_inr: 104300000, transactions: 5660 },
    ],
    pma_baseline_matrices: mockHeatmap,
  },
  cooling: {
    bridge_table: [
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
    ],
    margin_trend: [
      { quarter: "Q4 FY 24", overall_gm_pct: 64.0, baseline_gm_pct: 64.9 },
      { quarter: "Q4 FY 26", overall_gm_pct: 71.0, baseline_gm_pct: 64.9 },
    ],
    revenue_vs_cogs: [
      { quarter: "Q4 FY 26", revenue_inr: 89000000, cogs_inr: 25800000, transactions: 1500 },
    ],
    pma_baseline_matrices: mockHeatmap,
  },
  water: {
    bridge_table: [
      {
        segment: "Water",
        label: "Overall",
        baseline_rev_cr: 12.4,
        baseline_gm_pct: 54.2,
        quarters: {
          "Q2 FY 25": { rev_cr: 13.1, gm_pct: 56.4 },
          "Q3 FY 25": { rev_cr: 14.5, gm_pct: 53.0 },
          "Q4 FY 25": { rev_cr: 11.2, gm_pct: 55.1 },
          "Q1 FY 26": { rev_cr: 14.0, gm_pct: 56.5 },
          "Q2 FY 26": { rev_cr: 13.9, gm_pct: 57.0 },
          "Q3 FY 26": { rev_cr: 14.2, gm_pct: 57.5 },
          "Q4 FY 26": { rev_cr: 14.8, gm_pct: 57.5 },
        },
      },
    ],
    margin_trend: [
      { quarter: "Q4 FY 24", overall_gm_pct: 54.0, baseline_gm_pct: 54.2 },
      { quarter: "Q4 FY 26", overall_gm_pct: 57.5, baseline_gm_pct: 54.2 },
    ],
    revenue_vs_cogs: [
      { quarter: "Q4 FY 26", revenue_inr: 148000000, cogs_inr: 62800000, transactions: 2400 },
    ],
    pma_baseline_matrices: mockHeatmap,
  },
};

export const analystKpisMock: Record<string, any> = {
  heating: {
    insights: [
      "Standard and Non-Standard GM% rose +1.4 pp combined vs target.",
      "Valve 1 product family is the largest driver of notional margin losses.",
    ],
    bridge: {
      actual_gm_pct: 52.2,
      target_gm_pct: 49.7,
      volume_effect_pp: 0.8,
      mix_effect_pp: 1.2,
      rate_effect_pp: 0.5,
    },
  },
  cooling: {
    insights: [
      "Cooling compressor standard list pricing remains strong.",
    ],
    bridge: {
      actual_gm_pct: 71.0,
      target_gm_pct: 68.0,
      volume_effect_pp: 1.5,
      mix_effect_pp: 0.8,
      rate_effect_pp: 0.7,
    },
  },
  water: {
    insights: [
      "Water purification spares standard pricing is performing optimally.",
    ],
    bridge: {
      actual_gm_pct: 57.5,
      target_gm_pct: 54.2,
      volume_effect_pp: 1.0,
      mix_effect_pp: 0.5,
      rate_effect_pp: 0.8,
    },
  },
};

export const analystSkyscraperMock: Record<string, any> = {
  heating: {
    "Q4 FY 26": [
      { display_name: "He (Shell)", actual_gm_pct: 64.3, target_gm_pct: 52.0, ref_gm_pct: 50.8, margin_gap_pp: 12.3, baseline_margin_gap_pp: 13.5, revenue_inr: 902000, revenue_share_pct: 0.4 },
      { display_name: "Furnace", actual_gm_pct: 74.6, target_gm_pct: 64.3, ref_gm_pct: 64.3, margin_gap_pp: 10.3, baseline_margin_gap_pp: 10.3, revenue_inr: 57000, revenue_share_pct: 0.0 },
      { display_name: "ID Fan", actual_gm_pct: 51.9, target_gm_pct: 45.9, ref_gm_pct: 45.9, margin_gap_pp: 6.0, baseline_margin_gap_pp: 6.0, revenue_inr: 2167000, revenue_share_pct: 1.0 },
      { display_name: "VALVE 2 (VA)", actual_gm_pct: 65.6, target_gm_pct: 60.0, ref_gm_pct: 60.0, margin_gap_pp: 5.6, baseline_margin_gap_pp: 5.6, revenue_inr: 371000, revenue_share_pct: 0.2 },
      { display_name: "Pneumatic Cylinder", actual_gm_pct: 61.7, target_gm_pct: 56.3, ref_gm_pct: 56.3, margin_gap_pp: 5.4, baseline_margin_gap_pp: 5.4, revenue_inr: 500000, revenue_share_pct: 0.2 },
      { display_name: "Screw Feeder", actual_gm_pct: 63.3, target_gm_pct: 58.1, ref_gm_pct: 58.1, margin_gap_pp: 5.2, baseline_margin_gap_pp: 5.2, revenue_inr: 1137000, revenue_share_pct: 0.5 },
      { display_name: "HE (MPA)", actual_gm_pct: 56.8, target_gm_pct: 52.0, ref_gm_pct: 52.0, margin_gap_pp: 4.8, baseline_margin_gap_pp: 4.8, revenue_inr: 7434000, revenue_share_pct: 3.4 },
    ],
    byQuarter: {
      "Q4 FY 26": {
        insights: [
          "Largest gap vs target: Fan at -19.1 pp below PMA (₹44.92L, 2.1% of quarter revenue).",
          "Highest revenue below target: HE (Coil) — ₹450.84L at -11.7 pp (20.7% share).",
        ],
      },
    },
  },
  cooling: {
    "Q4 FY 26": [
      { display_name: "Chiller Overall", actual_gm_pct: 72.0, target_gm_pct: 68.0, ref_gm_pct: 64.9, margin_gap_pp: 4.0, baseline_margin_gap_pp: 7.1, revenue_inr: 4500000, revenue_share_pct: 50.5 },
    ],
    byQuarter: {
      "Q4 FY 26": {
        insights: ["Cooling Compressor at -12.5 pp below PMA target."],
      },
    },
  },
  water: {
    "Q4 FY 26": [
      { display_name: "Water Spares", actual_gm_pct: 59.0, target_gm_pct: 56.0, ref_gm_pct: 54.2, margin_gap_pp: 3.0, baseline_margin_gap_pp: 4.8, revenue_inr: 3200000, revenue_share_pct: 20.2 },
    ],
    byQuarter: {
      "Q4 FY 26": {
        insights: ["Water Treatment Spares meet target parameters."],
      },
    },
  },
};

export const analystQoqMatrixMock: Record<string, any> = {
  heating: {
    quarters: ["Q1 FY 26", "Q2 FY 26", "Q3 FY 26", "Q4 FY 26"],
    familyDetails: {
      "valve 1": { nk: "valve 1", actual_gm_pct: 51.9, target_gm_pct: 52.0, baseline_gm_pct: 52.4, delta_pp: -0.1, revenue_inr: 15061000, transaction_count: 694 },
    },
    familyHistory: {
      "valve 1": {
        "Q1 FY 26": { actual_gm_pct: 50.2, target_gm_pct: 52.0, revenue_inr: 12000000 },
        "Q2 FY 26": { actual_gm_pct: 51.5, target_gm_pct: 52.0, revenue_inr: 14000000 },
        "Q3 FY 26": { actual_gm_pct: 51.9, target_gm_pct: 52.0, revenue_inr: 15000000 },
        "Q4 FY 26": { actual_gm_pct: 52.2, target_gm_pct: 52.0, revenue_inr: 15061000 },
      },
    },
    quarterMatrices: {
      "Q4 FY 26": {
        "Above target (> +3pp)": { "Rising 3Q": ["DUCT"], "Rising 2Q": ["VALVE 2 (VA)"], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": ["Electric Actuator"] },
        "Within target (±3pp)": { "Rising 3Q": ["Fuel handling"], "Rising 2Q": [], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": ["MISCELLANEOUS"] },
        "Below target (< -3pp)": { "Rising 3Q": [], "Rising 2Q": ["Valve 1"], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": [] },
      },
    },
  },
  cooling: {
    quarters: ["Q4 FY 26"],
    familyDetails: {
      "compressor 1": { nk: "compressor 1", actual_gm_pct: 72.0, target_gm_pct: 68.0, baseline_gm_pct: 64.9, delta_pp: 4.0, revenue_inr: 45000000, transaction_count: 120 },
    },
    familyHistory: {
      "compressor 1": {
        "Q4 FY 26": { actual_gm_pct: 72.0, target_gm_pct: 68.0, revenue_inr: 45000000 },
      },
    },
    quarterMatrices: {
      "Q4 FY 26": {
        "Above target (> +3pp)": { "Rising 3Q": ["compressor 1"], "Rising 2Q": [], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": [] },
        "Within target (±3pp)": { "Rising 3Q": [], "Rising 2Q": [], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": [] },
        "Below target (< -3pp)": { "Rising 3Q": [], "Rising 2Q": [], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": [] },
      },
    },
  },
  water: {
    quarters: ["Q4 FY 26"],
    familyDetails: {
      "water pump 1": { nk: "water pump 1", actual_gm_pct: 59.0, target_gm_pct: 56.0, baseline_gm_pct: 54.2, delta_pp: 3.0, revenue_inr: 3200000, transaction_count: 85 },
    },
    familyHistory: {
      "water pump 1": {
        "Q4 FY 26": { actual_gm_pct: 59.0, target_gm_pct: 56.0, revenue_inr: 3200000 },
      },
    },
    quarterMatrices: {
      "Q4 FY 26": {
        "Above target (> +3pp)": { "Rising 3Q": ["water pump 1"], "Rising 2Q": [], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": [] },
        "Within target (±3pp)": { "Rising 3Q": [], "Rising 2Q": [], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": [] },
        "Below target (< -3pp)": { "Rising 3Q": [], "Rising 2Q": [], "Falling 2Q": [], "Falling 3Q": [], "Fluctuating": [] },
      },
    },
  },
};

export const analystSkuDeviationMock: Record<string, any> = {
  heating: {
    quarterMap: {
      "Q4 FY 26": {
        standard_rows: [
          { product_family: "VALVE 1", order_no: "350776182", item_code: "P253X00110", description: "VALVE, SOL - KACH - W20 40 R/RX, DN 40, KF 1-1/2, 230 V", channel_or_direct: "Direct", list_price: 20959.00, actual_price: 10450.00, price_deviation: -50.1, list_cost: 41650.00, actual_cost: 42001.70, cost_deviation: -0.8, overall_margin_actual: 51.9, overall_target_pf: 52.0, notional_loss: 10509 },
        ],
        nonstd_rows: [
          { product_family: "VALVE 1", order_no: "35070015", item_code: "P291V10980", description: "VALVE, BLOW DOWN - 40NB, 1500, ACT, 230V", actual_nonstd_margin: 62.7, target_nonstd_margin: 5.0, deviation_pp: 57.7, overall_actual: 62.5, overall_target: 62.5, notional_loss: 2310 },
        ],
      },
    },
  },
  cooling: {
    quarterMap: {
      "Q4 FY 26": {
        standard_rows: [
          { product_family: "COMPRESSOR 1", order_no: "450776182", item_code: "C253X00110", description: "COOLING COMPRESSOR XL", channel_or_direct: "Direct", list_price: 50959.00, actual_price: 52450.00, price_deviation: 2.9, list_cost: 30000.00, actual_cost: 29500.00, cost_deviation: 1.7, overall_margin_actual: 72.0, overall_target_pf: 68.0, notional_loss: 0 },
        ],
        nonstd_rows: [],
      },
    },
  },
  water: {
    quarterMap: {
      "Q4 FY 26": {
        standard_rows: [
          { product_family: "WATER PUMP 1", order_no: "550776182", item_code: "W253X00110", description: "WATER PURIFICATION PUMP HP", channel_or_direct: "Direct", list_price: 15959.00, actual_price: 16450.00, price_deviation: 3.1, list_cost: 10000.00, actual_cost: 9800.00, cost_deviation: 2.0, overall_margin_actual: 59.0, overall_target_pf: 56.0, notional_loss: 0 },
        ],
        nonstd_rows: [],
      },
    },
  },
};
