import React, { useState, useEffect } from "react";
import NewsList from "../components/News/NewsList";
import newsService from "../services/news.service";
import "../styles/NewsPage.css";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 4;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await newsService.getAllNews();
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  // Вычисляем новости для текущей страницы
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(news.length / newsPerPage);

  // Функция для изменения страницы
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="n-news-page-container">
      <div className="n-news-header">
        <div className="n-news-title">Новости санатория</div>
      </div>

      <div className="n-news-content-wrapper">
        <NewsList news={currentNews} />

        {news.length > newsPerPage && (
          <div className="n-pagination">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="n-page-nav"
            >
              &lt;
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }

              return (
                <button
                  key={index}
                  onClick={() => paginate(pageNumber)}
                  className={`n-page-number ${currentPage === pageNumber ? "active" : ""}`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="n-page-nav"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
