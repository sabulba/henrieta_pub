import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { sliderData } from "./slider-data";
import "./Slider.scss";
const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderLength = sliderData.length;
  const autoScroll = true;
  let slideInterval;
  let intervalTime= 5000;

  useEffect(()=>{    
    if(autoScroll){
        slideInterval= setInterval(nextSlide(),intervalTime)
    }
    return ()=> clearInterval(slideInterval)
  },[]);

  const nextSlide = () => {
    setCurrentSlide((currentSlide) =>
      currentSlide === sliderLength - 1 ? 0 : currentSlide + 1
    );
  };
  const prevSlide = () => {
    setCurrentSlide((currentSlide) =>
      currentSlide === 0 ? sliderLength - 1 : currentSlide - 1
    );
  };
  return (
    <div className="slider">
      <AiOutlineArrowLeft className="arrow prev" onClick={() => prevSlide()} />
      <AiOutlineArrowRight className="arrow next" onClick={() => nextSlide()} />
      {sliderData.map((slide, i) => {
        const { image, heading, desc } = slide;
        return (
          <div
            key={i}
            className={i === currentSlide ? "slide current" : "slide"}>
            {i === currentSlide && (
              <>
                <img src={image} alt="slide" />
                <div className="content">
                  <h2>{heading}</h2>
                  <p>{desc}</p>
                  <hr />
                  <a href="#product" className="--btn --btn-primary">
                    Shop Now
                  </a>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default Slider;
