import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import QRCode from 'react-qr-code';
import { createMomoPayment, checkPaymentStatus } from '../../services/paymentService';

// Hook tùy chỉnh để hiển thị QR code
const useQRCode = (url: string | null | undefined) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setQrUrl(null);
      setError("Không có URL để tạo mã QR");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sử dụng QR code component trực tiếp, không cần API
      setQrUrl(url);
      setIsLoading(false);
    } catch (err) {
      console.error('Lỗi tạo QR code:', err);
      setError("Không thể tạo mã QR");
      setIsLoading(false);
    }
  }, [url]);

  return { qrUrl, isLoading, error };
};

interface MomoPaymentModalProps {
  open: boolean;
  onClose: () => void;
  datBanId: string;
  onPaymentSuccess: () => void;
  amount: number;
}

const MomoPaymentModal: React.FC<MomoPaymentModalProps> = ({
  open,
  onClose,
  datBanId,
  onPaymentSuccess,
  amount
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // Sử dụng useRef để theo dõi interval
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Tránh tạo nhiều yêu cầu thanh toán
  const paymentCreatedRef = useRef<boolean>(false);

  // Sử dụng hook QR code
  const { qrUrl, isLoading: qrLoading, error: qrError } = useQRCode(paymentData?.payUrl);

  // Format tiền tệ
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Xử lý khi modal đóng
  const handleCloseModal = () => {
    // Dừng interval kiểm tra trạng thái khi đóng modal
    stopStatusCheck();
    
    // Reset state để tránh vòng lặp vô hạn
    setPaymentData(null);
    setError(null);
    setStatusMessage(null);
    paymentCreatedRef.current = false;
    
    // Gọi callback đóng
    onClose();
  };

  // Dừng kiểm tra trạng thái
  const stopStatusCheck = () => {
    if (statusIntervalRef.current) {
      console.log('Dừng kiểm tra trạng thái thanh toán');
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  };

  // Tạo thanh toán khi component được mở
  useEffect(() => {
    console.log('MomoPaymentModal - useEffect với datBanId:', datBanId, 'open:', open);
    
    if (open && !paymentCreatedRef.current) {
      if (!datBanId || datBanId.trim() === '') {
        setError('ID đặt bàn không hợp lệ hoặc không được cung cấp');
        setLoading(false);
        return;
      }
      
      // Kiểm tra nếu ID không đúng định dạng MongoDB ObjectId (24 ký tự hex)
      if (!datBanId.match(/^[0-9a-fA-F]{24}$/)) {
        setError('ID đặt bàn không đúng định dạng (cần 24 ký tự hexadecimal)');
        setLoading(false);
        return;
      }
      
      createPayment();
    }

    // Cleanup function
    return () => {
      stopStatusCheck();
    };
  }, [open, datBanId]);

  // Tạo thanh toán
  const createPayment = async () => {
    try {
      if (paymentCreatedRef.current) {
        console.log('Đã tạo thanh toán rồi, không tạo lại');
        return;
      }
      
      setLoading(true);
      setError(null);
      paymentCreatedRef.current = true;
      
      // Thêm log để debug
      console.log('Bắt đầu tạo thanh toán MoMo với datBanId:', datBanId);
      
      if (!datBanId || !datBanId.match(/^[0-9a-fA-F]{24}$/)) {
        setError('ID đặt bàn không hợp lệ hoặc không đúng định dạng');
        setLoading(false);
        paymentCreatedRef.current = false;
        return;
      }
      
      console.log('Gọi API createMomoPayment với ID:', datBanId);
      const response = await createMomoPayment(datBanId);
      console.log('API Response success:', response.success, 'data:', !!response.data);
      
      if (response.success && response.data) {
        console.log('Đã nhận được dữ liệu thanh toán:', response.data);
        // Log chi tiết các trường QR
        console.log('QR code URL:', response.data.qrCodeUrl);
        console.log('Pay URL:', response.data.payUrl);
        console.log('Deeplink:', response.data.deeplink);
        
        // Tạo QR code trực tiếp ở đây nếu có payUrl nhưng không có qrCodeUrl
        if (!response.data.qrCodeUrl && response.data.payUrl) {
          console.log('Không có QR code URL từ API, sẽ tạo QR code từ payUrl trực tiếp ở client');
        }
        
        setPaymentData(response.data);
        
        // Bắt đầu kiểm tra trạng thái
        stopStatusCheck(); // Dừng interval cũ nếu có
        
        const interval = setInterval(() => {
          if (response.data && response.data.orderId) {
            checkStatus(response.data.orderId);
          }
        }, 600000); // Kiểm tra mỗi 10 phút (600000ms) để có đủ thời gian quét mã
        
        statusIntervalRef.current = interval;
      } else {
        console.error('Lỗi từ API:', response);
        setError(response.message || 'Không thể tạo thanh toán MoMo');
        paymentCreatedRef.current = false;
      }
    } catch (error: any) {
      console.error('Lỗi bắt từ try/catch:', error);
      paymentCreatedRef.current = false;
      
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
        // Lỗi từ phản hồi API
        console.error('Lỗi phản hồi API:', error.response);
        if (error.response.status === 404) {
          setError('Không tìm thấy thông tin đặt bàn. Vui lòng kiểm tra lại.');
        } else {
          setError(error.response.data?.message || error.message || 'Lỗi từ server khi tạo thanh toán');
        }
      } else if (error.request) {
        // Lỗi không nhận được phản hồi
        console.error('Không nhận được phản hồi:', error.request);
        setError('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Các lỗi khác
        setError(error.message || 'Đã xảy ra lỗi khi tạo thanh toán');
      }
    } finally {
      setLoading(false);
    }
  };

  // Thử lại khi có lỗi
  const handleRetry = () => {
    paymentCreatedRef.current = false; // Reset trạng thái
    setPaymentData(null);
    setError(null);
    setStatusMessage(null);
    createPayment();
  };

  // Kiểm tra trạng thái thanh toán
  const checkStatus = async (orderId: string) => {
    if (checkingStatus) return; // Tránh kiểm tra chồng chéo
    
    try {
      setCheckingStatus(true);
      console.log('Đang kiểm tra trạng thái thanh toán cho orderId:', orderId);
      
      const response = await checkPaymentStatus(orderId);
      console.log('Kết quả kiểm tra trạng thái:', response);
      
      if (response.success && response.data) {
        console.log('Trạng thái thanh toán:', response.data.trangThai);
        
        // Nếu thanh toán thành công
        if (response.data.trangThai === 'success') {
          setStatusMessage('Thanh toán thành công! Đơn đặt bàn của bạn đã được xác nhận.');
          
          // Dừng kiểm tra
          stopStatusCheck();
          
          // Gọi callback thành công
          onPaymentSuccess();
          
          // Đóng modal sau 3 giây
          setTimeout(() => {
            handleCloseModal();
          }, 3000);
        } else if (response.data.trangThai === 'failed') {
          setStatusMessage('Thanh toán thất bại. Vui lòng thử lại.');
          
          // Dừng kiểm tra
          stopStatusCheck();
        } else if (response.data.trangThai === 'cancelled') {
          setStatusMessage('Thanh toán đã bị hủy.');
          
          // Dừng kiểm tra
          stopStatusCheck();
        }
      }
    } catch (error: any) {
      console.error('Lỗi kiểm tra trạng thái:', error);
      
      // Dừng kiểm tra sau một số lần thất bại để tránh gọi API liên tục khi server có vấn đề
      if (error.response && error.response.status === 500) {
        console.error('Server gặp lỗi 500, tạm ngừng kiểm tra trạng thái');
        setStatusMessage('Hệ thống thanh toán đang gặp sự cố. Vui lòng quét mã QR để thanh toán và liên hệ nhân viên nếu cần hỗ trợ.');
        stopStatusCheck();
      }
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Thanh toán bằng MoMo
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRetry} 
              sx={{ mt: 2 }}
            >
              Thử lại
            </Button>
          </Box>
        ) : paymentData ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {statusMessage && (
              <Alert 
                severity={statusMessage.includes('thành công') ? 'success' : 'info'} 
                sx={{ mb: 2 }}
              >
                {statusMessage}
              </Alert>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              Số tiền cần thanh toán:
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 2 }}>
              {formatCurrency(amount)}
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Quét mã QR bằng ứng dụng MoMo
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Bạn có 10 phút để quét mã thanh toán
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  my: 2,
                  p: 2,
                  border: '1px solid #eee',
                  borderRadius: 2,
                  bgcolor: 'white',
                  minHeight: '200px'
                }}
              >
                {loading ? (
                  <CircularProgress size={40} />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : !paymentData ? (
                  <Typography color="error">Không có dữ liệu thanh toán</Typography>
                ) : (
                  <div className="qrcode-container" style={{ width: '200px', height: '200px', position: 'relative' }}>
                    {/* QR code từ URL nếu có */}
                    {paymentData.qrCodeUrl && (
                      <img
                        src={paymentData.qrCodeUrl}
                        alt="MoMo QR Code"
                        style={{ maxWidth: '100%', maxHeight: '100%', position: 'absolute', top: 0, left: 0 }}
                        onLoad={() => {
                          console.log('QR code đã được tải thành công từ URL:', paymentData.qrCodeUrl);
                        }}
                        onError={(e) => {
                          console.error('Không thể tải QR code từ URL, sử dụng QR code được tạo tại client');
                          e.currentTarget.style.display = 'none';
                          const backupElement = document.getElementById(`qr-backup-${paymentData.orderId}`);
                          if (backupElement) {
                            backupElement.style.display = 'block';
                          }
                        }}
                      />
                    )}
                    
                    {/* QR code từ payUrl (luôn hiển thị nếu không có qrCodeUrl) */}
                    <div 
                      id={`qr-backup-${paymentData.orderId}`} 
                      style={{ 
                        display: paymentData.qrCodeUrl ? 'none' : 'block',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      {paymentData.payUrl && (
                        <QRCode
                          value={paymentData.payUrl}
                          size={200}
                          style={{ width: '100%', height: '100%' }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Hoặc mở ứng dụng MoMo để thanh toán
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              href={paymentData.deeplink || paymentData.payUrl}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              sx={{ 
                mb: 2, 
                bgcolor: '#ae2070',
                '&:hover': {
                  bgcolor: '#8e1c5c',
                },
              }}
            >
              Mở ứng dụng MoMo
            </Button>
            
            <Typography variant="caption" color="text.secondary">
              Mã giao dịch: {paymentData.orderId}
            </Typography>
          </Box>
        ) : null}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCloseModal} color="inherit">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MomoPaymentModal; 