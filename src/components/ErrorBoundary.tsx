import React from "react";

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error): void {
    console.error("ErrorBoundary:", error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50 p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl p-10 shadow-2xl border border-amber-200 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-amber-900 mb-4">Something went wrong</h2>
            <p className="text-lg text-amber-700 mb-8 leading-relaxed">
              We encountered an unexpected error while generating your reading. Don't worry, your birth details and settings are completely safe.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

