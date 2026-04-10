import React from 'react';
import '../../styles/NewsList.css';

const NewsList = ({ news }) => {
    return (
        <div className="news-list-container">
            {news.map(item => (
                <div key={item.id} className="news-list-item">
                    <div className="news-list-image">
                        <img src={item.imageUrl} alt={item.title} />
                    </div>
                    <div className="news-list-content">
                        <h3>{item.title}</h3>
                        <p className="news-list-date">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        <p className="news-list-text">{item.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NewsList;
