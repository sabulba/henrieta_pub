import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/config";
import {
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { format } from "date-fns";
import Loader from "../../loader/Loader";
import { AdminOnlyLink } from "../../shared/AdminOnlyLink";
import styles from "./ListView.module.scss";
import FloatingActionButton from "../../fab/FloatingActionButton";
import { useSelector } from "react-redux";
import { selectEmail } from "../../../redux/slice/authSlice";

const ListView = ({ data, onRefreshOrders }) => {
  const currentMonth = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const userEmail = useSelector(selectEmail);
  const isAdmin =
    userEmail === "barnushi@gmail.com" || userEmail === "eliavhilu@gmail.com";

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!Array.isArray(data)) return;
    if (data.length === 0) {
      data = JSON.parse(localStorage.getItem("orders"));
    }
    const filtered = data
      .filter((order) => {
        const orderMonth = format(new Date(order.date), "yyyy-MM");
        const matchesMonth = orderMonth === selectedMonth;
        const matchesStatus = selectedStatus
          ? order.status.toLowerCase() === selectedStatus.toLowerCase()
          : true;

        return matchesMonth && matchesStatus;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date descending

    setFilteredOrders(filtered);
  }, [data, selectedMonth, selectedStatus]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setIsOpen(false);
  };

  const saveOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "confirmed" });
      onRefreshOrders();
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(doc(db, "orders", orderId));
      onRefreshOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const filters = () => (
    <div className={styles.actionButtons}>
      <button
        className="px-4 py-2 rounded --btn-info"
        onClick={() => {
          setSelectedStatus("pending");
          setIsOpen(false);
        }}
      >
        הזמנות בהמתנה
      </button>
      <button
        className="--btn-success"
        onClick={() => {
          setSelectedStatus("confirmed");
          setIsOpen(false);
        }}
      >
        הזמנות מאושרות
      </button>
      <button
        className="--btn-dark"
        onClick={() => {
          setSelectedStatus(null);
          setIsOpen(false);
        }}
      >
        כל ההזמנות
      </button>
      <div className="flex justify-between mb-4">
        <div>
          <div className={`${styles.monthFilter} --btn-dark`}>
            <h4 style={{ color: "#fff" }}>סינון חודשי</h4>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border p-2 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const handleToggleFilters = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={styles.contentLayout}>
        <div className={styles.gridLayout}>
          {filteredOrders?.map((order, index) => (
            <div key={order.id} className={styles.flipCard}>
              <div className={styles.flipCardInner}>
                <div className={styles.flipCardFront}>
                  <div
                    className={styles.innerCard}
                    style={{ background: "gray" }}
                  >
                    <span className={styles.badge}>{index + 1}</span>
                    <div className={styles.title}>
                      <p style={{fontSize:'3rem', color:'#fff'}}>
                        {order.firstName !== "Unknown" &&
                        order.lastName !== "Unknown"
                          ? `${order.firstName} ${order.lastName}`
                          : ""}
                      </p>
                      <img src="images/beer1.png" alt="beer" />
                    </div>
                    <div className={styles.listContent}>
                      <div className={styles.listItems}>
                        {order.cartItems?.map((item) => (
                          <div key={item.id}>
                            <b>
                              {item.cartQuantity} {item.name}
                            </b>
                          </div>
                        ))}
                      </div>
                    </div>
                    <h3 className={styles.amount}>
                      <span>סה"כ: </span>
                      {order.totalAmount} <span>ש"ח</span>
                    </h3>
                    {isAdmin ? (
                      <div className={styles.actions}>
                        <button
                          style={{
                            width: "80%",
                            margin: "auto",
                            background:
                              order.status.toLowerCase() === "pending"
                                ? "#FFA500"
                                : "green",
                            color:
                              order.status.toLowerCase() === "pending"
                                ? "#000"
                                : "#fff",
                          }}
                          onClick={() => saveOrder(order.id)}
                        >
                          אישור
                        </button>
                        <button
                          style={{
                            width: "80%",
                            margin: "auto",
                            background: "#131313",
                            color: '#fff'
                          }}
                          onClick={() => deleteOrder(order.id)}
                        >
                          ביטול
                        </button>
                      </div>
                    ):(
                      <div>
                        <h2 className={styles.status} style={{backgroundColor : order.status.toLowerCase() === "pending" ? 'orange':
                                                      order.status.toLowerCase() === "confirmed" ? 'green':'red'}}>
                          { order.status.toLowerCase() === "pending" ? 'בהמתנה':
                                                      order.status.toLowerCase() === "confirmed" ? 'מאושרת':'בוטלה'}
                        </h2>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {screenWidth < 1400 ? (
          <>
            <FloatingActionButton isOpen={isOpen} toggleFilters={handleToggleFilters}>
              <div>{filters()}</div>
            </FloatingActionButton>
          </>
        ) : (
          filters()
        )}
      </div>
    </>
  );
};

export default ListView;
