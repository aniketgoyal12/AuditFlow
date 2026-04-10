import Card from './Card';
import Skeleton from './Skeleton';

const variants = {
  workspace: (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} hover={false}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-3 w-28" />
            </div>
          </Card>
        ))}
      </div>

      <Card hover={false}>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  ),
  table: (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>

      <Card hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>

      <Card padding="none" hover={false}>
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.2fr_0.8fr_1.4fr_1fr_1fr] gap-4 items-center">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  ),
  auth: (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/70 p-8 shadow-large">
        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <Skeleton className="h-10 w-40 mx-auto" />
            <Skeleton className="h-4 w-56 mx-auto max-w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  ),
};

const PageSkeleton = ({ variant = 'workspace' }) => variants[variant] || variants.workspace;

export default PageSkeleton;
