import React, { Component } from "react";
import { ArrowPathIcon, HomeIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default class ErrorBoundary extends Component {
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

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-950 text-white">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <ExclamationTriangleIcon className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Temporary Hiccup Occurred</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                We encountered an issue rendering this section. Don't worry, your scrap requests and account data are completely safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Retry / Refresh Page</span>
              </button>

              <a
                href="/"
                className="flex-1 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Return to Home</span>
              </a>
            </div>

            {process.env.NODE_ENV !== "production" && this.state.error && (
              <details className="text-left bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto">
                <summary className="cursor-pointer font-bold text-slate-400">Technical Details</summary>
                <p className="mt-2">{this.state.error?.toString()}</p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
