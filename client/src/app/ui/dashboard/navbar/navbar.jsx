"use client";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import {
  MdNotifications,
  MdOutlineChat,
  MdPublic,
  MdSearch,
  MdPerson,
} from "react-icons/md";
import { useEffect, useState, useRef } from "react";


const formatTitle = (slug) => {
  if (!slug) return '';
  // Tách camelCase bằng regex
  const words = slug.replace(/([A-Z])/g, ' $1').trim();
  // Viết hoa chữ cái đầu
  return words
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
};
const Navbar = () => {
  const pathname = usePathname();
  const titleSlug = pathname.split('/').pop();
  const formattedTitle = formatTitle(titleSlug);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const avatarRef = useRef(null);


  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{formattedTitle}</div>
      <div className={styles.menu}>
        
        {/* Avatar + Profile menu */}
        <div className={styles.avatarWrapper} ref={avatarRef}>
          <div
            className={styles.avatarWrapper}
            onClick={() => setShowProfileMenu((v) => !v)}
          >
            
              <div 
                className={styles.avatarImg}
                style={{
                  borderRadius: '50%',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MdPerson size={24} color="#666" />
              </div>
            
            
          </div>
          {showProfileMenu && (
            <div className={styles.profileMenu}>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;