import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Stack,
  Alert,
  Snackbar,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import api from '../../services/api';

// Định nghĩa loại người dùng (khác với loại User được định nghĩa toàn cục)
interface UserDisplay {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

// Định nghĩa loại form người dùng
interface UserFormData {
  id?: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

const UsersPage = () => {
  // State cho dữ liệu và tìm kiếm
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State cho phân trang
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // State cho modal
  const [openModal, setOpenModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormData>({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State cho modal xóa
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserDisplay | null>(null);

  // State cho snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Fetch dữ liệu người dùng từ API
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Hàm lấy danh sách người dùng từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Thay đổi endpoint để phù hợp với cấu hình server thực tế
      const response = await api.get('/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Kiểm tra cấu trúc dữ liệu trả về
        console.log('API response:', response.data);
        
        // Kiểm tra nếu response.data.users tồn tại và là mảng
        const userData = Array.isArray(response.data.users) ? response.data.users : [];
        setUsers(userData);
        setFilteredUsers(userData);
        setLoading(false);
      } else {
        setError(response.data?.message || 'Không thể tải dữ liệu người dùng');
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải dữ liệu người dùng:', error);
      setError(error.response?.data?.message || 'Lỗi kết nối đến server.');
      setUsers([]);
      setFilteredUsers([]);
      setLoading(false);
    }
  };
  
  // Xử lý thay đổi trang
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Xử lý thay đổi số hàng trên mỗi trang
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Xử lý tìm kiếm
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterUsers(value, roleFilter, statusFilter);
  };

  // Xử lý lọc theo vai trò
  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setRoleFilter(value);
    filterUsers(searchTerm, value, statusFilter);
  };

  // Xử lý lọc theo trạng thái
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setStatusFilter(value);
    filterUsers(searchTerm, roleFilter, value);
  };

  // Hàm lọc người dùng
  const filterUsers = (search: string, role: string, status: string) => {
    // Đảm bảo users đã được khởi tạo
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
    let filtered = [...users];
    
    // Lọc theo từ khóa tìm kiếm
    if (search) {
      filtered = filtered.filter(user => 
        (user.username && user.username.toLowerCase().includes(search.toLowerCase())) ||
        (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Lọc theo vai trò
    if (role !== 'all') {
      filtered = filtered.filter(user => user.role === role);
    }
    
    // Lọc theo trạng thái
    if (status !== 'all') {
      filtered = filtered.filter(user => user.isActive === (status === 'active'));
    }
    
    setFilteredUsers(filtered);
  };

  // Xử lý mở modal thêm/sửa người dùng
  const handleOpenModal = (user?: UserDisplay) => {
    if (user) {
      setCurrentUser({
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
      setIsEditMode(true);
    } else {
      setCurrentUser({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'user',
        isActive: true
      });
      setIsEditMode(false);
    }
    setOpenModal(true);
  };

  // Xử lý đóng modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Xử lý thay đổi input trong form
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi select trong form
  const handleSelectChange = (event: SelectChangeEvent) => {
    const name = event.target.name as string;
    const value = event.target.value;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý lưu người dùng
  const handleSaveUser = async () => {
    try {
      // Thêm loading state
      setLoading(true);
      
      if (isEditMode) {
        // Tạo payload tối thiểu, chỉ gửi những trường cần cập nhật
        const updateData: any = {};
        
        // Chỉ thêm các trường có giá trị và đã thay đổi
        if (currentUser.fullName) updateData.fullName = currentUser.fullName;
        if (currentUser.email) updateData.email = currentUser.email;
        if (currentUser.role) updateData.role = currentUser.role;
        
        // Cập nhật người dùng qua API với timeout thấp hơn
        const response = await api.put(`/users/${currentUser.id}`, updateData, {
          timeout: 10000, // Timeout riêng cho request này
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data && response.data.success) {
          // Refresh dữ liệu sau khi cập nhật
          await fetchUsers();
          
          setSnackbar({
            open: true,
            message: 'Cập nhật người dùng thành công!',
            severity: 'success'
          });
          setOpenModal(false);
        } else {
          setSnackbar({
            open: true,
            message: response.data?.message || 'Lỗi cập nhật người dùng!',
            severity: 'error'
          });
        }
      } else {
        // Thêm người dùng mới qua API
        if (!currentUser.username || !currentUser.password || !currentUser.email) {
          setSnackbar({
            open: true,
            message: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
            severity: 'error'
          });
          setLoading(false);
          return;
        }
        
        // Chuẩn bị dữ liệu tài khoản
        const userData = {
          username: currentUser.username,
          fullName: currentUser.fullName || currentUser.username,
          email: currentUser.email,
          password: currentUser.password,
          role: currentUser.role || 'user'
        };
        
        // Chọn API endpoint dựa vào vai trò
        const endpoint = (currentUser.role === 'admin' || currentUser.role === 'staff') ? 
          '/auth/admin-register' : '/auth/register';
        
        const response = await api.post(endpoint, userData, {
          timeout: 10000 // Timeout riêng cho request này
        });
        
        if (response.data && response.data.success) {
          // Refresh dữ liệu sau khi thêm
          await fetchUsers();
          
          setSnackbar({
            open: true,
            message: `Thêm ${currentUser.role === 'admin' ? 'tài khoản Admin' : 'người dùng'} mới thành công!`,
            severity: 'success'
          });
          setOpenModal(false);
        } else {
          setSnackbar({
            open: true,
            message: response.data?.message || 'Lỗi thêm người dùng mới!',
            severity: 'error'
          });
        }
      }
    } catch (error: any) {
      console.error('Lỗi khi lưu người dùng:', error);
      let errorMessage = 'Lỗi khi lưu người dùng!';
      
      // Xử lý các loại lỗi cụ thể
      if (error.message && error.message.includes('socket hang up')) {
        errorMessage = 'Kết nối bị gián đoạn khi lưu. Vui lòng thử lại sau!';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Yêu cầu quá thời gian chờ. Vui lòng thử lại sau!';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý mở modal xác nhận xóa
  const handleOpenDeleteModal = (user: UserDisplay) => {
    setUserToDelete(user);
    setOpenDeleteModal(true);
  };

  // Xử lý đóng modal xác nhận xóa
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setUserToDelete(null);
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        // Gọi API để xóa người dùng
        const response = await api.delete(`/users/${userToDelete._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data && response.data.success) {
          // Refresh dữ liệu sau khi xóa
          await fetchUsers();
          
          setSnackbar({
            open: true,
            message: 'Xóa người dùng thành công!',
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: response.data?.message || 'Lỗi xóa người dùng!',
            severity: 'error'
          });
        }
      } catch (error: any) {
        console.error('Lỗi khi xóa người dùng:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Lỗi xóa người dùng!',
          severity: 'error'
        });
      }
      
      setOpenDeleteModal(false);
    }
  };

  // Xử lý thay đổi trạng thái người dùng
  const handleToggleStatus = async (user: UserDisplay) => {
    try {
      // Gọi API để thay đổi trạng thái người dùng
      const newStatus = !user.isActive;
      const response = await api.patch(`/users/${user._id}/status`, {
        isActive: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.success) {
        // Refresh dữ liệu sau khi thay đổi trạng thái
        await fetchUsers();
        
        setSnackbar({
          open: true,
          message: `Người dùng đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'}!`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data?.message || `Lỗi ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} người dùng!`,
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lỗi khi thay đổi trạng thái người dùng!',
        severity: 'error'
      });
    }
  };

  // Xử lý đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Quản lý người dùng
      </Typography>
      
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      {/* Toolbar tìm kiếm và lọc */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <TextField
              placeholder="Tìm kiếm..."
              variant="outlined"
              size="small"
              sx={{ flexGrow: 1 }}
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="role-filter-label">Vai trò</InputLabel>
              <Select
                labelId="role-filter-label"
                value={roleFilter}
                label="Vai trò"
                onChange={handleRoleFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Nhân viên</MenuItem>
                <MenuItem value="user">Người dùng</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="status-filter-label">Trạng thái</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Trạng thái"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Vô hiệu</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => fetchUsers()}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              Thêm người dùng
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Bảng dữ liệu người dùng */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên đăng nhập</TableCell>
                <TableCell>Tên đầy đủ</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Đang tải dữ liệu...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : !filteredUsers || filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      Không có dữ liệu người dùng
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user._id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ width: 30, height: 30, mr: 1, bgcolor: 
                              user.role === 'admin' ? 'error.main' : 
                              user.role === 'staff' ? 'success.main' : 'primary.main' 
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          {user.username}
                        </Box>
                      </TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            user.role === 'admin' ? 'Admin' : 
                            user.role === 'staff' ? 'Nhân viên' : 
                            'Người dùng'
                          }
                          size="small"
                          color={
                            user.role === 'admin' ? 'error' : 
                            user.role === 'staff' ? 'success' : 
                            'primary'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Hoạt động' : 'Vô hiệu'} 
                          size="small"
                          color={user.isActive ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleOpenModal(user)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                            <IconButton 
                              size="small" 
                              color={user.isActive ? 'error' : 'success'}
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.isActive 
                                ? <BlockIcon fontSize="small" /> 
                                : <CheckCircleIcon fontSize="small" />
                              }
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleOpenDeleteModal(user)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers ? filteredUsers.length : 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
        />
      </Paper>

      {/* Modal thêm/sửa người dùng */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              label="Tên đăng nhập"
              name="username"
              fullWidth
              variant="outlined"
              value={currentUser.username}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              label="Tên đầy đủ"
              name="fullName"
              fullWidth
              variant="outlined"
              value={currentUser.fullName}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              label="Email"
              name="email"
              type="email"
              fullWidth
              variant="outlined"
              value={currentUser.email}
              onChange={handleInputChange}
              required
            />
            {!isEditMode && (
              <TextField
                margin="dense"
                label="Mật khẩu"
                name="password"
                type="password"
                fullWidth
                variant="outlined"
                value={currentUser.password}
                onChange={handleInputChange}
                required
              />
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel id="role-label">Vai trò</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={currentUser.role}
                label="Vai trò"
                onChange={handleSelectChange}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Nhân viên</MenuItem>
                <MenuItem value="user">Người dùng</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Hủy</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            color="primary"
          >
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal xác nhận xóa */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng 
            <Typography component="span" fontWeight="bold" color="error">
              {" "}{userToDelete?.username}{" "}
            </Typography>
            không? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>Hủy</Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UsersPage; 