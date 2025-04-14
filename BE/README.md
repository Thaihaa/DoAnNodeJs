# Backend - Hệ Thống Quản Lý Nhà Hàng

Phần backend của ứng dụng quản lý nhà hàng với kiến trúc microservice, được xây dựng bằng Node.js/Express và MongoDB.

## Cấu trúc dự án

```
/BE
├── services/        # Các microservices
│   ├── auth/        # Dịch vụ xác thực
│   ├── restaurant/  # Dịch vụ quản lý nhà hàng
│   ├── menu/        # Dịch vụ quản lý thực đơn
│   ├── order/       # Dịch vụ đặt bàn/đặt món
│   └── review/      # Dịch vụ đánh giá
├── middlewares/     # Middleware chung
├── utils/           # Tiện ích chung
├── uploads/         # Thư mục lưu trữ tệp tải lên
└── logs/            # Thư mục nhật ký
```

## Các dịch vụ

1. **Auth Service**: Quản lý người dùng và xác thực
2. **Restaurant Service**: Quản lý thông tin nhà hàng
3. **Menu Service**: Quản lý danh mục món ăn và món ăn
4. **Order Service**: Quản lý đặt bàn và đặt món
5. **Review Service**: Quản lý đánh giá và bình luận

## Tài khoản đăng nhập

### Tài khoản Admin
- **Username**: admin
- **Password**: Admin@123
- **Email**: admin@nhahang.com
- **Vai trò**: Quản trị viên hệ thống
- **Quyền**: Toàn quyền quản lý hệ thống

### Tài khoản Nhân viên
- **Username**: nhanvien1
- **Password**: Staff@123
- **Email**: nhanvien1@nhahang.com
- **Vai trò**: Nhân viên nhà hàng
- **Quyền**: Quản lý đơn hàng, thực đơn và xem báo cáo

- **Username**: nhanvien2
- **Password**: Staff@123
- **Email**: nhanvien2@nhahang.com
- **Vai trò**: Nhân viên nhà hàng
- **Quyền**: Quản lý đơn hàng, thực đơn và xem báo cáo

### Tài khoản Khách hàng
- **Username**: user1
- **Password**: User@123
- **Email**: user1@gmail.com
- **Họ tên**: Nguyễn Thái Hà
- **Vai trò**: Người dùng thông thường

- **Username**: nguoidung1
- **Password**: User@123
- **Email**: nguoidung1@gmail.com
- **Họ tên**: Nguyễn Văn A
- **Vai trò**: Người dùng thông thường

- **Username**: nguoidung2
- **Password**: User@123
- **Email**: nguoidung2@gmail.com
- **Họ tên**: Trần Thị B
- **Vai trò**: Người dùng thông thường

- **Username**: nguoidung3
- **Password**: User@123
- **Email**: nguoidung3@gmail.com
- **Họ tên**: Lê Văn C
- **Vai trò**: Người dùng thông thường

- **Username**: nguoidung4
- **Password**: User@123
- **Email**: nguoidung4@gmail.com
- **Họ tên**: Phạm Thị D
- **Vai trò**: Người dùng thông thường

- **Username**: nguoidung5
- **Password**: User@123
- **Email**: nguoidung5@gmail.com
- **Họ tên**: Nguyễn Văn E
- **Vai trò**: Người dùng thông thường

## Cài đặt và chạy ứng dụng

### Yêu cầu

- Node.js (v14.x hoặc cao hơn)
- MongoDB (v4.x hoặc cao hơn)
- npm hoặc yarn

### Cài đặt

1. **Cài đặt các gói phụ thuộc cho Backend**
   ```bash
   npm install
   ```

2. **Cài đặt các gói phụ thuộc cho cả Backend và Frontend**
   ```bash
   npm run install:all
   ```

3. **Cấu hình môi trường**
   - Tạo file `.env` dựa trên file `.env.example`

### Chạy ứng dụng

1. **Chạy tất cả các dịch vụ backend cùng lúc**
   ```bash
   npm run dev:all
   ```

2. **Chạy cả Backend và Frontend**
   ```bash
   npm run start:all
   ```

3. **Chỉ chạy Frontend từ thư mục Backend**
   ```bash
   npm run start:fe
   ```

4. **Chạy riêng từng dịch vụ**
   ```bash
   # API Gateway chính
   npm run dev
   
   # Auth Service
   npm run auth
   
   # Restaurant Service
   npm run restaurant
   
   # Menu Service
   npm run menu
   
   # Order Service
   npm run order
   
   # Review Service
   npm run review
   ```

## API Endpoints

### Auth Service
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh-token` - Làm mới token
- `GET /api/users/profile` - Lấy thông tin người dùng
- `PUT /api/users/profile` - Cập nhật thông tin người dùng

### Restaurant Service
- `GET /api/nha-hang` - Lấy danh sách nhà hàng
- `GET /api/nha-hang/:id` - Lấy thông tin một nhà hàng
- `POST /api/nha-hang` - Tạo nhà hàng mới
- `PUT /api/nha-hang/:id` - Cập nhật nhà hàng
- `DELETE /api/nha-hang/:id` - Xóa nhà hàng

### Menu Service
- `GET /api/loai-mon-an` - Lấy danh sách danh mục món ăn
- `POST /api/loai-mon-an` - Tạo danh mục món ăn mới
- `GET /api/mon-an` - Lấy danh sách món ăn
- `GET /api/mon-an/:id` - Lấy thông tin một món ăn
- `POST /api/mon-an` - Tạo món ăn mới
- `PUT /api/mon-an/:id` - Cập nhật món ăn
- `DELETE /api/mon-an/:id` - Xóa món ăn

### Order Service
- `GET /api/dat-ban` - Lấy danh sách đặt bàn
- `POST /api/dat-ban` - Tạo đơn đặt bàn mới
- `GET /api/dat-ban/:id` - Lấy thông tin đặt bàn
- `PUT /api/dat-ban/:id` - Cập nhật đặt bàn
- `DELETE /api/dat-ban/:id` - Hủy đặt bàn

### Review Service
- `GET /api/danh-gia` - Lấy danh sách đánh giá
- `POST /api/danh-gia` - Tạo đánh giá mới
- `PUT /api/danh-gia/:id` - Cập nhật đánh giá
- `POST /api/danh-gia/:id/tra-loi` - Thêm phản hồi cho đánh giá
- `DELETE /api/danh-gia/:id` - Xóa đánh giá

## Công nghệ sử dụng

- **Node.js & Express**: Framework web
- **MongoDB & Mongoose**: Cơ sở dữ liệu và ODM
- **JWT**: Xác thực và ủy quyền
- **Express Validator**: Xác thực dữ liệu
- **Multer**: Xử lý tải lên tệp
- **Winston**: Ghi nhật ký
- **bcryptjs**: Mã hóa mật khẩu

## Quản lý dữ liệu

Dự án này bao gồm các script để quản lý dữ liệu:

- **cleanDatabase.js**: Xóa tất cả dữ liệu ảo và giữ lại cấu trúc database
- **seedDatabase.js**: Thêm dữ liệu thật vào database
- **resetDatabase.js**: Chạy cả hai script trên để reset hoàn toàn database
- **resetDatabase2.js**: Kiểm tra dữ liệu trong database

Để reset database và thêm dữ liệu thật, chạy lệnh:
```bash
node resetDatabase.js
```
