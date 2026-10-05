interface LifeObjectIllustrationProps {
  name: string;
}

export default function LifeObjectIllustration({ name }: LifeObjectIllustrationProps) {
  switch (name) {
    case 'chiếc bảng lớp học':
      return (
        <svg
          viewBox="0 0 240 140"
          className="mx-auto h-36 w-60 sm:h-40 sm:w-68 drop-shadow-md"
          role="img"
          aria-label="Chiếc bảng lớp học hình chữ nhật màu xanh lá đậm"
        >
          {/* Móc treo bảng */}
          <rect x="50" y="4" width="10" height="10" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
          <rect x="180" y="4" width="10" height="10" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />

          {/* Khung nhôm/gỗ bo viền bảng - Hình chữ nhật ngang rõ ràng (tỉ lệ gần 2:1) */}
          <rect
            x="15"
            y="12"
            width="210"
            height="116"
            rx="0"
            fill="#d97706"
            stroke="#92400e"
            strokeWidth="3.5"
            strokeLinejoin="miter"
          />
          {/* Mặt bảng xanh viết phấn - Hình chữ nhật */}
          <rect
            x="23"
            y="20"
            width="194"
            height="96"
            rx="0"
            fill="#166534"
            stroke="#14532d"
            strokeWidth="2"
            strokeLinejoin="miter"
          />

          {/* Dòng kẻ ô li trên bảng */}
          <line x1="23" y1="44" x2="217" y2="44" stroke="#15803d" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="23" y1="68" x2="217" y2="68" stroke="#15803d" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="23" y1="92" x2="217" y2="92" stroke="#15803d" strokeWidth="1" strokeDasharray="3 3" />

          {/* Chữ viết phấn trắng trên bảng: 1 + 2 = 3 */}
          <text x="45" y="62" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="sans-serif">
            1 + 2 = 3
          </text>
          <text x="145" y="62" fill="#fef08a" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
            Toán 1
          </text>

          {/* Hình vẽ phấn minh họa trên bảng */}
          <rect x="45" y="74" width="18" height="18" fill="none" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="85" cy="83" r="9" fill="none" stroke="#67e8f9" strokeWidth="1.5" />
          <polygon points="120,74 110,92 130,92" fill="none" stroke="#fda4af" strokeWidth="1.5" />
          <rect x="150" y="77" width="28" height="15" fill="none" stroke="#a7f3d0" strokeWidth="1.5" />

          {/* Khay để phấn ở cạnh dưới bảng */}
          <rect x="35" y="116" width="170" height="8" rx="0" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          {/* Viên phấn trắng và vàng */}
          <rect x="75" y="113" width="16" height="4" rx="1" fill="#ffffff" />
          <rect x="96" y="113" width="16" height="4" rx="1" fill="#fde047" />
          {/* Miếng giẻ lau bảng */}
          <rect x="140" y="110" width="28" height="7" rx="1" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        </svg>
      );

    case 'cánh cửa ra vào':
      return (
        <svg
          viewBox="0 0 160 220"
          className="mx-auto h-44 w-32 drop-shadow-md"
          role="img"
          aria-label="Cánh cửa ra vào hình chữ nhật đứng"
        >
          {/* Khung bao cửa - Hình chữ nhật đứng */}
          <rect
            x="25"
            y="12"
            width="110"
            height="198"
            rx="0"
            fill="#78350f"
            stroke="#451a03"
            strokeWidth="3.5"
            strokeLinejoin="miter"
          />
          {/* Cánh cửa chính */}
          <rect
            x="33"
            y="20"
            width="94"
            height="190"
            rx="0"
            fill="#b45309"
            stroke="#78350f"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
          {/* Pano trên (hình chữ nhật) */}
          <rect
            x="43"
            y="32"
            width="74"
            height="70"
            rx="0"
            fill="#d97706"
            stroke="#92400e"
            strokeWidth="2.5"
            strokeLinejoin="miter"
          />
          {/* Pano dưới (hình chữ nhật) */}
          <rect
            x="43"
            y="118"
            width="74"
            height="78"
            rx="0"
            fill="#d97706"
            stroke="#92400e"
            strokeWidth="2.5"
            strokeLinejoin="miter"
          />
          {/* Tay nắm cửa vàng tròn và ổ khóa */}
          <circle cx="115" cy="112" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
          <rect x="114" y="118" width="2" height="6" fill="#713f12" />
        </svg>
      );

    case 'khung tranh ảnh':
      return (
        <svg
          viewBox="0 0 220 150"
          className="mx-auto h-36 w-52 sm:h-40 sm:w-60 drop-shadow-md"
          role="img"
          aria-label="Khung tranh ảnh hình chữ nhật nằm ngang"
        >
          {/* Khung gỗ viền ngoài - Hình chữ nhật */}
          <rect
            x="14"
            y="14"
            width="192"
            height="122"
            rx="0"
            fill="#b45309"
            stroke="#78350f"
            strokeWidth="4"
            strokeLinejoin="miter"
          />
          {/* Viền lót tranh màu kem - Hình chữ nhật */}
          <rect
            x="24"
            y="24"
            width="172"
            height="102"
            rx="0"
            fill="#fef3c7"
            stroke="#d97706"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
          {/* Bức tranh phong cảnh bên trong */}
          <rect x="36" y="36" width="148" height="78" rx="0" fill="#bae6fd" />
          {/* Mặt trời vàng */}
          <circle cx="152" cy="54" r="12" fill="#fbbf24" />
          {/* Ngọn núi xanh */}
          <polygon points="36,114 85,58 135,114" fill="#059669" strokeLinejoin="miter" />
          <polygon points="105,114 148,68 184,114" fill="#10b981" strokeLinejoin="miter" />
        </svg>
      );

    case 'bìa sách Toán 1':
      return (
        <svg
          viewBox="0 0 160 210"
          className="mx-auto h-44 w-34 drop-shadow-md"
          role="img"
          aria-label="Bìa sách Toán 1 hình chữ nhật đứng"
        >
          {/* Hiệu ứng gáy sách */}
          <rect x="18" y="16" width="12" height="178" fill="#1e40af" stroke="#172554" strokeWidth="2" />
          {/* Mặt bìa sách - Hình chữ nhật đứng */}
          <rect
            x="30"
            y="16"
            width="112"
            height="178"
            rx="0"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeLinejoin="miter"
          />
          {/* Dải tiêu đề bìa */}
          <rect x="34" y="32" width="104" height="42" fill="#0284c7" />
          <text x="86" y="52" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            TOÁN
          </text>
          <text x="86" y="70" fill="#fde047" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            1
          </text>
          {/* Tranh minh họa bìa sách */}
          <rect x="42" y="86" width="88" height="68" fill="#ffffff" stroke="#bae6fd" strokeWidth="1.5" />
          <polygon points="86,94 56,134 116,134" fill="#f97316" />
          <circle cx="86" cy="116" r="10" fill="#fbbf24" />
          {/* Tên nhà xuất bản */}
          <text x="86" y="176" fill="#0369a1" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            KẾT NỐI TRI THỨC
          </text>
        </svg>
      );

    case 'con tem thư':
      return (
        <svg
          viewBox="0 0 200 140"
          className="mx-auto h-34 w-48 drop-shadow-md"
          role="img"
          aria-label="Con tem thư hình chữ nhật có viền răng cưa"
        >
          {/* Viền nền trắng răng cưa con tem - Tỉ lệ hình chữ nhật */}
          <rect
            x="18"
            y="16"
            width="164"
            height="108"
            rx="0"
            fill="#f8fafc"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeDasharray="6 4"
            strokeLinejoin="miter"
          />
          {/* Nền trong của tem - Hình chữ nhật */}
          <rect
            x="28"
            y="26"
            width="144"
            height="88"
            rx="0"
            fill="#fbcfe8"
            stroke="#f472b6"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
          {/* Hình bông hoa trên tem */}
          <circle cx="70" cy="70" r="18" fill="#ec4899" />
          <circle cx="70" cy="70" r="7" fill="#fde047" />
          {/* Chữ trên tem thư */}
          <text x="104" y="55" fill="#831843" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
            VIỆT NAM
          </text>
          <text x="104" y="78" fill="#db2777" fontSize="16" fontWeight="900" fontFamily="sans-serif">
            1000 đ
          </text>
        </svg>
      );

    case 'khung cửa sổ vuông':
      return (
        <svg
          viewBox="0 0 160 160"
          className="mx-auto h-36 w-36 drop-shadow-md"
          role="img"
          aria-label="Khung cửa sổ hình vuông có 4 cạnh dài bằng nhau"
        >
          {/* Khung gỗ ngoài - Hình vuông hoàn hảo 1:1, rx=0 */}
          <rect
            x="16"
            y="16"
            width="128"
            height="128"
            rx="0"
            fill="#fed7aa"
            stroke="#9a3412"
            strokeWidth="4"
            strokeLinejoin="miter"
          />
          {/* 4 ô kính vuông nhỏ đều nhau bên trong */}
          <rect x="25" y="25" width="51" height="51" rx="0" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
          <rect x="84" y="25" width="51" height="51" rx="0" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
          <rect x="25" y="84" width="51" height="51" rx="0" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
          <rect x="84" y="84" width="51" height="51" rx="0" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
          {/* Đố cửa chữ thập ở giữa */}
          <line x1="80" y1="16" x2="80" y2="144" stroke="#9a3412" strokeWidth="6" strokeLinecap="square" />
          <line x1="16" y1="80" x2="144" y2="80" stroke="#9a3412" strokeWidth="6" strokeLinecap="square" />
        </svg>
      );

    case 'viên gạch lát hoa':
      return (
        <svg
          viewBox="0 0 160 160"
          className="mx-auto h-36 w-36 drop-shadow-md"
          role="img"
          aria-label="Viên gạch lát hoa hình vuông 4 cạnh bằng nhau"
        >
          {/* Viên gạch vuông 1:1, rx=0 */}
          <rect
            x="16"
            y="16"
            width="128"
            height="128"
            rx="0"
            fill="#ecfdf5"
            stroke="#047857"
            strokeWidth="4"
            strokeLinejoin="miter"
          />
          {/* Viền vuông phụ bên trong */}
          <rect
            x="28"
            y="28"
            width="104"
            height="104"
            rx="0"
            fill="#d1fae5"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinejoin="miter"
          />
          {/* Họa tiết hoa văn vuông xoay góc 45 độ */}
          <polygon points="80,36 124,80 80,124 36,80" fill="#a7f3d0" stroke="#047857" strokeWidth="2" />
          <circle cx="80" cy="80" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <circle cx="80" cy="80" r="5" fill="#f43f5e" />
        </svg>
      );

    case 'mặt khối Rubik':
      return (
        <svg
          viewBox="0 0 160 160"
          className="mx-auto h-36 w-36 drop-shadow-md"
          role="img"
          aria-label="Mặt khối Rubik hình vuông gồm 9 ô vuông nhỏ"
        >
          {/* Khung đen khối Rubik vuông vức 1:1 */}
          <rect
            x="16"
            y="16"
            width="128"
            height="128"
            rx="0"
            fill="#0f172a"
            stroke="#020617"
            strokeWidth="4"
            strokeLinejoin="miter"
          />
          {/* 9 ô vuông nhỏ rực rỡ */}
          {/* Hàng 1 */}
          <rect x="23" y="23" width="36" height="36" rx="2" fill="#ef4444" />
          <rect x="62" y="23" width="36" height="36" rx="2" fill="#3b82f6" />
          <rect x="101" y="23" width="36" height="36" rx="2" fill="#22c55e" />
          {/* Hàng 2 */}
          <rect x="23" y="62" width="36" height="36" rx="2" fill="#eab308" />
          <rect x="62" y="62" width="36" height="36" rx="2" fill="#f97316" />
          <rect x="101" y="62" width="36" height="36" rx="2" fill="#ffffff" />
          {/* Hàng 3 */}
          <rect x="23" y="101" width="36" height="36" rx="2" fill="#3b82f6" />
          <rect x="62" y="101" width="36" height="36" rx="2" fill="#ef4444" />
          <rect x="101" y="101" width="36" height="36" rx="2" fill="#eab308" />
        </svg>
      );

    case 'mặt đồng hồ tròn':
      return (
        <svg
          viewBox="0 0 160 160"
          className="mx-auto h-36 w-36 drop-shadow-md"
          role="img"
          aria-label="Mặt đồng hồ hình tròn không có cạnh và không có góc"
        >
          {/* Vành đồng hồ tròn */}
          <circle cx="80" cy="80" r="64" fill="#0284c7" stroke="#0369a1" strokeWidth="5" />
          <circle cx="80" cy="80" r="54" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2" />
          {/* Các vạch giờ chính */}
          <text x="80" y="40" fill="#0f172a" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">12</text>
          <text x="122" y="85" fill="#0f172a" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">3</text>
          <text x="80" y="128" fill="#0f172a" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">6</text>
          <text x="38" y="85" fill="#0f172a" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">9</text>
          {/* Kim giờ và kim phút */}
          <line x1="80" y1="80" x2="80" y2="48" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <line x1="80" y1="80" x2="108" y2="80" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="80" r="4.5" fill="#ef4444" />
        </svg>
      );

    case 'chiếc đĩa DVD':
      return (
        <svg
          viewBox="0 0 160 160"
          className="mx-auto h-36 w-36 drop-shadow-md"
          role="img"
          aria-label="Chiếc đĩa DVD hình tròn"
        >
          {/* Thân đĩa DVD tròn xoe */}
          <circle cx="80" cy="80" r="64" fill="#cbd5e1" stroke="#64748b" strokeWidth="4" />
          <circle cx="80" cy="80" r="52" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Ánh cầu vồng phản quang */}
          <path d="M 40 40 Q 80 80 120 40" fill="none" stroke="#f472b6" strokeWidth="6" opacity="0.6" />
          <path d="M 40 120 Q 80 80 120 120" fill="none" stroke="#38bdf8" strokeWidth="6" opacity="0.6" />
          {/* Vòng trong và lỗ tròn tâm đĩa */}
          <circle cx="80" cy="80" r="22" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="80" cy="80" r="9" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        </svg>
      );

    case 'bánh xe đạp':
      return (
        <svg
          viewBox="0 0 160 160"
          className="mx-auto h-36 w-36 drop-shadow-md"
          role="img"
          aria-label="Bánh xe đạp hình tròn lăn được"
        >
          {/* Lốp xe cao su đen tròn */}
          <circle cx="80" cy="80" r="64" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
          {/* Vành xe kim loại tròn */}
          <circle cx="80" cy="80" r="54" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
          <circle cx="80" cy="80" r="48" fill="#f1f5f9" />
          {/* Các nan hoa xe đạp tỏa tròn đều */}
          <line x1="80" y1="32" x2="80" y2="128" stroke="#64748b" strokeWidth="1.5" />
          <line x1="32" y1="80" x2="128" y2="80" stroke="#64748b" strokeWidth="1.5" />
          <line x1="46" y1="46" x2="114" y2="114" stroke="#64748b" strokeWidth="1.5" />
          <line x1="46" y1="114" x2="114" y2="46" stroke="#64748b" strokeWidth="1.5" />
          {/* Trục bánh xe ở tâm */}
          <circle cx="80" cy="80" r="10" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <circle cx="80" cy="80" r="4" fill="#f8fafc" />
        </svg>
      );

    case 'chiếc bánh pizza tròn':
      return (
        <svg
          viewBox="0 0 160 160"
          className="mx-auto h-36 w-36 drop-shadow-md"
          role="img"
          aria-label="Chiếc bánh pizza hình tròn"
        >
          {/* Đế bánh viền vàng nâu tròn đều */}
          <circle cx="80" cy="80" r="64" fill="#d97706" stroke="#b45309" strokeWidth="4" />
          {/* Lớp phô mai vàng */}
          <circle cx="80" cy="80" r="54" fill="#fde047" stroke="#eab308" strokeWidth="2" />
          {/* Miếng xúc xích tròn đỏ */}
          <circle cx="60" cy="60" r="10" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <circle cx="102" cy="62" r="10" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <circle cx="80" cy="94" r="10" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <circle cx="62" cy="100" r="8" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          <circle cx="100" cy="98" r="8" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
          {/* Lá rau thơm xanh */}
          <circle cx="78" cy="68" r="4" fill="#16a34a" />
          <circle cx="92" cy="80" r="4" fill="#16a34a" />
          <circle cx="68" cy="82" r="4" fill="#16a34a" />
        </svg>
      );

    case 'chiếc bánh quy tròn':
      return (
        <svg
          viewBox="0 0 160 160"
          className="mx-auto h-36 w-36 drop-shadow-md"
          role="img"
          aria-label="Chiếc bánh quy hình tròn"
        >
          {/* Thân bánh quy tròn đều màu vàng bơ */}
          <circle cx="80" cy="80" r="62" fill="#fbbf24" stroke="#d97706" strokeWidth="4" />
          {/* Các lỗ chấm nhỏ trên mặt bánh quy */}
          <circle cx="80" cy="50" r="3" fill="#b45309" />
          <circle cx="80" cy="80" r="3.5" fill="#b45309" />
          <circle cx="80" cy="110" r="3" fill="#b45309" />
          <circle cx="50" cy="80" r="3" fill="#b45309" />
          <circle cx="110" cy="80" r="3" fill="#b45309" />
          <circle cx="60" cy="60" r="3" fill="#b45309" />
          <circle cx="100" cy="60" r="3" fill="#b45309" />
          <circle cx="60" cy="100" r="3" fill="#b45309" />
          <circle cx="100" cy="100" r="3" fill="#b45309" />
        </svg>
      );

    case 'biển báo giao thông':
      return (
        <svg
          viewBox="0 0 180 160"
          className="mx-auto h-36 w-42 drop-shadow-md"
          role="img"
          aria-label="Biển báo giao thông hình tam giác viền đỏ nền vàng"
        >
          {/* Tam giác viền đỏ ngoài cùng - 3 cạnh thẳng sắc nét */}
          <polygon
            points="90,14 16,146 164,146"
            fill="#ef4444"
            stroke="#b91c1c"
            strokeWidth="4"
            strokeLinejoin="miter"
          />
          {/* Tam giác nền vàng bên trong */}
          <polygon
            points="90,32 32,136 148,136"
            fill="#facc15"
            stroke="#ca8a04"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
          {/* Dấu chấm than cảnh báo màu đen ở giữa */}
          <rect x="85" y="56" width="10" height="44" rx="2" fill="#0f172a" />
          <circle cx="90" cy="116" r="6" fill="#0f172a" />
        </svg>
      );

    case 'chiếc thước ê-ke':
      return (
        <svg
          viewBox="0 0 180 160"
          className="mx-auto h-36 w-42 drop-shadow-md"
          role="img"
          aria-label="Chiếc thước ê-ke hình tam giác vuông có 3 cạnh"
        >
          {/* Thân thước tam giác vuông ngoài */}
          <polygon
            points="22,142 22,18 162,142"
            fill="#fef08a"
            stroke="#ca8a04"
            strokeWidth="3.5"
            strokeLinejoin="miter"
          />
          {/* Khoét rỗng tam giác bên trong */}
          <polygon
            points="42,126 42,54 122,126"
            fill="#f8fafc"
            stroke="#eab308"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
          {/* Vạch chia xăng-ti-mét dọc theo cạnh thẳng đứng */}
          <line x1="22" y1="36" x2="32" y2="36" stroke="#854d0e" strokeWidth="1.5" />
          <line x1="22" y1="56" x2="32" y2="56" stroke="#854d0e" strokeWidth="1.5" />
          <line x1="22" y1="76" x2="32" y2="76" stroke="#854d0e" strokeWidth="1.5" />
          <line x1="22" y1="96" x2="32" y2="96" stroke="#854d0e" strokeWidth="1.5" />
          <line x1="22" y1="116" x2="32" y2="116" stroke="#854d0e" strokeWidth="1.5" />
          {/* Vạch chia dọc theo cạnh nằm ngang */}
          <line x1="46" y1="142" x2="46" y2="132" stroke="#854d0e" strokeWidth="1.5" />
          <line x1="72" y1="142" x2="72" y2="132" stroke="#854d0e" strokeWidth="1.5" />
          <line x1="98" y1="142" x2="98" y2="132" stroke="#854d0e" strokeWidth="1.5" />
          <line x1="124" y1="142" x2="124" y2="132" stroke="#854d0e" strokeWidth="1.5" />
        </svg>
      );

    case 'chiếc lều cắm trại':
      return (
        <svg
          viewBox="0 0 180 160"
          className="mx-auto h-36 w-42 drop-shadow-md"
          role="img"
          aria-label="Chiếc lều cắm trại hình tam giác"
        >
          {/* Thân lều tam giác ngoài */}
          <polygon
            points="90,16 16,144 164,144"
            fill="#38bdf8"
            stroke="#0284c7"
            strokeWidth="4"
            strokeLinejoin="miter"
          />
          {/* Cửa lều tam giác mở ở giữa */}
          <polygon
            points="90,44 48,144 132,144"
            fill="#fbbf24"
            stroke="#d97706"
            strokeWidth="3"
            strokeLinejoin="miter"
          />
          {/* Lối vào màu tối hình tam giác */}
          <polygon
            points="90,74 62,144 118,144"
            fill="#1e293b"
            strokeLinejoin="miter"
          />
        </svg>
      );

    default:
      return null;
  }
}
