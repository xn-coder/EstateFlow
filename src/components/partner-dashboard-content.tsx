'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BusinessReportChart from './business-report-chart';
import { getEnquiries } from '@/app/manage-orders/actions';
import { getCustomers } from '@/app/manage-customers/actions';
import { getPartnerWalletData } from '@/app/wallet-billing/actions';
import { getSupportTickets } from '@/app/support-ticket/actions';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from './ui/skeleton';

const StatCard = ({ title, value, description, loading }: { title: string; value: string; description: string; loading: boolean }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
        {loading ? (
             <Skeleton className="h-10 w-3/4 mb-1" />
        ) : (
            <p className="text-4xl font-bold">{value}</p>
        )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function PartnerDashboardContent() {
    const { user: currentUser } = useAuth();
    const [stats, setStats] = React.useState({
        enquiries: 0,
        customers: 0,
        revenue: "₹0",
        rewards: 0,
        tickets: 0,
        sales: 0,
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) return;
            setLoading(true);

            try {
                const [enquiryData, customerData, walletData, ticketData] = await Promise.all([
                    getEnquiries(),
                    getCustomers(),
                    getPartnerWalletData(currentUser.id),
                    getSupportTickets(),
                ]);

                const partnerEnquiries = enquiryData.filter(e => e.submittedBy.id === currentUser.id);
                const partnerCustomers = customerData.filter(c => c.createdBy === currentUser.id);
                const partnerTickets = ticketData.filter(t => t.userId === currentUser.id);
                const partnerSales = partnerEnquiries.filter(e => e.status !== 'New').length;


                setStats({
                    enquiries: partnerEnquiries.length,
                    customers: partnerCustomers.length,
                    revenue: walletData.totalEarning.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }),
                    rewards: walletData.rewardPoints,
                    tickets: partnerTickets.length,
                    sales: partnerSales,
                });
            } catch (error) {
                console.error("Failed to fetch partner dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [currentUser]);

  const statCards = [
    { title: 'New Enquiries', value: stats.enquiries.toString(), description: 'Leads submitted' },
    { title: 'Sales', value: stats.sales.toString(), description: 'Confirmed enquiries' },
    { title: 'Total Earning', value: stats.revenue, description: 'Lifetime revenue' },
    { title: 'Rewards', value: stats.rewards.toString(), description: 'Points earned' },
    { title: 'Customers', value: stats.customers.toString(), description: 'Clients onboarded' },
    { title: 'Today Deals', value: '30', description: 'Static placeholder' },
    { title: 'Support Tickets', value: stats.tickets.toString(), description: 'Your submitted tickets' },
    { title: 'Leaderboard', value: '100', description: 'Static placeholder' },
  ];

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {statCards.map(stat => (
                <StatCard 
                    key={stat.title} 
                    title={stat.title} 
                    value={stat.value} 
                    description={stat.description} 
                    loading={loading || (stat.description !== 'Static placeholder' && !currentUser)}
                />
            ))}
        </div>
        
        <BusinessReportChart />
    </div>
  );
}
