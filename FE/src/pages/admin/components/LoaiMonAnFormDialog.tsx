import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Grid,
  Switch,
  FormControlLabel,
  SelectChangeEvent
} from '@mui/material';
import { LoaiMonAn, createLoaiMonAn, updateLoaiMonAn } from '../../../services/menuService';

export interface LoaiMonAnFormDialogProps {
  open: boolean;
  onClose: () => void;
  loaiMonAn: any | null;
  onSuccess: () => void;
  showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const LoaiMonAnFormDialog = ({
  open,
  onClose,
  loaiMonAn,
  onSuccess,
  showSnackbar
}: LoaiMonAnFormDialogProps) => {
  const initialFormState = {
    tenLoai: '',
    moTa: '',
    thuTu: 0,
    hinhAnh: '',
    trangThai: true
  };

  const [formData, setFormData] = React.useState<any>(initialFormState);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (loaiMonAn) {
      setFormData({
        tenLoai: loaiMonAn.tenLoai || '',
        moTa: loaiMonAn.moTa || '',
        thuTu: loaiMonAn.thuTu || 0,
        hinhAnh: loaiMonAn.hinhAnh || '',
        trangThai: loaiMonAn.trangThai !== undefined ? loaiMonAn.trangThai : true
      });
      setImagePreview(loaiMonAn.hinhAnh || null);
    } else {
      setFormData(initialFormState);
      setImagePreview(null);
    }
    setErrors({});
  }, [loaiMonAn, open]);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({ ...formData, [name]: value });
      
      // Clear error when field is edited
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, hinhAnh: value });
    setImagePreview(value);
    
    if (errors.hinhAnh) {
      setErrors({ ...errors, hinhAnh: '' });
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, trangThai: e.target.checked });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.tenLoai.trim()) {
      newErrors.tenLoai = 'Tên loại món ăn không được để trống';
    }
    
    if (formData.thuTu < 0) {
      newErrors.thuTu = 'Thứ tự hiển thị không được nhỏ hơn 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        thuTu: Number(formData.thuTu)
      };
      
      let response;
      if (loaiMonAn?._id) {
        // Cập nhật loại món ăn
        response = await updateLoaiMonAn(loaiMonAn._id, payload);
      } else {
        // Tạo loại món ăn mới
        response = await createLoaiMonAn(payload);
      }
      
      if (response && response.success) {
        showSnackbar(
          loaiMonAn ? 'Cập nhật loại món ăn thành công' : 'Thêm loại món ăn mới thành công',
          'success'
        );
        onSuccess();
        onClose();
      } else {
        showSnackbar(response?.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error: any) {
      console.error('Lỗi khi lưu loại món ăn:', error);
      showSnackbar(
        error.response?.data?.message || 'Lỗi kết nối đến server', 
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {loaiMonAn ? 'Chỉnh sửa loại món ăn' : 'Thêm loại món ăn mới'}
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Tên loại món ăn */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tên loại món ăn"
              name="tenLoai"
              value={formData.tenLoai}
              onChange={handleTextFieldChange}
              error={!!errors.tenLoai}
              helperText={errors.tenLoai}
              required
            />
          </Grid>
          
          {/* Thứ tự hiển thị */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Thứ tự hiển thị"
              name="thuTu"
              type="number"
              value={formData.thuTu}
              onChange={handleTextFieldChange}
              error={!!errors.thuTu}
              helperText={errors.thuTu || 'Số thứ tự càng nhỏ càng hiển thị trước'}
            />
          </Grid>
          
          {/* Trạng thái */}
          <Grid item xs={12} md={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.trangThai}
                  onChange={handleSwitchChange}
                  color="primary"
                />
              }
              label={formData.trangThai ? 'Đang hiển thị' : 'Đã ẩn'}
            />
          </Grid>
          
          {/* Hình ảnh */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL hình ảnh"
              name="hinhAnh"
              value={formData.hinhAnh}
              onChange={handleImageChange}
              error={!!errors.hinhAnh}
              helperText={errors.hinhAnh}
              placeholder="Nhập đường dẫn URL hình ảnh"
            />
          </Grid>
          
          {/* Xem trước hình ảnh */}
          {imagePreview && (
            <Grid item xs={12}>
              <Box
                component="img"
                src={imagePreview}
                alt="Xem trước"
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  borderRadius: 1,
                  mt: 1
                }}
                onError={() => {
                  setErrors({ ...errors, hinhAnh: 'URL hình ảnh không hợp lệ' });
                  setImagePreview(null);
                }}
              />
            </Grid>
          )}
          
          {/* Mô tả */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              name="moTa"
              value={formData.moTa}
              onChange={handleTextFieldChange}
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : (loaiMonAn ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoaiMonAnFormDialog; 