import { Suspense, lazy } from 'react';
import { ModelErrorBoundary } from '@/components/ModelErrorBoundary';

// Lazy load the direct Three.js STL viewer
const STLViewer = lazy(() => import("@/components/ThreeSTLViewer"));

export default function Model() {
  return (
    <div className="min-h-screen">
      <section className="section-padding">
        <div className="container max-w-6xl">
          <h1 className="text-3xl font-bold mb-4">Interactive 3D Model</h1>
          <p className="text-muted-foreground mb-6">
            Drag to rotate. Scroll to zoom. Right-drag to pan.
          </p>

          <div className="space-y-6">
            <div className="p-4 bg-card/50 border border-border rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Controls</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Left-click and drag to rotate the view</li>
                <li>Right-click and drag to pan</li>
                <li>Scroll to zoom in/out</li>
              </ul>
            </div>

            <ModelErrorBoundary>
              <Suspense fallback={
                <div className="w-full h-[75vh] flex items-center justify-center bg-card border border-border rounded-lg">
                  <div className="text-sm text-muted-foreground bg-white/90 border border-border rounded px-3 py-2 shadow">
                    Loading 3D viewer...
                  </div>
                </div>
              }>
                <STLViewer height="75vh" src={`${import.meta.env.BASE_URL}Robot_new.stl`} />
              </Suspense>
            </ModelErrorBoundary>
          </div>
        </div>
      </section>
    </div>
  );
}
