'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Shapes, TrendingUp, Calendar } from 'lucide-react';
import useSWR from 'swr';

type UserCredits = {
  credits: number;
};

type ShapeGeneration = {
  id: number;
  parameters: any;
  status: string;
  creditsUsed: number;
  createdAt: string;
  completedAt?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserStats() {
  const { data: credits } = useSWR<UserCredits>('/api/user/credits', fetcher);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{credits?.credits || 0}</div>
          <p className="text-xs text-muted-foreground">
            Use credits to generate shapes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Shapes Generated</CardTitle>
          <Shapes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            Total shapes created
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentGenerations() {
  // Mock data for now - in a real app this would come from the API
  const recentGenerations: ShapeGeneration[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Shape Generations</CardTitle>
      </CardHeader>
      <CardContent>
        {recentGenerations.length > 0 ? (
          <div className="space-y-4">
            {recentGenerations.map((gen) => (
              <div key={gen.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Shapes className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Shape #{gen.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(gen.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    gen.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {gen.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    -{gen.creditsUsed} credits
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Shapes className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No shapes generated yet
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              Start creating amazing 3D shapes with your credits!
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Generate Your First Shape
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-2">
          Welcome to AtomicBond
        </h1>
        <p className="text-muted-foreground">
          Generate stunning 3D shapes with AI-powered precision
        </p>
      </div>

      <UserStats />
      <RecentGenerations />
    </section>
  );
}
