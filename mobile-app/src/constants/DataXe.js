// File: DataXe.js

export const VN_BRANDS = [
  // --- XE MÁY ---
  { label: 'Honda (Xe máy)', value: 'Honda_Moto' },
  { label: 'Yamaha (Xe máy)', value: 'Yamaha_Moto' },
  { label: 'Suzuki (Xe máy)', value: 'Suzuki_Moto' },
  { label: 'VinFast (Xe máy điện)', value: 'VinFast_Moto' },
  { label: 'Piaggio / Vespa', value: 'Piaggio_Moto' },
  { label: 'SYM (Xe máy)', value: 'SYM_Moto' },
  { label: 'Dat Bike (Xe điện)', value: 'DatBike' },
  { label: 'Yadea / Xiaomi (Xe điện)', value: 'Yadea' },
  { label: 'BYD (Ô tô điện)', value: 'BYD_Car' },
  
  // --- Ô TÔ ---
  { label: 'Toyota (Ô tô)', value: 'Toyota_Car' },
  { label: 'Hyundai (Ô tô)', value: 'Hyundai_Car' },
  { label: 'Kia (Ô tô)', value: 'Kia_Car' },
  { label: 'Honda (Ô tô)', value: 'Honda_Car' },
  { label: 'Mazda (Ô tô)', value: 'Mazda_Car' },
  { label: 'Ford (Ô tô)', value: 'Ford_Car' },
  { label: 'Mitsubishi (Ô tô)', value: 'Mitsubishi_Car' },
  { label: 'VinFast (Ô tô điện/xăng)', value: 'VinFast_Car' },
];

export const VN_MODELS = {
  // ==========================================
  // DỮ LIỆU XE MÁY
  // ==========================================
  Honda_Moto: [
    { label: 'Wave Alpha 110', value: '13.4' },
    { label: 'Wave RSX FI 110', value: '13.5' },
    { label: 'Blade 110', value: '14.1' },
    { label: 'Future 125 FI', value: '13.3' },
    { label: 'Vision (Đời cũ)', value: '12.8' },
    { label: 'Vision (Đời mới)', value: '12.0' },
    { label: 'Lead 125', value: '12.0' },
    { label: 'Air Blade 125/150/160', value: '14.1' },
    { label: 'SH Mode 125', value: '13.0' },
    { label: 'SH 125i/150i/160i', value: '14.6' },
    { label: 'SH 350i', value: '13.2' },
    { label: 'Vario 125/150', value: '13.5' },
    { label: 'Vario 160', value: '14.0' },
    { label: 'Winner X', value: '15.0' },
    { label: 'PCX 125/150', value: '13.5' },
    { label: 'MSX 125', value: '16.6' },
    { label: 'CBR150R', value: '15.1' },
  ],
  Yamaha_Moto: [
    { label: 'Sirius (Cơ/FI)', value: '15.5' },
    { label: 'Jupiter FI / Finn', value: '12.5' },
    { label: 'Exciter 135', value: '13.5' },
    { label: 'Exciter 150/155 VVA', value: '15.0' },
    { label: 'Janus', value: '13.5' },
    { label: 'Grande', value: '12.5' },
    { label: 'Latte', value: '12.5' },
    { label: 'NVX 155 VVA', value: '14.5' },
    { label: 'FreeGo', value: '13.5' },
    { label: 'YZF-R15', value: '17.0' },
    { label: 'MT-15', value: '15.5' },
  ],
  Suzuki_Moto: [
    { label: 'Raider R150', value: '15.0' },
    { label: 'Satria F150', value: '15.0' },
    { label: 'Burgman Street', value: '16.0' },
    { label: 'GSX-R150 / S150', value: '15.5' },
    { label: 'GZ150-A', value: '15.0' },
    { label: 'Impulse 125', value: '13.5' },
  ],
  VinFast_Moto: [
    { label: 'Evo200 / Evo200 Lite', value: '15.0' },
    { label: 'Feliz S', value: '14.5' },
    { label: 'Klara S (2022)', value: '12.5' },
    { label: 'Vento S', value: '13.5' },
    { label: 'Theon S', value: '16.0' },
    { label: 'Ludo / Impes', value: '14.2' },
  ],
  Piaggio_Moto: [
    { label: 'Vespa Sprint 125/150', value: '12.5' },
    { label: 'Vespa Primavera', value: '12.5' },
    { label: 'Vespa GTS Super', value: '15.5' },
    { label: 'Liberty 125', value: '14.5' },
    { label: 'Medley 125/150', value: '15.5' },
    { label: 'Zip 100', value: '11.5' },
  ],
  SYM_Moto: [
    { label: 'Attila Elizabeth', value: '11.0' },
    { label: 'Attila Venus', value: '13.5' },
    { label: 'Shark Mini 125', value: '13.0' },
    { label: 'Galaxy 110/125', value: '13.5' },
    { label: 'Elegant 110', value: '12.0' },
  ],

  // ==========================================
  // DỮ LIỆU Ô TÔ (SEDAN, SUV, BÁN TẢI)
  // ==========================================
  Toyota_Car: [
    { label: 'Vios (Sedan)', value: '13.3' },
    { label: 'Camry (Sedan)', value: '14.0' },
    { label: 'Corolla Altis (Sedan)', value: '14.9' },
    { label: 'Yaris Cross (CUV)', value: '21.0' },
    { label: 'Corolla Cross (SUV)', value: '16.1' },
    { label: 'Innova / Innova Cross (MPV)', value: '16.7' },
    { label: 'Veloz Cross (MPV)', value: '20.5' },
    { label: 'Fortuner (SUV)', value: '27.9' }, // Siêu cao
    { label: 'Hilux (Bán tải)', value: '28.6' },
  ],
  Hyundai_Car: [
    { label: 'Grand i10 (Hatchback/Sedan)', value: '15.2' },
    { label: 'Accent (Sedan)', value: '15.0' },
    { label: 'Elantra (Sedan)', value: '15.0' },
    { label: 'Creta (CUV)', value: '20.0' },
    { label: 'Tucson (CUV)', value: '18.1' },
    { label: 'Santa Fe (SUV)', value: '18.5' },
    { label: 'Palisade (SUV)', value: '20.3' },
  ],
  Kia_Car: [
    { label: 'Morning (Hatchback)', value: '15.2' },
    { label: 'Soluto (Sedan)', value: '15.0' },
    { label: 'K3 / Cerato (Sedan)', value: '15.0' },
    { label: 'K5 / Optima (Sedan)', value: '13.5' },
    { label: 'Sonet (CUV)', value: '20.5' },
    { label: 'Seltos (CUV)', value: '19.0' },
    { label: 'Sportage (CUV)', value: '19.0' },
    { label: 'Sorento (SUV)', value: '17.6' },
    { label: 'Carnival (MPV)', value: '17.2' },
  ],
  Honda_Car: [
    { label: 'Brio (Hatchback)', value: '13.7' },
    { label: 'City (Sedan)', value: '13.4' },
    { label: 'Civic (Sedan)', value: '13.3' },
    { label: 'HR-V (CUV)', value: '18.1' },
    { label: 'CR-V (CUV/SUV)', value: '19.8' },
    { label: 'BR-V (MPV)', value: '20.7' },
  ],
  Mazda_Car: [
    { label: 'Mazda 2 (Sedan)', value: '14.0' },
    { label: 'Mazda 3 (Sedan)', value: '14.5' },
    { label: 'Mazda 6 (Sedan)', value: '16.5' },
    { label: 'CX-3 (CUV)', value: '15.5' },
    { label: 'CX-5 (CUV)', value: '20.0' },
    { label: 'CX-8 (SUV)', value: '20.0' },
    { label: 'BT-50 (Bán tải)', value: '22.4' },
  ],
  Ford_Car: [
    { label: 'Territory (CUV)', value: '19.0' },
    { label: 'Everest (SUV)', value: '20.0' },
    { label: 'Explorer (SUV)', value: '20.8' },
    { label: 'Ranger (Bán tải)', value: '23.5' },
    { label: 'Ranger Raptor (Bán tải)', value: '23.3' },
  ],
  Mitsubishi_Car: [
    { label: 'Attrage (Sedan)', value: '17.0' },
    { label: 'Xpander (MPV)', value: '22.5' },
    { label: 'Xforce (CUV)', value: '22.2' },
    { label: 'Outlander (CUV)', value: '19.0' },
    { label: 'Pajero Sport (SUV)', value: '21.8' },
    { label: 'Triton (Bán tải)', value: '22.0' },
  ],
  VinFast_Car: [
    { label: 'Fadil (Hatchback - Xăng)', value: '15.0' },
    { label: 'Lux A2.0 (Sedan - Xăng)', value: '15.0' },
    { label: 'Lux SA2.0 (SUV - Xăng)', value: '21.4' },
    { label: 'VF 5 Plus (CUV - Điện)', value: '18.2' },
    { label: 'VF 6 (CUV - Điện)', value: '17.0' },
    { label: 'VF e34 (CUV - Điện)', value: '18.0' },
    { label: 'VF 8 (SUV - Điện)', value: '17.9' },
    { label: 'VF 9 (SUV - Điện)', value: '18.9' },
  ],
  DatBike: [
    { label: 'Weaver 200', value: '15.0' },
    { label: 'Weaver++', value: '15.0' },
    { label: 'Quantum', value: '15.5' },
  ],
  Yadea: [
    { label: 'Yadea Xmen Neo', value: '16.0' },
    { label: 'Yadea Odora', value: '15.0' },
    { label: 'Xiaomi Himo T1', value: '14.0' },
  ],
  BYD_Car: [
    { label: 'BYD Dolphin (Hatchback)', value: '13.0' }, // Gầm 13cm
    { label: 'BYD Seal (Sedan)', value: '12.0' },        // Gầm 12cm
    { label: 'BYD Atto 3 (CUV/SUV)', value: '17.5' },    // Gầm 17.5cm
  ]
};