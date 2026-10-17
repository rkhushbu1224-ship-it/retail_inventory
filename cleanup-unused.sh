#!/bin/sh
# Removes the old asset-management screens that the new retail frontend no longer uses.
# Run from the project root AFTER copying the new files in. Review the list first.
# src/data, src/types.ts and server/ are left alone so scripts/seed_mongodb_state.ts and the backend keep working.
set -e
LIST="
src/pages
src/context/InventoryContext.tsx
src/services/storeApiService.ts
src/components/admin
src/components/user
src/components/store
src/components/workflow
src/components/reports
src/components/Header.tsx
src/components/NavigationDrawer.tsx
src/components/AssetDetailModal.tsx
src/components/auth/FirstTimeLoginModal.tsx
src/components/auth/LoginModal.tsx
src/components/auth/RegisterModal.tsx
src/components/common/SaralPortalGuide.tsx
src/components/common/StoreBrandLogo.tsx
src/components/common/GovEnterpriseFooter.tsx
src/components/common/OfficialNoticesModal.tsx
src/components/common/UserProfileUpdateView.tsx
src/components/common/DataEntryModal.tsx
src/components/common/FunctionalRoleBanner.tsx
src/components/common/GfrRulesModal.tsx
src/components/common/SimpleWorkflowHelper.tsx
src/components/common/DeskSwitcher.tsx
src/components/common/ChangePasswordModal.tsx
src/assets
"
echo "This will delete:"; echo "$LIST"
printf "Continue? [y/N] "; read ans
[ "$ans" = "y" ] || { echo "Cancelled."; exit 1; }
for p in $LIST; do rm -rf "$p"; done
echo "Done. Now run: npm install && npm run lint && npm run build"
