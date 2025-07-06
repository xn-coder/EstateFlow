
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BusinessReportChart from './business-report-chart';

const StatCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function PartnerDashboardContent() {
  const stats = [
    { title: 'New Lead', value: '100', description: 'Today' },
    { title: 'Sales', value: '300', description: 'Today' },
    { title: 'Revenue', value: '1000', description: 'Today' },
    { title: 'Rewards', value: '100', description: 'Points' },
    { title: 'Customers', value: '500', description: 'Today' },
    { title: 'Today Deals', value: '30', description: 'Offers' },
    { title: 'New Ticket', value: '1000', description: 'Ticket' },
    { title: 'Leaderbord', value: '100', description: 'Rank' },
  ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(stat => (
                <StatCard key={stat.title} title={stat.title} value={stat.value} description={stat.description} />
            ))}
        </div>
        
        <BusinessReportChart />
    </div>
  );
}
