import React, { useEffect } from "react";
import ProductFilter from "./productFilter/ProductFilter";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { selectProducts, STORE_PRODUCTS } from "../../redux/slice/productSlice";
import { useNavigate } from "react-router-dom";
import ProductList from "./productList/ProductList";
import useFetchCollection from "../../customHooks/useFetchCollection";
import spinnerImg from "../../assets/spinner.jpg";
import Loader from "../loader/Loader";
import styles from "./Product.module.scss";

const Product = () => {
  const { data, isLoading } = useFetchCollection("products");
  const products = useSelector(selectProducts);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(
      STORE_PRODUCTS({
        products: data,
      })
    );
    if (data.length === 0) {
      navigate("/"); // Redirect to login if products length is 0
    }
  }, [dispatch, data, navigate]);

  if (isLoading) {
    return <Loader />;
  }
  return (
      <section>
        
          <div className={`container ${styles.product}`}>
          <div className={styles.content}>
            {isLoading ? (
              <img
              src={spinnerImg}
              alt="loading..."
              style={{ width: "50px" }}
              className="--center-all"
              />
            ) : (
              <ProductList products={products} />
            )}
         
        </div>





        </div>


       
      </section>
    
  );
};

export default Product;
