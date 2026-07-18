import React from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, RotateCcw, ShieldAlert } from "lucide-react";

interface Props {
  children: React.ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleReloadPage = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prevState) => ({ showDetails: !prevState.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          id="error-boundary-container" 
          className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md max-w-2xl mx-auto my-8 space-y-6 animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl shrink-0">
              <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h2 className="font-sans font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
                {this.props.moduleName || "Module"} Error Intercepted
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The active module encountered a runtime failure, but JeevanSetu AI isolated it successfully.
              </p>
            </div>
          </div>

          {/* User Warning Message */}
          <div className="space-y-2">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              An unexpected software exception occurred while rendering this interface. Other parts of the application remain active and completely safe to use.
            </p>
          </div>

          {/* Actions Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              id="error-retry-module-btn"
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-sans shadow-sm hover:shadow-md transition-all cursor-pointer select-none"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry / Reload Module</span>
            </button>

            <button
              id="error-reload-page-btn"
              onClick={this.handleReloadPage}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer select-none"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Hard Reload Application</span>
            </button>
          </div>

          {/* Technical Details Accordion */}
          <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
            <button
              id="error-details-toggle-btn"
              onClick={this.toggleDetails}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all select-none"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Show Technical Crash Logs</span>
              </span>
              {this.state.showDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {this.state.showDetails && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-950 text-slate-200 font-mono text-[11px] space-y-2 max-h-60 overflow-y-auto">
                <p className="text-rose-400 font-bold">
                  Error: {this.state.error?.message || "Unknown error details"}
                </p>
                {this.state.error?.stack && (
                  <pre className="whitespace-pre-wrap text-[10px] text-slate-400 leading-relaxed scrollbar-thin">
                    {this.state.error.stack}
                  </pre>
                )}
                {this.state.errorInfo?.componentStack && (
                  <div className="space-y-1">
                    <p className="text-slate-300 font-semibold border-b border-slate-800 pb-1 mt-2">Component Stack Trace:</p>
                    <pre className="whitespace-pre-wrap text-[10px] text-slate-400 leading-relaxed">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
