'use client';
import React, { useState, useEffect, Suspense } from "react";
import Style from "./chiendich.module.css";
import { Pagination, FilterableSearch } from "../ui/dashboard/dashboardindex";
import Link from "next/link";
import { campaignService } from "../api/campaign/campaignService";
import { channelService } from "../api/channel/channelService";
import { staffService } from "../api/staff/staffService";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import LogoutButton from "../components/LogoutButton/LogoutButton";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';

// Utility function để extract error message
const getErrorMessage = (error, defaultMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.code >= 400 || error?.status >= 400) return error.message || `Lỗi ${error.code || error.status}`;
  if (typeof error === 'string') return error;
  return defaultMessage;
};

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    status: 'running',
    ownerStaffId: null,
    budget: '0',
    spend: '0',
    roi: '0',
    // Thời gian chiến dịch
    startDate: '',
    endDate: '',
    // Mục tiêu chiến dịch
    targetLeads: '0',
    targetNewStudents: '0',
    targetRevenue: '0'
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [channels, setChannels] = useState([]);
  const [staff, setStaff] = useState([]);
  const [summary, setSummary] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [exporting, setExporting] = useState(false);
  const [editCampaignChannels, setEditCampaignChannels] = useState([]);


  // Lấy tham số từ URL
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Lấy trang hiện tại từ URL (API bắt đầu từ 1)
  const currentPage = parseInt(searchParams.get("page") || "1");

  // Lấy các tham số lọc từ URL
  const searchFilter = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const startDateFilter = searchParams.get("startDate") || "";
  const endDateFilter = searchParams.get("endDate") || "";
  const sortByFilter = searchParams.get("sortBy") || "";
  const sortDirectionFilter = searchParams.get("sortDirection") || "desc";

  // Sync state với URL parameters
  useEffect(() => {
    setSearchTerm(searchFilter);
    setSelectedStatus(statusFilter);
    setStartDate(startDateFilter);
    setEndDate(endDateFilter);
    setSortBy(sortByFilter);
    setSortDirection(sortDirectionFilter);
  }, [searchFilter, statusFilter, startDateFilter, endDateFilter, sortByFilter, sortDirectionFilter]);

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await campaignService.getCampaignSummary({
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined
        });
        if (response) {
          setSummary(response);
        }
      } catch (err) {
        console.error("Error fetching campaign summary:", err);
      }
    };
    fetchSummary();
  }, [startDateFilter, endDateFilter]);

  // Fetch channels and staff for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [channelsResponse, staffResponse] = await Promise.all([
          channelService.getChannels({ page: 1, size: 100 }),
          staffService.getStaffMembers({ page: 1, size: 100 })
        ]);

        if (channelsResponse && channelsResponse.items) {
          setChannels(channelsResponse.items);
        } else if (Array.isArray(channelsResponse)) {
          setChannels(channelsResponse);
        }

        if (staffResponse && staffResponse.items) {
          setStaff(staffResponse.items);
        } else if (Array.isArray(staffResponse)) {
          setStaff(staffResponse);
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };
    fetchDropdownData();
  }, []);

  // Effect khi trang hoặc bộ lọc thay đổi, gọi API để lấy dữ liệu
  useEffect(() => {
    fetchCampaigns(
      currentPage,
      itemsPerPage,
      searchFilter,
      statusFilter,
      sortByFilter,
      sortDirectionFilter,
      startDateFilter,
      endDateFilter
    );
  }, [currentPage, itemsPerPage, searchFilter, statusFilter, startDateFilter, endDateFilter, sortByFilter, sortDirectionFilter]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchTerm !== searchFilter) {
        // Cập nhật URL với từ khóa tìm kiếm
        updateFilters({ search: searchTerm });
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, searchFilter]);

  // Cập nhật bộ lọc vào URL và quay về trang đầu tiên
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);

    // Cập nhật các tham số
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Khi thay đổi bộ lọc, quay về trang đầu tiên
    params.set("page", "1");

    // Cập nhật URL
    replace(`${pathname}?${params}`);
  };

  const fetchCampaigns = async (
    page,
    size,
    search = "",
    status = "",
    sortByParam = "",
    sortDirectionParam = "desc",
    startDateParam,
    endDateParam
  ) => {
    try {
      setLoading(true);
      const response = await campaignService.getCampaigns({
        page,
        size,
        search,
        status,
        startDate: startDateParam || startDateFilter || undefined,
        endDate: endDateParam || endDateFilter || undefined,
        sortBy: sortByParam || 'createdAt',
        sortDirection: sortDirectionParam || 'desc'
      });

      console.log("API Response (Campaigns):", response);

      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể tải danh sách chiến dịch");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        setCampaigns([]);
        return;
      }

      // Kiểm tra và xử lý dữ liệu từ API
      if (response.items && Array.isArray(response.items)) {
        let processedItems = response.items;

        // Nếu sort theo conversionRate, cần sort ở frontend vì đây là giá trị tính toán
        if (sortByParam === 'conversionRate') {
          processedItems = [...response.items].sort((a, b) => {
            const rateA = (a.potentialStudentsCount > 0)
              ? (a.newStudentsCount || 0) / a.potentialStudentsCount
              : 0;
            const rateB = (b.potentialStudentsCount > 0)
              ? (b.newStudentsCount || 0) / b.potentialStudentsCount
              : 0;

            if (sortDirectionParam === 'desc') {
              return rateB - rateA;
            } else {
              return rateA - rateB;
            }
          });
        }

        setCampaigns(processedItems);

        // Lưu metadata để sử dụng cho phân trang
        if (response.page !== undefined) {
          setMetadata({
            page: response.page - 1, // Convert to 0-based for pagination component
            totalPages: response.totalPages,
            count: response.items.length,
            totalElements: response.totalItems
          });
        } else {
          console.warn("No pagination metadata found in Campaigns API response");
        }
      } else if (Array.isArray(response)) {
        // Fallback if API returns array directly
        setCampaigns(response);
        setMetadata({
          page: 0,
          totalPages: 1,
          count: response.length,
          totalElements: response.length
        });
      } else {
        console.error("Unexpected API response format:", response);
        setCampaigns([]);
        toast.error("Dữ liệu trả về không đúng định dạng", {
          duration: 3000,
          position: "top-center"
        });
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải danh sách chiến dịch. Vui lòng thử lại!");
      setCampaigns([]);
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    updateFilters({ status });
  };

  const handleDateFilterChange = () => {
    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Ngày bắt đầu không được lớn hơn ngày kết thúc!', {
        duration: 3000,
        position: 'top-center'
      });
      return;
    }

    updateFilters({
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });
  };

  const handleSort = (column) => {
    let newSortDirection = 'desc';
    if (sortBy === column) {
      // Nếu đang sắp xếp theo cột này, đảo chiều
      newSortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    }
    updateFilters({
      sortBy: column,
      sortDirection: newSortDirection
    });
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return '⇅'; // Neutral sort icon
    }
    return sortDirection === 'desc' ? '↓' : '↑';
  };

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setEditForm({
      name: campaign.name || '',
      status: campaign.status || 'running',
      ownerStaffId: campaign.ownerStaffId || null,
      budget: campaign.budget ? String(campaign.budget) : '0',
      spend: campaign.spend ? String(campaign.spend) : '0',
      roi: campaign.roi ? String(campaign.roi) : '0',
      // Thời gian chiến dịch
      startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
      endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
      // Mục tiêu chiến dịch
      targetLeads: campaign.targetLeads ? String(campaign.targetLeads) : '0',
      targetNewStudents: campaign.targetNewStudents ? String(campaign.targetNewStudents) : '0',
      targetRevenue: campaign.targetRevenue ? String(campaign.targetRevenue) : '0'
    });

    // Load existing channels
    if (campaign.channels && campaign.channels.length > 0) {
      setEditCampaignChannels(campaign.channels.map(ch => ({
        channelId: ch.channelId || ch.id,
        cost: ch.cost || 0
      })));
    } else {
      setEditCampaignChannels([]);
    }

    setShowEditModal(true);
  };

  const handleEditAddChannel = () => {
    setEditCampaignChannels([...editCampaignChannels, { channelId: '', cost: 0 }]);
  };

  const handleEditRemoveChannel = (index) => {
    setEditCampaignChannels(editCampaignChannels.filter((_, i) => i !== index));
  };

  const handleEditChannelChange = (index, field, value) => {
    const updated = [...editCampaignChannels];
    updated[index] = { ...updated[index], [field]: value };
    setEditCampaignChannels(updated);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!editForm.name.trim()) {
      toast.error("Tên chiến dịch không được để trống!", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    try {
      toast.loading("Đang cập nhật chiến dịch...", { id: "edit-campaign" });

      // Prepare channels data
      const channelsData = editCampaignChannels
        .filter(ch => ch.channelId)
        .map(ch => ({
          channelId: Number(ch.channelId),
          cost: Number(ch.cost) || 0
        }));

      const response = await campaignService.updateCampaign(selectedCampaign.id, {
        name: editForm.name,
        status: editForm.status,
        ownerStaffId: editForm.ownerStaffId ? Number(editForm.ownerStaffId) : null,
        budget: editForm.budget ? Number(editForm.budget) : 0,
        spend: editForm.spend ? Number(editForm.spend) : 0,
        roi: editForm.roi ? Number(editForm.roi) : 0,
        // Thời gian chiến dịch
        startDate: editForm.startDate || null,
        endDate: editForm.endDate || null,
        // Mục tiêu chiến dịch
        targetLeads: editForm.targetLeads ? Number(editForm.targetLeads) : 0,
        targetNewStudents: editForm.targetNewStudents ? Number(editForm.targetNewStudents) : 0,
        targetRevenue: editForm.targetRevenue ? Number(editForm.targetRevenue) : 0,
        channels: channelsData
      });

      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể cập nhật chiến dịch");
        toast.error(errorMessage, {
          id: "edit-campaign",
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      toast.success(`Đã cập nhật chiến dịch "${editForm.name}" thành công!`, {
        id: "edit-campaign",
        duration: 3000,
        position: "top-center"
      });

      setShowEditModal(false);
      fetchCampaigns(currentPage, itemsPerPage, searchFilter, statusFilter, sortByFilter, sortDirectionFilter, startDateFilter, endDateFilter);
    } catch (err) {
      console.error("Error updating campaign:", err);
      const errorMessage = getErrorMessage(err, "Không thể cập nhật chiến dịch. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "edit-campaign",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleDelete = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      toast.loading("Đang xóa chiến dịch...", { id: "delete-campaign" });

      const response = await campaignService.deleteCampaign(selectedCampaign.id);

      // Kiểm tra lỗi từ response
      if (response && (response.code >= 400 || response.error || response.status >= 400)) {
        const errorMessage = getErrorMessage(response, "Không thể xóa chiến dịch");
        toast.error(errorMessage, {
          id: "delete-campaign",
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      toast.success(`Đã xóa chiến dịch "${selectedCampaign.name}" thành công!`, {
        id: "delete-campaign",
        duration: 3000,
        position: "top-center"
      });

      setShowDeleteModal(false);
      fetchCampaigns(currentPage, itemsPerPage, searchFilter, statusFilter, sortByFilter, sortDirectionFilter, startDateFilter, endDateFilter);
    } catch (err) {
      console.error("Error deleting campaign:", err);
      const errorMessage = getErrorMessage(err, "Không thể xóa chiến dịch. Vui lòng thử lại!");
      toast.error(errorMessage, {
        id: "delete-campaign",
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const handleView = async (campaign) => {
    try {
      const campaignDetail = await campaignService.getCampaignDetails(campaign.id);

      // Kiểm tra lỗi từ response
      if (campaignDetail && (campaignDetail.code >= 400 || campaignDetail.error || campaignDetail.status >= 400)) {
        const errorMessage = getErrorMessage(campaignDetail, "Không thể tải chi tiết chiến dịch");
        toast.error(errorMessage, {
          duration: 4000,
          position: "top-center"
        });
        return;
      }

      setSelectedCampaign(campaignDetail);
      setShowViewModal(true);
    } catch (err) {
      console.error("Error fetching campaign details:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải chi tiết chiến dịch. Vui lòng thử lại!");
      toast.error(errorMessage, {
        duration: 4000,
        position: "top-center"
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return Style.active;
      case 'paused': return Style.warning;
      case 'completed': return Style.completed;
      default: return Style.inactive;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'running': return 'Đang chạy';
      case 'paused': return 'Tạm dừng';
      case 'completed': return 'Hoàn thành';
      default: return status || 'N/A';
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      toast.loading("Đang xuất báo cáo...", { id: "export-excel" });

      // Fetch all data matching current filters
      const response = await campaignService.getCampaigns({
        page: 1,
        size: 10000, // Large enough to get all
        search: searchFilter,
        status: statusFilter,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
        sortBy: sortByFilter || 'createdAt',
        sortDirection: sortDirectionFilter || 'desc'
      });

      if (!response || !response.items || response.items.length === 0) {
        toast.error("Không có dữ liệu để xuất", { id: "export-excel" });
        return;
      }

      // Format data for Excel - Main campaign sheet
      const campaignData = response.items.map(item => ({
        'Tên chiến dịch': item.name,
        'Trạng thái': getStatusText(item.status),
        'Người phụ trách': item.ownerStaffName || '',
        'Ngân sách': item.budget || 0,
        'Tổng chi': item.cost || 0,
        'Doanh thu': item.revenue || 0,
        'Học viên tiềm năng': item.potentialStudentsCount || 0,
        'Học viên mới': item.newStudentsCount || 0,
        'Tỉ lệ chuyển đổi (%)': item.potentialStudentsCount > 0
          ? ((item.newStudentsCount / item.potentialStudentsCount) * 100).toFixed(2)
          : 0,
        'ROI (%)': item.roi ? Number(item.roi).toFixed(2) : 0,
        'Số kênh': item.channels?.length || 0,
        'Ngày tạo': item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''
      }));

      // Format data for Channels detail sheet
      const channelsData = [];
      response.items.forEach(campaign => {
        if (campaign.channels && campaign.channels.length > 0) {
          campaign.channels.forEach(channel => {
            channelsData.push({
              'Tên chiến dịch': campaign.name,
              'Tên kênh': channel.channelName || '',
              'Chi phí kênh': channel.cost || 0,
              'HVTN từ kênh': channel.potentialStudentsCount || 0,
              'HV mới từ kênh': channel.newStudentsCount || 0,
              'Doanh thu từ kênh': channel.revenue || 0,
              'Tỉ lệ chuyển đổi kênh (%)': channel.potentialStudentsCount > 0
                ? ((channel.newStudentsCount / channel.potentialStudentsCount) * 100).toFixed(2)
                : 0
            });
          });
        }
      });

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Campaign summary
      const campaignSheet = XLSX.utils.json_to_sheet(campaignData);
      XLSX.utils.book_append_sheet(workbook, campaignSheet, "Tổng quan chiến dịch");

      // Sheet 2: Channels detail (only if there are channels)
      if (channelsData.length > 0) {
        const channelsSheet = XLSX.utils.json_to_sheet(channelsData);
        XLSX.utils.book_append_sheet(workbook, channelsSheet, "Chi tiết kênh truyền thông");
      }

      // Generate file name with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Bao_cao_chien_dich_${dateStr}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, fileName);

      toast.success("Xuất báo cáo thành công!", { id: "export-excel" });
    } catch (err) {
      console.error("Error exporting excel:", err);
      toast.error("Có lỗi khi xuất báo cáo", { id: "export-excel" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className={Style.loading}>Loading...</div>;

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Format number
  const formatNumber = (value) => {
    if (!value) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Calculate conversion rate
  const calculateConversionRate = (potential, newStudents) => {
    if (!potential || potential === 0) return '0%';
    return `${((newStudents / potential) * 100).toFixed(2)}%`;
  };

  return (
    <div className={Style.container}>
      {/* Summary Cards */}
      {summary && (
        <div className={Style.summaryCards}>
          <div className={Style.summaryCard}>
            <div className={Style.summaryCardLabel}>Tổng số CD</div>
            <div className={Style.summaryCardValue}>{formatNumber(summary.total || 0)}</div>
          </div>
          <div className={Style.summaryCard}>
            <div className={Style.summaryCardLabel}>SL Chiến dịch đang chạy</div>
            <div className={Style.summaryCardValue}>{formatNumber(summary.running || 0)}</div>
          </div>
          <div className={Style.summaryCard}>
            <div className={Style.summaryCardLabel}>Chiến dịch đã hoàn thành</div>
            <div className={Style.summaryCardValue}>{formatNumber(summary.completed || 0)}</div>
          </div>
          <div className={Style.summaryCard}>
            <div className={Style.summaryCardLabel}>Tổng chi</div>
            <div className={Style.summaryCardValue}>{formatCurrency(summary.totalSpent || 0)}</div>
          </div>
          <div className={Style.summaryCard}>
            <div className={Style.summaryCardLabel}>Doanh thu</div>
            <div className={Style.summaryCardValue}>{formatCurrency(summary.totalRevenue || 0)}</div>
          </div>
        </div>
      )}

      <div className={Style.top}>
        <Suspense fallback={<div>Loading...</div>}>
          <FilterableSearch
            placeholder="Tìm kiếm theo tên chiến dịch..."
            onChange={handleSearch}
            onSearch={handleSearch}
            value={searchTerm}
            statusFilter={selectedStatus}
            onStatusChange={handleStatusChange}
            statusOptions={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'running', label: 'Đang chạy' },
              { value: 'paused', label: 'Tạm dừng' },
              { value: 'completed', label: 'Hoàn thành' }
            ]}
          />
        </Suspense>
        <div className={Style.buttons}>
          <button
            className={Style.exportButton}
            onClick={handleExportExcel}
            disabled={exporting}
          >
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </button>
          <Link href="/chiendich/add">
            <button className={Style.addButton}>Thêm chiến dịch</button>
          </Link>
        </div>
      </div>

      {/* Time Filter */}
      <div className={Style.timeFilter}>
        <div className={Style.dateGroup}>
          <label>Từ ngày:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={Style.dateInput}
          />
        </div>
        <div className={Style.dateGroup}>
          <label>Đến ngày:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={Style.dateInput}
          />
        </div>
        <button
          className={Style.filterButton}
          onClick={handleDateFilterChange}
        >
          Áp dụng
        </button>
        {(startDate || endDate) && (
          <button
            className={Style.clearFilterButton}
            onClick={() => {
              setStartDate("");
              setEndDate("");
              updateFilters({ startDate: undefined, endDate: undefined });
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Hiển thị kết quả tìm kiếm */}
      {searchFilter && (
        <div className={Style.searchInfo}>
          Kết quả tìm kiếm cho: <strong>{searchFilter}</strong> |
          Tìm thấy: <strong>{campaigns.length}</strong> chiến dịch
          {statusFilter && (
            <span> | Trạng thái: <strong>{getStatusText(statusFilter)}</strong></span>
          )}
        </div>
      )}

      <table className={Style.table}>
        <thead>
          <tr>
            <td>Tên chiến dịch</td>
            <td>Người phụ trách</td>
            <td>
              <div className={Style.sortableHeader}>
                Tổng chi
                <button
                  className={`${Style.sortButton} ${sortBy === 'cost' ? Style.active : ''}`}
                  onClick={() => handleSort('cost')}
                  title="Sắp xếp theo chi phí"
                >
                  {getSortIcon('cost')}
                </button>
              </div>
            </td>
            <td>
              <div className={Style.sortableHeader}>
                Doanh thu
                <button
                  className={`${Style.sortButton} ${sortBy === 'revenue' ? Style.active : ''}`}
                  onClick={() => handleSort('revenue')}
                  title="Sắp xếp theo doanh thu"
                >
                  {getSortIcon('revenue')}
                </button>
              </div>
            </td>
            <td>
              <div className={Style.sortableHeader}>
                HV mới
                <button
                  className={`${Style.sortButton} ${sortBy === 'newStudentsCount' ? Style.active : ''}`}
                  onClick={() => handleSort('newStudentsCount')}
                  title="Sắp xếp theo số học viên mới"
                >
                  {getSortIcon('newStudentsCount')}
                </button>
              </div>
            </td>
            <td>
              <div className={Style.sortableHeader}>
                HV tiềm năng
                <button
                  className={`${Style.sortButton} ${sortBy === 'potentialStudentsCount' ? Style.active : ''}`}
                  onClick={() => handleSort('potentialStudentsCount')}
                  title="Sắp xếp theo số học viên tiềm năng"
                >
                  {getSortIcon('potentialStudentsCount')}
                </button>
              </div>
            </td>
            <td>
              <div className={Style.sortableHeader}>
                Tỉ lệ chuyển đổi (HVTN/HVM)
                <button
                  className={`${Style.sortButton} ${sortBy === 'conversionRate' ? Style.active : ''}`}
                  onClick={() => handleSort('conversionRate')}
                  title="Sắp xếp theo tỉ lệ chuyển đổi"
                >
                  {getSortIcon('conversionRate')}
                </button>
              </div>
            </td>
            <td>ROI</td>
            <td>% Hoàn thành mục tiêu</td>
            <td>Trạng thái</td>
            <td>Hành động</td>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td>
                <div className={Style.name}>
                  {campaign.name}
                </div>
              </td>
              <td>{campaign.ownerStaffName || 'N/A'}</td>
              <td>
                {campaign.cost ? formatCurrency(campaign.cost) : '0 ₫'}
              </td>
              <td>
                {campaign.revenue ? formatCurrency(campaign.revenue) : '0 ₫'}
              </td>
              <td>{formatNumber(campaign.newStudentsCount || 0)}</td>
              <td>{formatNumber(campaign.potentialStudentsCount || 0)}</td>
              <td>
                {calculateConversionRate(
                  campaign.potentialStudentsCount || 0,
                  campaign.newStudentsCount || 0
                )}
              </td>
              <td>{campaign.roi != null ? `${Number(campaign.roi).toFixed(2)}%` : 'N/A'}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                  {campaign.targetLeads > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ minWidth: '50px', color: '#8391a2' }}>Lead:</span>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: '#2d3748',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        minWidth: '60px'
                      }}>
                        <div style={{
                          width: `${Math.min(100, campaign.leadsProgress || 0)}%`,
                          height: '100%',
                          background: campaign.leadsProgress >= 100 ? '#10b981' : '#3b82f6',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{
                        minWidth: '45px',
                        textAlign: 'right',
                        color: campaign.leadsProgress >= 100 ? '#10b981' : '#fff',
                        fontWeight: campaign.leadsProgress >= 100 ? 600 : 400
                      }}>
                        {campaign.leadsProgress || 0}%
                      </span>
                    </div>
                  )}
                  {campaign.targetNewStudents > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ minWidth: '50px', color: '#8391a2' }}>HV mới:</span>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: '#2d3748',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        minWidth: '60px'
                      }}>
                        <div style={{
                          width: `${Math.min(100, campaign.newStudentsProgress || 0)}%`,
                          height: '100%',
                          background: campaign.newStudentsProgress >= 100 ? '#10b981' : '#8b5cf6',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{
                        minWidth: '45px',
                        textAlign: 'right',
                        color: campaign.newStudentsProgress >= 100 ? '#10b981' : '#fff',
                        fontWeight: campaign.newStudentsProgress >= 100 ? 600 : 400
                      }}>
                        {campaign.newStudentsProgress || 0}%
                      </span>
                    </div>
                  )}
                  {campaign.targetRevenue > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ minWidth: '50px', color: '#8391a2' }}>DT:</span>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: '#2d3748',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        minWidth: '60px'
                      }}>
                        <div style={{
                          width: `${Math.min(100, campaign.revenueProgress || 0)}%`,
                          height: '100%',
                          background: campaign.revenueProgress >= 100 ? '#10b981' : '#f59e0b',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{
                        minWidth: '45px',
                        textAlign: 'right',
                        color: campaign.revenueProgress >= 100 ? '#10b981' : '#fff',
                        fontWeight: campaign.revenueProgress >= 100 ? 600 : 400
                      }}>
                        {campaign.revenueProgress || 0}%
                      </span>
                    </div>
                  )}
                  {!campaign.targetLeads && !campaign.targetNewStudents && !campaign.targetRevenue && (
                    <span style={{ color: '#8391a2', fontStyle: 'italic' }}>Chưa đặt mục tiêu</span>
                  )}
                </div>
              </td>
              <td>
                <span className={`${Style.status} ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
              </td>
              <td>
                <div className={Style.buttons}>
                  <button
                    className={`${Style.button} ${Style.view}`}
                    onClick={() => handleView(campaign)}
                  >
                    Xem
                  </button>
                  <button
                    className={`${Style.button} ${Style.edit}`}
                    onClick={() => handleEdit(campaign)}
                  >
                    Sửa
                  </button>
                  <button
                    className={`${Style.button} ${Style.delete}`}
                    onClick={() => handleDelete(campaign)}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={Style.darkBg}>
        <Suspense fallback={<div>Loading...</div>}>
          <Pagination metadata={metadata || { page: 0, totalPages: 1, count: campaigns.length, totalElements: campaigns.length }} />
        </Suspense>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Sửa chiến dịch</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={Style.formGroup}>
                <label>Tên chiến dịch:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className={Style.formGroup}>
                <label>Trạng thái:</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  required
                >
                  <option value="running">Đang chạy</option>
                  <option value="paused">Tạm dừng</option>
                  <option value="completed">Hoàn thành</option>
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Người phụ trách:</label>
                <select
                  value={editForm.ownerStaffId || ''}
                  onChange={(e) => setEditForm({ ...editForm, ownerStaffId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Chọn nhân viên</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.fullName}</option>
                  ))}
                </select>
              </div>
              <div className={Style.formGroup}>
                <label>Ngân sách (VNĐ):</label>
                <input
                  type="number"
                  value={editForm.budget}
                  onChange={(e) => setEditForm({ ...editForm, budget: e.target.value })}
                  min="0"
                />
              </div>
              <div className={Style.formGroup}>
                <label>Tổng chi (VNĐ):</label>
                <input
                  type="number"
                  value={editForm.spend}
                  onChange={(e) => setEditForm({ ...editForm, spend: e.target.value })}
                  min="0"
                />
              </div>
              <div className={Style.formGroup}>
                <label>ROI:</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.roi}
                  onChange={(e) => setEditForm({ ...editForm, roi: e.target.value })}
                  min="0"
                />
              </div>

              {/* Thời gian chiến dịch */}
              <div style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border)',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
                  📅 Thời gian chiến dịch
                </h3>

                <div className={Style.formGroup}>
                  <label>Ngày bắt đầu:</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    max={editForm.endDate || undefined}
                  />
                </div>

                <div className={Style.formGroup}>
                  <label>Ngày kết thúc:</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    min={editForm.startDate || undefined}
                  />
                </div>
              </div>

              {/* Mục tiêu chiến dịch */}
              <div style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border)',
                marginBottom: '20px'
              }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
                  🎯 Mục tiêu chiến dịch
                </h3>

                <div className={Style.formGroup}>
                  <label>Mục tiêu số Lead (HVTN):</label>
                  <input
                    type="number"
                    value={editForm.targetLeads}
                    onChange={(e) => setEditForm({ ...editForm, targetLeads: e.target.value })}
                    min="0"
                  />
                </div>

                <div className={Style.formGroup}>
                  <label>Mục tiêu số HV mới:</label>
                  <input
                    type="number"
                    value={editForm.targetNewStudents}
                    onChange={(e) => setEditForm({ ...editForm, targetNewStudents: e.target.value })}
                    min="0"
                  />
                </div>

                <div className={Style.formGroup}>
                  <label>Mục tiêu doanh thu (VNĐ):</label>
                  <input
                    type="number"
                    value={editForm.targetRevenue}
                    onChange={(e) => setEditForm({ ...editForm, targetRevenue: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              {/* Kênh truyền thông */}
              <div className={Style.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label>Kênh truyền thông:</label>
                  <button
                    type="button"
                    onClick={handleEditAddChannel}
                    style={{
                      padding: '6px 12px',
                      background: '#5d57c9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    + Thêm kênh
                  </button>
                </div>

                {editCampaignChannels.map((channel, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                    <select
                      value={channel.channelId}
                      onChange={(e) => handleEditChannelChange(index, 'channelId', e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                    >
                      <option value="">Chọn kênh</option>
                      {channels.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Chi phí (VNĐ)"
                      value={channel.cost}
                      onChange={(e) => handleEditChannelChange(index, 'cost', e.target.value)}
                      min="0"
                      style={{ width: '150px', padding: '10px', borderRadius: '5px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleEditRemoveChannel(index)}
                      style={{
                        padding: '10px 15px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}

                {editCampaignChannels.length === 0 && (
                  <small style={{ color: 'var(--textSoft)', fontSize: '12px' }}>
                    Chưa có kênh nào. Nhấn "Thêm kênh" để thêm kênh truyền thông.
                  </small>
                )}
              </div>

              <div className={Style.modalButtons}>
                <button type="submit" className={Style.saveButton}>Lưu thay đổi</button>
                <button
                  type="button"
                  className={Style.cancelButton}
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal}>
            <h2>Xóa chiến dịch</h2>
            <p>Bạn có chắc chắn muốn xóa chiến dịch "{selectedCampaign?.name}"?</p>
            <div className={Style.modalButtons}>
              <button
                className={Style.deleteButton}
                onClick={handleDeleteConfirm}
              >
                Xóa
              </button>
              <button
                className={Style.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className={Style.modalOverlay}>
          <div className={Style.modal} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Chi tiết chiến dịch</h2>
            <div className={Style.detailContent}>
              <div className={Style.detailItem}>
                <label>Tên chiến dịch:</label>
                <span>{selectedCampaign?.name}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Trạng thái:</label>
                <span className={`${Style.status} ${getStatusColor(selectedCampaign?.status)}`}>
                  {getStatusText(selectedCampaign?.status)}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Kênh:</label>
                <span>{selectedCampaign?.channelName || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Người phụ trách:</label>
                <span>{selectedCampaign?.ownerStaffName || 'N/A'}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Ngân sách:</label>
                <span>
                  {selectedCampaign?.budget ? formatCurrency(selectedCampaign.budget) : '0 ₫'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Số HVTN:</label>
                <span>{selectedCampaign?.potentialStudentsCount || 0}</span>
              </div>
              <div className={Style.detailItem}>
                <label>Số HV mới:</label>
                <span>{selectedCampaign?.newStudentsCount || 0}</span>
              </div>
              {selectedCampaign?.potentialStudentsCount > 0 && (
                <div className={Style.detailItem}>
                  <label>Tỉ lệ HV mới:</label>
                  <span>
                    {((selectedCampaign?.newStudentsCount || 0) / selectedCampaign.potentialStudentsCount * 100).toFixed(2)}%
                  </span>
                </div>
              )}
              <div className={Style.detailItem}>
                <label>Doanh thu:</label>
                <span>
                  {selectedCampaign?.revenue ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(selectedCampaign.revenue) : '0 VNĐ'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Chi phí:</label>
                <span>
                  {selectedCampaign?.cost ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(selectedCampaign.cost) : '0 VNĐ'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>ROI:</label>
                <span>
                  {selectedCampaign?.roi != null
                    ? `${Number(selectedCampaign.roi).toFixed(2)}%`
                    : 'N/A'}
                </span>
              </div>
              <div className={Style.detailItem}>
                <label>Ngân sách:</label>
                <span>
                  {selectedCampaign?.budget ? new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(selectedCampaign.budget) : '0 VNĐ'}
                </span>
              </div>
              {selectedCampaign?.createdAt && (
                <div className={Style.detailItem}>
                  <label>Ngày tạo:</label>
                  <span>{new Date(selectedCampaign.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              )}

              {/* Mục tiêu chiến dịch */}
              {(selectedCampaign?.targetLeads > 0 || selectedCampaign?.targetNewStudents > 0 || selectedCampaign?.targetRevenue > 0) && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 600 }}>🎯 Mục tiêu chiến dịch:</h3>

                  {selectedCampaign?.targetLeads > 0 && (
                    <div className={Style.detailItem} style={{ marginBottom: '15px' }}>
                      <label>Mục tiêu Lead (HVTN):</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span>{formatNumber(selectedCampaign.potentialStudentsCount || 0)} / {formatNumber(selectedCampaign.targetLeads)}</span>
                        <div style={{
                          flex: 1,
                          height: '10px',
                          background: '#2d3748',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          maxWidth: '200px'
                        }}>
                          <div style={{
                            width: `${Math.min(100, selectedCampaign.leadsProgress || 0)}%`,
                            height: '100%',
                            background: selectedCampaign.leadsProgress >= 100 ? '#10b981' : '#3b82f6',
                            borderRadius: '5px'
                          }}></div>
                        </div>
                        <span style={{
                          fontWeight: 600,
                          color: selectedCampaign.leadsProgress >= 100 ? '#10b981' : '#fff'
                        }}>
                          {selectedCampaign.leadsProgress || 0}%
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedCampaign?.targetNewStudents > 0 && (
                    <div className={Style.detailItem} style={{ marginBottom: '15px' }}>
                      <label>Mục tiêu HV mới:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span>{formatNumber(selectedCampaign.newStudentsCount || 0)} / {formatNumber(selectedCampaign.targetNewStudents)}</span>
                        <div style={{
                          flex: 1,
                          height: '10px',
                          background: '#2d3748',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          maxWidth: '200px'
                        }}>
                          <div style={{
                            width: `${Math.min(100, selectedCampaign.newStudentsProgress || 0)}%`,
                            height: '100%',
                            background: selectedCampaign.newStudentsProgress >= 100 ? '#10b981' : '#8b5cf6',
                            borderRadius: '5px'
                          }}></div>
                        </div>
                        <span style={{
                          fontWeight: 600,
                          color: selectedCampaign.newStudentsProgress >= 100 ? '#10b981' : '#fff'
                        }}>
                          {selectedCampaign.newStudentsProgress || 0}%
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedCampaign?.targetRevenue > 0 && (
                    <div className={Style.detailItem} style={{ marginBottom: '15px' }}>
                      <label>Mục tiêu doanh thu:</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                        <span>{formatCurrency(selectedCampaign.revenue || 0)} / {formatCurrency(selectedCampaign.targetRevenue)}</span>
                        <div style={{
                          flex: 1,
                          height: '10px',
                          background: '#2d3748',
                          borderRadius: '5px',
                          overflow: 'hidden',
                          maxWidth: '200px'
                        }}>
                          <div style={{
                            width: `${Math.min(100, selectedCampaign.revenueProgress || 0)}%`,
                            height: '100%',
                            background: selectedCampaign.revenueProgress >= 100 ? '#10b981' : '#f59e0b',
                            borderRadius: '5px'
                          }}></div>
                        </div>
                        <span style={{
                          fontWeight: 600,
                          color: selectedCampaign.revenueProgress >= 100 ? '#10b981' : '#fff'
                        }}>
                          {selectedCampaign.revenueProgress || 0}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hiển thị thông tin kênh truyền thông */}
              {selectedCampaign?.channels && selectedCampaign.channels.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 600 }}>Kênh truyền thông:</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600 }}>Tên kênh</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>Chi phí</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>Số HVTN</th>
                        <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600 }}>Số HV mới</th>
                        <th style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCampaign.channels.map((channel, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px' }}>{channel.channelName || 'N/A'}</td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(channel.cost || 0)}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {channel.potentialStudentsCount || 0}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            {channel.newStudentsCount || 0}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(channel.revenue || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className={Style.modalButtons}>
              <button
                className={Style.cancelButton}
                onClick={() => setShowViewModal(false)}
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

export default Page;


