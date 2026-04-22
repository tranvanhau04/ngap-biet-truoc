import pandas as pd
import numpy as np
import random
from datetime import datetime

print("🚀 Khởi động quy trình tổng hợp dữ liệu Mega chuẩn xác từ file gốc...")

# ---------------------------------------------------------
# BƯỚC 1: ĐỌC VÀ CHUẨN HÓA DỮ LIỆU TỪ 3 FILE GỐC
# ---------------------------------------------------------

# 1.1 Đọc file Cao độ đường (X3)
df_duong = pd.read_csv('DoCaoDuongGoVap.csv')
df_duong = df_duong.dropna(subset=['Tên đường', 'Độ cao trung bình (m)'])
df_duong = df_duong[['Tên đường', 'Độ cao trung bình (m)']].drop_duplicates()

# 1.2 Đọc file Lượng mưa NASA (X1)
# Đổi lại thành pd.read_excel('LuongMua.xlsx', skiprows=10) nếu file của bạn đúng là Excel
df_mua = pd.read_excel('LuongMua.xlsx', skiprows=10)
df_mua['Ngay'] = pd.to_datetime(df_mua['YEAR'] * 1000 + df_mua['DOY'], format='%Y%j')
df_mua = df_mua[['Ngay', 'PRECTOTCORR']].rename(columns={'PRECTOTCORR': 'X1_LuongMua'})
df_mua['Thang_Ngay'] = df_mua['Ngay'].dt.strftime('%m-%d')
df_mua['Ngay_str'] = df_mua['Ngay'].dt.strftime('%Y-%m-%d')

# 1.3 Đọc file Thủy triều trạm Phú An (X2) 
print("🌊 Đang xử lý file thủy triều trạm Phú An...")
# SỬA LỖI 1: Bỏ qua 21 dòng thay vì 20 để lấy đúng hàng dữ liệu
df_trieu_raw = pd.read_excel('DuBaoThuyTrieu2026.xlsx', skiprows=21)

# SỬA LỖI 2: Quét vị trí cột từ cột 3 đến cột 26 (chứa 24 giờ) thay vì gọi tên '0', '1'...
hours_data = df_trieu_raw.iloc[:, 2:26]
df_trieu_raw['Peak_Trieu_m'] = hours_data.apply(pd.to_numeric, errors='coerce').max(axis=1) / 100

# SỬA LỖI 3: Tạo danh sách ngày liên tục (01-01 đến 31-12) thay vì đọc cột Ngày bị lỗi chữ "CN", "2"
start_2026 = datetime(2026, 1, 1)
trieu_dates = [(start_2026 + pd.Timedelta(days=i)).strftime('%m-%d') for i in range(len(df_trieu_raw))]
df_trieu_raw['Thang_Ngay'] = trieu_dates
trieu_dict = df_trieu_raw.set_index('Thang_Ngay')['Peak_Trieu_m'].to_dict()

# Ánh xạ đỉnh triều vào bảng lượng mưa (ngày thiếu mặc định 1.45m)
df_mua['X2_DinhTrieu'] = df_mua['Thang_Ngay'].map(trieu_dict).fillna(1.45)

# ---------------------------------------------------------
# BƯỚC 2: CROSS JOIN (NHÂN TẤT CẢ NGÀY VỚI TẤT CẢ ĐƯỜNG)
# ---------------------------------------------------------
print(f"📊 Đang kết hợp {len(df_mua)} ngày với {len(df_duong)} tuyến đường...")
df_mua['key'] = 1
df_duong['key'] = 1
df_mega = pd.merge(df_mua, df_duong, on='key').drop(['key', 'Thang_Ngay'], axis=1)
df_mega = df_mega.rename(columns={'Độ cao trung bình (m)': 'X3_CaoDo'})

# ---------------------------------------------------------
# BƯỚC 3: TÍNH TOÁN LOGIC NGẬP (X4 & Y) 
# ---------------------------------------------------------
print("🧠 Đang áp dụng logic tính ngập...")

def apply_flood_logic(row):
    mua = row['X1_LuongMua']
    trieu = row['X2_DinhTrieu']
    caodo = row['X3_CaoDo']
    
    Y_trieu = max(0, (trieu * 100) - (caodo * 100))
    X4 = 1 if random.random() < 0.25 else 0
    
    if Y_trieu > 0:
        D_cap = 0 
    else:
        D_cap = 40 if X4 == 0 else 10
        
    Y_mua = max(0, (mua - D_cap) / 10) * 1.5
    Y_final = Y_trieu + Y_mua
    
    if Y_final > 0:
        Y_final += random.uniform(-1, 3)
        
    return pd.Series([X4, round(max(0, Y_final), 1)])

df_mega[['X4_TinhTrangCong', 'Y_MucNgap']] = df_mega.apply(apply_flood_logic, axis=1)

# ---------------------------------------------------------
# BƯỚC 4: XUẤT FILE TRAIN MEGA
# ---------------------------------------------------------
df_final = df_mega[['Ngay_str', 'Tên đường', 'X1_LuongMua', 'X2_DinhTrieu', 'X3_CaoDo', 'X4_TinhTrangCong', 'Y_MucNgap']]
df_final.columns = ['Ngay', 'Ten_Duong', 'X1_LuongMua', 'X2_DinhTrieu', 'X3_CaoDo', 'X4_TinhTrangCong', 'Y_MucNgap']

df_final.to_csv('Train_Data_Mega_Full.csv', index=False, encoding='utf-8-sig')

print(f"✅ HOÀN THÀNH! Đã tạo file 'Train_Data_Mega_Full.csv' thành công.")