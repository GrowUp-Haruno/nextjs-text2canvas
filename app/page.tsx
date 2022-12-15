import { Suspense } from 'react';
import { TextToCanvas } from './TextToCanvas';

export default function Page() {
  return (
    <div>
      <Suspense fallback={<p>システムローディング中</p>}>
        <TextToCanvas />
      </Suspense>
    </div>
  );
}
