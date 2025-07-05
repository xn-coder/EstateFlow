
'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { businessReportData } from '@/lib/data';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  enquiry: {
    label: 'Enquiry',
    color: 'hsl(259 95% 69%)',
  },
  property: {
    label: 'Property',
    color: 'hsl(102 52% 58%)',
  },
  booking: {
    label: 'Booking',
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
        <ChartContainer config={chartConfig} className="h-72 w-full">
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
            <Legend />
            <defs>
                <linearGradient id="fillEnquiry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-enquiry)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-enquiry)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillProperty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-property)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-property)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillBooking" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-booking)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-booking)" stopOpacity={0.1}/>
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="enquiry" stroke="var(--color-enquiry)" fill="url(#fillEnquiry)" strokeWidth={2} />
            <Area type="monotone" dataKey="property" stroke="var(--color-property)" fill="url(#fillProperty)" strokeWidth={2} />
            <Area type="monotone" dataKey="booking" stroke="var(--color-booking)" fill="url(#fillBooking)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
