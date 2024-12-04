import {
  Button,
  Col,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import React, { useState, useEffect } from "react";
import request, { request4s } from "~/utils/request";
import ModalSanPham from "./ModalSanPham";
import { DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { formatGiaTienVND } from "~/utils/formatResponse";
const { confirm } = Modal;
import { MdAddShoppingCart } from "react-icons/md";
import HinhAnhSanPham from "~/pages/shop/gio-hang/HinhAnhSanPham";

interface DataGioHang {
  key: React.Key;
  soLuong: number;
  nguoiTao: string;
  maHoaDon: string;
  chiTietSanPham: {
    sanPham: {
      ten: string;
    };
    kichCo: {
      kichCo: number;
    };
    mauSac: {
      ten: string;
    };
    diaHinhSan: {
      ten: string;
    };
    loaiDe: {
      ten: string;
    };
  };
}

interface TableSanPhamProps {
  id: number;
  passTotalPriceToParent: (price: number) => void;
}
const TableSanPham: React.FC<TableSanPhamProps> = ({
  id,
  passTotalPriceToParent,
}) => {
  const [dataGioHang, setDataGioHang] = useState<DataGioHang[]>([]); // Specify the data type
  const { confirm } = Modal;
  const [inputSoLuongList, setInputSoLuongList] = useState<Array<number>>([]);
  const { Text } = Typography;
  const [maxValueSL, setMaxValueSL] = useState(0);

  useEffect(() => {
    // Khởi tạo mảng inputSoLuongList với giá trị là số lượng sản phẩm trong giỏ hàng (thay vì 0)
    const initialSoLuongList = dataGioHang.map((item) => item.soLuong || 0);
    setInputSoLuongList(initialSoLuongList);
  }, [dataGioHang]);
  

  const tableGioHang: ColumnsType<DataGioHang> = [
    {
      title: "#1",
      dataIndex: "rowIndex",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Thông tin sản phẩm",
      dataIndex: "chiTietSanPham",
      key: "ten",
      align: "left",
      render: (chiTietSanPham, record) => (
        <Space>
          <HinhAnhSanPham chiTietSanPham={chiTietSanPham} />
          <Space direction="vertical">
            <Text strong>{chiTietSanPham.sanPham.ten}</Text>
            <Text>{`[${chiTietSanPham.mauSac.ten} - ${chiTietSanPham.kichCo.kichCo} - ${chiTietSanPham.loaiDe.ten} - ${chiTietSanPham.diaHinhSan.ten}]`}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Số Lượng",
      dataIndex: "soLuong",
      width: 60,
      render: (text, record, index) => {
        const khoHangSoLuong = record.chiTietSanPham.soLuong; // Lấy số lượng tồn kho
        const currentSoLuong = inputSoLuongList[index] !== undefined ? inputSoLuongList[index] : record.soLuong; // Lấy giá trị hiện tại
        console.log('Số lượng tồn kho:', khoHangSoLuong);
        console.log('Khởi tạo số lượng:', currentSoLuong);
        console.log('inputSoLuongList:', inputSoLuongList[index]);
        return (
          <InputNumber
            min={0}
            max={khoHangSoLuong} // Giới hạn tối đa là số lượng tồn kho
            style={{ width: 60 }}
            value={currentSoLuong} // Xử lý giá trị khởi tạo
            inputMode="numeric"
            onChange={(newSoLuong) => handleSoLuongChange(index, newSoLuong)} // Cập nhật khi thay đổi
          />
        );
      },
    }
,    
    
    
    
    {
      title: "Đơn giá",
      dataIndex: "donGia",
      render: (text, record) => formatGiaTienVND(record.chiTietSanPham.giaTien),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTien",
      render: (text, record) => formatGiaTienVND(record.tongTien),
    },
    {
      title: "Xóa",
      dataIndex: "",
      key: "",
      render: (item, record) => (
        <Button danger type="link" onClick={() => deleteHoaDonChiTiet(item.id)}>
          <Tooltip title="Xóa">
            <DeleteOutlined />
          </Tooltip>
        </Button>
      ),
    },
  ];
  useEffect(() => {
    console.log('Data from dataGioHang:', dataGioHang);
    const initialSoLuongList = dataGioHang.map((item) => item.soLuong || 0);
    setInputSoLuongList(initialSoLuongList);
  }, [dataGioHang]);
  

  const handleCapNhatGioHang = async (id, soLuong) => {
    console.log("Cập nhật sản phẩm:", id, "với số lượng mới:", soLuong); // Log kiểm tra

    try {
        const response = await request.put(`/hoa-don/hoa-don-chi-tiet/${id}`, {
            soLuong: soLuong
        });
        
        if (response.status === 200) {
            console.log("Phản hồi sau khi cập nhật số lượng:", response.data); // Log kết quả từ API
            getDataGioHang(); // Tải lại giỏ hàng sau khi cập nhật
        } else {
            throw new Error("Cập nhật số lượng thất bại");
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật giỏ hàng:", error); // Log lỗi
        message.error("Có lỗi xảy ra khi cập nhật giỏ hàng."); // Thêm thông báo lỗi cho người dùng
    }
  };
  const handleSoLuongChange = (index, newSoLuong) => {
    setInputSoLuongList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index] = newSoLuong; // Cập nhật số lượng mới cho chỉ số hiện tại
      return updatedList; // Trả về danh sách đã cập nhật
    });
  
    // Kiểm tra xem số lượng mới có vượt quá số lượng tồn kho không
    if (newSoLuong > record.chiTietSanPham.soLuong) {
      message.warning("Số lượng vượt quá số lượng tồn kho.");
    }
  };
  
  
  

  const passTotalPriceToParentCallback = (price) => {
    // Gọi hàm callback để truyền tổng tiền lên component cha
    passTotalPriceToParent(price);
  };

  // Thêm một useEffect để theo dõi sự thay đổi của dataGioHang và tính toán tổng tiền
  useEffect(() => {
    const total = dataGioHang.reduce((acc, item) => acc + item.tongTien, 0);
    passTotalPriceToParentCallback(total);
  }, [dataGioHang]);

  const deleteHoaDonChiTiet = async (idHoaDonChiTiet) => {
    confirm({
      title: "Xác Nhận",
      icon: <ExclamationCircleFilled />,
      content: "Bạn có chắc muốn xóa sản phẩm không?",
      okText: "OK",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await request.delete(`/hoa-don/${idHoaDonChiTiet}`);
          message.success("Đã xóa sản phẩm khỏi giỏ hàng");
          getDataGioHang();
        } catch (error) {
          console.error("Error deleting item:", error);
          // Handle errors, e.g., display an error message
        }
      },
    });
  };

  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getImage = async (idSanPham, idMauSac) => {
    try {
      const response = await request.get("hinh-anh-san-pham", {
        params: { idSanPham: idSanPham, idMauSac: idMauSac },
      });
      const image = response.data[0];
      if (image && image.duongDan) {
        return image.duongDan;
      } else {
        console.error("Invalid image data:", image);
        return ""; // Or handle this case as needed
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const getDataGioHang = async () => {
    try {
      const response = await request.get(`hoa-don/${id}`);
      const gioHangData = await Promise.all(
        response.data.hoaDonChiTietList.map(async (item) => {
          const donGia = item.chiTietSanPham.giaTien;
          const tongTien = donGia * item.soLuong;
          const idMauSac = item.chiTietSanPham.mauSac.id;
          const idSanPham = item.chiTietSanPham.sanPham.id;
          const duongDan = await getImage(idSanPham, idMauSac);

          return { ...item, donGia, tongTien, idSanPham, idMauSac, duongDan };
        })
      );
      setDataGioHang(gioHangData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    if (dataGioHang.length > 0) {
      setInputSoLuongList(dataGioHang.map((item) => item.soLuong || 0));
    } else {
      setInputSoLuongList([]);
    }
  }, [dataGioHang]);

  // Tính tổng giá trị sản phẩm và truyền về component cha
  useEffect(() => {
    const totalPrice = dataGioHang.reduce((total, item, index) => {
      return total + item.donGia * (inputSoLuongList[index] || 0);
    }, 0);
    passTotalPriceToParent(totalPrice);
  }, [inputSoLuongList, dataGioHang, passTotalPriceToParent]);  
  useEffect(() => {
    getDataGioHang();
  }, [id]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  return (
    <>
      <Table
        title={() => (
          <>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>Giỏ hàng</div>
            <Row>
              <Col span={10}></Col>
              <Col span={7}></Col>
              <Col span={7}>
                <Button
                  type="primary"
                  style={{ float: "right", marginBottom: 15 }}
                  onClick={showModal}
                >
                  <Space>Thêm Sản phẩm</Space>
                </Button>
              </Col>
            </Row>
            <ModalSanPham
              loadData={getDataGioHang}
              idHoaDon={id}
              isModalVisible={isModalVisible}
              setIsModalVisible={setIsModalVisible}
            />
          </>
        )}
        columns={tableGioHang}
        dataSource={dataGioHang}
      />
    </>
  );
};

export default TableSanPham;
