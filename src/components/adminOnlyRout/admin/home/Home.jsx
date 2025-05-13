import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectEmail } from "../../../../redux/slice/authSlice";
import { selectOrderHistory,  } from "../../../../redux/slice/orderSlice";
import styles from "./Home.module.scss";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

import { FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { STORE_ORDERS } from "../../../../redux/slice/orderSlice";
import { db } from "../../../../firebase/config";
import { useDispatch } from "react-redux";
import Loader from "../../../loader/Loader";
import OrdersChart from "../../../chart/OrdersChat";

const Home = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState("pending");
  const userEmail = useSelector(selectEmail);
  const dispatch = useDispatch();
  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, orderBy("date", "desc")); // Order by 'date' descending
      const querySnapshot = await getDocs(q);
      
      const fetchedOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (
        userEmail === "barnushi@gmail.com" ||
        userEmail === "lazerashdot@gmail.com"
      ) {
        setOrders(fetchedOrders);
      } else {
        const filteredOrders = fetchedOrders.filter(
          (order) => order.email === userEmail
        );
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      //dispatch(STORE_ORDERS(orders));
    }
  };
  return (
    <>
      {orders.length === 0 ? (
        <Loader />
      ) : 
        <div className={styles.chart}>
          <h2>כמויות לפי מוצר</h2>
          <OrdersChart orders={orders}/> 
        </div>
      }
      
    </>
  );
};

export default Home;
