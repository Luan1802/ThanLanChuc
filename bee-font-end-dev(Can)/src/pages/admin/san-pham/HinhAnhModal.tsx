import ImgCrop from "antd-img-crop";
import React, { useState, useEffect } from "react";
import { Modal, Spin, Upload, message } from "antd";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import request, { request4s } from "~/utils/request";
import { PictureOutlined, PlusOutlined } from "@ant-design/icons";

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
function HinhAnhModal({ openModal, closeModal, mauSac, sanPham }) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fakeList, setFakeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const loadImages = async (mauSac) => {
    setLoading(true);
    setFileList([]);
    setFakeList([]);
    try {
      const res = await request4s.get("hinh-anh-san-pham", {
        params: { idSanPham: sanPham, idMauSac: mauSac.id },
      });

      const newFileList = res.data.map((item) => ({
        status: "done",
        url: `http://localhost:8081/admin/api/file/view/${item.duongDan}`,
      }));

      setFileList(newFileList);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      message.error("Lấy dữ liệu hình ảnh thất bại");
    }
  };

  useEffect(() => {
    console.log(mauSac);

    if (openModal === true) {
      loadImages(mauSac);
    }
  }, [openModal, mauSac]);
  const onChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    const newFakeList = newFileList
      .filter((item) => item.response) // Lọc những mục có response
      .map((item) => ({
        sanPham: {
          id: sanPham,
        },
        mauSac: {
          id: mauSac.id,
        },
        duongDan: item.response,
      }));

    setFakeList(newFakeList);
    setFileList(newFileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };
  const onRemove = (file: UploadFile) => {
    request    
      .delete(`file/delet/${file.response}`)
      .then((response) => {        
        
        if (response.status === 200) {
          setFileList(
            fileList.filter((item) => item.response !== file.response)
          );
        } else {
          message.error("Xóa ảnh thất bại");
        }
      })
      .catch((error) => {
        message.error("Xóa ảnh thất bạiiiii");
        console.error(error);
      });
  };
  const handleCancel = () => {
    setPreviewOpen(false);
  };
  const okModal = async () => {
    if (fakeList.length !== 0) {
      try {
        await request.post("hinh-anh-san-pham", fakeList, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        message.success("Thêm ảnh thành công");
        closeModal();
      } catch (error) {
        message.error("Thêm ảnh thất bại");
        console.log(error);
      }
    } else {
      message.warning("Vui lòng tải ảnh lên để thêm");
    }
  };
  return (
    <Spin spinning={loading}>
      <Modal
        title={`HÌNH ẢNH SẢN PHẨM`}
        open={openModal}
        onCancel={closeModal}
        okText={
          <span>
            <PictureOutlined style={{ marginRight: 5 }} />
            THÊM ẢNH
          </span>
        }
        cancelText="Hủy"
        onOk={okModal}
        width={600}
      >
        <ImgCrop rotationSlider>
          <Upload
            action="http://localhost:8081/admin/api/file/upload"
            listType="picture-card"
            fileList={fileList}
            onChange={onChange}
            onPreview={handlePreview}
            onRemove={onRemove}
            accept=".png,.jpg,.gif"
          >
            {fileList.length >= 5 ? null : (
              <div>
                <PlusOutlined style={{ fontSize: 20 }} />
                <div style={{ marginTop: 5 }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
        </ImgCrop>
        <Modal
          width={617}
          style={{ top: 20 }}
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={handleCancel}
        >
          <img alt="example" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      </Modal>
    </Spin>
  );
}
export default HinhAnhModal;
