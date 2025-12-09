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
  const [parameters, setParameters] = useState<ShapeParameters>({
    type: 'cylinder',
    radius: 50,
    height: 100,
    width: 100,
    depth: 100,
    teeth: 12,
  });

  const updateParameter = (key: keyof ShapeParameters, value: number | string) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

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
        {/* Main Viewer */}
        <div className="flex-1 p-4 md:p-6">
          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
            <Viewer modelUrl={modelUrl} loading={loading} />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
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

        {/* Mobile Compact Dock */}
        <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center space-x-3">
            {/* Shape Type Selector */}
            <select
              value={parameters.type}
              onChange={(e) => updateParameter('type', e.target.value as ShapeParameters['type'])}
              className="text-xs bg-transparent border-none outline-none font-medium text-gray-700"
            >
              <option value="cylinder">Cylinder</option>
              <option value="cube">Cube</option>
              <option value="gear">Gear</option>
            </select>

            {/* Quick Controls */}
            <div className="flex items-center space-x-2">
              {parameters.type === 'cylinder' && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">R</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={parameters.radius || 50}
                      onChange={(e) => updateParameter('radius', parseInt(e.target.value))}
                      className="w-12 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">H</span>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="10"
                      value={parameters.height || 100}
                      onChange={(e) => updateParameter('height', parseInt(e.target.value))}
                      className="w-12 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </>
              )}

              {parameters.type === 'cube' && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">W</span>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="10"
                      value={parameters.width || 100}
                      onChange={(e) => updateParameter('width', parseInt(e.target.value))}
                      className="w-8 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">H</span>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="10"
                      value={parameters.height || 100}
                      onChange={(e) => updateParameter('height', parseInt(e.target.value))}
                      className="w-8 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">D</span>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      step="10"
                      value={parameters.depth || 100}
                      onChange={(e) => updateParameter('depth', parseInt(e.target.value))}
                      className="w-8 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </>
              )}

              {parameters.type === 'gear' && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">R</span>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={parameters.radius || 50}
                      onChange={(e) => updateParameter('radius', parseInt(e.target.value))}
                      className="w-8 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">T</span>
                    <input
                      type="range"
                      min="6"
                      max="50"
                      step="1"
                      value={parameters.teeth || 12}
                      onChange={(e) => updateParameter('teeth', parseInt(e.target.value))}
                      className="w-8 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={() => handleGenerate(parameters)}
              disabled={loading}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-xs rounded-full"
            >
              {loading ? '...' : 'Generate'}
            </Button>

            {/* Download Button */}
            {canDownload && (
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 rounded-full"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 max-w-xs mx-auto">
              <p className="text-xs text-red-600 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
