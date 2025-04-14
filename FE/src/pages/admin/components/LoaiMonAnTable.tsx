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
import { LoaiMonAn, deleteLoaiMonAn, toggleLoaiMonAnStatus } from '../../../services/menuService';

interface LoaiMonAnTableProps {
  loaiMonAns: LoaiMonAn[];
  totalItems: number;
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  onEdit: (loaiMonAn: LoaiMonAn) => void;
  onRefresh: () => void;
  showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const LoaiMonAnTable: React.FC<LoaiMonAnTableProps> = ({
  loaiMonAns,
  totalItems,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  onEdit,
  onRefresh,
  showSnackbar
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loaiMonAnToDelete, setLoaiMonAnToDelete] = useState<LoaiMonAn | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedLoaiMonAn, setSelectedLoaiMonAn] = useState<LoaiMonAn | null>(null);

  // Sử dụng useMemo để tránh tính toán lại không cần thiết
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
  const handleOpenDeleteDialog = (loaiMonAn: LoaiMonAn) => {
    setLoaiMonAnToDelete(loaiMonAn);
    setOpenDeleteDialog(true);
  };

  // Xử lý đóng dialog xóa
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setLoaiMonAnToDelete(null);
  };

  // Xử lý xóa loại món ăn
  const handleDelete = async () => {
    if (!loaiMonAnToDelete) return;

    try {
      const response = await deleteLoaiMonAn(loaiMonAnToDelete._id as string);
      if (response && response.success) {
        showSnackbar('Xóa loại món ăn thành công', 'success');
        onRefresh();
      } else {
        showSnackbar(response?.message || 'Lỗi xóa loại món ăn', 'error');
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa loại món ăn:', error);
      showSnackbar(
        error.response?.data?.message || 'Lỗi kết nối đến server', 
        'error'
      );
    }

    handleCloseDeleteDialog();
  };

  // Xử lý thay đổi trạng thái hiển thị loại món ăn
  const handleToggleStatus = async (loaiMonAn: LoaiMonAn) => {
    try {
      const response = await toggleLoaiMonAnStatus(loaiMonAn._id as string);
      if (response && response.success) {
        showSnackbar(`${loaiMonAn.trangThai ? 'Ẩn' : 'Hiện'} loại món ăn thành công`, 'success');
        onRefresh();
      } else {
        showSnackbar(response?.message || 'Lỗi thay đổi trạng thái loại món ăn', 'error');
      }
    } catch (error: any) {
      console.error('Lỗi khi thay đổi trạng thái loại món ăn:', error);
      showSnackbar(
        error.response?.data?.message || 'Lỗi kết nối đến server', 
        'error'
      );
    }
  };

  // Xử lý mở dialog chi tiết
  const handleOpenDetailDialog = (loaiMonAn: LoaiMonAn) => {
    setSelectedLoaiMonAn(loaiMonAn);
    setOpenDetailDialog(true);
  };

  // Xử lý đóng dialog chi tiết
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedLoaiMonAn(null);
  };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Tìm kiếm loại món ăn..."
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
        <Table sx={{ minWidth: 650 }} aria-label="loại món ăn table">
          <TableHead>
            <TableRow>
              <TableCell>Tên loại</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell align="center">Thứ tự</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memoizedLoaiMonAns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            ) : (
              memoizedLoaiMonAns.map((loaiMonAn) => (
                <TableRow key={loaiMonAn._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {loaiMonAn.hinhAnh ? (
                        <Box
                          component="img"
                          src={loaiMonAn.hinhAnh}
                          alt={loaiMonAn.tenLoai}
                          sx={{ width: 40, height: 40, mr: 2, objectFit: 'cover', borderRadius: 1 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 2,
                            bgcolor: 'grey.300',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="caption">No img</Typography>
                        </Box>
                      )}
                      {loaiMonAn.tenLoai}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {loaiMonAn.moTa ? (
                      loaiMonAn.moTa.length > 50 ? `${loaiMonAn.moTa.substring(0, 50)}...` : loaiMonAn.moTa
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có mô tả
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">{loaiMonAn.thuTu || 0}</TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={loaiMonAn.trangThai}
                      onChange={() => handleToggleStatus(loaiMonAn)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Xem chi tiết">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDetailDialog(loaiMonAn)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(loaiMonAn)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(loaiMonAn)}
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
            Bạn có chắc chắn muốn xóa loại món ăn{' '}
            <Typography component="span" fontWeight="bold" color="primary">
              {loaiMonAnToDelete?.tenLoai}
            </Typography>{' '}
            không?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Lưu ý: Hành động này không thể hoàn tác và có thể ảnh hưởng đến các món ăn thuộc loại này.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog chi tiết loại món ăn */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết loại món ăn</DialogTitle>
        {selectedLoaiMonAn && (
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Hình ảnh */}
              {selectedLoaiMonAn.hinhAnh ? (
                <Box
                  component="img"
                  src={selectedLoaiMonAn.hinhAnh}
                  alt={selectedLoaiMonAn.tenLoai}
                  sx={{ 
                    width: '100%', 
                    maxHeight: 200, 
                    objectFit: 'contain', 
                    borderRadius: 1,
                    mb: 2 
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 120,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <Typography>Không có hình ảnh</Typography>
                </Box>
              )}
              
              {/* Tên loại */}
              <Typography variant="h5" gutterBottom>
                {selectedLoaiMonAn.tenLoai}
              </Typography>
              
              {/* Mô tả */}
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Mô tả:
                </Typography>
                {selectedLoaiMonAn.moTa ? (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedLoaiMonAn.moTa}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không có mô tả
                  </Typography>
                )}
              </Box>
              
              {/* Thông tin khác */}
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Thứ tự hiển thị: {selectedLoaiMonAn.thuTu || 0}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" mr={1}>
                    Trạng thái:
                  </Typography>
                  <Chip
                    label={selectedLoaiMonAn.trangThai ? 'Đang hiển thị' : 'Đã ẩn'}
                    color={selectedLoaiMonAn.trangThai ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
              
              {/* Thời gian tạo/cập nhật */}
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Ngày tạo: {new Date(selectedLoaiMonAn.createdAt || '').toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cập nhật: {new Date(selectedLoaiMonAn.updatedAt || '').toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
          <Button
            onClick={() => {
              if (selectedLoaiMonAn) {
                onEdit(selectedLoaiMonAn);
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

export default LoaiMonAnTable;
export type { LoaiMonAnTableProps }; 