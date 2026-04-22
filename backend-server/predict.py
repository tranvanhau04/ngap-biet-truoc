import sys
import json
import joblib
import numpy as np

try:
    model = joblib.load('NgapBietTruoc_AI_Model.pkl')
    
    luong_mua = float(sys.argv[1])
    dinh_trieu = float(sys.argv[2])
    cao_do = float(sys.argv[3])
    tinh_trang_cong = int(sys.argv[4])
    
    input_data = np.array([[luong_mua, dinh_trieu, cao_do, tinh_trang_cong]])
    muc_ngap = model.predict(input_data)[0]
    
    print(json.dumps({ "success": True, "muc_ngap_cm": round(muc_ngap, 1) }))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))