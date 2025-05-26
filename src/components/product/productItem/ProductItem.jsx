import React, { useState } from "react";

import { Link, NavLink } from "react-router-dom";
import Card from "../../../components/card/Card";
import { useDispatch } from "react-redux";
import {
  ADD_TO_CART,
  CALCULATE_TOTAL_QUANTITY,
  DECREASE_CART,
  selectCartItems,
} from "../../../redux/slice/cartSlice";
import styles from "./ProductItem.module.scss";
import { useSelector } from "react-redux";
import { FaCheckCircle, FaTrashAlt } from "react-icons/fa";

const ProductItem = ({ product, grid, id, name, price, desc, imageUrl }) => {
  const [productChecked, setProductChecked] = useState(false);
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const shortenText = (text, n) => {
    if (text.lenght > n) {
      const shortingText = text.substring(0, n).concat("...");
      return shortingText;
    }
    return text;
  };

  const isChecked = () => {
    return cartItems.some((item) => item.id === product.id);
  };
  const productQuantity = () => {
    return cartItems.find((item) => item.id === product.id)?.cartQuantity ?? "";
  };

  const addToCart = (product) => {
    dispatch(ADD_TO_CART(product));
    dispatch(CALCULATE_TOTAL_QUANTITY());
  };
  const decreaseCart = (product) => {
    dispatch(DECREASE_CART(product));
    dispatch(CALCULATE_TOTAL_QUANTITY());
  };
  return (
    <div
  className={styles.content}
  onMouseEnter={() => setProductChecked(true)}
  onMouseLeave={() => setProductChecked(false)}
>
  <div className={styles.img}>
    <img
      src={imageUrl || "images/beer1.png"}
      alt={name}
      className={styles.cardLogo}
    />
  </div>

  <div className={styles.details}>
    <h4>{shortenText(name, 25)}</h4>
    <h4>
      {price} <span>ש"ח</span>
    </h4>
  </div>

  <div className={styles.desc}>{shortenText(desc, 200)}</div>


    <div className={styles.quantityBtn} >
      <button className="--btn" onClick={() => decreaseCart(product)}>
        -
      </button>
      <button className="--btn" onClick={() => addToCart(product)}>
        +
      </button>
    </div>
  
    {/* <button className={styles.btnProduct} onClick={() => addToCart(product)}>
      <span>הוספה</span>
    </button> */}


  <b
    className={styles.productQuantity}
    style={{ opacity: productQuantity() > 0 ? 1 : 0 }}
  >
    {productQuantity()}
  </b>
</div>

  );
};

export default ProductItem;
