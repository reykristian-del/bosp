import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Error Boundary - menangkap error runtime agar tidak blank screen
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          maxWidth: '600px',
          margin: '50px auto',
          padding: '30px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ color: '#dc2626', fontSize: '20px', marginBottom: '12px' }}>
            Terjadi Kesalahan
          </h1>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Aplikasi mengalami masalah. Silakan coba muat ulang halaman.
          </p>
          <details style={{ textAlign: 'left', marginBottom: '16px' }}>
            <summary style={{ cursor: 'pointer', color: '#2563eb', fontSize: '14px' }}>
              Detail Error
            </summary>
            <pre style={{
              backgroundColor: '#f3f4f6',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              overflow: 'auto',
              marginTop: '8px',
              color: '#374151'
            }}>
              {this.state.error?.message}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading indicator
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTopColor: '#2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: '#6b7280' }}>Memuat aplikasi...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Render dengan error boundary
try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error('Element #root tidak ditemukan di halaman');
  }
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingFallback />}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Fatal error during initialization:', error);
  document.body.innerHTML = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 50px auto; padding: 20px; text-align: center;">
      <h2 style="color: #dc2626;">Gagal Memuat Aplikasi</h2>
      <p style="color: #666;">Terjadi kesalahan saat memuat aplikasi.</p>
      <p style="color: #999; font-size: 12px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Muat Ulang
      </button>
    </div>
  `;
}
