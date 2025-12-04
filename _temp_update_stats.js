// Nếu có filter thời gian, dùng total và newStudentsCount (đã lọc theo filter + thời gian)
// Nếu không có filter thời gian, dùng totalAll và newStudentsCountAll (đó lọc theo filter, không giới hạn thời gian)
// Cả hai đều đã được lọc theo search/status/campaignName
const hasDateFilter = dateRange.startDate || dateRange.endDate;
setStatistics({
    total: hasDateFilter
        ? (response?.total || 0)  // Có filter thời gian: dùng total (đã lọc theo filter + thời gian)
        : (response?.totalAll || response?.total || 0), // Không có filter thời gian: dùng totalAll (đã lọc theo filter)
    newStudentsCount: response?.newStatusCount || 0  // Hiển thị số HV có status='new'
});
