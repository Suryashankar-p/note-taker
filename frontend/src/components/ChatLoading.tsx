import React from 'react';
import './Loading.css';
import Text from './Text';

interface LoadingProps {
  related?: boolean;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ related = false, text }) => {
  const [loadingText, setLoadingText] = React.useState(text || "Analyzing");

  React.useEffect(() => {
    if (text) {
      setLoadingText(text);
      return;
    }
    if (related) return;

    const timer1 = setTimeout(() => {
      setLoadingText("Analyzing deeper");
    }, 5000);

    const timer2 = setTimeout(() => {
      setLoadingText("Preparing answers");
    }, 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [related]);

  return (
    <div className="loading-container">
      <div className="loading-text">
        {related ? (
          <Text type="bold-body">Related Questions</Text>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="blue-dots-loader">
                <div className="blue-dot"></div>
                <div className="blue-dot"></div>
                <div className="blue-dot"></div>
              </div>
              <Text className="loading-text-blue">{loadingText}</Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
