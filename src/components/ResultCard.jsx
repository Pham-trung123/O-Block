export function ResultCard() {
  return (
    <div className="bg-blue-50 p-5 rounded-xl shadow mb-4">
      <h3 className="font-bold text-indigo-700 mb-2">Kết Quả Phân Tích</h3>
      <p><b>Phân Tích Người Gửi:</b> Không liên kết ngân hàng hợp pháp</p>
      <p><b>Phân Tích Nội Dung:</b> Có dấu hiệu lừa đảo, yêu cầu cung cấp thông tin</p>
      <p className="mt-2 text-red-500 font-semibold">Rủi ro cao: 87/100</p>
    </div>
  );
}

export function TrainingData() {
  return (
    <div className="bg-blue-50 p-5 rounded-xl shadow">
      <h3 className="font-bold text-indigo-700 mb-2">Dữ Liệu Huấn Luyện AI</h3>
      <p>
        Mô hình được huấn luyện trên hơn <b>500.000 email</b> lừa đảo và hợp pháp.
      </p>
      <p className="text-amber-600 font-semibold mt-2">Độ tin cậy mô hình: 94%</p>
    </div>
  );
}
