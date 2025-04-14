import api from './api';

export const uploadImage = async (file: File) => {
  try {
    console.log('Bắt đầu upload ảnh:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const formData = new FormData();
    formData.append('image', file);

    // Log FormData để kiểm tra
    console.log('FormData image:', formData.get('image'));

    // Sử dụng cấu hình đặc biệt cho upload
    // Lưu ý: giờ chúng ta đang sử dụng API GridFS mới để lưu vào MongoDB
    const response = await api.post('/upload', formData, {
      headers: {
        // Không đặt Content-Type, để axios tự xác định với boundary cho FormData
        'Accept': 'application/json',
      },
      // Thêm timeout dài hơn cho upload file
      timeout: 120000
    });

    console.log('Upload thành công:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Lỗi upload ảnh:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      requestHeaders: error.config?.headers,
      requestData: error.config?.data instanceof FormData ? 'FormData' : error.config?.data
    });
    
    // Xử lý thông báo lỗi chi tiết
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Lỗi không xác định khi tải ảnh lên';
    
    throw new Error(errorMessage);
  }
}; 