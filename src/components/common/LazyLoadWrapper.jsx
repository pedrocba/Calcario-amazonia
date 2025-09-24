import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Cache de componentes lazy
const componentCache = new Map();

export const createLazyComponent = (importFn, fallback = null) => {
  const key = importFn.toString();
  
  if (!componentCache.has(key)) {
    componentCache.set(key, lazy(importFn));
  }
  
  return componentCache.get(key);
};

export default function LazyLoadWrapper({ 
  children, 
  fallback = <div className="space-y-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-32 w-full" /></div>,
  errorBoundary = true 
}) {
  if (errorBoundary) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600 text-sm">Erro ao carregar componente.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-red-700 underline text-xs mt-2"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}