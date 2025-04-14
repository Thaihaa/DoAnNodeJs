import api from './api';
import { ApiResponse, Restaurant, Location, Promotion, BuffetInfo } from '../types';

const RESTAURANT_URL = '/nha-hang';

// Lấy danh sách nhà hàng
export const getAllRestaurants = async () => {
  const response = await api.get<ApiResponse<Restaurant[]>>(RESTAURANT_URL);
  return response.data;
};

// Lấy thông tin nhà hàng theo ID
export const getRestaurantById = async (id: string) => {
  const response = await api.get<ApiResponse<Restaurant>>(`${RESTAURANT_URL}/${id}`);
  return response.data;
};

// Lấy danh sách nhà hàng gần đây
export const getNearbyRestaurants = async (lat: number, lng: number, radius: number = 10) => {
  const response = await api.get<ApiResponse<Restaurant[]>>(`${RESTAURANT_URL}/gan-day`, {
    params: { lat, lng, radius }
  });
  return response.data;
};

// Mock data cho các địa điểm Manwah
export const getManwahLocations = (): Location[] => {
  return [
    {
      id: '1',
      name: 'Manwah Lê Thái Tổ',
      address: '27-29 Lê Thái Tổ, Hàng Trống, Hoàn Kiếm, Hà Nội',
      phone: '024 3935 3536',
      openingHours: '11:00 - 22:00',
      description: 'Đặt phép bình phân trong môi yếu tố thiết kế - từ màu sắc tới hoa tiết hay ánh sáng... Manwah Lê Thái Tổ mang đến ấn tượng truyền thống nhưng cũng thật phóng khoáng, với trang trí lại không kém phần mỹ lệ, thanh thuộc và cũng đầy độc đáo.',
      imageUrl: 'https://www.manwah.com.vn/images/LE-THAI-TO-COVER.jpg'
    },
    {
      id: '2',
      name: 'Manwah Láng Hạ',
      address: '98B Láng Hạ, Đống Đa, Hà Nội',
      phone: '024 3514 9345',
      openingHours: '11:00 - 22:00',
      description: 'Manwah Láng Hạ mang đến không gian ẩm thực đầy sang trọng và hiện đại, phù hợp cho các cuộc gặp gỡ với bạn bè, gia đình hoặc đồng nghiệp.',
      imageUrl: 'https://www.manwah.com.vn/images/manwah-lang-ha.jpg'
    }
  ];
};

// Mock data cho thông tin Buffet
export const getBuffetInfo = (): BuffetInfo => {
  return {
    adult: {
      prices: [269000, 329000, 419000, 499000]
    },
    children: {
      freeUnder: 1,
      discountAge: {
        min: 1,
        max: 1.3,
        percentage: 40
      }
    }
  };
};

// Mock data cho promotions
export const getPromotions = (): Promotion[] => {
  return [
    {
      id: '1',
      title: 'Hành trình vạn đẹm - Manwah đến Lê Thái Tổ',
      description: 'Đặt phép bình phân trong môi yếu tố thiết kế - từ màu sắc tới hoa tiết hay ánh sáng... Manwah Lê Thái Tổ mang đến ấn tượng truyền thống nhưng cũng thật phóng khoáng, với trang trí lại không kém phần mỹ lệ, thanh thuộc và cũng đầy độc đáo.',
      imageUrl: 'https://www.manwah.com.vn/images/hanh-trinh-van-dam.jpg',
      url: '/promotion/1'
    },
    {
      id: '2',
      title: 'The New Manwah - New Identity',
      description: 'Là Đài Đài nguyên bản, nhưng không kém phần trẻ trung và phá cách. Khôn từ bỏ bản sắc mình trong phẩm vị thực, Manwah luôn muốn đến cải các yếu tố văn hóa vào thương hiệu. Lần "đổi áo" này, Manwah muốn lại gần đối tượng khách hàng trẻ! Bạn có thể thấy những màu sắc, họa tiết, nguồn cảm hứng từng có mặt trong các bộ phim Đài Loan tuổi thơ hay những linh vật đặc trưng cuộc đất nước ngày. Một hành trình mới nhưng lại vô cùng thân thuộc mà bạn sẽ luôn cảm thấy mình trong Manwah nhé!',
      imageUrl: 'https://www.manwah.com.vn/images/the-new-manwah.jpg',
      url: '/promotion/2'
    }
  ];
}; 