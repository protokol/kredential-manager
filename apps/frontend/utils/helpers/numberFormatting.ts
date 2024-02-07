/**
 *
 * @param {number} value
 * @param {Intl.NumberFormatOptions} options
 * Example: 27,000
 */
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
) => new Intl.NumberFormat('en-US', options).format(value);

export const safeNumberFormat = (
  value?: unknown,
  fallback?: number | string
) => {
  if (typeof value === 'number') {
    return formatNumber(value);
  }

  return fallback || '';
};

export const weiToEther = (weiAmount: number) => weiAmount / 10 ** 18;

export const formatWeiToEther = (weiAmount?: number) => {
  if (!weiAmount) return;
  const ether = weiToEther(weiAmount);

  return formatNumber(ether, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
};

export const formatCompactNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
) =>
  Intl.NumberFormat('en-US', { notation: 'compact', ...options }).format(value);
