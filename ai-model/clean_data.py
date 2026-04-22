import pandas as pd
import random

print("Đang đọc file Mega Data gốc...")
df = pd.read_csv('Train_Data_Mega_Full.csv')

# 1. FIX LỖI NASA: Biến lượng mưa -999.0 thành 0 (Ngày không mưa)
df.loc[df['X1_LuongMua'] < 0, 'X1_LuongMua'] = 0

# 🔥 2. HIỆU CHỈNH MƯA: Bù sai số vệ tinh (Rất quan trọng để ngập sâu)
# Lượng mưa gốc cao nhất là 80mm -> Nhân 1.8 sẽ thành siêu bão 144mm
df['X1_LuongMua'] = df['X1_LuongMua'] * 1.8

# 3. FIX LỖI THỦY TRIỀU: Những đỉnh triều đọc nhầm > 3m sẽ đưa về mức trung bình 1.45m
df.loc[df['X2_DinhTrieu'] > 3, 'X2_DinhTrieu'] = 1.45

# 4. TÍNH LẠI CỘT Y BẰNG CÔNG THỨC V3 (Áp dụng Địa Hình)
def recalculate_flood_v3(row):
    mua = row['X1_LuongMua']
    trieu = row['X2_DinhTrieu']
    caodo = row['X3_CaoDo']
    X4 = row['X4_TinhTrangCong']
    
    # 1. Ngập do triều (Gò Vấp cao nên gần như = 0)
    Y_trieu = max(0, (trieu * 100) - (caodo * 100))
    
    # 2. Cống rút nước
    if Y_trieu > 0:
        D_cap = 0 
    else:
        D_cap = 25 if X4 == 0 else 5 # Cống tốt rút 25mm, cống nghẹt chỉ rút 5mm
        
    # 3. Tính lượng nước đọng ban đầu trên mặt phẳng (đổi ra cm)
    nuoc_dong_cm = max(0, mua - D_cap) / 10
    
    # 🔥 4. BÍ QUYẾT TẠO NGẬP SÂU: HỆ SỐ ĐỊA HÌNH (Hiệu ứng phễu)
    # Đường càng thấp, nước đổ về càng nhiều. 
    # Ví dụ: Đường cao 8m -> Hệ số = 4.0; Đường cao 16m -> Hệ số = 1.0 (Nước trôi đi nhanh)
    he_so_dia_hinh = max(1.0, (18 - caodo) / 2.5)
    
    # Tính ngập cuối cùng = Nước đọng * Hệ số hứng nước
    Y_mua = nuoc_dong_cm * he_so_dia_hinh
    Y_final = Y_trieu + Y_mua
    
    # Thêm độ nhiễu ngẫu nhiên cho tự nhiên
    if Y_final > 0:
        Y_final += random.uniform(-1, 4)
        
    return round(max(0, Y_final), 1)

print("Đang tính toán lại cột Y (Mức ngập) với Hiệu ứng Địa Hình...")
df['Y_MucNgap'] = df.apply(recalculate_flood_v3, axis=1)

# 5. LƯU LẠI FILE SẠCH
df.to_csv('Train_Data_Mega_Cleaned.csv', index=False, encoding='utf-8-sig')

print("✅ ĐÃ DỌN RÁC VÀ TÍNH NGẬP THÀNH CÔNG!")
print("--- KIỂM TRA MỨC NGẬP KỶ LỤC ---")
# Lọc thử 5 dòng ngập nặng nhất để bạn xem tận mắt
print(df.sort_values('Y_MucNgap', ascending=False)[['Ngay', 'Ten_Duong', 'X1_LuongMua', 'X3_CaoDo', 'Y_MucNgap']].head(5))