"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useItems } from "@/context/ItemsContext";

export default function ReportModal({ isOpen, onClose }) {
  const { createItem, addToast } = useItems();
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [charLen, setCharLen] = useState(0);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const uploadAreaRef = useRef(null);

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(null);
      setCharLen(0);
      setErrors({});
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // ── Validation ──
  function validateField(name, value) {
    if (!value || !value.trim()) return "This field is required.";
    if (name === "contact") {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      const phoneOk = /^[\d\s+\-()\u0900-\u097F]{7,15}$/.test(value.trim());
      if (!emailOk && !phoneOk) return "Enter a valid email or phone number.";
    }
    return "";
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  // ── Image handling ──
  function handleImageFile(file) {
    if (file.size > 5 * 1024 * 1024) {
      addToast("Image must be under 5 MB.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
  }

  function clearImage() {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Drag & Drop ──
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    uploadAreaRef.current?.classList.add("dragover");
  }, []);

  const handleDragLeave = useCallback(() => {
    uploadAreaRef.current?.classList.remove("dragover");
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      uploadAreaRef.current?.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        // Assign dropped file to the file input
        const dt = new DataTransfer();
        dt.items.add(file);
        if (fileInputRef.current) fileInputRef.current.files = dt.files;
        handleImageFile(file);
      } else {
        addToast("Please drop a valid image file.", "error");
      }
    },
    [addToast]
  );

  // ── Submit ──
  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.itemName.value;
    const contact = form.itemContact.value;
    const location = form.itemLocation.value;

    // Validate required fields
    const newErrors = {};
    const nameErr = validateField("name", name);
    if (nameErr) newErrors.name = nameErr;
    const contactErr = validateField("contact", contact);
    if (contactErr) newErrors.contact = contactErr;
    const locationErr = validateField("location", location);
    if (locationErr) newErrors.location = locationErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("Please fix the errors above.", "error");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("status", form.itemStatus.value);
    formData.append("category", form.itemCategory.value);
    formData.append("location", location.trim());
    formData.append("date", form.itemDate.value);
    formData.append("contact", contact.trim());
    formData.append("description", form.itemDescription.value.trim());

    const file = fileInputRef.current?.files[0];
    if (file) formData.append("image", file);

    try {
      await createItem(formData);
      form.reset();
      clearImage();
      setCharLen(0);
      setErrors({});
      onClose();
    } catch {
      addToast("Failed to post. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <div className="modal-top">
          <h2 id="modalTitle">Report an Item</h2>
          <button className="close-btn" aria-label="Close modal" onClick={onClose}>
            &times;
          </button>
        </div>
        <form id="itemForm" noValidate onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemName">
                Item Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="itemName"
                name="name"
                required
                placeholder="e.g. Blue Wallet"
                maxLength={80}
                className={errors.name ? "invalid" : ""}
                onBlur={handleBlur}
              />
              <span className="field-error">{errors.name || ""}</span>
            </div>
            <div className="form-group">
              <label htmlFor="itemStatus">
                Status <span className="required">*</span>
              </label>
              <select id="itemStatus" name="status" required>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemCategory">
                Category <span className="required">*</span>
              </label>
              <select id="itemCategory" name="category" required>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Books">Books</option>
                <option value="IDs & Cards">IDs &amp; Cards</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="itemContact">
                Contact <span className="required">*</span>
              </label>
              <input
                type="text"
                id="itemContact"
                name="contact"
                required
                placeholder="Email or Phone"
                className={errors.contact ? "invalid" : ""}
                onBlur={handleBlur}
              />
              <span className="field-error">{errors.contact || ""}</span>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="itemLocation">
                Location <span className="required">*</span>
              </label>
              <input
                type="text"
                id="itemLocation"
                name="location"
                required
                placeholder="e.g. Main Canteen"
                className={errors.location ? "invalid" : ""}
                onBlur={handleBlur}
              />
              <span className="field-error">{errors.location || ""}</span>
            </div>
            <div className="form-group">
              <label htmlFor="itemDate">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="itemDate"
                name="date"
                required
                defaultValue={today}
              />
            </div>
          </div>
          <div className="form-group full">
            <label htmlFor="itemDescription">Description</label>
            <textarea
              id="itemDescription"
              name="description"
              rows={3}
              placeholder="Describe the item (color, brand, marks)..."
              maxLength={300}
              onChange={(e) => setCharLen(e.target.value.length)}
            />
            <span
              className={`char-count${charLen > 255 ? " warn" : ""}${charLen >= 300 ? " over" : ""}`}
            >
              {charLen} / 300
            </span>
          </div>
          <div className="form-group full">
            <label>
              Image <span className="optional">(Optional)</span>
            </label>
            <div
              ref={uploadAreaRef}
              className="upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                aria-label="Upload item image"
                onChange={handleFileChange}
              />
              <div className="upload-content">
                <span className="upload-icon">📷</span>
                <p>
                  Click or <strong>drag &amp; drop</strong> to upload
                </p>
                <span className="upload-hint">PNG, JPG, WEBP up to 5 MB</span>
              </div>
            </div>
            {previewUrl && (
              <div
                className="img-preview"
                style={{ backgroundImage: `url('${previewUrl}')` }}
              >
                <button
                  type="button"
                  className="clear-img-btn"
                  title="Remove image"
                  onClick={clearImage}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
          >
            <span>{submitting ? "Submitting..." : "Submit Report"}</span>
            {submitting && <span className="btn-spinner" />}
          </button>
        </form>
      </div>
    </div>
  );
}
