import React, { useEffect, useState } from "react";
import { BsFillGridFill } from "react-icons/bs";
import {
  FaFilter,
  FaListAlt,
  FaShoppingCart,
  FaWindowClose,
} from "react-icons/fa";
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
import CategorySidebar from "../../../pages/home/Categories/CategorySidebar";
import { Sheet } from "react-modal-sheet";

const ProductList = ({ products }) => {
  const [grid, setGrid] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [activeUser, setActiveUser] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const isMobile = window.innerWidth <= 768;

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
    if (
      currentUser?.status?.toLowerCase() === "confirmed" &&
      currentUser.accountNumber
    ) {
      setActiveUser(true);
    }
    AOS.init({ offset: 100, duration: 500, once: true });
  }, []);

  useEffect(() => {
    const filtered = selectedCategory
      ? products.filter((p) => p.category === selectedCategory)
      : products;
    dispatch(FILTER_BY_SEARCH({ products: filtered, search }));
  }, [products, search, selectedCategory, dispatch]);

  // ✅ Get categories dynamically
  const categories = [
    "All",
    ...new Set(
      filteredProducts.map((product) => product.category).filter(Boolean)
    ),
  ];

  const filteredByCategory =
    selectedCategory === "All"
      ? filteredProducts
      : filteredProducts.filter((p) => p.category === selectedCategory);

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
        <Loader />
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.masonryGrid}>
            {filteredProducts.map((product, index) => (
              <div key={product.id} className={styles.item}>
                <ProductItem {...product} grid={grid} product={product} />
              </div>
            ))}
          </div>

          {/* Desktop Sidebar */}
          {!isMobile && (
            <CategorySidebar
              products={products}
              onSelectCategory={setSelectedCategory}
              className={styles.categories}
            />
          )}
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <FaFilter
          size={24}
          className={styles.fabCategory}
          onClick={() => setShowSheet(true)}
          aria-label="Select Category"
        />
      )}

      {/* Category Sheet for Mobile */}
      <Sheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        snapPoints={[0.5, 0.1]}
      >
        <Sheet.Container
          style={{
            backgroundColor: "#695f4d",
            width: "90%",
            margin: "0 auto", // center horizontally
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            marginLeft: "2rem",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowSheet(false)}
            style={{
              position: "absolute",
              top: "-2rem",
              right: "2rem",
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              width:'2rem',height:'2rem'
            }}
            aria-label="Close categories"
          >
            <FaWindowClose size={24}/>
          </button>

          <Sheet.Content style={{ width: "90%" }}>
            <CategorySidebar
              products={products}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setShowSheet(false);
              }}
            />
          </Sheet.Content>
        </Sheet.Container>
       <Sheet.Backdrop onClose={() => setShowSheet(false)} />
      </Sheet>

      <div className={styles.cartBtn}>{cart}</div>
    </>
  );
};

export default ProductList;
