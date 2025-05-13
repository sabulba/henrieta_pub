import React, { useEffect, useState } from 'react'
import useFetchCollection from '../../customHooks/useFetchCollection';
import { selectOrderHistory, STORE_ORDERS } from '../../redux/slice/orderSlice';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import useFetchDocument from '../../customHooks/useFetchDocument';

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const { id } = useParams();
  const { document } = useFetchDocument("orders", id);

 useEffect(() => {
    setOrder(document);
  }, [document]);
  return (
    <>
    {order && order.cartItems ? (
      order.cartItems.map((item) => (
    
        <h4>{item.name} | {item.price}</h4>
        
    
      ))
    ) : (
      <p>Loading...</p>
    )}

  </>
  )
}
export default OrderDetails