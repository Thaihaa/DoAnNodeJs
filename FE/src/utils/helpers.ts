/**
 * Format số thành chuỗi tiền tệ VNĐ
 * @param amount Số tiền cần định dạng
 * @returns Chuỗi tiền tệ đã định dạng (VNĐ)
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  })
  .format(amount)
  .replace('₫', 'VNĐ');
};

/**
 * Format ngày tháng thành chuỗi ngày/tháng/năm
 * @param date Ngày cần định dạng
 * @returns Chuỗi ngày tháng đã định dạng (DD/MM/YYYY)
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format thời gian thành chuỗi giờ:phút
 * @param time Thời gian cần định dạng
 * @returns Chuỗi thời gian đã định dạng (HH:MM)
 */
export const formatTime = (time: Date | string): string => {
  const d = new Date(time);
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
}; 