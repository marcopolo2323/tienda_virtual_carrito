import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, onRatingChange, editable = false }) => {
  const stars = [];
  
  const handleClick = (selectedRating) => {
    if (editable && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };
  
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      // Full star
      stars.push(
        <span 
          key={i} 
          onClick={() => handleClick(i)}
          style={{ cursor: editable ? 'pointer' : 'default' }}
          className="text-warning"
        >
          <FaStar />
        </span>
      );
    } else if (i - 0.5 <= rating) {
      // Half star
      stars.push(
        <span 
          key={i} 
          onClick={() => handleClick(i)}
          style={{ cursor: editable ? 'pointer' : 'default' }}
          className="text-warning"
        >
          <FaStarHalfAlt />
        </span>
      );
    } else {
      // Empty star
      stars.push(
        <span 
          key={i} 
          onClick={() => handleClick(i)}
          style={{ cursor: editable ? 'pointer' : 'default' }}
          className="text-warning"
        >
          <FaRegStar />
        </span>
      );
    }
  }
  
  return <div className="d-inline-block">{stars}</div>;
};

export default StarRating;