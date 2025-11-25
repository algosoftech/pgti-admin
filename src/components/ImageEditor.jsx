import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Modal, Button, Space, Slider, notification } from "antd";
import { CloseOutlined, CameraOutlined, UploadOutlined, CheckOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import "../pages/Admin/admin-pages.css";

const ImageEditor = ({ open, onClose, onSave, folder = "images" }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropSize, setCropSize] = useState({ width: 0, height: 0 });
  const [hasTransparency, setHasTransparency] = useState(false);
  const [originalFileType, setOriginalFileType] = useState("image/jpeg");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Check if image has transparency
  const checkTransparency = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          resolve(false);
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Check if any pixel has alpha < 255 (has transparency)
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      };
      img.onerror = () => resolve(false);
      img.src = imageSrc;
    });
  };

  // Handle file input change
  const handleFileChange = async (e, isCamera = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type || "image/jpeg";
      setOriginalFileType(fileType);
      
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result;
        setImageSrc(result);
        
        // Check if image has transparency (for PNG files)
        if (fileType === "image/png" || fileType === "image/webp") {
          const hasAlpha = await checkTransparency(result);
          setHasTransparency(hasAlpha);
        } else {
          setHasTransparency(false);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    if (isCamera) {
      e.target.value = "";
    } else {
      e.target.value = "";
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Handle file upload
  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle crop completion
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    setCropSize({
      width: Math.round(croppedArea.width),
      height: Math.round(croppedArea.height),
    });
  }, []);

  // Create image from cropped area
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  // Get cropped image as blob with rotation support
  const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, preserveTransparency = false) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { 
      willReadFrequently: false,
      alpha: preserveTransparency // Enable alpha channel for transparency
    });

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = pixelCrop.width * pixelRatio * scaleX;
    canvas.height = pixelCrop.height * pixelRatio * scaleY;

    // Clear canvas with transparent background if preserving transparency
    if (preserveTransparency) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      // Fill with white background for JPEG
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    // Handle rotation
    if (rotation !== 0) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      // Use PNG format if preserving transparency, otherwise JPEG
      const mimeType = preserveTransparency ? "image/png" : "image/jpeg";
      const quality = preserveTransparency ? undefined : 0.95;
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        mimeType,
        quality
      );
    });
  };

  // Compress image to max 2MB
  const compressImage = async (file, preserveTransparency = false) => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: preserveTransparency ? "image/png" : "image/jpeg",
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Compression error:", error);
      notification.error({
        message: "Compression Error",
        description: "Failed to compress image. Please try again.",
        placement: "topRight",
      });
      return file;
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      notification.error({
        message: "Error",
        description: "Please crop the image first.",
        placement: "topRight",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Get cropped blob with rotation, preserving transparency if needed
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, hasTransparency);
      
      // Determine file extension and MIME type based on transparency
      const fileExtension = hasTransparency ? "png" : "jpg";
      const mimeType = hasTransparency ? "image/png" : "image/jpeg";
      
      // Convert blob to file
      const croppedFile = new File([croppedBlob], `cropped-image.${fileExtension}`, {
        type: mimeType,
      });

      // Compress the cropped image, preserving transparency if needed
      const compressedFile = await compressImage(croppedFile, hasTransparency);

      // Check final file size
      const fileSizeMB = compressedFile.size / 1024 / 1024;
      if (fileSizeMB > 2) {
        notification.warning({
          message: "File Size Warning",
          description: `Image size is ${fileSizeMB.toFixed(2)}MB. Please crop to a smaller area.`,
          placement: "topRight",
        });
        setIsProcessing(false);
        return;
      }

      // Call onSave callback with the compressed file
      if (onSave) {
        await onSave(compressedFile);
      }

      // Reset state and close
      handleClose();
    } catch (error) {
      console.error("Error processing image:", error);
      notification.error({
        message: "Error",
        description: "Failed to process image. Please try again.",
        placement: "topRight",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setAspect(1);
    setCropSize({ width: 0, height: 0 });
    setHasTransparency(false);
    setOriginalFileType("image/jpeg");
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      title={
        <div className="d-flex justify-content-between align-items-center">
          <h3 style={{ margin: 0 }}>Edit Image</h3>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      className="image-editor-modal"
    >
      <div className="image-editor-container">
        {!imageSrc ? (
          <div className="image-editor-upload-section">
            <Space direction="vertical" size="large" style={{ width: "100%", textAlign: "center" }}>
              <div>
                <Button
                  type="primary"
                  size="large"
                  icon={<CameraOutlined />}
                  onClick={handleCameraCapture}
                  style={{ marginRight: 10 }}
                >
                  Capture from Camera
                </Button>
                <Button
                  type="default"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={handleFileUpload}
                >
                  Upload from Device
                </Button>
              </div>
              <p style={{ color: "#666", marginTop: 20 }}>
                Select an image to crop and compress (max 2MB)
              </p>
            </Space>
          </div>
        ) : (
          <div className="image-editor-crop-section">
            <div className="crop-container">
              <div className="crop-instructions">
                <p>💡 <strong>Mouse Controls:</strong> Click and drag to move crop area • Drag corners/edges to resize • Scroll to zoom</p>
              </div>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                {...(aspect !== 0 && { aspect })}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
                restrictPosition={true}
                minZoom={0.5}
                maxZoom={5}
                style={{
                  containerStyle: {
                    cursor: 'move',
                  },
                  cropAreaStyle: {
                    cursor: 'move',
                    border: '3px solid #3b82f6',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                  },
                }}
              />
              {cropSize.width > 0 && cropSize.height > 0 && (
                <div className="crop-size-info">
                  Crop Size: {cropSize.width} × {cropSize.height}px
                </div>
              )}
            </div>
            <div className="crop-controls">
              <div className="control-group">
                <label>Zoom ({zoom.toFixed(1)}x)</label>
                <Slider
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={zoom}
                  onChange={setZoom}
                  style={{ width: "100%", maxWidth: 300 }}
                />
                <div className="slider-actions">
                  <Button size="small" onClick={() => setZoom(Math.max(0.5, zoom - 0.5))}>-</Button>
                  <Button size="small" onClick={() => setZoom(1)}>Reset</Button>
                  <Button size="small" onClick={() => setZoom(Math.min(5, zoom + 0.5))}>+</Button>
                </div>
              </div>
              
              <div className="control-group">
                <label>Rotation ({rotation}°)</label>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={rotation}
                  onChange={setRotation}
                  style={{ width: "100%", maxWidth: 300 }}
                />
                <div className="slider-actions">
                  <Button size="small" onClick={() => setRotation((rotation - 90 + 360) % 360)}>↺ -90°</Button>
                  <Button size="small" onClick={() => setRotation(0)}>Reset</Button>
                  <Button size="small" onClick={() => setRotation((rotation + 90) % 360)}>↻ +90°</Button>
                </div>
              </div>

              <div className="control-group">
                <label>Aspect Ratio</label>
                <Space wrap>
                  <Button
                    size="small"
                    type={aspect === 1 ? "primary" : "default"}
                    onClick={() => setAspect(1)}
                  >
                    1:1
                  </Button>
                  <Button
                    size="small"
                    type={aspect === 0.5 ? "primary" : "default"}
                    onClick={() => setAspect(0.5)}
                  >
                    1:2
                  </Button>
                  <Button
                    size="small"
                    type={aspect === 16 / 9 ? "primary" : "default"}
                    onClick={() => setAspect(16 / 9)}
                  >
                    16:9
                  </Button>
                  <Button
                    size="small"
                    type={aspect === 4 / 3 ? "primary" : "default"}
                    onClick={() => setAspect(4 / 3)}
                  >
                    4:3
                  </Button>
                  <Button
                    size="small"
                    type={aspect === 3 / 4 ? "primary" : "default"}
                    onClick={() => setAspect(3 / 4)}
                  >
                    3:4
                  </Button>
                  <Button
                    size="small"
                    type={aspect === 0 ? "primary" : "default"}
                    onClick={() => setAspect(0)}
                  >
                    Free
                  </Button>
                </Space>
              </div>
            </div>
            <div className="image-editor-actions">
              <Space>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => setImageSrc(null)}>Change Image</Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={handleSave}
                  loading={isProcessing}
                >
                  Save & Upload
                </Button>
              </Space>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e, true)}
        />
      </div>
    </Modal>
  );
};

export default ImageEditor;

