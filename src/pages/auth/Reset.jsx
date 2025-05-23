import React, { useState } from 'react'
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from '../../firebase/config';
import { toast } from 'react-toastify';
import Card from "../../components/card/Card";
import resetImg from "../../assets/forgot.png";
import styles from "./auth.module.scss";
import Loader from '../../components/loader/Loader';



const Reset = () => {
  const [email,setEmail]=useState('')
  const [isLoading,setIsLoading]=useState(false)

  const resetPassword=(e)=> {
    e.preventDefault();
    setIsLoading(true)
    sendPasswordResetEmail(auth, email).then(() => {
      toast.success('סיסמתך אופסה בהצלחה',{
        position: "bottom-left",
        autoClose: 1000,
      });
      setIsLoading(false)
    })
    .catch((error) => {
      setIsLoading(false)
      toast.error(error.message,{
        position: "bottom-left",
        autoClose: 1000,
      });
    });
  };

  return (
    <>
      {isLoading ? 
        <Loader/> :
        <section className={`container ${styles.auth}`}>
        <div className={styles.img}>
          <img src={resetImg} alt="Reset" width="400" />
        </div>
        <Card>
          <div className={styles.form}>
            <h2>איפוס סיסמה</h2>
            <form onSubmit={resetPassword}>
                <input type='text' 
                          placeholder='Email' 
                          value={email}     
                          onChange={(e)=>setEmail(e.target.value)}  
                          required/>
                  <button
                    className="--btn --btn-primary --btn-block"
                    placeholder="Email" >
                   איפוס סיסמה
                  </button>
                  <div className={styles.resetBtn}>
                  
                        <Link to="/login">כניסה </Link>
                        <Link to="/register">רישום </Link>
            
                  </div>
            </form>
          </div>
        </Card>
        </section>
      }
  </>
  )
}

export default Reset