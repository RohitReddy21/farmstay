import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.group('Global Error Boundary Caught Error');
        console.error(error);
        console.error(errorInfo.componentStack);
        console.groupEnd();
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full border-l-4 border-red-500">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            The application encountered a critical error and could not load.
                        </p>

                        <div className="bg-red-50 p-4 rounded mb-6 overflow-auto max-h-60">
                            <p className="font-mono text-sm text-red-700 font-bold mb-2">
                                {this.state.error && this.state.error.toString()}
                            </p>
                            <pre className="font-mono text-xs text-red-600 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Reload Page
                            </button>
                            <a
                                href="/"
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-center"
                            >
                                Go Home
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
