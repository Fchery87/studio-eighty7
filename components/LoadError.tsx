import React from 'react';

interface LoadErrorProps {
  what: string;
  onRetry: () => void;
}

const LoadError: React.FC<LoadErrorProps> = ({ what, onRetry }) => (
  <div role="alert" className="flex flex-wrap items-center gap-4 rounded-md border border-line bg-panel px-6 py-5">
    <p className="text-dust">Couldn't load {what}. Check your connection and try again.</p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-md border border-bone px-4 py-2 font-semibold text-bone hover:bg-bone hover:text-walnut"
    >
      Try again
    </button>
  </div>
);

export default LoadError;
