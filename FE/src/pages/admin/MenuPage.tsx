import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import { MonAn, LoaiMonAn, getAllMonAn, getAllLoaiMonAn, deleteAllMonAn, deleteAllLoaiMonAn } from '../../services/menuService';

// Components
import MonAnTable from './components/MonAnTable';
import LoaiMonAnTable from './components/LoaiMonAnTable';
import MonAnFormDialog from './components/MonAnFormDialog';
import LoaiMonAnFormDialog from './components/LoaiMonAnFormDialog';

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `menu-tab-${index}`,
    'aria-controls': `menu-tabpanel-${index}`,
  };
}

// Tạo phiên bản memo của các component để tránh render lại không cần thiết
const MemoizedMonAnTable = React.memo(MonAnTable);
const MemoizedLoaiMonAnTable = React.memo(LoaiMonAnTable);

const MenuPage = () => {
  // State cho tab hiện tại
  const [tabValue, setTabValue] = useState(0);
  
  // State cho dialog thêm/sửa
  const [openMonAnDialog, setOpenMonAnDialog] = useState(false);
  const [openLoaiMonAnDialog, setOpenLoaiMonAnDialog] = useState(false);
  const [selectedMonAn, setSelectedMonAn] = useState<MonAn | null>(null);
  const [selectedLoaiMonAn, setSelectedLoaiMonAn] = useState<LoaiMonAn | null>(null);
  
  // State cho dữ liệu
  const [monAns, setMonAns] = useState<MonAn[]>([]);
  const [loaiMonAns, setLoaiMonAns] = useState<LoaiMonAn[]>([]);
  const [loadingMonAn, setLoadingMonAn] = useState<boolean>(true);
  const [loadingLoaiMonAn, setLoadingLoaiMonAn] = useState<boolean>(true);
  const [errorMonAn, setErrorMonAn] = useState<string | null>(null);
  const [errorLoaiMonAn, setErrorLoaiMonAn] = useState<string | null>(null);
  
  // State cho phân trang và lọc
  const [pageMonAn, setPageMonAn] = useState(0);
  const [rowsPerPageMonAn, setRowsPerPageMonAn] = useState(10);
  const [totalMonAn, setTotalMonAn] = useState(0);
  
  const [pageLoaiMonAn, setPageLoaiMonAn] = useState(0);
  const [rowsPerPageLoaiMonAn, setRowsPerPageLoaiMonAn] = useState(10);
  const [totalLoaiMonAn, setTotalLoaiMonAn] = useState(0);
  
  // State cho thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Thêm state để kiểm soát việc refresh dữ liệu
  const [shouldRefresh, setShouldRefresh] = useState(true);

  // State cho dialog xác nhận xóa tất cả
  const [openDeleteAllMonAnDialog, setOpenDeleteAllMonAnDialog] = useState(false);
  const [openDeleteAllLoaiMonAnDialog, setOpenDeleteAllLoaiMonAnDialog] = useState(false);

  // Xử lý chuyển tab
  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Thêm useEffect để tải dữ liệu phù hợp khi chuyển tab
  useEffect(() => {
    // Chỉ tải dữ liệu tab hiện tại để tránh gọi API không cần thiết
    if (tabValue === 0) {
      fetchMonAns();
    } else if (tabValue === 1) {
      fetchLoaiMonAns();
    }
  }, [tabValue]);

  // Fetch dữ liệu món ăn
  const fetchMonAns = async () => {
    try {
      setLoadingMonAn(true);
      setErrorMonAn(null);
      
      const response = await getAllMonAn({
        page: pageMonAn + 1,
        limit: rowsPerPageMonAn
      });
      
      if (response && response.success) {
        setMonAns(response.data);
        setTotalMonAn(response.totalItems);
      } else {
        setErrorMonAn(response?.message || 'Không thể tải danh sách món ăn');
      }
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách món ăn:', error);
      setErrorMonAn(error.response?.data?.message || 'Lỗi kết nối đến server');
    } finally {
      setLoadingMonAn(false);
    }
  };

  // Fetch dữ liệu loại món ăn
  const fetchLoaiMonAns = async () => {
    try {
      setLoadingLoaiMonAn(true);
      setErrorLoaiMonAn(null);
      
      const response = await getAllLoaiMonAn({
        page: pageLoaiMonAn + 1,
        limit: rowsPerPageLoaiMonAn
      });
      
      if (response && response.success) {
        setLoaiMonAns(response.data);
        setTotalLoaiMonAn(response.totalItems);
      } else {
        setErrorLoaiMonAn(response?.message || 'Không thể tải danh sách loại món ăn');
      }
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách loại món ăn:', error);
      setErrorLoaiMonAn(error.response?.data?.message || 'Lỗi kết nối đến server');
    } finally {
      setLoadingLoaiMonAn(false);
    }
  };

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    if (shouldRefresh) {
      fetchMonAns();
      fetchLoaiMonAns();
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  // Thay vào đó, tạo một useEffect mới theo dõi sự thay đổi phân trang
  // nhưng đặt một debounce để không gọi API quá thường xuyên
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMonAns();
    }, 300); // Đợi 300ms sau mỗi lần thay đổi

    return () => clearTimeout(timeoutId); // Dọn dẹp timeout nếu thay đổi quá nhanh
  }, [pageMonAn, rowsPerPageMonAn]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLoaiMonAns();
    }, 300); // Đợi 300ms sau mỗi lần thay đổi
    
    return () => clearTimeout(timeoutId); // Dọn dẹp timeout nếu thay đổi quá nhanh
  }, [pageLoaiMonAn, rowsPerPageLoaiMonAn]);

  // Hàm refresh dữ liệu khi cần
  const refreshData = () => {
    setShouldRefresh(true);
  };

  // Xử lý mở dialog thêm/sửa món ăn
  const handleOpenMonAnDialog = (monAn: MonAn | null = null) => {
    setSelectedMonAn(monAn);
    setOpenMonAnDialog(true);
  };

  // Xử lý đóng dialog món ăn
  const handleCloseMonAnDialog = () => {
    setOpenMonAnDialog(false);
    setSelectedMonAn(null);
  };

  // Xử lý mở dialog thêm/sửa loại món ăn
  const handleOpenLoaiMonAnDialog = (loaiMonAn: LoaiMonAn | null = null) => {
    setSelectedLoaiMonAn(loaiMonAn);
    setOpenLoaiMonAnDialog(true);
  };

  // Xử lý đóng dialog loại món ăn
  const handleCloseLoaiMonAnDialog = () => {
    setOpenLoaiMonAnDialog(false);
    setSelectedLoaiMonAn(null);
  };

  // Xử lý thông báo
  const handleShowSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Xử lý đóng thông báo
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Xử lý xóa tất cả món ăn
  const handleDeleteAllMonAn = async () => {
    try {
      const response = await deleteAllMonAn();
      if (response && response.success) {
        handleShowSnackbar(`Đã xóa tất cả món ăn (${response.deletedCount} món)`, 'success');
        refreshData();
      } else {
        handleShowSnackbar(response?.message || 'Lỗi xóa tất cả món ăn', 'error');
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa tất cả món ăn:', error);
      handleShowSnackbar(
        error.response?.data?.message || 'Lỗi kết nối đến server', 
        'error'
      );
    }
    setOpenDeleteAllMonAnDialog(false);
  };

  // Xử lý xóa tất cả loại món ăn
  const handleDeleteAllLoaiMonAn = async () => {
    try {
      const response = await deleteAllLoaiMonAn();
      if (response && response.success) {
        handleShowSnackbar(`Đã xóa tất cả loại món ăn (${response.deletedCount} loại)`, 'success');
        refreshData();
      } else {
        handleShowSnackbar(response?.message || 'Lỗi xóa tất cả loại món ăn', 'error');
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa tất cả loại món ăn:', error);
      handleShowSnackbar(
        error.response?.data?.message || 'Lỗi kết nối đến server', 
        'error'
      );
    }
    setOpenDeleteAllLoaiMonAnDialog(false);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Quản lý thực đơn
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          aria-label="menu tabs"
          variant="fullWidth"
        >
          <Tab 
            icon={<RestaurantMenuIcon />} 
            label="Món ăn" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<CategoryIcon />} 
            label="Danh mục món ăn" 
            {...a11yProps(1)} 
          />
        </Tabs>
      </Paper>
      
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Danh sách món ăn</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteAllMonAnDialog(true)}
            >
              Xóa tất cả
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenMonAnDialog()}
            >
              Thêm món ăn
            </Button>
          </Box>
        </Box>
        
        {loadingMonAn ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : errorMonAn ? (
          <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{errorMonAn}</Typography>
          </Paper>
        ) : (
          <MemoizedMonAnTable 
            monAns={monAns} 
            totalItems={totalMonAn}
            page={pageMonAn}
            rowsPerPage={rowsPerPageMonAn}
            setPage={setPageMonAn}
            setRowsPerPage={setRowsPerPageMonAn}
            onEdit={handleOpenMonAnDialog}
            onRefresh={refreshData}
            showSnackbar={handleShowSnackbar}
            loaiMonAns={loaiMonAns}
          />
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Danh mục món ăn</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteAllLoaiMonAnDialog(true)}
            >
              Xóa tất cả
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenLoaiMonAnDialog()}
            >
              Thêm danh mục
            </Button>
          </Box>
        </Box>
        
        {loadingLoaiMonAn ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : errorLoaiMonAn ? (
          <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{errorLoaiMonAn}</Typography>
          </Paper>
        ) : (
          <MemoizedLoaiMonAnTable 
            loaiMonAns={loaiMonAns} 
            totalItems={totalLoaiMonAn}
            page={pageLoaiMonAn}
            rowsPerPage={rowsPerPageLoaiMonAn}
            setPage={setPageLoaiMonAn}
            setRowsPerPage={setRowsPerPageLoaiMonAn}
            onEdit={handleOpenLoaiMonAnDialog}
            onRefresh={refreshData}
            showSnackbar={handleShowSnackbar}
          />
        )}
      </TabPanel>
      
      {/* Modal thêm/sửa món ăn */}
      <MonAnFormDialog
        open={openMonAnDialog}
        onClose={handleCloseMonAnDialog}
        monAn={selectedMonAn}
        loaiMonAns={loaiMonAns}
        onSuccess={() => {
          refreshData();
          handleCloseMonAnDialog();
          handleShowSnackbar(selectedMonAn ? 'Cập nhật món ăn thành công' : 'Thêm món ăn thành công');
        }}
        showSnackbar={handleShowSnackbar}
      />
      
      {/* Modal thêm/sửa loại món ăn */}
      <LoaiMonAnFormDialog
        open={openLoaiMonAnDialog}
        onClose={handleCloseLoaiMonAnDialog}
        loaiMonAn={selectedLoaiMonAn}
        onSuccess={() => {
          refreshData();
          handleCloseLoaiMonAnDialog();
          handleShowSnackbar(selectedLoaiMonAn ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công');
        }}
        showSnackbar={handleShowSnackbar}
      />
      
      {/* Dialog xác nhận xóa tất cả món ăn */}
      <Dialog
        open={openDeleteAllMonAnDialog}
        onClose={() => setOpenDeleteAllMonAnDialog(false)}
      >
        <DialogTitle>Xác nhận xóa tất cả món ăn</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa <strong>tất cả món ăn</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Lưu ý: Hành động này không thể hoàn tác. Tất cả dữ liệu món ăn sẽ bị mất.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteAllMonAnDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteAllMonAn} color="error" variant="contained">
            Xóa tất cả
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog xác nhận xóa tất cả loại món ăn */}
      <Dialog
        open={openDeleteAllLoaiMonAnDialog}
        onClose={() => setOpenDeleteAllLoaiMonAnDialog(false)}
      >
        <DialogTitle>Xác nhận xóa tất cả danh mục</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa <strong>tất cả danh mục món ăn</strong>?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Lưu ý: Hành động này không thể hoàn tác. Tất cả dữ liệu danh mục sẽ bị mất.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteAllLoaiMonAnDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteAllLoaiMonAn} color="error" variant="contained">
            Xóa tất cả
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

export default MenuPage; 