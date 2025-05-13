import React, { useEffect, useState } from "react";
import { BsFillGridFill } from "react-icons/bs";
import { FaListAlt, FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  FILTER_BY_SEARCH,
  SORT_PRODUCTS,
  selectedFilterProducts,
} from "../../../redux/slice/filterSlice";
import ProductItem from "../productItem/ProductItem";
import styles from "./ProductList.module.scss";
import { selectCartTotalQuantity } from "../../../redux/slice/cartSlice";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "animate.css";
import Loader from "../../loader/Loader";

const ProductList = ({ products }) => {
  const [grid, setGrid] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [activeUser, setActiveUser] = useState(false);
  
  const dispatch = useDispatch();
  const filteredProducts = useSelector(selectedFilterProducts);
  const cartTotalQuantity = useSelector(selectCartTotalQuantity);

  useEffect(() => {
    dispatch(FILTER_BY_SEARCH({ products, search }));
  }, [dispatch, products, search]);

  useEffect(() => {
    dispatch(SORT_PRODUCTS({ products, sort }));
  }, [dispatch, products, sort]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
    if (currentUser?.status !== undefined) {
      if (currentUser?.status?.toLowerCase() === "confirmed") {
        if (currentUser?.accountNumber !== "") {
          setActiveUser(true);
        }
      }
    }
    AOS.init({  offset: 100,duration: 500, once: true }); // Initialize AOS for animation
  }, []);
  
  const cart = activeUser && (
    <div className={styles.cart}>
      <Link to={activeUser ? "/cart" : "/"}>
        <button>
          <b>{cartTotalQuantity}</b>
          <FaShoppingCart size={30} color="white" />
        </button>
      </Link>
    </div>
  );

  return (
    <>
      {products.length === 0 ? (
        <Loader/>
      ) : (
        <div className={styles.masonryGrid}>
          {filteredProducts.map((product, index) => {
            const { id } = product;
            return (
              <div
                key={id}
                className={`${styles.item}`}
                data-aos="fade-up"
                data-aos-delay={Math.min(index * 100, 500)} // Tiered delay effect
              >
                <ProductItem {...product} grid={grid} product={product} />
              </div>
            );
          })}
        </div>
      )}
      <div className={styles.cartBtn}>{cart}</div>
    </>
  );
};

export default ProductList;
