import express from 'express';
import { Sale } from '../models/Sale.js';
import { Product } from '../models/Product.js';
import { isDatabaseConnected } from '../config/db.js';
import { getProductsStore, getSalesStore } from '../services/retailService.js';

const router = express.Router();

/**
 * GET /api/reports/sales
 * Aggregate total sales, transaction counts, top-selling products, and date filtered metrics
 */
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let sales = [];

    if (isDatabaseConnected()) {
      const filter = { status: 'COMPLETED' };
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }
      sales = await Sale.find(filter).sort({ createdAt: -1 });
    } else {
      let list = getSalesStore().filter((s) => s.status === 'COMPLETED');
      if (startDate) {
        const s = new Date(startDate);
        list = list.filter((x) => new Date(x.createdAt) >= s);
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        list = list.filter((x) => new Date(x.createdAt) <= e);
      }
      sales = list;
    }

    const transactionCount = sales.length;
    const totalSalesRevenue = parseFloat(sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0).toFixed(2));
    const totalSubtotal = parseFloat(sales.reduce((acc, s) => acc + (s.subtotal || 0), 0).toFixed(2));
    const totalDiscount = parseFloat(sales.reduce((acc, s) => acc + (s.discountAmount || 0), 0).toFixed(2));
    const totalTax = parseFloat(sales.reduce((acc, s) => acc + (s.taxAmount || 0), 0).toFixed(2));
    const averageOrderValue = transactionCount > 0 ? parseFloat((totalSalesRevenue / transactionCount).toFixed(2)) : 0;

    // Top-selling products aggregation
    const productSalesMap = {};
    const categorySalesMap = {};

    sales.forEach((s) => {
      s.items?.forEach((item) => {
        // Product metrics
        if (!productSalesMap[item.sku]) {
          productSalesMap[item.sku] = {
            sku: item.sku,
            name: item.name,
            totalQuantitySold: 0,
            totalRevenue: 0,
            unitPrice: item.unitPrice,
          };
        }
        productSalesMap[item.sku].totalQuantitySold += item.quantity;
        productSalesMap[item.sku].totalRevenue = parseFloat(
          (productSalesMap[item.sku].totalRevenue + item.itemTotal).toFixed(2)
        );
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 10);

    // Group sales by date for daily chart trends
    const dailyMap = {};
    sales.forEach((s) => {
      const dateKey = new Date(s.createdAt).toISOString().slice(0, 10);
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, total: 0, count: 0 };
      }
      dailyMap[dateKey].total = parseFloat((dailyMap[dateKey].total + s.totalAmount).toFixed(2));
      dailyMap[dateKey].count += 1;
    });

    const dailyTrends = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    const totalUnitsSold = sales.reduce(
      (acc, s) => acc + (s.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0),
      0
    );

    return res.json({
      success: true,
      data: {
        totalRevenue: totalSalesRevenue,
        transactionCount,
        totalUnitsSold,
        averageOrderValue,
        topProducts: topSellingProducts.map((p) => ({
          productId: p.sku,
          sku: p.sku,
          name: p.name,
          quantity: p.totalQuantitySold,
          revenue: p.totalRevenue,
        })),
        salesByDay: dailyTrends,
        summary: {
          totalSalesRevenue,
          transactionCount,
          totalUnitsSold,
          averageOrderValue,
          totalSubtotal,
          totalDiscount,
          totalTax,
        },
        topSellingProducts,
        dailyTrends,
        period: {
          startDate: startDate || 'All Time',
          endDate: endDate || 'All Time',
        },
      },
    });
  } catch (error) {
    console.error('[Reports Sales Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/reports/profit
 * Detailed profit and margin reporting (Revenue - Cost of Goods Sold)
 */
router.get('/profit', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let sales = [];

    if (isDatabaseConnected()) {
      const filter = { status: 'COMPLETED' };
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }
      sales = await Sale.find(filter);
    } else {
      let list = getSalesStore().filter((s) => s.status === 'COMPLETED');
      if (startDate) {
        const s = new Date(startDate);
        list = list.filter((x) => new Date(x.createdAt) >= s);
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        list = list.filter((x) => new Date(x.createdAt) <= e);
      }
      sales = list;
    }

    const totalRevenue = parseFloat(sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0).toFixed(2));
    const netRevenue = parseFloat(sales.reduce((acc, s) => acc + (s.subtotal - s.discountAmount), 0).toFixed(2));
    const totalCostOfGoodsSold = parseFloat(sales.reduce((acc, s) => acc + (s.totalCost || 0), 0).toFixed(2));
    const grossProfit = parseFloat((netRevenue - totalCostOfGoodsSold).toFixed(2));
    const grossMarginPercent = netRevenue > 0 ? parseFloat(((grossProfit / netRevenue) * 100).toFixed(2)) : 0;

    // Item profit leaderboard
    const profitByItem = {};
    sales.forEach((s) => {
      s.items?.forEach((item) => {
        if (!profitByItem[item.sku]) {
          profitByItem[item.sku] = {
            sku: item.sku,
            name: item.name,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }
        const cost = item.quantity * item.purchasePrice;
        profitByItem[item.sku].quantity += item.quantity;
        profitByItem[item.sku].revenue = parseFloat((profitByItem[item.sku].revenue + item.itemTotal).toFixed(2));
        profitByItem[item.sku].cost = parseFloat((profitByItem[item.sku].cost + cost).toFixed(2));
        profitByItem[item.sku].profit = parseFloat(
          (profitByItem[item.sku].revenue - profitByItem[item.sku].cost).toFixed(2)
        );
      });
    });

    const itemProfitLeaderboard = Object.values(profitByItem)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    // Category profit breakdown
    const categoryMap = {};
    const catalog = getProductsStore();

    sales.forEach((s) => {
      s.items?.forEach((item) => {
        const prod = catalog.find((p) => p.sku === item.sku || p.id === item.productId);
        const cat = prod?.category || 'Consumer Electronics';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { category: cat, revenue: 0, cost: 0, profit: 0, marginPercent: 0 };
        }
        const cost = item.quantity * item.purchasePrice;
        categoryMap[cat].revenue = parseFloat((categoryMap[cat].revenue + item.itemTotal).toFixed(2));
        categoryMap[cat].cost = parseFloat((categoryMap[cat].cost + cost).toFixed(2));
        categoryMap[cat].profit = parseFloat((categoryMap[cat].revenue - categoryMap[cat].cost).toFixed(2));
        categoryMap[cat].marginPercent = categoryMap[cat].revenue > 0
          ? Math.round((categoryMap[cat].profit / categoryMap[cat].revenue) * 100)
          : 0;
      });
    });

    const categoryBreakdown = Object.values(categoryMap);

    return res.json({
      success: true,
      data: {
        totalRevenue,
        netRevenue,
        totalCost: totalCostOfGoodsSold,
        totalCostOfGoodsSold,
        grossProfit,
        marginPercent: grossMarginPercent,
        grossMarginPercent,
        salesCount: sales.length,
        itemProfitLeaderboard,
        categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('[Reports Profit Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
