"use client";
import React, { useState, useRef, useEffect } from "react";
import { MdSearch, MdClear } from "react-icons/md";
import styles from "./filterableSearch.module.css";

const FilterableSearch = ({ 
  placeholder = "Search...", 
  onChange, 
  onSearch, 
  value,
  statusFilter,
  onStatusChange,
  statusOptions
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef(null);

  // Default status options if not provided
  const defaultStatusOptions = [
    { value: "", label: "All Statuses" },
    { value: "AVAILABLE", label: "Available" },
    { value: "UNAVAILABLE", label: "Unavailable" }
  ];

  // Use provided statusOptions or fall back to defaults
  const options = statusOptions || defaultStatusOptions;

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Nếu có onChange, gọi nó
    if (onChange) {
      onChange(newValue);
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

  const handleStatusChange = (e) => {
    if (onStatusChange) {
      onStatusChange(e.target.value);
    }
  };

  return (
    <div className={styles.filterContainer}>
      <form className={styles.searchForm} onSubmit={handleSubmit}>
        <div className={styles.searchInputContainer}>
          <MdSearch className={styles.searchIcon} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder={placeholder}
            className={styles.searchInput}
            value={inputValue}
            onChange={handleInputChange}
          />
          {inputValue && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear search"
            >
              <MdClear />
            </button>
          )}
        </div>
        <button type="submit" className={styles.submitButton}>
          Tìm
        </button>
      </form>
      
      {onStatusChange && (
        <div className={styles.statusFilterContainer}>
          <select 
            className={styles.statusFilter}
            value={statusFilter || ""}
            onChange={handleStatusChange}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterableSearch; 