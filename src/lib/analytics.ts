type AnalyticsValue = string | number | boolean;
type AnalyticsParameters = Record<string, AnalyticsValue | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: 'event', eventName: string, parameters?: AnalyticsParameters) => void;
  }
}

function pageContext() {
  if (typeof window === 'undefined') return {};
  const grade = window.location.pathname.match(/lop-(\d)/)?.[1];
  return {
    page_path: window.location.pathname,
    lesson_title: document.title.split(' – ')[0],
    grade: grade ? Number(grade) : undefined,
  };
}

export function trackEvent(eventName: string, parameters: AnalyticsParameters = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, { ...pageContext(), ...parameters });
}
