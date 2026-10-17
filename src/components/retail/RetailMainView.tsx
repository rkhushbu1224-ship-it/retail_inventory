import React, { useState } from 'react';
import { AppShell, PageId } from '../layout/AppShell';
import { RetailDashboard } from './RetailDashboard';
import { RetailPOS } from './RetailPOS';
import { RetailProducts } from './RetailProducts';
import { RetailLowStock } from './RetailLowStock';
import { RetailMovements } from './RetailMovements';
import { RetailSalesHistory } from './RetailSalesHistory';
import { RetailReports } from './RetailReports';

export const RetailMainView: React.FC = () => {
  const [page, setPage] = useState<PageId>('dashboard');
  // Bumped whenever stock changes so the sidebar badge and dashboard refresh.
  const [stockVersion, setStockVersion] = useState(0);
  const onStockChanged = () => setStockVersion((v) => v + 1);

  return (
    <AppShell page={page} onNavigate={setPage} stockVersion={stockVersion}>
      {page === 'dashboard' && <RetailDashboard onNavigate={setPage} stockVersion={stockVersion} />}
      {page === 'sale' && <RetailPOS onStockChanged={onStockChanged} />}
      {page === 'products' && <RetailProducts onStockChanged={onStockChanged} />}
      {page === 'low-stock' && <RetailLowStock onStockChanged={onStockChanged} />}
      {page === 'history' && <RetailMovements />}
      {page === 'sales' && <RetailSalesHistory />}
      {page === 'reports' && <RetailReports />}
    </AppShell>
  );
};
