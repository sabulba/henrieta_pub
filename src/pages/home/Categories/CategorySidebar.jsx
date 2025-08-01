// src/pages/home/Categories/CategorySidebar.jsx
import React from "react";
import styles from "./CategorySidebar.module.scss";
import {
  FaBeer,
  FaWineGlassAlt,
  FaHamburger,
  FaGlassWhiskey,
  FaBoxOpen,
  FaEllipsisH,
} from "react-icons/fa";
import { RiBeerFill} from "react-icons/ri";

const categoryIcons = [
  { name: 'בירה', src: 'images/categories/beer.png'},
  { name: 'משקאות חריפים', src: 'images/categories/alcoholic.png' },
  { name: 'Whisky', src: 'images/categories/wisky.png' },
  { name: 'משקאות קלים', src: 'images/categories/soft-drink.png' },
  { name: 'מאכלים', src: 'images/categories/food.png' },
  { name: 'כל המוצרים', src: 'images/categories/all_products.png' },
  { name: "צ'ייסרים",src: 'images/categories/chasers.png' },
  { name: 'מעורבבים', src: 'images/categories/mixed.png' },
  { name: 'יין', src: 'images/categories/wine.png' },
];


const CategorySidebar = ({ products, onSelectCategory }) => {
  const categories = [...new Set(products.map((p) => p.category))];
  // התאמת האייקון המתאים לפי שם הקטגוריה
  const getIconForCategory = (catName) => {
     const icon = categoryIcons.find((icon) => icon.name === catName);
     return icon ? icon.src : null;
  };

  return (
    <div className={styles.sidebar}>
      <ul>
        {categories.map((cat,index) => (
         <li key={cat} onClick={() => onSelectCategory(cat)} style={{background:"#262020" ,padding:"1rem" , color:"white" , borderRadius:"10px"}}>
            <img
              src={getIconForCategory(cat)}
              style={{ width: "5rem",height:"5rem", marginLeft: "0.5rem" }}
            />
            {cat}
          </li>
        ))
        }
        <li onClick={() => onSelectCategory('')} style={{background:"#262020" ,padding:"1rem" , color:"white" , borderRadius:"10px"}}>
            <img
              src="images/categories/all_products.png"
              style={{ width: "5rem",height:"5rem", marginLeft: "0.5rem" }}
            />
            כל המוצרים
          </li>
      </ul>
    </div>
  );
};

export default CategorySidebar;
/*// src/pages/home/Categories/CategorySidebar.jsx
import React from "react";
import styles from "./CategorySidebar.module.scss";
import {
  FaBeer,
  FaWineGlassAlt,
  FaHamburger,
  FaGlassWhiskey,
  FaBoxOpen,
  FaEllipsisH,
} from "react-icons/fa";

const categoryIcons = [
  { name: 'בירה', src: '/icons/beer.svg' },
  { name: 'משקאות חריפים', src: '/icons/liquor.svg' },
  { name: 'משקאות קלים', src: '/icons/soft-drink.svg' },
  { name: 'מאכלים', src: '/icons/food.svg' },
  { name: 'כל המוצרים', src: '/icons/all-products.svg' },
];

const CategorySidebar = ({ products, onSelectCategory }) => {
  const uniqueCategories = [...new Set(products.map((p) => p.category))];

  // התאמת האייקון המתאים לפי שם הקטגוריה
  const getIconForCategory = (catName) => {
    const icon = categoryIcons.find((icon) => icon.name === catName);
    return icon ? icon.src : null;
  };

  return (
    <div className={styles.sidebar}>
      <ul>
        {uniqueCategories.map((cat) => (
          <li key={cat} onClick={() => onSelectCategory(cat)}>
            <img
              src={getIconForCategory(cat)}
              alt={cat}
              style={{ width: "2rem", marginLeft: "0.5rem" }}
            />
            {cat}
          </li>
        ))}

        <li onClick={() => onSelectCategory(null)}>
          <img
            src={getIconForCategory('כל המוצרים')}
            alt="כל המוצרים"
            style={{ width: "2rem", marginLeft: "0.5rem" }}
          />
          כל המוצרים
        </li>
      </ul>
    </div>
  );
};

export default CategorySidebar;
*/
