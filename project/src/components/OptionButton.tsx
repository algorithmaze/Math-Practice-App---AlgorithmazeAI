import React from 'react';
import { InlineMath } from 'react-katex';

interface Option {
  label: string;
  text: string;
}

interface OptionButtonProps {
  option: Option;
  isSelected: boolean;
  onSelect: (label: string) => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({ option, isSelected, onSelect }) => {
  const renderMathText = (text: string) => {
    // Split text by $ delimiters to identify math expressions
    const parts = text.split(/(\$[^$]+\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        // Remove the $ delimiters and render as math
        const mathContent = part.slice(1, -1);
        return <InlineMath key={index} math={mathContent} />;
      } else {
        // Regular text
        return <span key={index}>{part}</span>;
      }
    });
  };

  return (
    <button
      onClick={() => onSelect(option.label)}
      className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
          isSelected
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {option.label}
        </div>
        <div className="flex-1 text-gray-900">
          {renderMathText(option.text)}
        </div>
      </div>
    </button>
  );
};

export default OptionButton;