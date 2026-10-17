/**
 * Khushbu Electronic Store - Seed Enterprise Portal State to MongoDB via Node.js/Express
 *
 * Reads initial TypeScript collections and saves full state snapshot
 * to the Node.js/Express MongoDB backend at http://localhost:8081/api/state
 *
 * Run:  npx tsx scripts/seed_mongodb_state.ts
 */

import {
  INITIAL_DEPARTMENTS,
  INITIAL_STORES,
  INITIAL_USERS,
  INITIAL_ASSET_GROUPS,
  INITIAL_ITEM_MAKES,
  INITIAL_VENDORS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_ASSETS,
  INITIAL_INDENTS,
  INITIAL_TRANSFERS,
  INITIAL_COMPLAINTS,
  INITIAL_NOTICES,
  INITIAL_FORM9_RECORDS,
  INITIAL_PM_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUPER_CONFIG,
  INITIAL_AMC_PROPOSALS,
} from '../src/data/initialData';

import {
  INITIAL_WORKFLOW_REQUESTS,
  INITIAL_WORKFLOW_NOTIFICATIONS,
  INITIAL_STORE_CATALOG,
  HIERARCHY_USERS,
} from '../src/data/workflowData';

import {
  INITIAL_STORE_PARCELS,
  INITIAL_STORE_DEPARTURES,
  INITIAL_PDF_MANIFEST_LOGS,
} from '../src/data/departureData';

const API_BASE = process.env.API_BASE ?? 'http://127.0.0.1:8081';

// Merge initial users and hierarchy users
const mergedUsers = [...INITIAL_USERS];
const existingUserIds = new Set(mergedUsers.map((u) => u.id));
for (const hu of HIERARCHY_USERS) {
  if (!existingUserIds.has(hu.id)) {
    mergedUsers.push(hu as typeof INITIAL_USERS[0]);
    existingUserIds.add(hu.id);
  }
}

// Build the full snapshot
const snapshot = {
  users: mergedUsers,
  departments: INITIAL_DEPARTMENTS,
  stores: INITIAL_STORES,
  assets: INITIAL_ASSETS,
  indents: INITIAL_INDENTS,
  auditLogs: INITIAL_AUDIT_LOGS,
  assetGroups: INITIAL_ASSET_GROUPS,
  itemMakes: INITIAL_ITEM_MAKES,
  vendors: INITIAL_VENDORS,
  purchaseOrders: INITIAL_PURCHASE_ORDERS,
  complaints: INITIAL_COMPLAINTS,
  notices: INITIAL_NOTICES,
  form9: INITIAL_FORM9_RECORDS,
  pmLogs: INITIAL_PM_LOGS,
  superConfig: INITIAL_SUPER_CONFIG,
  transfers: INITIAL_TRANSFERS,
  workflowRequests: INITIAL_WORKFLOW_REQUESTS,
  workflowNotifications: INITIAL_WORKFLOW_NOTIFICATIONS,
  storeCatalog: INITIAL_STORE_CATALOG,
  amcProposals: INITIAL_AMC_PROPOSALS,
  storeParcels: INITIAL_STORE_PARCELS,
  storeDepartures: INITIAL_STORE_DEPARTURES,
  manifestLogs: INITIAL_PDF_MANIFEST_LOGS,
};

async function seed() {
  console.log('\n[Khushbu Electronic Store] Seeding MongoDB state snapshot via Node.js/Express API...');
  console.log(`Target: ${API_BASE}/api/state\n`);

  try {
    const getRes = await fetch(`${API_BASE}/api/state`);
    const current = await getRes.json().catch(() => ({ revision: 1 }));
    const revision = (current && current.revision) || 1;

    const putRes = await fetch(`${API_BASE}/api/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        revision,
        payload: snapshot,
      }),
    });

    if (!putRes.ok) {
      throw new Error(`PUT /api/state failed with status ${putRes.status}`);
    }

    const result = await putRes.json();
    console.log('✓ Successfully persisted portal state to MongoDB!');
    console.log(`  Revision: ${result.revision}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`✗ Seeding failed: ${msg}`);
  }
}

seed();
