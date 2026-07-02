import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/10">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Something went wrong
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 underline"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
