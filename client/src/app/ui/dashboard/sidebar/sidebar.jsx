"use client";
import Image from "next/image";
import MenuLink from "./menu/menuLink";
import styles from "./sidebar.module.css";
import { BsClipboardPulse } from "react-icons/bs";
import { FaRegIdCard } from "react-icons/fa6";
import { PiMedal } from "react-icons/pi";
import { CiUser } from "react-icons/ci";
import { GrChannel } from "react-icons/gr";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { FaChartBar } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { HiOutlineMegaphone } from "react-icons/hi2";
import images from "../../../img/index"; 


const menuItems = [
  {
    title: "",
    list: [
      {
        title: "Trang chủ",
        path: "/",
        icon: <FaHome />,
      },
      {
        title: "QL Form",
        path: "/forms",
        icon: <BsClipboardPulse />,
      },
      {
        title: "QL Học viên",
        path: "/hocvien",
        icon: <FaRegIdCard />,
      },
      {
        title: "HV Tiềm năng",
        path: "/hvtiemnang",
        icon: <PiMedal />,
      },
      {
        title: "QL nhân viên",
        path: "/nhanvien",
        icon: <CiUser />,
      },
      {
        title: "QL Chiến dịch",
        path: "/chiendich",
        icon: <HiOutlineMegaphone />,
      },
      {
        title: "Kênh truyền thông",
        path: "/media",
        icon: <GrChannel />,
      },
      {
        title: "Doanh thu",
        path: "/revenue",
        icon: <AiOutlineDollarCircle />,
      },
      {
        title: "Báo cáo thống kê",
        path: "/report",
        icon: <FaChartBar />,
      },
    ],
  }
];

const Sidebar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Image src={images.logoheader} alt="logo" width={280} height={100} />
      </div>
      <ul >
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>
              {cat.title}
            </span>
            {cat.list.map((item) => (
              <MenuLink key={item.title} item={item}>
                {/* {item.title} */}
              </MenuLink>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;