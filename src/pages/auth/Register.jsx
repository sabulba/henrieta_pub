import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase/config";
import { auth } from "../../firebase/config";
import { toast } from "react-toastify";
import registerImg from "../../assets/register.png";
import Card from "../../components/card/Card";
import Loader from "../../components/loader/Loader";
import styles from "./auth.module.scss";
import "react-toastify/dist/ReactToastify.css";
import bcrypt from "bcryptjs";
import {
  addDoc, 
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cPassword, setcPassword] = useState("");
  const [cellular, setCellular] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hashedPassword, setHashedPassword] = useState("");
  const navigate = useNavigate();

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

  // Generate a salt and hash the password
  // const getHashPassword = async (password) => {
  //   const salt = await bcrypt.genSalt(10);
  //   const hashedPassword = await bcrypt.hash(password, salt);
  //   return hashedPassword;
  // };

  const handlePasswordChange = async (value) => {
    const rawPassword = value;
    setPassword(rawPassword); // Store plain text password for comparison

    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);
    setHashedPassword(hash);
  };

  const registerUser = (e) => {
    e.preventDefault();
    if (password !== cPassword) {
      toast.error("password do not match!", {
        position: "bottom-left",
        autoClose: 4000,
      });
    }

    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        createUser({
          id: user?.uid,
          accountNumber: "",
          createdAt: user?.metadata.creationTime,
          email: email,
          password: hashedPassword,
          cellular: cellular,
          firstName: firstName,
          lastName: lastName,
          status: "Pending",
          photoURL: user?.photoURL ?? "",
          displayName: user?.displayName ?? "",
        }).then((result) => {
          console.log(result);
        });
        console.log(user);
        setIsLoading(false);
        toast.success("Registration Successful...", {
          position: "bottom-left",
          autoClose: 1000,
        });
        navigate("/login");
      })
      .catch((error) => {
          toast.error(error.message, {
            position: "bottom-left",
            autoClose: 4000,
          });
        
        setIsLoading(false);
  });
};

  return (
    <>
      {isLoading && <Loader />}
      <section className={`container ${styles.auth}`}>
        <Card>
          <div className={styles.form}>
            <h2>רישום</h2>
            <form onSubmit={registerUser}>
              <input
                type="text"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="text"
                placeholder="סלולאר"
                required
                value={cellular}
                onChange={(e) => setCellular(e.target.value)}
              />
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
                type="password"
                placeholder="סיסמה"
                required
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              <input
                type="password"
                placeholder="וידוא סיסמה"
                required
                value={cPassword}
                onChange={(e) => setcPassword(e.target.value)}
              />
              <button
                className="--btn --btn-primary --btn-block"
                placeholder="Email"
              >
                רישום
              </button>
              <div className={styles.Links}>
                <p>
                  כבר יש לך חשבון ?{" "}
                  <b>
                    <Link to="/login" style={{ fontSize: "1.6rem" }}>
                      כניסה{" "}
                    </Link>
                  </b>
                </p>
              </div>
            </form>
          </div>
        </Card>
        <div className={styles.img}>
          <img src={registerImg} alt="Register" width="400" />
        </div>
      </section>
    </>
  );
};
// className={`container ${styles.auth}`}>
export default Register;
