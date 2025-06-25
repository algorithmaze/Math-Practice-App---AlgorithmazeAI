import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface Question {
  question_id: number;
  question_text: string;
  options: { label: string; text: string }[];
  difficulty_level: string;
  question_type: string;
}

interface QuestionDisplayProps {
  question: Question;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
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
    <div className="space-y-4">
      {/* Question Type and Difficulty Badge */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {question.question_type}
        </span>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          question.difficulty_level === 'Easy' ? 'bg-green-100 text-green-800' :
          question.difficulty_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {question.difficulty_level}
        </span>
      </div>

      {/* Question Text */}
      <div className="text-lg leading-relaxed text-gray-900">
        {renderMathText(question.question_text)}
      </div>
    </div>
  );
};

export default QuestionDisplay;