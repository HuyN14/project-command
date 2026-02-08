import { HealthStatus } from '@/types/project';

const config: Record<HealthStatus, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  green: { label: 'On Track', dotClass: 'bg-rag-green', bgClass: 'bg-rag-green-bg', textClass: 'text-rag-green' },
  yellow: { label: 'At Risk', dotClass: 'bg-rag-yellow', bgClass: 'bg-rag-yellow-bg', textClass: 'text-rag-yellow' },
  red: { label: 'Off Track', dotClass: 'bg-rag-red', bgClass: 'bg-rag-red-bg', textClass: 'text-rag-red' },
};

export default function HealthBadge({ status, size = 'default' }: { status: HealthStatus; size?: 'sm' | 'default' | 'lg' }) {
  const { label, dotClass, bgClass, textClass } = config[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${bgClass} ${textClass} ${sizeClasses}`}>
      <span className={`${dotSize} rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
