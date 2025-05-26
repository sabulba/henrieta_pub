import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { FaBars, FaShoppingCart, FaTimes, FaUserCircle } from "react-icons/fa";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  REMOVE_ACTIVE_USER,
  SET_ACTIVE_USER,
} from "../../redux/slice/authSlice";
import ShowOnLogin, { ShowOnLogout } from "../hidddenLinks/hiddenLinks";
import { AdminOnlyLink } from "../shared/AdminOnlyLink";

import {
  CALCULATE_TOTAL_QUANTITY,
  selectCartTotalQuantity,
} from "../../redux/slice/cartSlice";
import { collection, getDocs, where, query } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { Fab } from "react-tiny-fab";

const activeLink = ({ isActive }) => (isActive ? `${styles.active}` : "");

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [popupMenu, setPopupMenu] = useState(false);
  const [displayName, setdisplayName] = useState("");
  const [scrollPage, setScrollPage] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const cartTotalQuantity = useSelector(selectCartTotalQuantity);
  let unsubscribe = null;
  useEffect(() => {
    dispatch(CALCULATE_TOTAL_QUANTITY());
  }, []);

  useEffect(() => {
    setImageUrl("../images/logo.png");
  }, []);

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const fixNavbar = () => {
    if (window.scrollY > 50) {
      setScrollPage(true);
    } else {
      setScrollPage(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", fixNavbar);
  }, []);

  // Monitor currently sign in user
  useEffect(() => {
    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log(user);
        if (user.displayName == null) {
          const u1 = user.email.slice(0, -10);
          const uName = getDisplayName(user);

          setdisplayName(uName);
        } else {
          setdisplayName(user.displayName);
        }

        dispatch(
          SET_ACTIVE_USER({
            email: user.email,
            userName: user.displayName ? user.displayName : displayName,
            userID: user.uid,
          })
        );
      } else {
        setdisplayName("");
        dispatch(REMOVE_ACTIVE_USER());
      }
    });
    return () => {
      if (unsubscribe) unsubscribe(); // Cleanup on unmount
    };
  }, [dispatch, displayName]);

  const getDisplayName = (user) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return currentUser?.firstName === undefined ||
      currentUser?.lastName === undefined
      ? currentUser.displayName
      : `${currentUser?.firstName} ${currentUser?.lastName}`;
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const hideMenu = () => {
    setShowMenu(false);
  };

  const logoutUser = async () => {
    if (unsubscribe) {
      unsubscribe(); // Stop Firestore listener before logout
      unsubscribe = null; // Reset to prevent issues
    }

    await signOut(auth)
      .then(() => {
        toast.success("Logout successfully.", {
          position: "bottom-right",
          autoClose: 1000,
        });
        navigate("/login");
      })
      .catch((error) => {
        toast.error(error.message, {
          position: "bottom-right",
          autoClose: 1000,
        });
      });
  };

  const cart = (
    <span className={styles.cart}>
      <Link to="/cart">
        <FaShoppingCart size={window.screen.width < 600 ? 20 : 36} />
        <p>{cartTotalQuantity}</p>
      </Link>
    </span>
  );

  const logo = (
    <div className={styles.logo}>
      <Link to="/">
        <img src={imageUrl}   
             alt="" 
             referrerpolicy="no-referrer"/>
      </Link>
    </div>
  );

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isMobile = window.screen.width <=800;
  return (
    <>
    <header className={scrollPage ? `${styles.fixed}` : null}>
        <div className={styles.header}>
          {logo}

          <nav
            className={
              showMenu ? `${styles["show-nav"]}` : `${styles["hide-nav"]}`
            }
          >
            <div className={styles.navContent}>
              <div
                className={
                  showMenu
                    ? `${styles["nav-wrapper"]} ${styles["show-nav-wrapper"]}`
                    : `${styles["nav-wrapper"]}`
                }
                onClick={hideMenu}
              ></div>
              <ShowOnLogin> 
                <ul onClick={hideMenu}>
                    <li className={styles["logo-mobile"]}>
                      {logo}
                      <FaTimes size={22} color="#fff" onClick={hideMenu} />
                    </li>
                    <li>
                      <AdminOnlyLink>
                        <Link to="/admin/home">
                          <button
                            className="--btn --btn-danger"
                            style={{ fontSize: "2rem" }}
                          >
                            ממשק ניהול
                          </button>
                        </Link>
                      </AdminOnlyLink>
                    </li>
                    <li>
                      <ShowOnLogin>
                        <NavLink to="/" className={activeLink}>
                          תפריט
                        </NavLink>
                      </ShowOnLogin>
                    </li>
                    {/* <li>
                      <ShowOnLogin>
                        <NavLink to="/contact" className={activeLink}>
                          צור קשר
                        </NavLink>
                      </ShowOnLogin>
                    </li>
                    <li>
                      <ShowOnLogin>
                        <NavLink to="/about" className={activeLink}>
                          אודותינו
                        </NavLink>
                      </ShowOnLogin>
                    </li> */}
                </ul>
              
              
                <div className={styles["header-right"]} onClick={hideMenu}>
                  <span className={styles.links}>
                    <ShowOnLogout>
                      <NavLink to="/login" className={activeLink}>
                        כניסה
                      </NavLink>
                    </ShowOnLogout>

                    <NavLink to="/order-history" className={activeLink}>
                      הזמנות
                    </NavLink>

                    <NavLink to="/" onClick={logoutUser}>
                      יציאה
                    </NavLink>
                  </span>
                 
                  {/* {cart} */}
                </div>
                <div className={styles.avatar}>
                  <a href="#home" style={{ color: "#ff7722" }}>
                    {currentUser && <img
                      src={currentUser && currentUser?.photoURL ? currentUser?.photoURL : ""}
                      alt=""
                      referrerpolicy="no-referrer"
                    />}
                  </a>
                  <p> Hi, {displayName}</p>
                </div>
              </ShowOnLogin>
             
            </div>
          </nav>
          
          <ShowOnLogin>
            <div className={styles["menu-icon"]}>
              {/* {cart} */}
              <HiOutlineMenuAlt3 size={48} onClick={toggleMenu} />
            </div>
          </ShowOnLogin>
        </div>
        
      </header>
    </>
  );
};

export default Header;
