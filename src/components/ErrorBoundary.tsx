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
        <div className="m-6 rounded bg-red-50 p-4 text-sm max-w-full overflow-auto">
          <p className="font-bold text-red-700">Something went wrong.</p>
          <p className="mb-4">Your data is safe (stored locally). Try refreshing.</p>
          
          <div className="bg-white p-3 rounded border border-red-200 mb-4 font-mono text-xs text-red-600 whitespace-pre-wrap">
            {this.state.error?.toString()}
            <br/><br/>
            {this.state.error?.stack}
          </div>

          <button className="mt-2 rounded bg-red-600 px-3 py-1 text-white" onClick={() => this.setState({ hasError: false })}>
            Reset
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

