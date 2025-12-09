'use client';

import { useState } from 'react';
import { Check, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addMockCredits } from '@/app/(login)/actions';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (credits: number) => {
    setLoading(`${credits}`);
    try {
      // In real implementation, this would redirect to Stripe checkout
      // For now, we'll add mock credits
      const formData = new FormData();
      formData.append('credits', credits.toString());
      await addMockCredits({}, formData);
      alert(`Added ${credits} credits to your account!`);
    } catch (error) {
      alert('Failed to purchase credits');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Buy Credits</h1>
        <p className="text-lg text-gray-600">
          Purchase credits to generate 3D shapes. Each generation costs 10 credits.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <CreditCard
          credits={100}
          price={10}
          popular={false}
          onPurchase={() => handlePurchase(100)}
          loading={loading === '100'}
        />
        <CreditCard
          credits={500}
          price={45}
          popular={true}
          onPurchase={() => handlePurchase(500)}
          loading={loading === '500'}
        />
        <CreditCard
          credits={1000}
          price={80}
          popular={false}
          onPurchase={() => handlePurchase(1000)}
          loading={loading === '1000'}
        />
      </div>
    </main>
  );
}

function CreditCard({
  credits,
  price,
  popular,
  onPurchase,
  loading,
}: {
  credits: number;
  price: number;
  popular: boolean;
  onPurchase: () => void;
  loading: boolean;
}) {
  return (
    <div className={`relative pt-6 ${popular ? 'ring-2 ring-orange-500' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
          <Coins className="h-6 w-6 text-orange-600" />
        </div>

        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          {credits} Credits
        </h3>

        <p className="text-3xl font-bold text-gray-900 mb-6">
          ${price}
          <span className="text-lg font-normal text-gray-600">
            {' '}
            (${(price / credits * 10).toFixed(2)} per generation)
          </span>
        </p>

        <ul className="space-y-3 mb-8">
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">{credits} shape generations</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">Download GLB/STL files</span>
          </li>
          <li className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span className="text-gray-700">High-quality 3D models</span>
          </li>
        </ul>

        <Button
          onClick={onPurchase}
          disabled={loading}
          className={`w-full ${popular ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
        >
          {loading ? 'Processing...' : `Buy ${credits} Credits`}
        </Button>
      </div>
    </div>
  );
}
