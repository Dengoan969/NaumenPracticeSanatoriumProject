import React, { useState, useEffect } from "react";
import heroImage1 from "../../images/hero-1.jpg";
import heroImage2 from "../../images/hero-2.jpg";
import heroImage3 from "../../images/hero-3.jpg";
import "../../styles/HeroSection.css";

const HeroSection = () => {
  const images = [heroImage1, heroImage2, heroImage3];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="hero-wrapper">
      <div className="hero-container">
        <img
          src={images[currentIndex]}
          alt="Фотография санатория"
          className="hero-image"
        />
        <div className="hero-text">Добро пожаловать!</div>
      </div>
      <div className="indicators">
        {images.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
