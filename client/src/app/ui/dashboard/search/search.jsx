"use client";
import React, { useState, useRef } from "react";
import { MdSearch, MdClear } from "react-icons/md";
import Style from "./search.module.css";

const Search = ({ placeholder = "Search...", onChange, onSearch }) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // Đảm bảo rằng ít nhất một trong hai thuộc tính onChange hoặc onSearch được cung cấp
  const handleChange = onChange || onSearch || (() => {});

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Nếu có onChange, gọi nó
    if (onChange) {
      onChange(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Nếu có onSearch, gọi nó, nếu không thì gọi onChange
    if (onSearch) {
      onSearch(inputValue);
    } else if (onChange) {
      onChange(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue("");
    
    // Thông báo khi xóa giá trị
    if (onChange) {
      onChange("");
    }
    if (onSearch) {
      onSearch("");
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form className={Style.container} onSubmit={handleSubmit}>
      <MdSearch className={Style.searchIcon} />
      <input 
        ref={inputRef}
        type="text" 
        placeholder={placeholder}
        className={Style.input}
        value={inputValue}
        onChange={handleInputChange}
      />
      {inputValue && (
        <button
          type="button"
          className={Style.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <MdClear />
        </button>
      )}
      <button type="submit" className={Style.submitButton}>
        Tìm
      </button>
    </form>
  );
};

export default Search;