
import React from 'react';
import { marked } from 'marked';

interface SolutionDisplayProps {
  solution: string | null;
  isLoading: boolean;
}

const Loader = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-accent"></div>
        <p className="text-lg text-brand-muted">Forging your solution...</p>
    </div>
);

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution, isLoading }) => {
  const getHtml = () => {
    if (!solution) return '';
    return marked(solution, { gfm: true, breaks: true });
  };
    
  return (
    <div className="w-full mt-8 p-6 bg-brand-secondary border border-brand-accent/20 rounded-lg min-h-[200px] flex justify-center items-center">
      {isLoading ? (
        <Loader />
      ) : solution ? (
        <div
          className="prose prose-invert prose-p:text-brand-light prose-headings:text-white prose-strong:text-brand-accent prose-code:text-yellow-300 prose-code:bg-brand-primary/50 prose-code:p-1 prose-code:rounded-sm prose-pre:bg-brand-primary/50 prose-pre:p-4 prose-pre:rounded-lg prose-blockquote:border-l-brand-accent prose-blockquote:text-brand-muted w-full max-w-none"
          dangerouslySetInnerHTML={{ __html: getHtml() }}
        />
      ) : (
        <div className="text-center text-brand-muted">
          <p className="text-xl">Your solution will appear here.</p>
          <p>Choose an input method and provide a problem to get started.</p>
        </div>
      )}
    </div>
  );
};

export default SolutionDisplay;
