import React from 'react';
import styles from './Admin.module.scss';
import NavBar from '../../components/navbar/NavBar';
import { Routes,Route } from 'react-router-dom';
import Home from '../../components/adminOnlyRout/admin/home/Home';
import ViewProducts from '../../components/adminOnlyRout/admin/viewProducts/ViewProducts';
import AddProduct from '../../components/adminOnlyRout/admin/addProducts/AddProduct';
import OrderHistory from '../orederHistory/OrderHistory';
import Users from '../users/Users';
import Accounts from '../accounts/Accounts';
import DataGridExtended from '../../components/dataGrid/DataGridExtended';
import AllOrders from '../allOrders/AllOrders';

const Admin = () => {
  return (
    <div className={styles.admin}>
      <div className={styles.navbar}>
        <NavBar/>
      </div>
      <div className={styles.content}>
          <Routes>
              <Route path='home' element={<Home/>}/>
              <Route path='all-products' element={<ViewProducts/>}/>
              <Route path='add-product/:id' element={<AddProduct/>}/>
              <Route path='orders' element={<OrderHistory/>}/>
              <Route path='users' element={<Users/>}/>
              <Route path='accounts' element={<Accounts/>}/>
              <Route path='orders-extended' element={<OrderHistory/>}/>
              <Route path='reports' element={<AllOrders/>}/>
          </Routes>
      </div>
    </div>
  );
};   

export default Admin;
