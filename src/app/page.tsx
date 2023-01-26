import { Suspense } from 'react';
import { TextToCanvas } from './TextToCanvas';

export default function Page() {
  return (
    <div style={{ padding: '16px', height: '95%' }} id="page">
      <Suspense fallback={<p>システムローディング中</p>}>
        <TextToCanvas />
      </Suspense>
    </div>
  );
}
