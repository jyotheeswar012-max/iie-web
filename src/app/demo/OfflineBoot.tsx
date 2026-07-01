'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Invisible component — mounts inside a Suspense boundary in DemoPage.
 * If ?offline=1 is present in the URL it fires onOffline() once on mount,
 * booting the pre-recorded canonical Ramesh Kumar script automatically.
 * Zero UI — renders nothing.
 */
export default function OfflineBoot({ onOffline }: { onOffline: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('offline') === '1') {
      onOffline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fire once on mount only
  return null;
}
