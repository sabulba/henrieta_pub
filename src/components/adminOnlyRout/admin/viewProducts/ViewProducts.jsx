import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  Timestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "../../../../firebase/config";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Notiflix from "notiflix";
import Loader from "../../../../components/loader/Loader";
import styles from "./ViewProducts.module.scss";
import { useDispatch } from "react-redux";
import {
  selectProducts,
  STORE_PRODUCTS,
} from "../../../../redux/slice/productSlice";
import useFetchCollection from "../../../../customHooks/useFetchCollection";
import { useSelector } from "react-redux";

const ViewProducts = () => {
  const { data, isLoading } = useFetchCollection("products");
  const products = useSelector(selectProducts);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      STORE_PRODUCTS({
        products: data,
      })
    );
  }, [dispatch, data]);

  const deleteProduct = async (id, imageUrl) => {
    try {
      await deleteDoc(doc(db, "products", id));
      const storageRef = ref(storage, imageUrl);

      await deleteObject(storageRef)
        .then(() => {
          toast.success("Deleted successfully...", {
            position: "bottom-left",
            autoClose: 1000,
          });
        })
        .catch((error) => {
          toast.error(error.message, {
            position: "bottom-left",
            autoClose: 1000,
          });
        });
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-left",
        autoClose: 1000,
      });
    }
  };
  const confirmDelete = (id, imageUrl) => {
    Notiflix.Confirm.show(
      "Delete Product",
      "You are about to dele this product",
      "Delete",
      "Cancel",
      function okCb() {
        deleteProduct(id, imageUrl);
      },
      function cancelCb() {
        return;
      },
      {
        width: "320px",
        borderRadius: "3px",
        titleColor: "orangered",
        okButtonBackground: "orangered",
        cancelButtonBackground: "gray",
        cssAnimationStyle: "zoom",
      }
    );
  };

  return (
    <>
      {isLoading && <Loader />}
      <div className={styles.table}>
        <h2>רשימת מוצרים</h2>
        {products.lenght === 0 ? (
          <p>No product foung ...</p>
        ) : (
          <div>
            <div className={styles.tableTitle}
            style={{display:'grid' , gridTemplateColumns:' 5% 23% 23% 23% 12% 10%'  , justifyItems:'end',
                         background:'#fff' , borderRadius:'15px' , direction:'rtl',
                         padding:'1rem', margin:'auto' , color:'black'}}>
              <div>#</div>
              <div>תמונה</div>
              <div>מוצר</div>
              <div>קטגוריה</div>
              <div>מחיר</div>
              <div>פעולות</div>
            </div>
            <div style={{maxHeight:'70vh' , overflow:'scroll',margin:'1rem',direction:'rtl'}}>
              <table style={{ direction: "rtl", textAlign: "right" ,width:'80%' , margin:'auto',
                              boxShadow:'3px 6px rgba(0,0,0,0.8)', borderRadius:'15px'}}>
                <tbody>
                  {products.map((product, index) => {
                    const { id, name, price, imageUrl, category } = product;
                    return (
                      <tr key={id}>
                        <td>{index + 1}</td>
                        <td  style={{ display: "grid" ,justifyItems:"center" }}>
                          <img
                            src={imageUrl}
                            alt={name}
                            style={{ maxWidth: "100px" }}
                          />
                        </td>
                        <td>{name}</td>
                        <td>{category}</td>
                        <td>{`$ ${price}`}</td>
                        <td className={styles.icons}>
                          <Link to={`/admin/add-product/${id}`}>
                            <FaEdit color="green" />
                          </Link>
                          &nbsp;
                          <FaTrash
                            color="red"
                            onClick={() => confirmDelete(id, imageUrl)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ViewProducts;
