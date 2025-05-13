import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  writeBatch
} from "firebase/firestore";
import { db } from "../../firebase/config";
import Loader from "../../components/loader/Loader";
import styles from "./Accounts.module.scss";
import { toast } from "react-toastify";

const Accounts = () => {
  const [isLoading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    number: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
      fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
      const accountsCollection = collection(db, "accounts");
  
      // Query with ordering by accountNumber in ascending order
      const querySnapshot = await getDocs(
          query(accountsCollection, orderBy("lastName", "asc"))
      );
      
      setAccounts(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      console.log(accounts);
      setLoading(false);
  };

  // Open dialog for creating or editing an account
  const openDialog = (account = null) => {
    if (account) {
      setFormData(account);
    } else {
      setFormData({ id: "", firstName: "", lastName: "", accountNumber: "" });
    }
    setShowPopup(true);
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

  // Create new account
  const createAccount = async () => {
    const { firstName, lastName,  accountNumber } = formData;
    if (firstName && lastName && accountNumber) {
      await addDoc(collection(db, "accounts"), {
        firstName,
        lastName,
        accountNumber,
      });
      fetchAccounts();
      closeDialog();
    } else {
      alert("All fields are required!");
    }
  };

  // Edit existing account
  const editAccount = async () => {
    const { id, firstName, lastName, accountNumber } = formData;
    if (id && firstName && lastName && accountNumber) {
      const accountRef = doc(db, "accounts", id);
      await updateDoc(accountRef, {
        firstName,
        lastName,
        accountNumber,
      });
      fetchAccounts();
      closeDialog();
    } else {
      alert("All fields are required!");
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.id) {
      editAccount();
    } else {
      createAccount();
    }
  };

  // Get account data for editing
  const handleEditClick = async (id) => {
    const accountRef = doc(db, "accounts", id);
    const docSnap = await getDoc(accountRef);
    if (docSnap.exists()) {
      openDialog({ id: docSnap.id, ...docSnap.data() });
    }
  };
// Handle file selection and start uploading automatically
const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (window.confirm("⚠️ This will erase all data and upload new JSON. Proceed?")) {
          await uploadDataToFirestore(jsonData);
        }
        
      } catch (error) {
        console.error("❌ Invalid JSON file:", error);
      }
    };
    reader.readAsText(file);
  }
};

const uploadDataToFirestore = async (jsonData) => {
  if (!jsonData || jsonData.length === 0) {
    alert("❌ No data to upload!");
    return;
  }

  try {
    setIsUploading(true);
    setUploadProgress(0);

    const collectionRef = collection(db, "accounts");

    // Step 1: Fetch all existing documents and delete them
    const snapshot = await getDocs(collectionRef);
    if (!snapshot.empty) {
      const batchDelete = writeBatch(db);
      snapshot.docs.forEach((doc) => batchDelete.delete(doc.ref));
      await batchDelete.commit();
      console.log("Firestore collection cleared.");
    }

    // Step 2: Upload new JSON data AFTER deletion completes
    const batchUpload = writeBatch(db);
    jsonData.forEach((docData, index) => {
      const id = generateFirestoreId(); //  מזהה חדש אם חסר
      const docRef = doc(collectionRef, id);
       batchUpload.set(docRef, {
        ...docData,
        id, // ודא שה-id נשמר במסמך עצמו
      });

      // Progress bar animation (not real-time but gives user feedback)
      setTimeout(() => {
        setUploadProgress(((index + 1) / jsonData.length) * 100);
      }, index * 100);
    });

    await batchUpload.commit(); // Ensures all writes happen at once
    setUploadProgress(100);
    fetchAccounts();
  } catch (error) {
    console.error("Error clearing/uploading Firestore:", error);
  } finally {
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 1000);
  }
};
const generateFirestoreId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let autoId = "";
  for (let i = 0; i < 20; i++) {
    autoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return autoId;
};

  return (
    <div className="main-content">
    
      <section>
        <h2>חשבונות</h2>
        <button onClick={() => openDialog()}  style={{width:'20rem'}}>יצירת חשבון חדש</button>

        {/* Table to display accounts */}
        {isLoading && <Loader />}
        <div className={styles.table}>
          {accounts.length === 0 ? (
            <p>No User found</p>
          ) : (
            <>
            <table >
              <thead>
                <tr>
                  <th>שם פרטי</th>
                  <th>שם משפחה</th>
                  <th>מספר חשבון</th>
                  <th>פעולות</th>
                </tr>
              </thead>  
            </table>
            <div style={{maxHeight:'45vh', overflow:'scroll'}}>
                <table>
                  <tbody>
                    {accounts.map((account) => (
                      <tr   key={account.id}>
                        <td style={{width:'25%'}}>{account.firstName}</td>
                        <td style={{width:'25%'}}>{account.lastName}</td>
                        <td style={{width:'32%'}}>{account.accountNumber}</td>
                        <td style={{width:'18%'}}>
                          <button onClick={() => handleEditClick(account.id)}>עריכה</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
            </>
          )}
        </div>
        {showPopup && (
          <div style={popupStyles}>
            <div style={popupContentStyles}>
              <h2>{formData.id ? "עריכת חשבון" : "יצירת חשבון"}</h2>
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
                  מספר חשבון:
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    required
                  />
                </h3>
                <div style={{display:'grid' , gap:'1rem'}}>
                    <button type="submit" className='--btn --btn-success'>שמירה</button>
                    <button type="button" onClick={closeDialog}  className='--btn --btn-danger'>ביטול</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      <div  className={styles.uploader}>
      <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>

      <h2>שמירה מקובץ</h2>
      <input type="file" accept=".json" onChange={handleFileChange} disabled={isUploading} placeholder="בחירת קובץ"/>
      
      {isUploading && (
        <div style={{ marginTop: "10px" }}>
          <div style={{ width: "100%", height: "10px", background: "#ddd", borderRadius: "5px" }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: "100%",
                background: "#4caf50",
                borderRadius: "5px",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </div>
          <p>{Math.round(uploadProgress)}% uploaded</p>
        </div>
      )}
    </div>
      </div>
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
  direction:'rtl'
};

export default Accounts;
