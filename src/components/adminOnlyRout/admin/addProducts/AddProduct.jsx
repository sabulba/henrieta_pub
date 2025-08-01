import { addDoc, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage, 
  ref, 
  uploadBytesResumable
} from 'firebase/storage';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db, storage } from '../../../../firebase/config';
import Card from '../../../card/Card';
import Loader from '../../../loader/Loader';
import styles from './AddProducts.module.scss';
import { selectProducts } from '../../../../redux/slice/productSlice';

const categories = [
  { id: 1, name: 'משקאות חריפים' },
  { id: 2, name: 'משקאות קלים' },
  { id: 3, name: 'מאכלים' },
  { id: 4, name: 'בירה' },
  { Id: 5, name: "צ'ייסרים" },
  { Id: 6, name: 'מעורבבים' },
  { Id: 7, name:  'יין' },
  { Id: 8, name:  'ויסקי' },
  { id: 9, name: 'אחר' },
];

const initialState = {
  name: '',
  imageUrl: '',
  price: 0,
  category: '',
  brand: '',
  desc: '',
};

const AddProduct = () => {
  const { id } = useParams();
  const products = useSelector(selectProducts);
  const productEdit = products.find((item) => item.id === id);
  console.log(productEdit);

  const [product, setProduct] = useState(() => {
    const newState = detectForm(id, { ...initialState }, productEdit);
    return newState;
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function detectForm(id, f1, f2) {
    if (id === 'ADD') {
      return f1;
    }
    return f2;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };


const handleImageChange = (e) => {
  if (!e.target.files.length) {
    toast.error("No file selected!", { position: "bottom-left", autoClose: 1000 });
    return;
  }

  const file = e.target.files[0];

  // Validate file type (optional)
  if (!file.type.startsWith("image/")) {
    toast.error("Only image files are allowed!", { position: "bottom-left", autoClose: 1000 });
    return;
  }

  // Validate file size (e.g., max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error("File is too large! Max size is 5MB.", { position: "bottom-left", autoClose: 1000 });
    return;
  }

  const storage = getStorage();
  const sanitizedFileName = file.name.replace(/\s/g, "_"); // Replace spaces
  const filePath = `eshop/${Date.now()}_${sanitizedFileName}`;
  const storageRef = ref(storage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setUploadProgress(progress);
    },
    (error) => {
      toast.error(`Upload failed: ${error.message}`, { position: "bottom-left", autoClose: 3000 });
    },
    async () => {
      try {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setProduct((prevProduct) => ({ ...prevProduct, imageUrl: downloadURL }));
        toast.success("Image uploaded successfully!", { position: "bottom-left", autoClose: 2000 });
      } catch (error) {
        toast.error(`Error getting URL: ${error.message}`, { position: "bottom-left", autoClose: 3000 });
      }
    }
  );
};


  const addProduct = (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const docRef = addDoc(collection(db, 'products'), {
        name: product?.name,
        imageUrl: product?.imageUrl,
        price: Number(product?.price),
        category: product?.category,
        brand: product?.brand,
        desc: product?.desc,
        createdAt: Timestamp.now().toDate(),
      });
      setUploadProgress(0);
      setProduct({ ...initialState });
      toast.success('Product uploaded successfully.',
        {
        position: "bottom-left",
        autoClose: 1000,
      });
      navigate('/admin/all-products');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message,
        {
        position: "bottom-left",
        autoClose: 1000,
      });
    }
  };

  // const editProduct = (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);

  //   if (product?.imageUrl !== productEdit.imageUrl) {
  //     const storageRef = ref(storage, productEdit.imageUrl);
  //     deleteObject(storageRef);
  //   }

  //   try {
  //     setDoc(doc(db, 'products', id), {
  //       name: product?.name,
  //       imageUrl: product?.imageUrl,
  //       price: Number(product?.price),
  //       category: product?.category,
  //       brand: product?.brand,
  //       desc: product?.desc,
  //       createdAt: productEdit.createdAt,
  //       editedAt: Timestamp.now().toDate(),
  //     });
  //     setIsLoading(false);
  //     toast.success('Product Edited Successfully',
  //       {
  //       position: "bottom-left",
  //       autoClose: 1000,
  //     });
  //     navigate('/admin/all-products');
  //   } catch (error) {
  //     setIsLoading(false);
  //     toast.error(error.message,
  //       {
  //       position: "bottom-left",
  //       autoClose: 1000,
  //     });
  //   }
  // };

//   import { deleteObject, ref } from "firebase/storage";
// import { doc, setDoc, Timestamp } from "firebase/firestore";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";

//const navigate = useNavigate();

const editProduct = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // If the image was updated, delete the old one
    if (product?.imageUrl !== productEdit.imageUrl) {
      const oldImageUrl = productEdit.imageUrl;
      const storagePath = oldImageUrl
        .split("/o/")[1] // Get the path after '/o/'
        ?.split("?")[0] // Remove query parameters
        ?.replace(/%2F/g, "/"); // Decode '%2F' to '/'

      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef); // Ensure deletion completes before proceeding
      }
    }

    // Update Firestore
    await setDoc(doc(db, "products", id), {
      name: product?.name,
      imageUrl: product?.imageUrl,
      price: Number(product?.price),
      category: product?.category,
      brand: product?.brand,
      desc: product?.desc,
      createdAt: productEdit.createdAt,
      editedAt: Timestamp.now().toDate(),
    });

    toast.success("Product Edited Successfully", {
      position: "bottom-left",
      autoClose: 1000,
    });

    navigate("/admin/all-products");
  } catch (error) {
    toast.error(`Error: ${error.message}`, {
      position: "bottom-left",
      autoClose: 1000,
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      {isLoading && <Loader />}
      <div className={styles.product}>
        <h2>{detectForm(id, 'הוספת מוצר', 'עריכת מוצר')}</h2>
        <Card cardClass={styles.card}>
          <form onSubmit={detectForm(id, addProduct, editProduct)}>
            
            <div style={{display:'grid' , gridTemplateColumns:'1fr 1fr' , width:'100%', gap:'2rem',direction:'rtl'}}>
               <div>
               <label>שם מוצר</label>
                      <input
                        type='text'
                        placeholder='שם מוצר'
                        required
                        name='name'
                        value={product?.name}
                        onChange={(e) => handleInputChange(e)}
                      />

                      <label>תמונת מוצר</label>
                      <Card cardClass={styles.group}>
                        {uploadProgress === 0 ? null : (
                          <div className={styles.progress}>
                            <div
                              className={styles['progress-bar']}
                              style={{ width: `${uploadProgress}%` }}
                            >
                              {uploadProgress < 100
                                ? `Uploading ${uploadProgress}`
                                : `Upload Complete ${uploadProgress}%`}
                            </div>
                          </div>
                        )}

                        <input
                          type='file'
                          accept='image/*'
                          placeholder='תמונת מוצר'
                          name='image'
                          onChange={(e) => handleImageChange(e)}
                        />

                        {product?.imageUrl === '' ? null : (
                          <input
                            type='text'
                            // required
                            placeholder='כתובת תמונה'
                            name='imageUrl'
                            value={product?.imageUrl}
                            disabled
                          />
                        )}
                      </Card>

                      <label>מחיר מוצר</label>
                      <input
                        type='number'
                        placeholder='מחיר מוצר'
                        required
                        name='price'
                        value={product?.price}
                        onChange={(e) => handleInputChange(e)}
                      />
                      <label>קטגוריות</label>
                      <select
                        required
                        name='category'
                        value={product?.category}
                        onChange={(e) => handleInputChange(e)}
                      >
                        <option value='' disabled>
                          -- בחירת קטגטריות --
                        </option>
                        {categories.map((cat) => {
                          return (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          );
                        })}
                      </select>   
               </div>

               <div>
                <label>שם מותג</label>
                    <input
                      type='text'
                      placeholder='Product brand'
                      required
                      name='brand'
                      value={product?.brand}
                      onChange={(e) => handleInputChange(e)}
                    />

                    <label>תיאור</label>
                    <textarea
                      name='desc'
                      required
                      value={product?.desc}
                      onChange={(e) => handleInputChange(e)}
                      cols='30'
                      rows='11'
                    ></textarea>
               </div>
            </div>
            <button className='--btn --btn-primary' style={{width:'30rem' , margin:'auto' }}>
              {detectForm(id, 'שמירה', 'עריכה')}
            </button>
   
          </form>
        </Card>
      </div>
    </>
  );
};

export default AddProduct;
