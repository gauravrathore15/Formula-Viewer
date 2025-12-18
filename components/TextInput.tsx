
import React from 'react';

interface TextInputProps {
  problemText: string;
  setProblemText: (text: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({ problemText, setProblemText }) => {
  return (
    <div className="w-full">
      <textarea
        value={problemText}
        onChange={(e) => setProblemText(e.target.value)}
        placeholder="Type your math, science, or logic problem here... For example: 'What is the integral of x^2 dx from 0 to 1?'"
        className="w-full h-48 p-4 bg-brand-secondary border-2 border-brand-accent/30 rounded-lg text-brand-light placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200 resize-none"
      />
    </div>
  );
};

export default TextInput;
