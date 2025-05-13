import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/loader/Loader";
import useFetchCollection from "../../customHooks/useFetchCollection";
import { selectEmail } from "../../redux/slice/authSlice";
import { selectOrderHistory, STORE_ORDERS } from "../../redux/slice/orderSlice";


import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  where
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import DataGrid from "../../components/dataGrid/DataGrid";
import ListView from "../../components/adminOnlyRout/listView/ListView";
import DataGridExtended from "../../components/dataGrid/DataGridExtended";
import styles from "./AllOrders.module.scss"
//collection, onSnapshot
const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListView, setIsListView] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const [orderStatus, setOrderStatus] = useState("pending");

  //const { historyOrdersData, isLoading } = useFetchCollection("orders");
  //const orders = useSelector(selectOrderHistory);
  const userEmail = useSelector(selectEmail) || JSON.parse(localStorage.getItem('currentUser')).email;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAdmin =  userEmail === "barnushi@gmail.com" || userEmail === "lazerashdot@gmail.com";
  const gridContainerStyle = {position:'relative' , right:'20%'}
  const handleClick = (id) => {
    navigate(`/orders/${id}`);
  };

  useEffect(() => {
    getOrders();
    setOrdersMessagesNotifyer();
    const listMode = window.screen.width < 600 || window.location.href.includes('order-history');
    setIsListView(listMode);
    const extended = window.location.href.includes('orders-extended');
    setIsExtended(extended);
  }, []);


  const extendOrdersWithUserDetails = async (orders) => {
    try {
      if (!orders || orders.length === 0) return [];
  
      // 📧 Extract unique emails from orders
      const uniqueEmails = [...new Set(orders.map(order => order.email))];
  
      // 🔥 Fetch all users in one query using "in" condition
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "in", uniqueEmails));
      const userSnapshot = await getDocs(userQuery);
  
      // 🔗 Store users in a Map for quick lookup
      const userMap = new Map();
      userSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        userMap.set(userData.email, userData); // { email: { firstName, lastName } }
      });
  
      // 🔄 Merge user details into orders
      const ordersWithUserData = orders.map(order => ({
        ...order,
        firstName: userMap.get(order.email)?.firstName || "",
        lastName: userMap.get(order.email)?.lastName || "",
        accountNumber: userMap.get(order.email)?.accountNumber || "",
        fullName:userMap.get(order.email)?.firstName +'   '+ userMap.get(order.email)?.lastName || ""
      }));
  
      return ordersWithUserData;
    } catch (error) {
      console.error("Error extending orders with user details:", error);
      return orders; // Return original orders if there's an error
    }
  };

  const getOrders = useCallback(async () => {
    try {
      setIsLoading(true);
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
        const extendedOrders = await extendOrdersWithUserDetails(fetchedOrders);
        localStorage.setItem('orders',JSON.stringify(extendedOrders));
        setOrders(extendedOrders);
      } else {
        const filteredOrders = fetchedOrders.filter(
          (order) => order.email === userEmail
        );
        const extendedOrders = await extendOrdersWithUserDetails(filteredOrders);
        localStorage.setItem('orders',JSON.stringify(extendedOrders));
        setOrders(extendedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
      dispatch(STORE_ORDERS(orders));
    }
  });

  const updateOrder = async (orderId, status) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: status,
      });

      setOrderStatus("confirmed");
      getOrders();
      toast.success("Order updated successfully!", {
        position: "bottom-right",
        autoClose: 1000,
      });
    } catch (error) {
      toast.error("Error updating order:", error, {
        position: "bottom-right",
        autoClose: 1000,
      });
    }
  };

  const deleteOrder = async (id) => {
    try {
      const orderRef = doc(db, "orders", id); // Reference to the specific document
      await deleteDoc(orderRef); // Delete the document
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== id)); // Update UI
      toast.success(`Order with ID ${id} deleted successfully.`);
    } catch (error) {
      toast.error("Error deleting order:", error);
    }
  };

  //SUBSCRIBE TO CHANGES AND SET THEM ON REALTIME
  const setOrdersMessagesNotifyer = () => {
    const collectionRef = collection(db, "orders");

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        const updatedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(updatedOrders);
        getOrders();
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setIsLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  };

  if (isLoading) {
    return <Loader />;
  }
  return (
   
       <DataGridExtended dataSource={orders} updateOrder={updateOrder}  deleteOrder={deleteOrder}></DataGridExtended>
            
  );
};

export default AllOrders;
