import React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { selectUserName } from "../../redux/slice/authSlice";
import { Sheet } from "react-modal-sheet";
import { useState } from "react";
import styles from "./NavBar.module.scss";

const activeLink = ({ isActive }) => (isActive ? `${styles.active}` : "");
const Navbar = () => {
  const [isOpen, setOpen] = useState(false);
  const userName = useSelector(selectUserName);
  const isMobile = window.screen.width < 1000;

  return (
    <>
      {isMobile ? (
        <>
        <div className={styles.fab}>
          <FaBars
            size={60}
            style={{
              color: "#fff",
              padding: "1rem",
              borderRadius: "50%",
              background:'#000'
            }}
            onClick={() => setOpen(!isOpen)}
          />
        </div>
          <Sheet isOpen={isOpen} onClose={() => setOpen(false)} snapPoints={[0.7 ,0.1]}>
            <Sheet.Container>
              <Sheet.Header />
              <Sheet.Content>
                <div className={styles.navbar}>
                  <div className={styles.user}>
                    <FaUserCircle size={40} color="#000" />
                    <h4>{userName}</h4>
                  </div>
                  <nav>
                    <ul>
                      <li onClick={() => setOpen(false)}>
                        <NavLink to="/admin/home" className={activeLink}>
                          מעקב כמויות
                        </NavLink>
                      </li>
                      <li onClick={() => setOpen(false)}>
                        <NavLink
                          to="/admin/all-products"
                          className={activeLink}
                        >
                          מוצרים
                        </NavLink>
                      </li>
                      <li onClick={() => setOpen(false)}>
                        <NavLink
                          to="/admin/add-product/ADD"
                          className={activeLink}
                        >
                          הוספת מוצר
                        </NavLink>
                      </li>
                      {/* <li onClick={() => setOpen(false)}>
                        <NavLink to="/admin/orders" className={activeLink}>
                          דוח חודשי
                        </NavLink>
                      </li>
                      <li onClick={() => setOpen(false)}>
                        <NavLink to="/admin/reports" className={activeLink}>
                          מעקב הזמנות
                        </NavLink>
                      </li>
                      <li onClick={() => setOpen(false)}>
                        <NavLink to="/admin/users" className={activeLink}>
                          לקוחות
                        </NavLink>
                      </li>
                      <li onClick={() => setOpen(false)}>
                        <NavLink to="/admin/accounts" className={activeLink}>
                          חשבונות
                        </NavLink> 
                      </li>*/}
                    </ul>
                  </nav>
                </div>
              </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop />
          </Sheet>
        </>
      ) : (
        <div className={styles.navbar}>
          <div className={styles.user}>
            <FaUserCircle size={40} color="#000" />
            <h4>{userName}</h4>
          </div>
          <nav>
            <ul>
              <li>
                <NavLink to="/admin/home" className={activeLink}>
                  מעקב כמויות
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/all-products" className={activeLink}>
                  מוצרים
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/add-product/ADD" className={activeLink}>
                  הוספת מוצר
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/orders" className={activeLink}>
                  דוח חודשי
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/reports" className={activeLink}>
                  מעקב הזמנות
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" className={activeLink}>
                  לקוחות
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/accounts" className={activeLink}>
                  חשבונות
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
