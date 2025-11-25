import React, { useEffect, useState, useRef } from "react";
import { Modal, notification, Button, Space, Input } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  SearchOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { list, uploadImage, deleteImage } from "../controllers/V1/clipArtController";
import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import ImageEditor from "./ImageEditor";
import "../pages/Admin/admin-pages.css";

const { Search } = Input;

const ClipArtPicker = ({ open, onClose, onSelect, selectedImage, folder = "images" }) => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const limit = 20;

  // Fetch images
  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const result = await list({
        type: "",
        condition: {},
        skip: (currentPage - 1) * limit,
        limit: limit,
      });
      
      if (result.status === true && result.result) {
        setImages(result.result);
        setFilteredImages(result.result);
        setTotalPages(Math.ceil((result.count || 0) / limit));
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      notification.open({
        message: "Oops!",
        description: "Failed to load images. Please try again.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchImages();
      setSearchTerm("");
    }
  }, [open, currentPage]);

  // Filter images based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredImages(images);
    } else {
      const filtered = images.filter((img) =>
        img.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredImages(filtered);
    }
  }, [searchTerm, images]);

  // Handle image upload from ImageEditor
  const handleImageSave = async (file) => {
    try {
      setUploading(true);
      const result = await uploadImage(file, folder);
      
      if (result.status === true) {
        notification.open({
          message: "Success",
          description: "Image uploaded successfully!",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        // Refresh images list
        await fetchImages();
      } else {
        notification.open({
          message: "Oops!",
          description: result.message || "Failed to upload image.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      notification.open({
        message: "Oops!",
        description: "Failed to upload image. Please try again.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle image delete with confirmation
  const handleDelete = (imageUrl, e) => {
    e.stopPropagation();
    
    Modal.confirm({
      title: "Delete Image",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: "Are you sure you want to delete this image? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await deleteImage(imageUrl);
          
          if (result.status === true) {
            notification.open({
              message: "Success",
              description: "Image deleted successfully!",
              placement: "topRight",
              icon: <CheckCircleOutlined style={{ color: "green" }} />,
              duration: 2,
            });
            // Refresh images list
            await fetchImages();
          } else {
            notification.open({
              message: "Oops!",
              description: result.message || "Failed to delete image.",
              placement: "topRight",
              icon: <InfoCircleOutlined style={{ color: "red" }} />,
              duration: 2,
            });
          }
        } catch (error) {
          console.error("Delete error:", error);
          notification.open({
            message: "Oops!",
            description: "Failed to delete image. Please try again.",
            placement: "topRight",
            icon: <InfoCircleOutlined style={{ color: "red" }} />,
            duration: 2,
          });
        }
      },
    });
  };

  const API_K_WINN_URL = process.env.REACT_APP_API_BASE_URL;

  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    if (image?.url) {
      // If URL is relative, prepend API base URL
      if (image.url.startsWith('./') || image.url.startsWith('/')) {
        return `${image.url.replace('./', '')}`;
      }
      return image.url;
    }
    return null;
  };

  // Handle image selection
  const handleSelect = (image) => {
    if (onSelect) {
      const imageUrl = getImageUrl(image);
      onSelect(imageUrl || image.url || image);
    }
  };


  return (
    <Modal
      title={
        <div className="d-flex justify-content-between align-items-center">
          <h3 style={{ margin: 0, textAlign: "center" }}>Select Image</h3>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      className="clipart-picker-modal"
    >
      <div className="clipart-picker-container">
        {/* Search and Upload Section */}
        <div className="clipart-picker-header">
          <Search
            placeholder="Search images..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", maxWidth: "400px" }}
            prefix={<SearchOutlined />}
          />
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={() => setImageEditorOpen(true)}
          >
            Upload New Image
          </Button>
        </div>

        {/* Images Grid */}
        <div className="clipart-picker-grid">
          {isLoading ? (
            <div className="clipart-picker-loading">
              <div className="loading-spinner"></div>
              <p>Loading images...</p>
            </div>
          ) : filteredImages.length > 0 ? (
            filteredImages.map((image, index) => {
              const imageUrl = getImageUrl(image);
              const isSelected = selectedImage === imageUrl || selectedImage === image?.url || selectedImage === image?.url;
              
              return (
                <div
                  key={image.id || index}
                  className={`clipart-picker-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(image)}
                >
                  <div className="clipart-picker-item-overlay">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      className="clipart-picker-select-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(image);
                        onClose();
                      }}
                    >
                      Select
                    </Button>
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      className="clipart-picker-delete-btn"
                      onClick={(e) => handleDelete(image.url || imageUrl, e)}
                    >
                      Delete
                    </Button>
                  </div>
                  {imageUrl && (
                    <img
                      src={`${process.env.REACT_APP_IMAGE_BASE_URL}${imageUrl}`}
                      alt={image.name || "Image"}
                      className="clipart-picker-image"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  {isSelected && (
                    <div className="clipart-picker-selected-badge">
                      <CheckOutlined />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="clipart-picker-empty">
              <p>No images found</p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="clipart-picker-pagination">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Image Editor Modal */}
      <ImageEditor
        open={imageEditorOpen}
        onClose={() => setImageEditorOpen(false)}
        onSave={handleImageSave}
        folder={folder}
      />
    </Modal>
  );
};

export default ClipArtPicker;

