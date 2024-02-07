import type { ComponentType } from 'react';
import React from 'react';

import ErrorBoundary from '@ui/error-boundary/ErrorBoundary';

/**
 * @description HOC to wrap a component with an error boundary
 * @param WrappedComponent
 *
 * @example
 * export withErrorBoundary(Component);
 */
const withErrorBoundary = <T extends Record<string, unknown>>(
  WrappedComponent: ComponentType<T>
): ComponentType<T> => {
  const WithErrorBoundary = (props: T) => (
    <ErrorBoundary>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  return WithErrorBoundary;
};

export default withErrorBoundary;
