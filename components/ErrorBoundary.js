/**
 * @module ErrorBoundary
 * @description React class component that catches render errors and displays fallback UI.
 * Must be a class component — React error boundaries require getDerivedStateFromError.
 * @agent Component Developer (Agent 3)
 */
import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return React.createElement('div', {
                className: 'flex flex-col items-center justify-center min-h-[50vh] p-8 text-center'
            },
                React.createElement('div', {
                    className: 'text-red-500 dark:text-red-400 text-5xl mb-4'
                }, '⚠️'),
                React.createElement('h2', {
                    className: 'text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2'
                }, 'Something went wrong'),
                React.createElement('p', {
                    className: 'text-slate-500 dark:text-slate-400 mb-6 max-w-md'
                }, 'An unexpected error occurred. Please refresh the page to continue.'),
                React.createElement('button', {
                    onClick: () => window.location.reload(),
                    className: 'px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
                }, 'Refresh Page')
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
