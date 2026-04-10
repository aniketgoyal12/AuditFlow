const Skeleton = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-2xl bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%] ${className}`}
    aria-hidden="true"
  />
);

export default Skeleton;
