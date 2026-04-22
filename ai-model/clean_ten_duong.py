import pandas as pd

# Tên file đầu vào (Bạn đổi lại tên file cho đúng với file mới nhất bạn đang có nhé)
input_file = 'Train_Data_Mega_Cleaned.csv'
output_file = 'Train_Data_Ready_To_Train.csv'

print(f"Đang đọc dữ liệu từ file {input_file}...")
df = pd.read_csv(input_file)

so_dong_ban_dau = len(df)

# Đếm xem có bao nhiêu đường "Không tên"
# Dùng str.contains để quét sạch cả "Không tên", "Đường không tên", "Hẻm không tên"...
mask_khong_ten = df['Ten_Duong'].astype(str).str.contains('Không tên', case=False, na=False)
so_dong_khong_ten = len(df[mask_khong_ten])

print(f"📊 Tổng số dòng ban đầu: {so_dong_ban_dau}")
print(f"🗑️ Phát hiện {so_dong_khong_ten} dòng chứa đường 'Không tên'. Đang tiến hành xóa...")

# Lọc giữ lại những dòng KHÔNG có chữ "Không tên" (Dấu ~ mang ý nghĩa phủ định/loại bỏ)
df_clean = df[~mask_khong_ten]

# Xuất ra file cuối cùng hoàn hảo
df_clean.to_csv(output_file, index=False, encoding='utf-8-sig')

print(f"✅ HOÀN TẤT! File mới sạch sẽ '{output_file}' hiện còn {len(df_clean)} dòng.")