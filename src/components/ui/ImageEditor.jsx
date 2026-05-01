import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Modal, Button, Space, Slider, notification } from "antd";
import { CameraOutlined, UploadOutlined, CheckOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import "styles/admin-pages.css";

const parseRecommendedAspect = (recommended = "") => {
  const match = String(recommended).match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!match) return null;

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return null;

  return {
    ratio: width / height,
    label: `Recommended (${width}:${height})`,
  };
};

const ImageEditor = ({ open, onClose, onSave, initialFile = null, spec = null }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropSize, setCropSize] = useState({ width: 0, height: 0 });
  const [hasTransparency, setHasTransparency] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const recommendedAspect = parseRecommendedAspect(spec?.recommended);

  useEffect(() => {
    if (!open) return;
    setAspect(recommendedAspect?.ratio || 1);
  }, [open, recommendedAspect]);

  useEffect(() => {
    if (!open || !initialFile) return;

    const fileType = initialFile.type || "image/jpeg";
    const reader = new FileReader();

    reader.onload = async () => {
      const result = reader.result;
      setImageSrc(result);
      if (fileType === "image/png" || fileType === "image/webp") {
        setHasTransparency(await checkTransparency(result));
      } else {
        setHasTransparency(false);
      }
    };

    reader.readAsDataURL(initialFile);
  }, [open, initialFile]);

  const checkTransparency = (source) =>
    new Promise((resolve) => {
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
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            resolve(true);
            return;
          }
        }
        resolve(false);
      };
      img.onerror = () => resolve(false);
      img.src = source;
    });

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const fileType = file.type || "image/jpeg";
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result;
      setImageSrc(result);
      if (fileType === "image/png" || fileType === "image/webp") {
        setHasTransparency(await checkTransparency(result));
      } else {
        setHasTransparency(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea, nextPixels) => {
    setCroppedAreaPixels(nextPixels);
    setCropSize({
      width: Math.round(croppedArea.width),
      height: Math.round(croppedArea.height),
    });
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", reject);
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getCroppedImg = async (source, pixelCrop, nextRotation = 0, preserveTransparency = false) => {
    const image = await createImage(source);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      willReadFrequently: false,
      alpha: preserveTransparency,
    });

    if (!ctx) throw new Error("No 2d context");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = pixelCrop.width * pixelRatio * scaleX;
    canvas.height = pixelCrop.height * pixelRatio * scaleY;

    if (preserveTransparency) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    if (nextRotation !== 0) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((nextRotation * Math.PI) / 180);
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
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve(blob);
        },
        preserveTransparency ? "image/png" : "image/jpeg",
        preserveTransparency ? undefined : 0.95
      );
    });
  };

  const compressImage = async (file, preserveTransparency = false) => {
    try {
      return await imageCompression(file, {
        maxSizeMB: spec?.maxMB || 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: preserveTransparency ? "image/png" : "image/jpeg",
      });
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

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      notification.error({
        message: "Image Required",
        description: "Please select and crop an image before saving.",
        placement: "topRight",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation, hasTransparency);
      const extension = hasTransparency ? "png" : "jpg";
      const type = hasTransparency ? "image/png" : "image/jpeg";
      const croppedFile = new File([croppedBlob], `cropped-image.${extension}`, { type });
      const compressedFile = await compressImage(croppedFile, hasTransparency);

      const maxMb = spec?.maxMB || 2;
      const fileSizeMB = compressedFile.size / 1024 / 1024;
      if (fileSizeMB > maxMb) {
        notification.warning({
          message: "Image Too Large",
          description: `The edited image is ${fileSizeMB.toFixed(2)} MB. Please crop a smaller area or choose a lighter image. Maximum allowed is ${maxMb} MB.`,
          placement: "topRight",
        });
        setIsProcessing(false);
        return;
      }

      if (onSave) {
        await onSave(compressedFile);
      }

      handleClose();
    } catch (error) {
      console.error("Error processing image:", error);
      notification.error({
        message: "Edit Failed",
        description: "The image could not be processed. Please try again.",
        placement: "topRight",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setAspect(recommendedAspect?.ratio || 1);
    setCropSize({ width: 0, height: 0 });
    setHasTransparency(false);
    onClose?.();
  };

  return (
    <Modal
      title={<h3 style={{ margin: 0 }}>Edit Image</h3>}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={840}
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
                  onClick={() => cameraInputRef.current?.click()}
                  style={{ marginRight: 10 }}
                >
                  Capture from Camera
                </Button>
                <Button
                  type="default"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload from Device
                </Button>
              </div>
              <p style={{ color: "#475569", marginTop: 20 }}>
                Upload an image, then crop, zoom, rotate, and save it before it is uploaded.
              </p>
            </Space>
          </div>
        ) : (
          <div className="image-editor-crop-section">
            <div className="crop-container">
              <div className="crop-instructions">
                <p>
                  Drag the crop area to reposition it, resize it from the edges, then use zoom or rotation if
                  you need finer control before saving.
                </p>
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
                showGrid
                restrictPosition
                minZoom={0.5}
                maxZoom={5}
                style={{
                  containerStyle: { cursor: "move" },
                  cropAreaStyle: {
                    cursor: "move",
                    border: "3px solid #3b82f6",
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                  },
                }}
              />
              {cropSize.width > 0 && cropSize.height > 0 && (
                <div className="crop-size-info">
                  Crop Size: {cropSize.width} x {cropSize.height}px
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
                  <Button size="small" onClick={() => setRotation((rotation - 90 + 360) % 360)}>Rotate -90°</Button>
                  <Button size="small" onClick={() => setRotation(0)}>Reset</Button>
                  <Button size="small" onClick={() => setRotation((rotation + 90) % 360)}>Rotate +90°</Button>
                </div>
              </div>

              <div className="control-group">
                <label>Aspect Ratio</label>
                <Space wrap>
                  {recommendedAspect && (
                    <Button
                      size="small"
                      type={aspect === recommendedAspect.ratio ? "primary" : "default"}
                      onClick={() => setAspect(recommendedAspect.ratio)}
                    >
                      {recommendedAspect.label}
                    </Button>
                  )}
                  <Button size="small" type={aspect === 1 ? "primary" : "default"} onClick={() => setAspect(1)}>1:1</Button>
                  <Button size="small" type={aspect === 0.5 ? "primary" : "default"} onClick={() => setAspect(0.5)}>1:2</Button>
                  <Button size="small" type={aspect === 16 / 9 ? "primary" : "default"} onClick={() => setAspect(16 / 9)}>16:9</Button>
                  <Button size="small" type={aspect === 4 / 3 ? "primary" : "default"} onClick={() => setAspect(4 / 3)}>4:3</Button>
                  <Button size="small" type={aspect === 3 / 4 ? "primary" : "default"} onClick={() => setAspect(3 / 4)}>3:4</Button>
                  <Button size="small" type={aspect === 0 ? "primary" : "default"} onClick={() => setAspect(0)}>Free</Button>
                </Space>
              </div>
            </div>

            <div className="image-editor-actions">
              <Space>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => setImageSrc(null)}>Change Image</Button>
                <Button type="primary" icon={<CheckOutlined />} onClick={handleSave} loading={isProcessing}>
                  Save & Upload
                </Button>
              </Space>
            </div>
          </div>
        )}

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
          onChange={handleFileChange}
        />
      </div>
    </Modal>
  );
};

export default ImageEditor;
