"use client";

import React, { useEffect, useState } from "react";
import styles from "./report.module.css";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import { campaignService } from "../api/campaign/campaignService";
import { studentService } from "../api/student/studentService";
import toast from "react-hot-toast";

const ReportPage = () => {
    // Utility function to extract error message from API response
    const getErrorMessage = (error, defaultMessage) => {
        // Check if error has response data with message
        if (error?.response?.data?.message) {
            return error.response.data.message;
        }
        
        // Check if error object has message property directly (API response)
        if (error?.message) {
            return error.message;
        }
        
        // Check if error is response object with code/status
        if (error?.code >= 400 || error?.status >= 400) {
            return error.message || `Lỗi ${error.code || error.status}`;
        }
        
        // Check if error is string
        if (typeof error === 'string') {
            return error;
        }
        
        // Debug log for unhandled error formats
        console.log("Unhandled error format:", error);
        
        // Fallback to default message
        return defaultMessage;
    };

    const [orders, setOrders] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [campaigns, setCampaigns] = useState([]);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentPage = parseInt(searchParams.get("page") || "0");
    const statusFilter = searchParams.get("status") || "";

    // Fetch campaigns on mount
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await campaignService.getCampaigns({ page: 1, size: 100 });
                if (response && response.data) {
                    setCampaigns(response.data);
                } else if (Array.isArray(response)) {
                    setCampaigns(response);
                }
            } catch (err) {
                console.error("Error fetching campaigns:", err);
            }
        };
        fetchCampaigns();
    }, []);

    useEffect(() => {
        fetchOrders(currentPage, statusFilter, searchTerm);
    }, [currentPage, statusFilter, searchTerm]);

    const updateFilters = (newFilters) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        params.set("page", "0");
        replace(`${pathname}?${params}`);
    };

    const fetchOrders = async (page, status, search = "") => {
        try {
            setLoading(true);
            // Sử dụng studentService để lấy danh sách học viên đã đăng ký
            const response = await studentService.getStudents({
                page: page + 1, // API sử dụng page bắt đầu từ 1
                size: 10,
                search: search || undefined,
                enrollmentStatus: status || undefined,
                sortBy: 'createdAt',
                sortDirection: 'desc'
            });
            
            // Xử lý response từ API
            if (response && response.items) {
                setOrders(response.items);
                setMetadata({
                    page: response.page - 1, // Convert về 0-based cho UI
                    totalPages: response.totalPages,
                    count: response.items.length,
                    totalElements: response.totalItems
                });
            } else if (response && response.data && Array.isArray(response.data)) {
                setOrders(response.data);
                setMetadata(response.metadata || null);
            } else if (Array.isArray(response)) {
                setOrders(response);
                setMetadata({
                    page: page,
                    totalPages: 1,
                    count: response.length,
                    totalElements: response.length
                });
            } else {
                console.warn("Unexpected students response format", response);
                setOrders([]);
                setMetadata(null);
                toast.error("Dữ liệu trả về không đúng định dạng", {
                    duration: 3000,
                    position: "top-center"
                });
            }

        } catch (err) {
            console.error("Error fetching students:", err);
            setOrders([]);
            setMetadata(null);
            const errorMessage = getErrorMessage(err, "Không thể tải danh sách học viên. Vui lòng thử lại!");
            toast.error(errorMessage, {
                duration: 4000,
                position: "top-center"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => setSearchTerm(value);
    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        updateFilters({ status });
    };

    const handleView = async (studentId) => {
        try {
            const detail = await studentService.getStudentById(studentId);
            setSelectedOrder(detail);
            setShowDetailModal(true);
        } catch (err) {
            console.error("Error fetching student detail:", err);
            const errorMessage = getErrorMessage(err, "Không thể tải chi tiết học viên. Vui lòng thử lại!");
            toast.error(errorMessage, {
                duration: 4000,
                position: "top-center"
            });
        }
    };

    // Format currency to Vietnamese format
    const formatCurrency = (amount) => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(numericAmount || 0);
    };

    // Get status class name
    const getStatusClass = (status) => {
        switch (status) {
            case 'DONE':
                return styles.statusCompleted;
            case 'PAID':
                return styles.statusPaid;
            case 'HOLD':
                return styles.statusHold;
            case 'PROCESSING':
                return styles.statusPending;
            case 'CANCELLED':
                return styles.statusCancelled;
            case 'FAILED':
                return styles.statusFailed;
            default:
                return styles.statusDefault;
        }
    };

    // Get taking method display text
    const getTakingMethodText = (method) => {
        const methodMap = {
            'DELIVERY': 'Giao hàng tiêu chuẩn',
            'EXPRESS_DELIVERY': 'Giao hàng nhanh',
            'PICKUP': 'Tự đến lấy',
            'PICKUP_SCHEDULED': 'Tự đến lấy theo lịch hẹn',
            'DINE_IN': 'Dùng tại chỗ',
            'DINE_IN_RESERVED': 'Dùng tại chỗ có đặt bàn',
            'SHIP': 'Giao hàng'
        };
        return methodMap[method] || method || 'N/A';
    };

    if (loading) return <div className={styles.loading}>Đang tải...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <h1>Báo cáo Thống kê Đăng ký</h1>
                <FilterableSearch
                    placeholder="Tìm kiếm theo tên học viên hoặc email..."
                    onChange={handleSearch}
                    onSearch={handleSearch}
                    value={searchTerm}
                    statusFilter={selectedStatus}
                    onStatusChange={handleStatusChange}
                    statusOptions={[
                        { value: "", label: "Tất cả trạng thái" },
                        { value: "pending", label: "Chờ xử lý" },
                        { value: "enrolled", label: "Đã đăng ký" },
                        { value: "completed", label: "Hoàn thành" },
                        { value: "cancelled", label: "Đã hủy" },
                    ]}
                />
            </div>

            <table className={styles.table}>
                <thead>
                <tr>
                    <td>ID</td>
                    <td>Tên học viên</td>
                    <td>Email</td>
                    <td>Số điện thoại</td>
                    <td>Khóa học</td>
                    <td>Trạng thái</td>
                    <td>Chiến dịch</td>
                    <td>Học phí</td>
                    <td>Ngày đăng ký</td>
                    <td>Thao tác</td>
                </tr>
                </thead>
                <tbody>
                {orders.length === 0 ? (
                    <tr>
                        <td colSpan={10} className={styles.noData}>
                            Hiển thị 0 / 0 bản ghi
                        </td>
                    </tr>
                ) : (
                    orders.map((student) => {
                        const campaign = campaigns.find(c => (c.id || c.MaCD) === (student.campaignId || student.MaCD));
                        return (
                            <tr key={student.id}>
                                <td>#{student.id}</td>
                                <td className={styles.orderName}>
                                    {student.fullName || student.name}
                                </td>
                                <td>{student.email || "N/A"}</td>
                                <td>{student.phone || student.phoneNumber || "Chưa có"}</td>
                                <td>
                                    <p className={styles.orderType}>
                                        Khóa học ID: {student.campaignId || "N/A"}
                                    </p>
                                </td>
                                <td>
                                    <p className={`${styles.status} ${getStatusClass(student.enrollmentStatus || student.status)}`}>
                                        {student.enrollmentStatus === 'enrolled' ? 'Đã đăng ký' : 
                                         student.enrollmentStatus === 'pending' ? 'Chờ xử lý' :
                                         student.enrollmentStatus === 'completed' ? 'Hoàn thành' :
                                         student.enrollmentStatus === 'cancelled' ? 'Đã hủy' :
                                         student.enrollmentStatus || student.status || 'N/A'}
                                    </p>
                                </td>
                                <td>{campaign?.name || campaign?.TenCD || "N/A"}</td>
                                <td className={styles.price}>
                                    {formatCurrency(student.tuitionFee || student.fee || 0)}
                                </td>
                                <td>
                                    <p className={styles.foodCount}>
                                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </p>
                                </td>
                                <td>
                                    <button
                                        className={styles.viewButton}
                                        onClick={() => handleView(student.id)}
                                    >
                                        Chi tiết
                                    </button>
                                </td>
                            </tr>
                        );
                    })
                )}
                </tbody>
            </table>

            <Pagination
                metadata={metadata || { page: 0, totalPages: 1, count: 0, totalElements: 0 }}
            />

            {showDetailModal && selectedOrder && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Chi tiết học viên #{selectedOrder.id}</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setShowDetailModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.modalContent}>
                            <div className={styles.orderInfo}>
                                <h3>Thông tin học viên</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <strong>Họ và tên:</strong>
                                        <p>{selectedOrder.fullName || selectedOrder.name}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Email:</strong>
                                        <p>{selectedOrder.email || "Không có"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Số điện thoại:</strong>
                                        <p>{selectedOrder.phone || selectedOrder.phoneNumber || "Chưa có"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Trạng thái:</strong>
                                        <p className={`${styles.status} ${getStatusClass(selectedOrder.status)}`}>
                                            {selectedOrder.status || "N/A"}
                                        </p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Trạng thái đăng ký:</strong>
                                        <p className={`${styles.status} ${getStatusClass(selectedOrder.enrollmentStatus)}`}>
                                            {selectedOrder.enrollmentStatus === 'enrolled' ? 'Đã đăng ký' : 
                                             selectedOrder.enrollmentStatus === 'pending' ? 'Chờ xử lý' :
                                             selectedOrder.enrollmentStatus === 'completed' ? 'Hoàn thành' :
                                             selectedOrder.enrollmentStatus === 'cancelled' ? 'Đã hủy' :
                                             selectedOrder.enrollmentStatus || 'N/A'}
                                        </p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Chiến dịch:</strong>
                                        <p>{campaigns.find(c => (c.id || c.MaCD) === selectedOrder.campaignId)?.name || campaigns.find(c => (c.id || c.MaCD) === selectedOrder.campaignId)?.TenCD || "N/A"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Kênh:</strong>
                                        <p>{selectedOrder.channelName || "N/A"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Nhân viên phụ trách:</strong>
                                        <p>{selectedOrder.assignedStaffName || "N/A"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Học viên mới:</strong>
                                        <p>{selectedOrder.newStudent ? "Có" : "Không"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Ngày tạo:</strong>
                                        <p>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : "N/A"}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <strong>Ngày cập nhật:</strong>
                                        <p>{selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString('vi-VN') : "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.priceInfo}>
                                <h3>Thông tin học phí</h3>
                                <div className={styles.priceGrid}>
                                    <div className={styles.priceItem}>
                                        <strong>Học phí:</strong>
                                        <p>{formatCurrency(selectedOrder.tuitionFee || selectedOrder.fee || 0)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalButtons}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowDetailModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportPage;
