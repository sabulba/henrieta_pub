import { useEffect, useState } from 'react'
import { db } from '../firebase/config';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';

const useFetchCollection = (collectionName) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
  
    const getCollection = () => {
      setIsLoading(true);
      try {
        console.log(db);
        const docRef = collection(db, collectionName);
        const q = query(docRef);
        onSnapshot(q, (snapshot) => {
          // console.log(snapshot.docs);
          const allData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // console.log(allData);
          setData(allData);
          setIsLoading(false);
        });
      } catch (error) {
        setIsLoading(false);
        toast.error(error.message,{
          position: "bottom-left",
          autoClose: 1000,
        });
      }
    };
  
    useEffect(() => {
      getCollection();
    }, []);
  
    return { data, isLoading };
  };
  
  export default useFetchCollection;