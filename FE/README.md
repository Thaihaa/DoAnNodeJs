# Frontend - Hệ Thống Quản Lý Nhà Hàng

Phần giao diện người dùng của ứng dụng quản lý nhà hàng, được xây dựng bằng React.js và Material-UI.

## Đăng nhập hệ thống

### Tài khoản Admin
- **Username**: admin
- **Password**: Admin@123
- **URL**: http://localhost:3000/admin

### Tài khoản Nhân viên
- **Username**: nhanvien1
- **Password**: Staff@123

- **Username**: nhanvien2
- **Password**: Staff@123

### Tài khoản Khách hàng
- **Username**: nguoidung1
- **Password**: User@123

- **Username**: nguoidung2
- **Password**: User@123

## Cài đặt và chạy ứng dụng

### Yêu cầu

- Node.js (v14.x hoặc cao hơn)
- npm hoặc yarn

### Cài đặt

1. **Cài đặt các gói phụ thuộc cho Frontend**
   ```bash
   npm install
   ```

2. **Cài đặt các gói phụ thuộc cho cả Frontend và Backend**
   ```bash
   npm run install:all
   ```

### Chạy ứng dụng

1. **Chạy Frontend**
   ```bash
   npm start
   ```

2. **Chạy cả Frontend và Backend**
   ```bash
   npm run start:all
   ```

3. **Chỉ chạy Backend từ thư mục Frontend**
   ```bash
   npm run start:be
   ```

4. **Build ứng dụng cho môi trường production**
   ```bash
   npm run build
   ```

## Chức năng chính

1. **Xem thông tin nhà hàng**: Thông tin chi tiết về nhà hàng
2. **Đặt bàn**: Đặt bàn trực tuyến
3. **Xem thực đơn**: Xem danh sách món ăn và đồ uống
4. **Đánh giá**: Đánh giá và bình luận về nhà hàng và món ăn
5. **Xem ưu đãi**: Các ưu đãi và khuyến mãi hiện có

### Trang Admin

1. **Tổng quan hệ thống**: Dashboard với thống kê và biểu đồ
2. **Quản lý người dùng**: Xem và quản lý thông tin người dùng
3. **Quản lý nhà hàng**: Xem và quản lý thông tin nhà hàng
4. **Quản lý thực đơn**: Xem và quản lý các món ăn
5. **Quản lý đơn hàng**: Xem và quản lý đơn đặt hàng
6. **Quản lý đặt bàn**: Xem và quản lý đơn đặt bàn
7. **Cài đặt hệ thống**: Thiết lập cấu hình hệ thống

## Công nghệ sử dụng

- **React.js**: Thư viện UI
- **TypeScript**: Ngôn ngữ lập trình
- **Material-UI**: Framework UI component
- **React Router**: Quản lý định tuyến
- **Context API**: Quản lý trạng thái
- **Axios**: Gọi API

## Cấu trúc dự án

```
/FE/src
├── assets/           # Tài nguyên tĩnh (hình ảnh, biểu tượng...)
├── components/       # Các thành phần UI tái sử dụng
├── contexts/         # Context API để quản lý trạng thái
├── hooks/            # React hooks tùy chỉnh
├── layouts/          # Bố cục giao diện
├── pages/            # Các trang chính của ứng dụng
│   ├── admin/        # Các trang dành cho Admin
│   └── ...           # Các trang khác
├── services/         # Dịch vụ gọi API
├── types/            # Định nghĩa kiểu dữ liệu TypeScript
└── utils/            # Tiện ích chung
```

## Liên kết hữu ích

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Backend API**: http://localhost:5000/api

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
