// Next.js streaming file built on top of React Suspense.
// Renders fallback UI to show while page content loads
import DashboardSkeleton from '@/app/ui/skeletons';

export default function Loading() {
  return <DashboardSkeleton />;
}
