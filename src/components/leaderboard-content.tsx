
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';
import { getLeaderboardData } from '@/app/leaderboard/actions';
import type { LeaderboardEntry } from '@/app/leaderboard/actions';
import { Crown, ArrowLeft, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function LeaderboardContent() {
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getLeaderboardData();
      setLeaderboard(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <div>
              <CardTitle>Partner Leaderboard</CardTitle>
              <CardDescription>Ranking based on the total number of confirmed orders.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                      <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : leaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">No partner data available.</TableCell>
                  </TableRow>
                ) : (
                  leaderboard.map((entry, index) => (
                    <TableRow key={entry.partner.id}>
                      <TableCell className="font-bold text-lg">
                        <div className={`flex items-center gap-2 ${getRankColor(index + 1)}`}>
                          {index < 3 ? <Trophy className="h-5 w-5" /> : <span className="w-5 h-5 flex items-center justify-center"></span>}
                          <span>{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={entry.partner.avatar} alt={entry.partner.name} />
                            <AvatarFallback>{entry.partner.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.partner.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">{entry.orderCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
