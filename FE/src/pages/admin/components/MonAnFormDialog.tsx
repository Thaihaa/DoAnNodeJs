import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  Grid,
  Switch,
  FormControlLabel,
  InputAdornment,
  SelectChangeEvent,
  Typography,
  IconButton
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { createMonAn, updateMonAn, MonAn, LoaiMonAn } from '../../../services/menuService';
import { uploadImage } from '../../../services/uploadService';

export interface MonAnFormDialogProps {
  open: boolean;
  onClose: () => void;
  monAn: MonAn | null;
  loaiMonAns: LoaiMonAn[];
  onSuccess: () => void;
  showSnackbar?: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}

const MonAnFormDialog = ({
  open,
  onClose,
  monAn,
  loaiMonAns,
  onSuccess,
  showSnackbar
}: MonAnFormDialogProps) => {
  const initialFormState = {
    tenMon: '',
    moTa: '',
    gia: 0,
    loaiMonAn: '',
    hinhAnh: '',
    trangThai: true
  };

  const [formData, setFormData] = useState<any>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (monAn) {
      setFormData({
        tenMon: monAn.tenMon || '',
        moTa: monAn.moTa || '',
        gia: monAn.gia || 0,
        loaiMonAn: monAn.loaiMonAn || '',
        hinhAnh: Array.isArray(monAn.hinhAnh) && monAn.hinhAnh.length > 0 ? monAn.hinhAnh[0] : '',
        trangThai: monAn.trangThai !== undefined ? monAn.trangThai : true
      });
      setImagePreview(Array.isArray(monAn.hinhAnh) && monAn.hinhAnh.length > 0 ? monAn.hinhAnh[0] : null);
    } else {
      setFormData(initialFormState);
      setImagePreview(null);
    }
    setErrors({});
  }, [monAn, open]);

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

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
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
    
    // Xóa khoảng trắng ở đầu và cuối
    const trimmedValue = value.trim();
    
    // Tự động thêm https:// nếu URL không có protocol
    let normalizedUrl = trimmedValue;
    if (trimmedValue && !trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
      normalizedUrl = 'https://' + trimmedValue;
    }
    
    // Thêm kiểm tra độ dài URL hình ảnh
    if (normalizedUrl && normalizedUrl.length > 500) {
      setErrors({ ...errors, hinhAnh: 'URL hình ảnh quá dài, vui lòng sử dụng URL ngắn hơn' });
      return;
    }
    
    setFormData({ ...formData, hinhAnh: normalizedUrl });
    setImagePreview(normalizedUrl);
    
    if (errors.hinhAnh) {
      setErrors({ ...errors, hinhAnh: '' });
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, trangThai: e.target.checked });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.tenMon.trim()) {
      newErrors.tenMon = 'Tên món ăn không được để trống';
    }
    
    if (!formData.loaiMonAn) {
      newErrors.loaiMonAn = 'Vui lòng chọn loại món ăn';
    }
    
    if (formData.gia <= 0) {
      newErrors.gia = 'Giá bán phải lớn hơn 0';
    }
    
    // Kiểm tra URL hình ảnh
    if (formData.hinhAnh) {
      try {
        new URL(formData.hinhAnh);
      } catch (e) {
        newErrors.hinhAnh = 'URL hình ảnh không hợp lệ';
      }
      
      if (formData.hinhAnh.length > 500) {
        newErrors.hinhAnh = 'URL hình ảnh quá dài, vui lòng sử dụng URL ngắn hơn';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Kiểm tra loại file
      if (!file.type.match('image.*')) {
        setErrors({ ...errors, hinhAnh: 'Chỉ chấp nhận file hình ảnh' });
        return;
      }
      
      // Kiểm tra kích thước file (giới hạn 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, hinhAnh: 'Kích thước ảnh không được vượt quá 10MB' });
        return;
      }
      
      setLocalImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Xóa URL nếu đang có
      setFormData({ ...formData, hinhAnh: '' });
      
      if (errors.hinhAnh) {
        setErrors({ ...errors, hinhAnh: '' });
      }
    }
  };
  
  const handleRemoveImage = () => {
    setLocalImage(null);
    setImagePreview(null);
    setFormData({ ...formData, hinhAnh: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      // Nếu có ảnh và đã thay đổi, tải ảnh lên trước
      let imageUrl = formData.hinhAnh;
      
      if (localImage) {
        setIsLoading(true);
        
        // Kiểm tra lại kích thước trước khi tải lên
        if (localImage.size > 10 * 1024 * 1024) {
          if (showSnackbar) {
            showSnackbar('Kích thước ảnh vượt quá 10MB, vui lòng chọn ảnh nhỏ hơn', 'error');
          }
          setSaving(false);
          setIsLoading(false);
          return;
        }
        
        try {
          console.log('Bắt đầu tải ảnh lên...', {
            fileName: localImage.name,
            fileSize: localImage.size,
            fileType: localImage.type
          });
          
          // Hiển thị thông báo đang xử lý
          if (showSnackbar) {
            showSnackbar('Đang tải ảnh lên máy chủ...', 'info');
          }
          
          const uploadResult = await uploadImage(localImage);
          if (uploadResult.success) {
            console.log('Upload thành công:', uploadResult);
            imageUrl = uploadResult.url;
            
            // Hiển thị thông báo thành công
            if (showSnackbar) {
              showSnackbar('Tải ảnh lên thành công!', 'success');
            }
          } else {
            throw new Error(uploadResult.message || 'Upload thất bại');
          }
        } catch (error) {
          console.error('Lỗi upload ảnh:', error);
          // Hiển thị lỗi chi tiết hơn
          let errorMessage = 'Đã xảy ra lỗi không xác định';
          
          if (error instanceof Error) {
            errorMessage = error.message;
            
            // Thêm các kiểm tra lỗi phổ biến
            if (errorMessage.includes('Network Error')) {
              errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối Internet của bạn.';
            } else if (errorMessage.includes('timeout')) {
              errorMessage = 'Quá thời gian tải lên. Vui lòng thử lại với ảnh nhỏ hơn.';
            } else if (errorMessage.includes('404')) {
              errorMessage = 'Không tìm thấy API upload. Vui lòng kiểm tra cấu hình máy chủ.';
            }
          }
          
          if (showSnackbar) {
            showSnackbar(`Lỗi tải ảnh lên: ${errorMessage}`, 'error');
          }
          
          setSaving(false);
          setIsLoading(false);
          return;
        } finally {
          setIsLoading(false);
        }
      }
      
      // Tạo payload với URL ảnh đã upload
      const payload = {
        tenMon: formData.tenMon.trim(),
        loaiMonAn: formData.loaiMonAn,
        gia: Number(formData.gia),
        hinhAnh: imageUrl ? [imageUrl] : [], 
        moTa: formData.moTa ? formData.moTa.substring(0, 300) : '',
        trangThai: formData.trangThai,
        nhaHang: monAn?.nhaHang || "65eec46bf3de78eab0e14ecb"
      };
      
      console.log('Payload để tạo/cập nhật món ăn:', payload);
      
      // Thông báo đang xử lý
      if (showSnackbar) {
        showSnackbar('Đang xử lý yêu cầu, vui lòng đợi...', 'info');
      }
      
      let response;
      if (monAn?._id) {
        response = await updateMonAn(monAn._id, payload);
      } else {
        response = await createMonAn(payload);
      }
      
      if (response && response.success) {
        if (showSnackbar) {
          showSnackbar(
            monAn ? 'Cập nhật món ăn thành công' : 'Thêm món ăn mới thành công',
            'success'
          );
        }
        onSuccess();
        onClose();
      } else {
        if (showSnackbar) {
          showSnackbar(response?.message || 'Có lỗi xảy ra', 'error');
        }
      }
    } catch (error: any) {
      console.error('Lỗi khi lưu món ăn:', error);
      let errorMessage = 'Lỗi kết nối đến server';
      
      if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Quá thời gian xử lý yêu cầu. Vui lòng thử lại với ảnh nhỏ hơn.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      if (showSnackbar) {
        showSnackbar(errorMessage, 'error');
      }
    } finally {
      setSaving(false);
      setIsLoading(false);
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
        {monAn ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tên món ăn"
              name="tenMon"
              value={formData.tenMon}
              onChange={handleTextFieldChange}
              error={!!errors.tenMon}
              helperText={errors.tenMon}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.loaiMonAn} required>
              <InputLabel>Loại món ăn</InputLabel>
              <Select
                name="loaiMonAn"
                value={formData.loaiMonAn}
                onChange={handleSelectChange}
                label="Loại món ăn"
              >
                {loaiMonAns.map((loai) => (
                  <MenuItem key={loai._id} value={loai._id}>
                    {loai.tenLoai}
                  </MenuItem>
                ))}
              </Select>
              {errors.loaiMonAn && (
                <FormHelperText>{errors.loaiMonAn}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Giá bán"
              name="gia"
              type="number"
              value={formData.gia}
              onChange={handleTextFieldChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">₫</InputAdornment>,
              }}
              error={!!errors.gia}
              helperText={errors.gia}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
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
          
          <Grid item xs={12}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'info.lighter', 
              borderRadius: 1, 
              mb: 2,
              fontSize: '0.9rem'
            }}>
              <b>Hình ảnh món ăn:</b>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Tải lên ảnh trực tiếp từ máy tính (khuyến nghị)</li>
                <li>Kích thước tối đa: 10MB</li>
                <li>Định dạng: JPG, PNG, JPEG, WEBP, GIF</li>
              </ul>
              {isLoading && <p style={{ color: '#0288d1', fontWeight: 'bold' }}>Đang tải ảnh lên, vui lòng đợi...</p>}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <CloudUploadIcon fontSize="large" color="primary" />
                <Typography variant="subtitle1" mt={1}>
                  Nhấp để chọn ảnh hoặc kéo thả vào đây
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {localImage ? `Đã chọn: ${localImage.name}` : 'Chưa có ảnh nào được chọn'}
                </Typography>
              </Box>
              
              {errors.hinhAnh && (
                <FormHelperText error>{errors.hinhAnh}</FormHelperText>
              )}
              
              {imagePreview && (
                <Box sx={{ position: 'relative', width: '100%', height: 200, border: '1px dashed #ccc', borderRadius: 1, mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Xem trước"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      // Khi hình ảnh lỗi
                      console.error('Lỗi tải hình ảnh:', imagePreview);
                      setErrors({ ...errors, hinhAnh: 'Không thể tải hình ảnh, URL có thể không hợp lệ hoặc bị chặn CORS' });
                      // Thay thế bằng hình ảnh mặc định
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Hình+ảnh+không+tải+được';
                    }}
                  />
                  <IconButton 
                    sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.7)' }}
                    onClick={handleRemoveImage}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
              
              <TextField
                fullWidth
                label="Hoặc nhập URL hình ảnh (không bắt buộc)"
                name="hinhAnh"
                value={formData.hinhAnh}
                onChange={handleImageChange}
                error={!!errors.hinhAnh && !localImage}
                helperText={!localImage && errors.hinhAnh}
                placeholder="Nhập đường dẫn URL hình ảnh (ví dụ: https://i.imgur.com/abc123.jpg)"
                disabled={!!localImage}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              name="moTa"
              value={formData.moTa}
              onChange={handleTextFieldChange}
              multiline
              rows={4}
              placeholder="Nhập mô tả cho món ăn"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button 
          onClick={() => {
            const formEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
            handleSubmit(formEvent);
          }} 
          variant="contained" 
          color="primary"
          disabled={saving || isLoading}
        >
          {saving || isLoading ? 'Đang lưu...' : (monAn ? 'Cập nhật' : 'Thêm mới')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MonAnFormDialog; 