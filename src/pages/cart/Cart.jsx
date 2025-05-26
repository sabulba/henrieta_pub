import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { db } from "../../firebase/config";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import {
  ADD_TO_CART,
  DECREASE_CART,
  CALCULATE_SUBTOTAL,
  CALCULATE_TOTAL_QUANTITY,
  CLEAR_CART,
  REMOVE_FROM_CART,
  SAVE_URL,
  selectCartItems,
  selectCartTotalAmount,
  selectCartTotalQuantity,
} from "../../redux/slice/cartSlice";
import { selectEmail, selectIsLoggedIn } from "../../redux/slice/authSlice";
import { FaShoppingCart, FaTimes, FaTrashAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Card from "../../components/card/Card";
import styles from "./Cart.module.scss";
import { toast } from "react-toastify";
import { Sheet } from "react-modal-sheet";
import { Autocomplete, TextField, Box } from "@mui/material";

const Cart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderPopup, setIsOrderPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(window.screen.width < 1400);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusTitle, setStatusTitle] = useState("התקבלה");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [lastPaymentUser, setLastPaymentUser] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [remark, setRemark] = useState('');

  const url = window.location.href;
  const cartTotalAmount = useSelector(selectCartTotalAmount);
  const cartTotalQuantity = useSelector(selectCartTotalQuantity);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userEmail = useSelector(selectEmail);
  const cartItems = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotalAmount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const increaseCart = (cart) => {
    dispatch(ADD_TO_CART(cart));
  };
  const decreaseCart = (cart) => {
    dispatch(DECREASE_CART(cart));
  };
  const removeFromCart = (cart) => {
    dispatch(REMOVE_FROM_CART(cart));
  };
  const clearCart = () => {
    dispatch(CLEAR_CART());
  };
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const isAdmin =
    currentUser.email === "barnushi@gmail.com" ||
    currentUser.email === "eliavhilu@gmail.com" || 'h.szold23@gmail.com';
  useEffect(() => {
    dispatch(CALCULATE_SUBTOTAL());
    dispatch(CALCULATE_TOTAL_QUANTITY());
    dispatch(SAVE_URL(""));
    setOrdersMessagesNotifyer();
    fetchUsers();
    setSelectedUser(currentUser);
    setLastPaymentUser(JSON.parse(localStorage.getItem("setLastPaymentUser")));
  }, [cartItems, dispatch]);

  useEffect(() => {
    if ((inputValue ?? "").length > 0) {
      fetchUsers();
    }
  }, [inputValue]);

  const saveOrder = () => {
    const { email, firstName, lastName } = lastPaymentUser
      ? lastPaymentUser
      : selectedUser;
    setIsLoading(true);
    try {
      const orderData = {
        email: email,
        cartItems: cartItems,
        date: Date.now(),
        totalAmount: totalAmount,
        status: "pending",
        firstName: firstName || "",
        lastName: lastName || "",
        remark: remark || ""
      };
      localStorage.setItem("selectedOrder", JSON.stringify(orderData));
      setSelectedOrder(orderData);
      addDoc(collection(db, "orders"), orderData);
      setIsLoading(false);
      clearCart();
      isMobile ? successMessage() : navToOrders();
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 1000,
      });
    }
  };

  const successMessage = () => {
    toast.success(
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="images/beer2.png" // Replace with your image URL
          alt="Icon"
          style={{
            width: "80px",
            height: "80px",
            marginRight: "10px",
            borderRadius: "50%",
          }}
        />
        <div>
          <h4 style={{ color: "#4CAF50" }}> ! תודה רבה </h4>
          <h4 style={{ margin: 0, fontSize: "14px", color: "#fff" }}>
            הזמנתך התקבלה.
          </h4>
        </div>
      </div>,
      {
        position: "bottom-left",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        onClose: () => setIsOrderPopup(true),
      }
    );
  };

  const fetchUsers = async () => {
    const accountsCollection = collection(db, "users");
    const querySnapshot = await getDocs(query(accountsCollection));
    setUsers(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const checkout = () => {
    if (isLoggedIn) {
      saveOrder();
    } else {
      dispatch(SAVE_URL(url));
      navigate("/login");
    }
  };

  //SUBSCRIBE TO CHANGES AND SET THEM ON REALTIME
  const setOrdersMessagesNotifyer = () => {
    const collectionRef = collection(db, "orders");

    const unsubscribe = onSnapshot(
      collectionRef,
      async (snapshot) => {
        const updatedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        localStorage.setItem("orders", JSON.stringify(updatedOrders));
        const lastSaveOrder =
          JSON.parse(localStorage.getItem("selectedOrder")) || {};
        if (!lastSaveOrder) return;
        const localOrder = updatedOrders?.find(
          (order) =>
            order.date === lastSaveOrder.date &&
            order.email === lastSaveOrder.email
        );

        if (localOrder) {
          // Ensure updatedOrder exists
          setSelectedOrder({
            email: localOrder.email || "",
            cartItems: localOrder.cartItems || [],
            date: Date.now(),
            totalAmount: localOrder.totalAmount || 0,
            status: localOrder.status || "pending",
          });
          setStatusTitle(
            localOrder.status === "confirmed" ? "מוכנה" : "התקבלה"
          );
        } else {
          setSelectedOrder({
            email: "",
            cartItems: [],
            date: Date.now(),
            totalAmount: 0,
            status: "cancled",
          });
          setStatusTitle("בוטלה");
        }
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      }
    );
  };
  const backToMenu = () => {
    navigate("/");
  };
  const navToOrders = () => {
    navigate("/order-history");
  };

  return (
    <section>
      <div className={`container ${styles.table}`}>
        <div className={styles.total}>
          <div cardClass={styles.card}>
            <div className={styles.text}>
              <h1>{` ${cartTotalAmount.toFixed(2)} ש"ח `}</h1>
            </div>
          </div>
          <h1>סיכום עסקה</h1>
        </div>
        {cartItems.length === 0 ? (
          <>
            <h4 style={{ textAlign: "center" }}>.אין הזמנות כרגע</h4>
            <br />
            <div>
              <Link to="/#products">&larr; חזרה לתפריט</Link>
            </div>
          </>
        ) : (
          <>
            <div className={styles.mainLayout}>
              <div className={styles.mainContent}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerColumns}>
                    <b>#</b>
                    <b>מוצר</b>
                    <b>מחיר</b>
                    <b>כמות</b>
                    <b>סה"כ</b>
                    <b></b>
                  </div>
                  <div className={styles.tableBody}>
                    {cartItems.map((cart, index) => {
                      const { id, name, price, imageUrl, cartQuantity } = cart;
                      return (
                        <div
                          key={id}
                          className={styles.tableRow}
                          style={{
                            backgroundColor: index % 2 ? "silver" : "white",
                          }}
                        >
                          <div className={styles.index}>
                            <b>{index + 1}</b>
                          </div>
                          <div>
                            {" "}
                            <b>{name}</b>
                          </div>
                          <div>
                            <b>{price}</b>
                          </div>
                          <div className={styles.count}>
                            <div
                              style={{
                                width: "3rem",
                                height: "3rem",
                                background: "red",
                                borerRadius: "50%",
                                fontSize: "2rem",
                              }}
                              onClick={() => decreaseCart(cart)}
                            >
                              -
                            </div>
                            <b>{cartQuantity}</b>
                            <div
                              style={{
                                width: "3rem",
                                height: "3rem",
                                background: "green",
                                borerRadius: "50%",
                                fontSize: "2rem",
                              }}
                              onClick={() => increaseCart(cart)}
                            >
                              {" "}
                              +
                            </div>
                          </div>
                          <div>
                            <b>{(price * cartQuantity).toFixed(2)}</b>
                          </div>
                          <div className={styles.icons}>
                            <FaTrashAlt
                              size={19}
                              color="red"
                              onClick={() => removeFromCart(cart)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.payment}>
                {isAdmin && (
                  <div>
                    <h4>חיוב חברים</h4>
                 
                      <Autocomplete   
                      options={users}
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : `${option.firstName || ""} ${
                                option.lastName || ""
                              } - ${option.accountNumber || ""}`
                        }
                        value={lastPaymentUser || selectedUser}
                        onChange={(event, newValue) => {
                          //setSelectedUser(newValue);
                          setLastPaymentUser(newValue);
                          localStorage.setItem(
                            "setLastPaymentUser",
                            JSON.stringify(newValue)
                          );
                        }}
                        inputValue={inputValue}
                        onInputChange={(event, newInputValue) =>
                          setInputValue(newInputValue)
                        }
                        clearIcon={<FaTimes size={14} />} // big clear icon
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "flex-end", // move to left
                                    alignItems: "center",
                                    width: "max-content",
                                    background: "white"
                                  }}
                                >
                                  {/* Only show clear button (params.InputProps.endAdornment includes clear + arrow) */}
                                  {
                                    params.InputProps.endAdornment?.props
                                      ?.children?.[0] /* clear button */
                                  }
                                </Box>
                              ),
                              style: {
                                direction: "rtl",
                                fontSize: "2rem",
                                   background:"white"
                              },
                            }}
                            InputLabelProps={{
                              style: {
                                direction: "rtl",
                                fontSize: "2rem",
                             
                              },
                            }}
                          />
                        )}
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, 4],
                                },
                              },
                            ],
                            sx: {
                              "& .MuiAutocomplete-listbox": {
                                fontSize: "2rem",
                              },
                              "& .MuiAutocomplete-option": {
                                fontSize: "2rem",
                                padding: "1rem",
                              },
                            },
                          },
                        }}
                        sx={{
                          direction: "rtl",
                          "& .MuiAutocomplete-input": {
                            fontSize: "2rem",
                          },
                          "& .MuiInputBase-root": {
                            fontSize: "2rem",
                          },
                          "& .MuiAutocomplete-clearIndicator": {
                            borderRadius: "50%", // Circular clear icon
                            backgroundColor: "lightgray",
                            padding: "5px", // Make the icon round
                            marginLeft: "10px", // Space between clear icon and input
                            cursor: "pointer",
                            width: "3rem", // Pointer cursor on hover
                            height: "3rem",
                          },
                        }} />

                      <div className={styles.remark}>
                        <label for="remark">הערה להזמנה</label>
                        <input
                          type="text"
                          id="remark"
                          name="remark"
                          placeholder="כתוב הערה כאן..."
                          onChange={(e) => setRemark(e.target.value)}
                        />
                      </div>

                    </div>
                 
                )}

                <div className={styles.summary}>
                  <button className={styles.reset} onClick={clearCart}>
                    איפוס
                  </button>
                  <button className={styles.checkout}>
                    <FaShoppingCart size={24} color="black" />
                    <Link to="/#products">
                      <p>המשך קנייה</p>
                    </Link>
                  </button>
                </div>

                <button className={styles.buttonPay} onClick={checkout}>
                  תשלום
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isOrderPopup && isMobile && (
        <Sheet
          isOpen={isOrderPopup}
          onClose={() => setIsOrderPopup(false)}
          snapPoints={[0.5, 0.1]}
        >
          <Sheet.Container>
            <Sheet.Header>
              <div className={styles.actions}>
                <h3 onClick={backToMenu}> תפריט </h3>
                <h3 onClick={navToOrders}>הזמנות</h3>
              </div>
            </Sheet.Header>
            <Sheet.Content>
              <Sheet.Scroller>
                <div className={styles.sheetContainer}>
                  <div className={styles.listContent}>
                    <div className={styles.listItems}>
                      {lastPaymentUser ? (
                        <h1>{`${lastPaymentUser?.firstName} ${lastPaymentUser?.lastName}`}</h1>
                      ) : (
                        <h1>{`${selectedUser?.firstName} ${selectedUser?.lastName}`}</h1>
                      )}
                      <h1>
                        <span>הזמנתך </span>
                        <span
                          className={styles.status}
                          style={{
                            background:
                              selectedOrder?.status === "confirmed"
                                ? "green"
                                : selectedOrder?.status === "pending"
                                ? "orange"
                                : "red",
                          }}
                        >
                          {statusTitle}
                        </span>
                      </h1>
                      <h1 className={styles.amount}>
                        <div>
                          {selectedOrder?.totalAmount} <span>ש"ח </span>
                        </div>
                      </h1>
                    </div>
                  </div>
                </div>
              </Sheet.Scroller>
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onClick={(e) => e.stopPropagation()} />
        </Sheet>
      )}
    </section>
  );
};

export default Cart;
