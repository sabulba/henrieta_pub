import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { auth, db } from "../../firebase/config";
import { toast } from "react-toastify";
import Card from "../../components/card/Card";
import Loader from "../../components/loader/Loader";
import loginImg from "../../assets/login.png";
import styles from "./auth.module.scss";
import { useSelector } from "react-redux";
import { selectPreviousUrl } from "../../redux/slice/cartSlice";
import { redirect } from "react-router-dom";
import bcrypt from "bcryptjs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cellular, setCellular] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const provider = new GoogleAuthProvider();
  const previousUrl = useSelector(selectPreviousUrl);
  const navigate = useNavigate();
  //on init : set current email from local storage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setCurrentUser(storedUser);
      setEmail(storedUser.email);
    }
  }, []);
  //sign in by email
  const onSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (showUserDetails) {
      saveUserToDB({
        id: currentUser?.uid ?? currentUser?.id,
        accountNumber: currentUser?.accountNumber ?? "",
        createdAt:  currentUser?.createdAt ?? new Date().toISOString().slice(0, 10),
        email: currentUser?.email,
        cellular: cellular ?? "",
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        status: currentUser?.status ?? "Pending",
        photoURL: currentUser?.photoURL ?? "",
        displayName: currentUser?.displayName ?? "",
      });
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          saveUserToDB(userCredential.user);
        })
        .catch((error) => {
          toast.error(<h4>"פרטי כניסה שגויים"</h4>, {
            position: "bottom-left",
            autoClose: 3000,
          });
          setIsLoading(false);
        });
    }
  };
  //sign in by Google
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        getUserFromDB(result.user.uid, result.user.email).then((user) => {
          setCurrentUser(user ?? result.user);
          if (!user?.cellular || !user?.firstName || !user?.lastName) {
            setEmail(result.user.email);
            setShowPassword(false);
            setShowUserDetails(true);
          } else {
            redirectUser();
          }
        });
      })
      .catch((error) => {
        toast.error(<h4>"פרטי כניסה שגויים"</h4>, {
          position: "bottom-left",
          autoClose: 3000,
        });
        setIsLoading(false);
      });
  };
  //find user by email
  const getUserFromDB = async (userId, email) => {
    const usersRef = collection(db, "users");
    const q = email
      ? query(usersRef, where("email", "==", email))
      : query(usersRef, where("id", "==", userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      for (const doc of querySnapshot.docs) {
        const userData = doc.data();
        const isMatch = userData.id === userId;
        if (isMatch) {
          localStorage.setItem("currentUser", JSON.stringify(userData));
          return userData;
        }
      }
    }
    return null;
  };

  //find and save the user
  const saveUserToDB = (user) => {
    getUserFromDB(user.uid ?? user.id, user.email).then((result) => {
      const selectedUser = result ? result : user;
      if (!selectedUser.cellular && !cellular) {
        setIsLoading(false);
        setEmail(selectedUser.email);
        setShowPassword(false);
        setShowUserDetails(true);
      } else {
        addUser({
          id: selectedUser?.uid ?? selectedUser?.id,
          accountNumber: selectedUser?.accountNumber ?? "",
          createdAt:  selectedUser?.createdAt ?? new Date().toISOString().slice(0, 10),
          email: selectedUser?.email,
          cellular: cellular || selectedUser.cellular,
          firstName: firstName  || selectedUser.firstName,
          lastName: lastName || selectedUser.lastName,
          status: selectedUser?.status || "Pending",
          photoURL: selectedUser?.photoURL || "",
          displayName: selectedUser?.displayName || "",
        });
      }
    });
  };
  //save user to firebase users
  const addUser = async (userData) => {
    try {
      // 🔎 Find the correct document in Firestore
      const q = userData.id
        ? query(collection(db, "users"), where("id", "==", userData.id))
        : query(collection(db, "users"), where("email", "==", userData.email));

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        createUser(userData);
      } else {
        // This is the actual Firestore document ID
        const userDoc = querySnapshot.docs[0];
        const userDocId = userDoc.id;
        // Now update the correct Firestore document
        const userRef = doc(db, "users", userDocId);
        await updateDoc(userRef, userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        redirectUser();
      }
      // Save the user to localStorage
    } catch (error) {
      toast.error(<h4>"פרטי כניסה שגויים"</h4>, {
        position: "bottom-left",
        autoClose: 3000,
      });
      setIsLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      localStorage.setItem("currentUser", JSON.stringify(userData));
      const usersRef = collection(db, "users"); // Reference to "users" collection
      const q = query(usersRef, where("email", "==", userData.email)); // Check if the user already exists (Assuming 'email' is unique)
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return; // Stop execution if user exists
      }
      const docRef = await addDoc(usersRef, userData); // Add document
      console.log("User created with ID:", docRef.id); // Firestore auto-generates ID
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  //redirect to home/cart
  const redirectUser = () => {
    setIsLoading(true);
    if (previousUrl.includes("cart")) {
      return navigate("/cart");
    } else {
      return navigate("/");
    }
  };
  const userFillInDetails = showUserDetails && (
    <>
      <input
        type="text"
        placeholder="שם פרטי"
        required
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="שם משפחה"
        required
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="text"
        placeholder="סלולאר"
        required
        value={cellular}
        onChange={(e) => setCellular(e.target.value)}
      />
    </>
  );
  return (
    <>
      {isLoading && <Loader />}
      <section className={`container ${styles.auth}`}>
        <div className={styles.img}>
          <img src={loginImg} alt="Login" width="400" />
        </div>
        <Card>
          <div className={styles.form}>
            <h2>כניסה</h2>
            <form onSubmit={onSubmit}>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {showPassword && (
                <input
                  type="password"
                  placeholder="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              )}

              {userFillInDetails}
              <button
                className="--btn --btn-primary --btn-block"
                placeholder="Login"
              >
                כניסה
              </button>
              <div className={styles.Links}>
                <Link to="/reset" style={{ fontSize: "1.5rem" }}>
                  איפוס סיסמה{" "}
                </Link>
              </div>
              <p>-- או --</p>
            </form>
            <button
              className="--btn --btn-block"
              style={{ background: "#77665b" }}
              placeholder="Email"
              onClick={() => signInWithGoogle()}
            >
              <div
                style={{
                  display: "grid",
                  alignItems: "center",
                  gridAutoFlow: "column",
                  gap: "0.5rem",
                }}
              >
                {" "}
                <FaGoogle size={16} />
                <b style={{ fontSize: "1.9rem" }}>Mail</b>{" "}
              </div>
            </button>

            <div
              className={styles.register}
              style={{
                display: "grid",
                alignItems: "center",
                gridAutoFlow: "column",
                gap: "1rem",
              }}
            >
              <Link to="/register" style={{ fontSize: "1.5rem" }}>
                רישום
              </Link>
              <b style={{ fontSize: "1.5rem" }}> ?אין לך חשבון</b>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
};
export default Login;
