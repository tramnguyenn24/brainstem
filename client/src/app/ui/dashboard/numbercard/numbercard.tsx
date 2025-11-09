import React from 'react';
import { FaBoxOpen } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa";
import Style from "./numbercard.module.css";

const NumberCard = ({ title1, title2 }: { title1: string, title2: string }) => {
  const getIcon = () => {
    if (title1.includes("Stock")) return <FaBoxOpen className={Style.numbercard_icon} />;
    if (title1.includes("Sell")) return <FaShoppingCart className={Style.numbercard_icon} />;
    if (title1.includes("Revenue")) return <FaDollarSign className={Style.numbercard_icon} />;
    return null;
  };

  return (
    <div className={Style.numbercard}>
      <div className={Style.numbercard_content}>
        <div className={Style.numbercard_text}>
          <h3 className={Style.numbercard_value}>{title2}</h3>
          <p className={Style.numbercard_title}>{title1}</p>
        </div>
        <div className={Style.numbercard_icon_wrapper}>
          {getIcon()}
        </div>
      </div>
    </div>
  )
}

export default NumberCard