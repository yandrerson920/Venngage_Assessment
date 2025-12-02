import React, { useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IconGeneratorForm from './components/IconGeneratorForm';
import IconGrid from './components/IconGrid';
import { useIconStore } from './store/iconStore';
import { generateIcons } from './services/api';
import { GenerationRequest } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { icons, loading, error, metadata, setIcons, setLoading, setError, setMetadata } = useIconStore();

  const handleGenerate = useCallback(async (request: GenerationRequest) => {
    setLoading(true);
    setError(null);
    setIcons([]);

    try {
      const response = await generateIcons(request);
      setIcons(response.icons);
      setMetadata(response.metadata);
    } catch (err: any) {
      setError(err.message || 'Failed to generate icons. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [setIcons, setLoading, setError, setMetadata]);

  const hasIcons = useMemo(() => icons.length > 0, [icons.length]);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <h1 className="title">
          <span className="animate-float">✨</span>
          {' '}AI Icon Set Generator
        </h1>
        <p className="subtitle">
          Generate 4 consistent icons in your chosen style
        </p>
      </header>

      {/* Form */}
      <IconGeneratorForm 
        onGenerate={handleGenerate} 
        loading={loading}
      />

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p className="loading-text">
            Generating your icon set... This may take 30-60 seconds
          </p>
        </div>
      )}

      {/* Results */}
      {hasIcons && !loading && (
        <IconGrid icons={icons} metadata={metadata} />
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Powered by Replicate + FLUX Schnell</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
