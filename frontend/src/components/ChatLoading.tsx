import React from 'react';
import './Loading.css';
import Text from './Text';

interface LoadingProps {
  related?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ related = false }) => {
  return (
    <div className="loading-container">
      <div className="loading-text">
        {related ? <Text type='bold-body'>Related Questions</Text> :
          <div className="loading-title">
          </div>
        }
      </div>
      <div className="loading-content">
        <div className="loading-line"></div>
        <div className="loading-line"></div>
        <div className="loading-line"></div>
        <div className="loading-line short"></div>
        <div className="loading-line"></div>
        <div className="loading-line"></div>
      </div>

    </div>
  );
};

export default Loading;
