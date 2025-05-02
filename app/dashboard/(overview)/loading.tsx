// Next.js streaming file built on top of React Suspense.
// Renders fallback UI to show while page content loads.
// Placed in (overview) folder to group together with dashboard 'overview' page only.
// To see individual component usage, see page.tsx file.
import DashboardSkeleton from '@/app/ui/skeletons';

export default function Loading() {
  return <DashboardSkeleton />;
}
