export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false,
) {
  let timeout: ReturnType<typeof setTimeout> | null;

  const debounced = function (this: any, ...args: Parameters<T>) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as T & {cancel: () => void};
}
