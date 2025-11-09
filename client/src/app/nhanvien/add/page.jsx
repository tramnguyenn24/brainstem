"use client";
import React, { useState, useEffect } from "react";
import styles from "./add.module.css";
import { useLanguageService } from "../../hooks/useLanguageService";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const AddFoodPage = () => {
  const { foodService, categoryService, language } = useLanguageService();
  const router = useRouter();
  const { uploadToPinata, error, openError } = useCart();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    imgUrl: '',
    categoryId: '',
    state: 'AVAILABLE',
    quantity: 1
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [language]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getActiveCategories();
      const categoryData = Array.isArray(response) ? response : response.data || [];
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) return 'Name is required';
    if (value.trim().length < 5) return 'Name must be at least 5 characters';
    return '';
  };

  const validateDescription = (value) => {
    if (!value.trim()) return 'Description is required';
    if (value.trim().length < 10) return 'Description must be at least 10 characters';
    return '';
  };

  const validatePrice = (value) => {
    if (!value) return 'Price is required';
    const price = parseFloat(value);
    if (isNaN(price) || price <= 0) return 'Price must be a positive number';
    return '';
  };

  const validateQuantity = (value) => {
    if (!value) return 'Quantity is required';
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 0) return 'Quantity must be a non-negative number';
    return '';
  };

  const validateCategory = (value) => {
    if (!value) return 'Category is required';
    return '';
  };

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return validateName(value);
      case 'description':
        return validateDescription(value);
      case 'price':
        return validatePrice(value);
      case 'quantity':
        return validateQuantity(value);
      case 'categoryId':
        return validateCategory(value);
      default:
        return '';
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'state' && key !== 'image' && key !== 'imgUrl') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    if (!formData.image && !formData.imgUrl) {
      toast.error('Please select an image');
      return;
    }

    setIsSubmitting(true);

    try {
      let imgUrl = formData.imgUrl;
      if (formData.image) {
        imgUrl = await uploadToPinata(formData.image);
      }

      const result = await foodService.addFood(
        formData.name,
        formData.description,
        formData.price.toString(),
        imgUrl,
        formData.categoryId,
        formData.state,
        formData.quantity.toString()
      );

      // Check if API response contains error
      if (result.code && result.code !== 200) {
        const errorMessage = result.message || 'Failed to add product. Please try again.';
        toast.error(errorMessage);
        return;
      }

      // Check if response has error field or unsuccessful structure
      if (result.error || (result.code && result.code >= 1000)) {
        const errorMessage = result.message || result.error || 'Failed to add product. Please try again.';
        toast.error(errorMessage);
        return;
      }

      // Success case
      toast.success('Product added successfully!');
      router.push('/admin/dashboard/products');
    } catch (error) {
      console.error('Error adding product:', error);
      
      // Parse error response to get message from API
      let errorMessage = 'Failed to add product. Please try again.';
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter food name"
            className={errors['name'] ? styles.errorInput : ''}
          />
          {errors['name'] && <span className={styles.errorText}>{errors['name']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter food description"
            className={errors['description'] ? styles.errorInput : ''}
          />
          {errors['description'] && <span className={styles.errorText}>{errors['description']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            step="0.1"
            min="0"
            className={errors['price'] ? styles.errorInput : ''}
          />
          {errors['price'] && <span className={styles.errorText}>{errors['price']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            min="0"
            className={errors['quantity'] ? styles.errorInput : ''}
          />
          {errors['quantity'] && <span className={styles.errorText}>{errors['quantity']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Category:</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={errors['categoryId'] ? styles.errorInput : ''}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors['categoryId'] && <span className={styles.errorText}>{errors['categoryId']}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Status:</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="IN_AVAILABLE">IN_AVAILABLE</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Food'}
          </button>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={() => router.push('/admin/dashboard/products')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFoodPage;