import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d1114] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#161b1e] border border-red-500/30 rounded-[16px] p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <h1 className="text-xl font-bold text-red-400">Ocurrió un error en la pantalla</h1>
            <p className="text-sm text-gray-300">
              Se ha producido una excepción al renderizar la interfaz. A continuación se muestra la información detallada del error:
            </p>
            <div className="bg-black/60 border border-white/10 rounded-lg p-4 text-left overflow-x-auto text-xs font-mono text-rose-300 max-h-48 custom-scrollbar">
              <p className="font-bold mb-1">{this.state.error?.toString()}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-gray-400 whitespace-pre-wrap mt-2">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Recargar la Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
