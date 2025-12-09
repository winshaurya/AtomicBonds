'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ShapeParameters {
  radius?: number;
  height?: number;
  width?: number;
  depth?: number;
  teeth?: number;
  type: 'cylinder' | 'cube' | 'gear';
}

interface ParametersFormProps {
  onGenerate: (params: ShapeParameters) => void;
  loading: boolean;
}

export function ParametersForm({ onGenerate, loading }: ParametersFormProps) {
  const [parameters, setParameters] = useState<ShapeParameters>({
    type: 'cylinder',
    radius: 50,
    height: 100,
    width: 100,
    depth: 100,
    teeth: 12,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(parameters);
  };

  const updateParameter = (key: keyof ShapeParameters, value: number | string) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Shape Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="type">Shape Type</Label>
            <select
              id="type"
              value={parameters.type}
              onChange={(e) => updateParameter('type', e.target.value as ShapeParameters['type'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="cylinder">Cylinder</option>
              <option value="cube">Cube</option>
              <option value="gear">Gear</option>
            </select>
          </div>

          {parameters.type === 'cylinder' && (
            <>
              <div>
                <Label htmlFor="radius">Radius: {parameters.radius}</Label>
                <Slider
                  value={[parameters.radius || 50]}
                  onValueChange={(value) => updateParameter('radius', value[0])}
                  max={100}
                  min={10}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="height">Height: {parameters.height}</Label>
                <Slider
                  value={[parameters.height || 100]}
                  onValueChange={(value) => updateParameter('height', value[0])}
                  max={200}
                  min={20}
                  step={10}
                  className="mt-2"
                />
              </div>
            </>
          )}

          {parameters.type === 'cube' && (
            <>
              <div>
                <Label htmlFor="width">Width: {parameters.width}</Label>
                <Slider
                  value={[parameters.width || 100]}
                  onValueChange={(value) => updateParameter('width', value[0])}
                  max={200}
                  min={20}
                  step={10}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="height">Height: {parameters.height}</Label>
                <Slider
                  value={[parameters.height || 100]}
                  onValueChange={(value) => updateParameter('height', value[0])}
                  max={200}
                  min={20}
                  step={10}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="depth">Depth: {parameters.depth}</Label>
                <Slider
                  value={[parameters.depth || 100]}
                  onValueChange={(value) => updateParameter('depth', value[0])}
                  max={200}
                  min={20}
                  step={10}
                  className="mt-2"
                />
              </div>
            </>
          )}

          {parameters.type === 'gear' && (
            <>
              <div>
                <Label htmlFor="radius">Radius: {parameters.radius}</Label>
                <Slider
                  value={[parameters.radius || 50]}
                  onValueChange={(value) => updateParameter('radius', value[0])}
                  max={100}
                  min={20}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="teeth">Teeth: {parameters.teeth}</Label>
                <Slider
                  value={[parameters.teeth || 12]}
                  onValueChange={(value) => updateParameter('teeth', value[0])}
                  max={50}
                  min={6}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="height">Height: {parameters.height}</Label>
                <Slider
                  value={[parameters.height || 20]}
                  onValueChange={(value) => updateParameter('height', value[0])}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Shape'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
