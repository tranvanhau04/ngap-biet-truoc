import pandas as pd
import numpy as np
import time
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, confusion_matrix, classification_report

# =====================================================================
# HÀM GIAO DIỆN CONSOLE (UI BOX) ĐỂ IN BÁO CÁO ĐẸP MẮT
# =====================================================================
def print_box(title, content):
    lines = content.strip().split('\n')
    max_len = max(len(line) for line in lines)
    max_len = max(max_len, len(title) + 4)
    print(f"┌─ {title} " + "─" * (max_len - len(title) - 1) + "┐")
    for line in lines:
        print(f"│ {line.ljust(max_len)} │")
    print("└" + "─" * (max_len + 2) + "┘\n")

print("\n" + "🚀"*3 + " KHỞI ĐỘNG HỆ THỐNG HUẤN LUYỆN AI (EXPERT LEVEL) " + "🚀"*3 + "\n")

# =====================================================================
# BƯỚC 1: ĐỌC VÀ TIỀN XỬ LÝ DỮ LIỆU
# =====================================================================
df = pd.read_csv('Train_Data_Ready_To_Train.csv')

# Khai báo Biến đầu vào (X) và Biến mục tiêu (Y)
X = df[['X1_LuongMua', 'X2_DinhTrieu', 'X3_CaoDo', 'X4_TinhTrangCong']]
y = df['Y_MucNgap']

# Chia tập dữ liệu: 80% để học, 20% để thi thử (Giữ nguyên random_state để dễ tái lập)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

box1 = f"""- File gốc: Train_Data_Ready_To_Train.csv
- Tổng số dữ liệu sạch: {len(df):,} dòng
- Tập huấn luyện (Train 80%): {len(X_train):,} dòng
- Tập kiểm thử (Test 20%): {len(X_test):,} dòng"""
print_box("BƯỚC 1: TỔNG QUAN DỮ LIỆU (DATA OVERVIEW)", box1)

# =====================================================================
# BƯỚC 2: KHỞI TẠO VÀ HUẤN LUYỆN MÔ HÌNH RANDOM FOREST
# =====================================================================
start_time = time.time()

# Cấu hình chuyên gia: 150 cây quyết định, giới hạn độ sâu tránh học vẹt (Overfitting)
model = RandomForestRegressor(
    n_estimators=150, 
    max_depth=25, 
    min_samples_split=5, 
    random_state=42, 
    n_jobs=-1
)

model.fit(X_train, y_train)
train_time = time.time() - start_time

box2 = f"""- Thuật toán: Random Forest Regressor (Ensemble Learning)
- Cấu hình: 150 Decision Trees | Max Depth: 25 | Min Split: 5
- Trạng thái: 🟢 Hoàn tất quá trình học!
- Thời gian huấn luyện: {train_time:.2f} giây"""
print_box("BƯỚC 2: HUẤN LUYỆN MÔ HÌNH (MODEL TRAINING)", box2)

# =====================================================================
# BƯỚC 3: ĐÁNH GIÁ ĐỘ CHÍNH XÁC TOÁN HỌC (REGRESSION METRICS)
# =====================================================================
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

box3 = f"""- Sai số tuyệt đối trung bình (MAE): {mae:.2f} cm
- Sai số toàn phương trung bình gốc (RMSE): {rmse:.2f} cm
- Độ chính xác tổng thể (R-squared): {r2*100:.2f} %
=> AI có khả năng giải thích {r2*100:.2f}% sự biến thiên của mức ngập."""
print_box("BƯỚC 3: ĐÁNH GIÁ SAI SỐ SỐ THỰC", box3)

# =====================================================================
# BƯỚC 4: FEATURE IMPORTANCE (MỨC ĐỘ QUAN TRỌNG CỦA ĐẶC TRƯNG)
# =====================================================================
importances = model.feature_importances_
features = X.columns
feat_imp = sorted(zip(features, importances), key=lambda x: x[1], reverse=True)

box4 = "AI đánh giá mức độ ảnh hưởng đến kết quả ngập lụt như sau:\n"
for name, imp in feat_imp:
    box4 += f"- {name:<18}: {imp*100:>5.2f} %\n"
box4 += "\n* Insight: Yếu tố nào % cao nhất chính là nguyên nhân chính gây ngập!"
print_box("BƯỚC 4: MỨC ĐỘ QUAN TRỌNG (FEATURE IMPORTANCE)", box4)

# =====================================================================
# BƯỚC 5: ĐÁNH GIÁ LOGIC NGHIỆP VỤ (CLASSIFICATION METRICS)
# =====================================================================
# Chuyển đổi mức ngập cm thành 3 cấp độ cảnh báo trên Mobile App
def categorize_flood(val):
    if val < 5: return 0      # Mức 0: An toàn (Xanh)
    elif val <= 15: return 1  # Mức 1: Chú ý (Vàng)
    else: return 2            # Mức 2: Nguy hiểm (Đỏ - >15cm)

y_test_class = np.vectorize(categorize_flood)(y_test)
y_pred_class = np.vectorize(categorize_flood)(y_pred)

cm = confusion_matrix(y_test_class, y_pred_class, labels=[0, 1, 2])
report = classification_report(y_test_class, y_pred_class, target_names=['[0] An toàn', '[1] Chú ý', '[2] Nguy hiểm'])

box5 = f"""MA TRẬN NHẦM LẪN (Confusion Matrix):
                Dự đoán [0]    Dự đoán [1]    Dự đoán [2]
Thực tế [0]:    {cm[0,0]:<14} {cm[0,1]:<14} {cm[0,2]:<14}
Thực tế [1]:    {cm[1,0]:<14} {cm[1,1]:<14} {cm[1,2]:<14}
Thực tế [2]:    {cm[2,0]:<14} {cm[2,1]:<14} {cm[2,2]:<14}

BÁO CÁO PHÂN LỚP CHI TIẾT (Classification Report):
{report}"""
print_box("BƯỚC 5: ĐÁNH GIÁ NGHIỆP VỤ ỨNG DỤNG (APP LOGIC)", box5)

# =====================================================================
# BƯỚC 6: LƯU TRỮ MÔ HÌNH VÀO FILE .PKL
# =====================================================================
file_name = "NgapBietTruoc_AI_Model.pkl"
joblib.dump(model, file_name)
box6 = f"""- Đã đóng gói toàn bộ 150 Decision Trees vào file: {file_name}
- Kích thước nhẹ, tốc độ truy xuất < 10ms.
- Sẵn sàng Deploy lên Server (FastAPI / Node.js) để phục vụ Mobile App."""
print_box("BƯỚC 6: XUẤT XƯỞNG MÔ HÌNH (DEPLOYMENT READY)", box6)