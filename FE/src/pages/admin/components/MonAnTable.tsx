import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Switch,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { MonAn, LoaiMonAn, deleteMonAn, toggleMonAnStatus } from '../../../services/menuService';

interface MonAnTableProps {
  monAns: MonAn[];
  totalItems: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  onEdit: (monAn: MonAn) => void;
  onRefresh: () => void;
  showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
  loaiMonAns: LoaiMonAn[];
}

const MonAnTable: React.FC<MonAnTableProps> = ({
  monAns,
  totalItems,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  onEdit,
  onRefresh,
  showSnackbar,
  loaiMonAns
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [monAnToDelete, setMonAnToDelete] = useState<MonAn | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedMonAn, setSelectedMonAn] = useState<MonAn | null>(null);

  // Sử dụng useMemo để tránh tính toán lại không cần thiết
  const memoizedMonAns = useMemo(() => monAns, [monAns]);
  const memoizedLoaiMonAns = useMemo(() => loaiMonAns, [loaiMonAns]);
  
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
    setSearchTerm(event.target.value);
    // Có thể thêm logic tìm kiếm qua API ở đây
  };

  // Xử lý mở dialog xóa
  const handleOpenDeleteDialog = (monAn: MonAn) => {
    setMonAnToDelete(monAn);
    setOpenDeleteDialog(true);
  };

  // Xử lý đóng dialog xóa
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setMonAnToDelete(null);
  };

  // Xử lý xóa món ăn
  const handleDelete = async () => {
    if (!monAnToDelete) return;

    try {
      const response = await deleteMonAn(monAnToDelete._id as string);
      if (response && response.success) {
        showSnackbar('Xóa món ăn thành công', 'success');
        onRefresh();
      } else {
        showSnackbar(response?.message || 'Lỗi xóa món ăn', 'error');
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa món ăn:', error);
      showSnackbar(error.response?.data?.message || 'Lỗi kết nối đến server', 'error');
    }

    handleCloseDeleteDialog();
  };

  // Xử lý thay đổi trạng thái hiển thị món ăn
  const handleToggleStatus = async (monAn: MonAn) => {
    try {
      const response = await toggleMonAnStatus(monAn._id as string);
      if (response && response.success) {
        showSnackbar(`${monAn.trangThai ? 'Ẩn' : 'Hiện'} món ăn thành công`, 'success');
        onRefresh();
      } else {
        showSnackbar(response?.message || 'Lỗi thay đổi trạng thái món ăn', 'error');
      }
    } catch (error: any) {
      console.error('Lỗi khi thay đổi trạng thái món ăn:', error);
      showSnackbar(error.response?.data?.message || 'Lỗi kết nối đến server', 'error');
    }
  };

  // Xử lý mở dialog chi tiết
  const handleOpenDetailDialog = (monAn: MonAn) => {
    setSelectedMonAn(monAn);
    setOpenDetailDialog(true);
  };

  // Xử lý đóng dialog chi tiết
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedMonAn(null);
  };

  // Hàm định dạng tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Lấy tên loại món ăn từ ID
  const getLoaiMonAnName = useMemo(() => {
    return (id: string) => {
      const loaiMonAn = memoizedLoaiMonAns.find(loai => loai._id === id);
      return loaiMonAn ? loaiMonAn.tenLoai : 'Không xác định';
    };
  }, [memoizedLoaiMonAns]);

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Tìm kiếm món ăn..."
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <Button
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          variant="outlined"
        >
          Làm mới
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="món ăn table">
          <TableHead>
            <TableRow>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Tên món</TableCell>
              <TableCell>Loại món</TableCell>
              <TableCell align="right">Giá</TableCell>
              <TableCell align="right">Giá KM</TableCell>
              <TableCell align="center">Nổi bật</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memoizedMonAns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              memoizedMonAns.map((monAn) => (
                <TableRow key={monAn._id}>
                  <TableCell>
                    {monAn.hinhAnh && monAn.hinhAnh.length > 0 ? (
                      <Box
                        component="img"
                        src={monAn.hinhAnh[0]}
                        alt={monAn.tenMon}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = '/placeholder-food.png';
                        }}
                      />
                    ) : (
                      <Box
                        component="img"
                        src="/placeholder-food.png"
                        alt="No image"
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{monAn.tenMon}</TableCell>
                  <TableCell>{getLoaiMonAnName(monAn.loaiMonAn)}</TableCell>
                  <TableCell align="right">{formatCurrency(monAn.gia)}</TableCell>
                  <TableCell align="right">
                    {monAn.giaKhuyenMai && monAn.giaKhuyenMai > 0
                      ? formatCurrency(monAn.giaKhuyenMai)
                      : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={monAn.noiBat ? 'Có' : 'Không'}
                      color={monAn.noiBat ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={monAn.trangThai}
                      onChange={() => handleToggleStatus(monAn)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDetailDialog(monAn)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(monAn)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(monAn)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Số hàng mỗi trang:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
      />
      
      {/* Dialog xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa món ăn{' '}
            <Typography component="span" fontWeight="bold" color="primary">
              {monAnToDelete?.tenMon}
            </Typography>{' '}
            không?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Lưu ý: Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog chi tiết món ăn */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết món ăn</DialogTitle>
        {selectedMonAn && (
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Hình ảnh */}
              <Box sx={{ width: { xs: '100%', md: 300 } }}>
                {selectedMonAn.hinhAnh && selectedMonAn.hinhAnh.length > 0 ? (
                  <Box
                    component="img"
                    src={selectedMonAn.hinhAnh[0]}
                    alt={selectedMonAn.tenMon}
                    sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      bgcolor: 'grey.300',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography>Không có hình ảnh</Typography>
                  </Box>
                )}
                
                {/* Thông tin giá và trạng thái */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(selectedMonAn.gia)}
                  </Typography>
                  {selectedMonAn.giaKhuyenMai && selectedMonAn.giaKhuyenMai > 0 && (
                    <Typography variant="body2" color="error" sx={{ textDecoration: 'line-through', mt: 0.5 }}>
                      {formatCurrency(selectedMonAn.giaKhuyenMai)}
                    </Typography>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Chip
                      label={selectedMonAn.trangThai ? 'Đang hiển thị' : 'Đã ẩn'}
                      color={selectedMonAn.trangThai ? 'success' : 'default'}
                      size="small"
                      sx={{ width: 'fit-content' }}
                    />
                    {selectedMonAn.noiBat && (
                      <Chip
                        label="Món nổi bật"
                        color="primary"
                        size="small"
                        sx={{ width: 'fit-content' }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              {/* Thông tin chi tiết */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {selectedMonAn.tenMon}
                </Typography>
                
                <Typography variant="body1" fontWeight="medium" sx={{ mt: 2 }}>
                  Loại món:
                </Typography>
                <Typography variant="body2">
                  {getLoaiMonAnName(selectedMonAn.loaiMonAn)}
                </Typography>
                
                {selectedMonAn.moTa && (
                  <>
                    <Typography variant="body1" fontWeight="medium" sx={{ mt: 2 }}>
                      Mô tả:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedMonAn.moTa}
                    </Typography>
                  </>
                )}
                
                {selectedMonAn.nguyenLieu && (
                  <>
                    <Typography variant="body1" fontWeight="medium" sx={{ mt: 2 }}>
                      Nguyên liệu:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedMonAn.nguyenLieu}
                    </Typography>
                  </>
                )}
                
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Thứ tự hiển thị: {selectedMonAn.thuTu || 0}
                  </Typography>
                  {selectedMonAn.danhGiaTrungBinh !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      Đánh giá: {selectedMonAn.danhGiaTrungBinh.toFixed(1)}/5 ({selectedMonAn.soLuongDanhGia || 0} lượt)
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Ngày tạo: {new Date(selectedMonAn.createdAt || '').toLocaleDateString('vi-VN')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật: {new Date(selectedMonAn.updatedAt || '').toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
          <Button
            onClick={() => {
              if (selectedMonAn) {
                onEdit(selectedMonAn);
                handleCloseDetailDialog();
              }
            }}
            color="primary"
            variant="contained"
          >
            Chỉnh sửa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MonAnTable; 