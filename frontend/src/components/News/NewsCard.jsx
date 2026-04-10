import React from "react";
import "../../styles/NewsCard.css";

const NewsCard = ({ title, content, imageUrl }) => {
  return (
    <div className="news-card">
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
};

export default NewsCard;
