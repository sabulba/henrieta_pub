import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loader/Loader";
import { selectEmail } from "../../redux/slice/authSlice";
import { selectOrderHistory, STORE_ORDERS } from "../../redux/slice/orderSlice";
import styles from "./OrderHistory.module.scss";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { toast } from "react-toastify";
import DataGrid from "../../components/dataGrid/DataGrid";
import ListView from "../../components/adminOnlyRout/listView/ListView";
import DataGridExtended from "../../components/dataGrid/DataGridExtended";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListView, setIsListView] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [indexFrom, setIndexFrom] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const userEmail =
    useSelector(selectEmail) || JSON.parse(localStorage.getItem("currentUser")).email;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin = ["barnushi@gmail.com", "eliavhilu@gmail.com"].includes(userEmail);

  const handleClick = (id) => navigate(`/orders/${id}`);

  useEffect(() => {
    getOrders();
    const unsubscribe = setOrdersMessagesNotifyer();

    const listMode =
      window.screen.width < 600 || window.location.href.includes("order-history");
    setIsListView(listMode);

    const extended = window.location.href.includes("orders-extended");
    setIsExtended(extended);

    return () => unsubscribe();
  }, []);

  const getOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userEmail = currentUser?.email;
      const isAdmin = ["barnushi@gmail.com", "eliavhilu@gmail.com"].includes(userEmail);
      const ordersRef = collection(db, "orders");

      let q = isAdmin
        ? query(ordersRef, orderBy("date", "asc"))
        : query(ordersRef, where("email", "==", userEmail), orderBy("date", "desc"));

      const querySnapshot = await getDocs(q);
      const allOrders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const extendedOrders = await extendOrdersWithUserDetails(allOrders);
      localStorage.setItem("orders", JSON.stringify(extendedOrders));
      setOrders(extendedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extendOrdersWithUserDetails = async (orders) => {
    try {
      if (!orders || orders.length === 0) return [];
      const uniqueEmails = [...new Set(orders.map((order) => order.email))];

      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "in", uniqueEmails));
      const userSnapshot = await getDocs(userQuery);

      const userMap = new Map();
      userSnapshot.docs.forEach((doc) => {
        const userData = doc.data();
        userMap.set(userData.email, userData);
      });

      return orders.map((order) => ({
        ...order,
        firstName: userMap.get(order.email)?.firstName || "",
        lastName: userMap.get(order.email)?.lastName || "",
        accountNumber: userMap.get(order.email)?.accountNumber || "",
        fullName:
          (userMap.get(order.email)?.firstName || "") +
          "   " +
          (userMap.get(order.email)?.lastName || ""),
      }));
    } catch (error) {
      console.error("Error extending orders with user details:", error);
      return orders;
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setIndexFrom(0);
  };

  const handleNextPage = () => {
    if (orders.length === 0) return;
    setIndexFrom((prev) => prev + pageSize);
  };

  const handlePrevPage = () => {
    setIndexFrom((prev) => Math.max(0, prev - pageSize));
  };

  const updateOrder = async (orderId, status) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });
      setOrderStatus("confirmed");
      getOrders();
      toast.success("Order updated successfully!", { position: "bottom-right", autoClose: 1000 });
    } catch (error) {
      toast.error("Error updating order:", error.message, {
        position: "bottom-right",
        autoClose: 1000,
      });
    }
  };

  const deleteOrder = async (id) => {
    try {
      const orderRef = doc(db, "orders", id);
      await deleteDoc(orderRef);
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id));
      toast.success(`Order with ID ${id} deleted successfully.`);
    } catch (error) {
      toast.error("Error deleting order:", error.message);
    }
  };

  const setOrdersMessagesNotifyer = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const isAdmin = ["barnushi@gmail.com", "eliavhilu@gmail.com"].includes(currentUser?.email);
    const collectionRef = query(collection(db, "orders"), orderBy("date", "desc"));

    const unsubscribe = onSnapshot(
      collectionRef,
      async (snapshot) => {
        const allOrders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const filteredOrders = isAdmin
          ? allOrders
          : allOrders.filter((order) => order.email === currentUser?.email);

        const extendedOrders = await extendOrdersWithUserDetails(filteredOrders);
        localStorage.setItem("orders", JSON.stringify(extendedOrders));
        setOrders(extendedOrders);
      },
      (error) => {
        console.error("Error in Firestore listener:", error);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  };

  if (isLoading) return <Loader />;

  return (
    <div className={styles.gridContent}>
      {isExtended ? (
        <DataGridExtended
          dataSource={orders}
          updateOrder={updateOrder}
          deleteOrder={deleteOrder}
        />
      ) : isListView ? (
        <div className={styles.mobileLayout}>
          <h1 style={{ textAlign: "center", color: "#fff", background: "#554949" }}>הזמנות</h1>
          <ListView data={orders} onRefreshOrders={getOrders} />
        </div>
      ) : (
        <div
          className={styles.gridLayOut}
          style={{ position: "absolute", top: "15rem", right: "10rem" }}
        >
          <DataGrid
            dataSource={orders}
            updateOrder={updateOrder}
            deleteOrder={deleteOrder}
          />
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

