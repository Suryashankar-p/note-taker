export const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "Pricing Analytics Service",
    url: "/ai-studio/pricing-analytics",
  },
];

export const workspaces = [
  {
    title: "CEO / CFO Briefing",
    description:
      "Access high-level executive summaries, market trends correlations, and long term strategic forecasts.",
    button: "Enter Briefing Suite",
  },
  {
    title: "Pricing Analyst / Council",
    description:
      "Deep dive into granular SKU performance, elasticity modeling, and competitive benchmark datasets.",
    button: "Launch Analytics Studio",
  },
];

export const pricingAnalyticsServiceBreadCrumbsWorkspace = [
  ...breadCrumbs,
  {
    title: "Workspace",
    url: "/ai-studio/pricing-analytics/workspace",
  }
];

export const pricingAnalyticsServiceBreadCrumbs = [
  ...breadCrumbs,
  {
    title: "Dashboard",
    url: "/ai-studio/pricing-analytics/workspace",
  },
];

export const pricingAnalyticsServicesettingsBreadCrumbs = [
  ...breadCrumbs,
  {
    title: "Settings",
    url: "/ai-studio/pricing-analytics/settings/members",
  },
];

export const roles = [
  { id: 1, name: "Member", value: "MEMBER" },
  { id: 2, name: "Owner", value: "OWNER" },
];
