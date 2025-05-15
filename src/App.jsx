import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header, Footer } from "./components";
import { Admin, Contact, Home, Login, Register, Reset } from "./pages";
import { ToastContainer } from "react-toastify";
import AdminOnlyRout from "./components/adminOnlyRout/AdminOnlyRout";
import ProductDetails from "./components/product/productDetails/ProductDetails";
import "react-toastify/dist/ReactToastify.css";
import Cart from "./pages/cart/Cart";
import OrderHistory from "./pages/orederHistory/OrderHistory";
import OrderDetails from "./pages/orederHistory/OrderDetails";
import Users from "./pages/users/Users";
import About from "./pages/about/About";
import RequireAuth from "./pages/auth/RequireAuth";


function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <ToastContainer />
        <Routes>
          
          <Route path="/" 
                 element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          <Route path="/login" element={<Login />} />
          {/* <Route path="/login" element={<PhoneAuth />} /> */}
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<Reset />} />

{/* <Route
          path="/dashboard"
          render={() =>
            isAuthenticated ? (
              <Dashboard />
            ) : (
              <Redirect to="/login" />
            )
          }
        /> */}
 
          <Route
            path="/admin/*"
            element={
              <AdminOnlyRout>
                <Admin />
              </AdminOnlyRout>
            }
          />
          <Route path="/product-details/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/order-history" element={<OrderHistory/>} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/users" element={<Users />} />
        </Routes>
        {/* <Footer /> */}
      </BrowserRouter>
    </>
  );
}

export default App;
