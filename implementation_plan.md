# Integration of Compile Status API and Analyst Upload Navigation (Header Button Revision)

This plan outlines the integration of the `/upload/compile/status` API, redirecting users dynamically based on compiled data presence, and providing a persistent button in the header to access the file upload screen.

## Proposed Changes

### [pricing_analytics_service]

We will remove the previously added navigation tab and instead add an "Upload Files" button to the header of the analyst view.

---

#### [MODIFY] [PricingAnalyst.tsx](file:///home/raina/gia/thermax-frontend-service/frontend/src/pages/pricing_analytics_service/components/PricingAnalyst.tsx)

1. Revert `showTabs` to only show tabs when the user is not on the upload page:
   ```typescript
   const isUpload = pathname.includes("/upload");
   const showTabs = bu && !isUpload;
   ```
2. Remove the `"5 - UPLOAD FILES"` item from the `tabItems` array.
3. In the header action buttons container, add a conditional button that links to the upload page when the user is viewing the dashboards:
   ```typescript
   {!isUpload && (
     <button
       onClick={() => navigate(`${SETTINGS_BASE}/analyst/${bu}/upload`)}
       className="px-3.5 py-1.5 bg-[#a61c1e] hover:bg-red-750 text-white rounded-lg text-[10px] font-bold tracking-wide transition-colors shadow-sm"
     >
       Upload Files 📤
     </button>
   )}
   ```

## Verification Plan

### Manual Verification
1. Navigate to `/ai-studio/pricing-analytics/workspace/dashboard/analyst/cooling/overall-margin`.
2. Confirm the top-right header contains an **"Upload Files 📤"** button.
3. Click it and confirm it takes you to the file upload screen.
4. Verify that the tabs are hidden while on the upload screen, and the "Upload Files 📤" button is not visible there.
