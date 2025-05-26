import React, { useEffect, useRef, useState } from "react";
import { Fab } from "react-tiny-fab";
import { FaFilter } from "react-icons/fa"; 
import "react-tiny-fab/dist/styles.css";
import styles from "./FloatingActionButton.module.scss"; 

const FloatingActionButton = ({ children , isOpen, toggleFilters }) => {
  const fabRef = useRef(null);
  const filterContainerRef = useRef(null);

  const handleClickOutside = (event) => {
    // Close the filters if the click is outside of the FAB or filter container
    if (
      fabRef.current &&
      !fabRef.current.contains(event.target) &&
      filterContainerRef.current &&
      !filterContainerRef.current.contains(event.target)
    ) {
      // Close the filters when clicked outside (No state update here)
      isOpen = false;
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside the component
    document.addEventListener("click", handleClickOutside);
    return () => {
      // Clean up the event listener on unmount
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <div style={{ position: "relative" }}>
      <Fab
        mainButtonStyles={{ backgroundColor: "#007bff", color: "white" ,background:"black",top: "3rem" ,right:(window.screen.width - 120)+'px'}}
        icon={<FaFilter />}
        alwaysShowTitle={false}
        onClick={toggleFilters }
      />
      {isOpen && (
        <div   
        ref={filterContainerRef}
        className={styles.filterContainer}   >
          {children}  
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;
