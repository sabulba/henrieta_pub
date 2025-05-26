import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useFetchCollection from "../../customHooks/useFetchCollection";
import { selectEmail } from "../../redux/slice/authSlice";
//import { selectOrderHistory, STORE_ORDERS } from "../../redux/slice/orderSlice";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  addDoc,
  where,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { FaInfoCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import Loader from "../../components/loader/Loader";
import styles from "./Users.module.scss";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState({});
  const [userStatus, setUserStatus] = useState("pending");
  const [accounts, setAccounts] = useState([]);
  const [accountNumbers, setAccountNumbers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    cellular: "",
    accountNumber: "",
  });

  const userEmail = useSelector(selectEmail);
  const dispatch = useDispatch();

  useEffect(() => {
    getUsers();
    fetchAccounts();
  }, []);
  // Update accountNumbers whenever accounts state changes
  useEffect(() => {
    if (accounts.length > 0) {
      setAccountNumbers(accounts.map((account) => account.accountNumber)); // Extract account numbers
    }
  }, [accounts]);

  const getUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const fetchedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      //dispatch(STORE_USERS(users));
    }
  };
  // Fetch accounts from Firebase
  const fetchAccounts = async () => {
    const accountsCollection = collection(db, "accounts");
    const q = query(accountsCollection, orderBy("firstName", "asc"));
    const querySnapshot = await getDocs(q);
    const fetchedAccounts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setAccounts(fetchedAccounts); // Set accounts state with the fetched accounts
    setLoading(false);
  };

  const updateUserState = async (userId, newStatus) => {
    try {
      // 🔎 Find the correct document in Firestore
      const q = query(collection(db, "users"), where("id", "==", userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("User document not found:", userId);
        toast.error("User not found!", {
          position: "bottom-right",
          autoClose: 1000,
        });
        return;
      }

      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        currentUser.status = newStatus;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }

      const userDoc = querySnapshot.docs[0];
      const userDocId = userDoc.id; // This is the actual Firestore document ID

      // ✅ Now update the correct Firestore document
      const userRef = doc(db, "users", userDocId);
      await updateDoc(userRef, { status: newStatus });

      // Update UI immediately
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      toast.success("User status updated!", {
        position: "bottom-right",
        autoClose: 1000,
      });

      getUsers(); // Refresh users list
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user!", {
        position: "bottom-right",
        autoClose: 1000,
      });
    }
  };

  const addUserAccount = (id) => {
    //popup dropdown of account with name list with searcjh auto complete
    //get accounts
    //set the dropdown
    //on select
  };

  const deleteUserAccount = (id) => {
    //popup dropdown of account with name list with searcjh auto complete
    //get accounts
    //set the dropdown
    //on select
  };

  // Open dialog for creating or editing an account
  const openDialog = (user) => {
    setSelectedUser(user);
    setShowPopup(true);
    setFormData({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      cellular: user.cellular,
      accountNumber: user.accountNumber,
    });
  };

  // Close the popup
  const closeDialog = () => {
    setShowPopup(false);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Edit existing account
  const editAccount = async () => {
    const { id, firstName, lastName, cellular, email, accountNumber } =
      formData;
    if (
      selectedUser.id &&
      firstName &&
      lastName &&
      cellular &&
      email &&
      accountNumber
    ) {
      const q = query(
        collection(db, "users"),
        where("id", "==", selectedUser.id)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("User document not found:", selectedUser.id);
        toast.error("User not found!", {
          position: "bottom-right",
          autoClose: 1000,
        });
        return;
      }

      // 🔥 Get the Firestore document ID
      const userDoc = querySnapshot.docs[0];
      const userDocId = userDoc.id;

      const accountRef = doc(db, "users", userDocId);
      await updateDoc(accountRef, {
        firstName,
        lastName,
        email,
        cellular,
        accountNumber,
      });
      getUsers();
      fetchAccounts();
      closeDialog();
    } else {
      alert("All fields are required!");
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    editAccount();
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="main-content">
      {users.length > 0 ? (
        <section>
          <h2>לקוחות</h2>
          <div className={styles.table}>
            {users.length === 0 ? (
              <p>No User found</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>מספר מזהה</th>
                    <th>נוצר התאריך</th>
                    <th>אי מייל</th>
                    <th>שם פרטי</th>
                    <th>שם משפחה</th>
                    <th>מספר טלפון</th>
                    <th>מספר חשבון</th>
                    <th>פעולות</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => {
                    const {
                      id,
                      email,
                      createdAt,
                      firstName,
                      lastName,
                      cellular,
                      accountNumber,
                      status,
                    } = user;
                    return (
                      <tr key={id}>
                        <td>{index + 1}</td>
                        <td>{id}</td>
                        <td style={{ width: "15rem" }}>
                          {createdAt instanceof Timestamp
                            ? new Timestamp(
                                createdAt.seconds,
                                createdAt.nanoseconds
                              )
                                .toDate()
                                .toISOString()
                            : new Date(createdAt).toISOString()}
                        </td>
                        <td>{email}</td>
                        <td style={{ direction: "rtl", textAlign: "justify" }}>
                          {firstName}
                        </td>
                        <td style={{ direction: "rtl", textAlign: "justify" }}>
                          {lastName}
                        </td>
                        <td style={{ direction: "rtl", textAlign: "justify" }}>
                          {cellular}
                        </td>
                        <td style={{ direction: "rtl", textAlign: "justify" }}>
                          {accountNumber}
                        </td>
                        <td>
                          <div className={styles.actions} >
                            <button
                              style={{
                                fontSize:'12px',
                                background:
                                  status === "confirmed"
                                    ? "light-green"
                                    : "red",
                              }}
                              onClick={() => updateUserState(id, "confirmed")}
                            >
                              {status === "confirmed" ? "מאושר" : "...בהמתנה"}
                            </button>
                            <button
                            style={{fontSize:'12px'}}
                              className="--btn-primary"
                              onClick={() => updateUserState(id, "Pending")}
                            >
                              חסימת לקוח.ה
                            </button>
                            <button
                            style={{fontSize:'12px'}}
                              className="--btn-purple"
                              onClick={() => openDialog(user)}
                            >
                              עריכת לקוח.ה
                            </button>
                          </div>
                        </td>
                        <td
                          style={{
                            display: "grid",
                            alignItems: "center",
                            justifyItems: "center",
                            height: "8rem",
                          }} >
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {showPopup && (
            <div style={popupStyles}>
              <div style={popupContentStyles}>
                <h2>עריכת לקוח.ה</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="hidden"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                  />
                  <h3>
                    שם פרטי:
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </h3>
                  <h3>
                    שם משפחה:
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </h3>
                  <h3>
                    מספר טלפון:
                    <input
                      type="text"
                      name="cellular"
                      value={formData.cellular}
                      onChange={handleChange}
                      required
                    />
                  </h3>
                  <h3>
                    אימייל :
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </h3>
                  <h3>מספר חשבון:</h3>
                  <select
                    style={{
                      padding: "1rem",
                      fontSize: "1.8rem",
                      width: "100%",
                    }}
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    required
                  >
                    <option value="">בחר מספר חשבון</option>{" "}
                    {/* Default option */}
                    {accounts.map((account, index) => (
                      <option key={index} value={account.accountNumber}>
                        {account.accountNumber} - {account.firstName} {account.lastName}
                      </option>
                    ))}
                  </select>
                  <div
                    style={{
                      display: "grid",
                      gap: "1rem",
                      marginTop: "1rem",
                    }}
                  >
                    <button type="submit" className="--btn --btn-success">
                      שמירה
                    </button>
                    <button
                      type="button"
                      onClick={closeDialog}
                      className="--btn --btn-danger"
                    >
                      ביטול
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      ) : (
        <p>No Users found.</p>
      )}
    </div>
  );
};

const popupStyles = {
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const popupContentStyles = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "5px",
  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
  width: "300px",
  direction: "rtl",
};
export default Users;
