'use client';

import { useState } from 'react';
import { ParametersForm } from '@/components/dashboard/ParametersForm';
import { Viewer } from '@/components/canvas/Viewer';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShapeParameters {
  radius?: number;
  height?: number;
  width?: number;
  depth?: number;
  teeth?: number;
  type: 'cylinder' | 'cube' | 'gear';
}

export default function EditorPage() {
  const [loading, setLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [canDownload, setCanDownload] = useState(false);

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
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
      <div className="flex-1 p-6">
        <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
          <Viewer modelUrl={modelUrl} loading={loading} />
        </div>
      </div>
    </div>
  );
}
