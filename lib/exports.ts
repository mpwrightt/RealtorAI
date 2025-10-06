/**
 * Export utilities for admin data
 */

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Format data for export
export function formatAgentsForExport(agents: any[]) {
  return agents.map(agent => ({
    Email: agent.email,
    Agency: agent.agencyName || 'N/A',
    Status: agent.active ? 'Active' : 'Inactive',
    Plan: agent.plan || 'None',
    'Total Portals': agent.totalPortals || 0,
    'Buyer Portals': agent.buyerPortals || 0,
    'Seller Portals': agent.sellerPortals || 0,
    'Joined Date': new Date(agent.createdAt).toLocaleDateString(),
  }));
}

export function formatRevenueForExport(events: any[]) {
  return events.map(event => ({
    Date: new Date(event.timestamp).toLocaleDateString(),
    Time: new Date(event.timestamp).toLocaleTimeString(),
    'Event Type': event.eventType,
    Plan: event.plan || 'N/A',
    Amount: `$${event.amount.toFixed(2)}`,
    Description: event.description || '',
  }));
}

export function formatAnalyticsForExport(analytics: any) {
  return [{
    'Daily Active Users': analytics.dau,
    'Weekly Active Users': analytics.wau,
    'Monthly Active Users': analytics.mau,
    'DAU/MAU Ratio': `${analytics.dau_mau_ratio.toFixed(1)}%`,
    'Retention Rate': `${analytics.retentionRate.toFixed(1)}%`,
    'Avg Portals per Agent': analytics.avgPortalsPerAgent.toFixed(1),
    'Avg Messages per Agent': analytics.avgMessagesPerAgent.toFixed(1),
    'Avg Listings per Agent': analytics.avgListingsPerAgent.toFixed(1),
    'Total Agents': analytics.totalAgents,
    'Total Portals': analytics.totalPortals,
    'Total Messages': analytics.totalMessages,
    'Total Listings': analytics.totalListings,
  }];
}
