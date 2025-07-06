
'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { businessReportData } from '@/lib/data';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  leads: {
    label: 'Leads',
    color: 'hsl(259 95% 69%)',
  },
  sales: {
    label: 'Sales',
    color: 'hsl(102 52% 58%)',
  },
  customers: {
    label: 'Customers',
    color: 'hsl(33 93% 54%)',
  },
} satisfies ChartConfig;

export default function BusinessReportChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <AreaChart
            data={businessReportData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
             <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, 90]}
            />
            <Tooltip content={<ChartTooltipContent indicator="line" />} />
            <Legend wrapperStyle={{paddingTop: '20px'}}/>
            <defs>
                <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-customers)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-customers)" stopOpacity={0.1}/>
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="leads" stroke="var(--color-leads)" fill="url(#fillLeads)" strokeWidth={2} />
            <Area type="monotone" dataKey="sales" stroke="var(--color-sales)" fill="url(#fillSales)" strokeWidth={2} />
            <Area type="monotone" dataKey="customers" stroke="var(--color-customers)" fill="url(#fillCustomers)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
