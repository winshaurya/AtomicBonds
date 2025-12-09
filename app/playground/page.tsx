'use client';

import { useState } from 'react';
import { ParametersForm } from '@/components/dashboard/ParametersForm';
import { Viewer } from '@/components/canvas/Viewer';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle, Menu, X } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

interface ShapeParameters {
  radius?: number;
  height?: number;
  width?: number;
  depth?: number;
  teeth?: number;
  type: 'cylinder' | 'cube' | 'gear';
}

export default function PlaygroundPage() {
  const [loading, setLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [canDownload, setCanDownload] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleGenerate = async (params: ShapeParameters) => {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parameters: params }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError('Insufficient credits. Please purchase more credits.');
        } else {
          setError(data.error || 'Failed to generate shape');
        }
        return;
      }

      // Success
      setModelUrl(data.modelUrl);
      setCanDownload(true);

      // Refresh credits in navbar
      mutate('/api/user/credits');

    } catch (err: any) {
      setError(err.message || 'Failed to generate shape');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (modelUrl) {
      // In real implementation, trigger download of the GLB/STL file
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = 'generated-shape.glb';
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">AtomicBond Playground</span>
          </div>
          {user && <ProfileDropdown user={user} />}
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-50 md:z-auto w-80 md:w-80 bg-white border-r border-gray-200 p-4 md:p-6 overflow-y-auto h-full md:h-auto transition-transform duration-300 ease-in-out`}>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shape Editor</h2>
              <ParametersForm onGenerate={handleGenerate} loading={loading} />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {canDownload && (
              <div className="pt-4 border-t">
                <Button
                  onClick={handleDownload}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download GLB
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 p-4 md:p-6">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
            <Viewer modelUrl={modelUrl} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
