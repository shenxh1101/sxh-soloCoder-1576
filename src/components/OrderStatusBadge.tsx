import type { OrderStatus } from '@/types';
import { ORDER_STATUS_NAMES } from '@/config/prices';

interface Props {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: Props) {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    picked: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {ORDER_STATUS_NAMES[status]}
    </span>
  );
}
