export function formatAmount(
  amountInRials: number,
  currency: 'IRT' | 'IRR' = 'IRT',
  usePersianDigits: boolean = true
): string {
  // 1 Toman = 10 Rials
  const val = currency === 'IRT' ? Math.round(amountInRials / 10) : amountInRials;
  const unitStr = currency === 'IRT' ? 'تومان' : 'ریال';

  const formattedNum = new Intl.NumberFormat('en-US').format(val);

  if (!usePersianDigits) {
    return `${formattedNum} ${unitStr}`;
  }

  // Convert to Persian Digits
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const faNum = formattedNum.replace(/\d/g, d => persianDigits[parseInt(d, 10)]);

  return `${faNum} ${unitStr}`;
}

export function formatDate(isoDate: string, usePersianDigits: boolean = true): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24 && date.getDate() === now.getDate()) {
    const timeStr = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    return `امروز - ${timeStr}`;
  } else if (diffHours < 48 && now.getDate() - date.getDate() === 1) {
    const timeStr = date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    return `دیروز - ${timeStr}`;
  }

  // Standard Shamsi Date formatting
  try {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('fa-IR', options);
  } catch (e) {
    return date.toLocaleDateString();
  }
}
