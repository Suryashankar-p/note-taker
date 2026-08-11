# Walkthrough - Compile Status API and Header Button Navigation

We have successfully integrated the `POST /api/upload/compile/status` check and replaced the temporary navigation tab with a persistent header button on the dashboard views.

## Summary of Changes

### [pricing_analytics_service]

#### [query.ts](file:///home/raina/gia/thermax-frontend-service/frontend/src/pages/pricing_analytics_service/services/query/query.ts)
- Added `useGetCompileStatus` mutation to execute status checks.

#### [AnalystSelectBu.tsx](file:///home/raina/gia/thermax-frontend-service/frontend/src/pages/pricing_analytics_service/components/analyst/AnalystSelectBu.tsx)
- Integrated the check status mutation on card click.
- Renders a spinner loader inside the selected card during checking, then redirects the user to the overall margin dashboard if data exists, otherwise fallback to the upload screen.

#### [PricingAnalyst.tsx](file:///home/raina/gia/thermax-frontend-service/frontend/src/pages/pricing_analytics_service/components/PricingAnalyst.tsx)
- Reverted the navigation tabs to 4 items (hiding them on the upload view).
- Added an **"Upload Files 📤"** button to the top-right header section of all analyst dashboards, allowing users to return to the upload view to manage/update files at any time.
- The button is dynamically hidden when the user is already on the upload screen.
