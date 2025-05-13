import React, { useEffect } from "react";
import Slider from "../../components/slider/Slider";
import AdminOnlyRout from "../../components/adminOnlyRout/AdminOnlyRout";
import Product from "../../components/product/Product";
import Loader from "../../components/loader/Loader";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "../../redux/slice/authSlice";
import { useNavigate } from "react-router-dom";

const Home = () => {
  // const navigate = useNavigate();
  // const isLoggenIn = useSelector(selectIsLoggedIn);
  // if (!isLoggenIn) {
  //   navigate("/login");
  // }
  return (
    <>
      
          <Product />
        
    </>
  );
};

export default Home;
