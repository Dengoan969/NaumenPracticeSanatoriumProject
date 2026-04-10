import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NewsCard from "../News/NewsCard";
import newsService from "../../services/news.service";
import "../../styles/NewsSection.css";

const NewsSection = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsService.getAllNews();
        setNews(response.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="news-frame">
      <div className="news-header">
        <div className="news-title">Последние новости</div>
        <Link to="/news" className="all-news-button">
          <span>Все новости</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5859 2.96875H9.41406C9.3099 2.96875 9.25781 3.02083 9.25781 3.125V16.875C9.25781 16.9792 9.3099 17.0312 9.41406 17.0312H10.5859C10.6901 17.0312 10.7422 16.9792 10.7422 16.875V3.125C10.7422 3.02083 10.6901 2.96875 10.5859 2.96875Z"
              fill="black"
            />
            <path
              d="M16.5625 9.25781H3.4375C3.33333 9.25781 3.28125 9.3099 3.28125 9.41406V10.5859C3.28125 10.6901 3.33333 10.7422 3.4375 10.7422H16.5625C16.6667 10.7422 16.7188 10.6901 16.7188 10.5859V9.41406C16.7188 9.3099 16.6667 9.25781 16.5625 9.25781Z"
              fill="black"
            />
          </svg>
        </Link>
      </div>

      <div className="news-cards-container">
        {news.map((item) => (
          <NewsCard
            key={item.id}
            title={item.title}
            content={item.content}
            imageUrl={item.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
