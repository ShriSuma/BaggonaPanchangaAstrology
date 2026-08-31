import React, { useState, useEffect } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import {
  useSankalpaStore,
  SANKALPA_PRESETS,
  type SankalpaPreset
} from "../../features/sankalpa/sankalpaStore";
import type { SankalpaCategory, UserSankalpaRecord } from "../../db/indexedDb";

export interface ManageSankalpaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  devoteeName?: string;
  lang?: SevaLang;
  onOpenPooja?: () => void;
}

export const ManageSankalpaModal: React.FC<ManageSankalpaModalProps> = ({
  isOpen,
  onClose,
  userId = "devotee_default",
  devoteeName = "ಭಕ್ತ",
  lang = "kn",
  onOpenPooja
}) => {
  const {
    sankalpas,
    loadSankalpas,
    createSankalpa,
    updateSankalpa,
    deleteSankalpa,
    toggleSankalpaActive
  } = useSankalpaStore();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<SankalpaCategory>("aarogya");
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [sanskritInput, setSanskritInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      void loadSankalpas(userId, devoteeName);
    }
  }, [isOpen, userId, devoteeName]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPreset = (preset: SankalpaPreset) => {
    setSelectedCategory(preset.category);
    setTitleInput(preset.titleKn);
    setDescInput(preset.descriptionKn);
    setSanskritInput(preset.sanskritPhrasing);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      showToast("ದಯವಿಟ್ಟು ಸಂಕಲ್ಪದ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ (Please enter title)");
      return;
    }

    if (editingId) {
      await updateSankalpa(editingId, {
        category: selectedCategory,
        title: titleInput.trim(),
        description: descInput.trim(),
        sanskritPhrasing: sanskritInput.trim() || "ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ"
      });
      showToast("ಸಂಕಲ್ಪ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ (Updated)!");
      setEditingId(null);
    } else {
      await createSankalpa(userId, {
        category: selectedCategory,
        title: titleInput.trim(),
        description: descInput.trim(),
        sanskritPhrasing: sanskritInput.trim() || "ಸಮಸ್ತ ಮನೋರಥ ಸಿದ್ಧ್ಯರ್ಥಂ",
        isActive: true,
        devoteeName
      });
      showToast("ಹೊಸ ಸಂಕಲ್ಪ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ (Created)!");
      setIsAddingNew(false);
    }

    // Reset Form
    setTitleInput("");
    setDescInput("");
    setSanskritInput("");
  };

  const handleStartEdit = (sankalpa: UserSankalpaRecord) => {
    setEditingId(sankalpa.id);
    setIsAddingNew(true);
    setSelectedCategory(sankalpa.category);
    setTitleInput(sankalpa.title);
    setDescInput(sankalpa.description);
    setSanskritInput(sankalpa.sanskritPhrasing || "");
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingId(null);
    setTitleInput("");
    setDescInput("");
    setSanskritInput("");
  };

  if (!isOpen) return null;

  const activeCount = sankalpas.filter((s) => s.isActive).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(12, 6, 2, 0.88)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #FFFDF7 0%, #FFF8E7 100%)",
          border: "2.5px solid #F59E0B",
          borderRadius: 24,
          maxWidth: 680,
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(245, 158, 11, 0.25)",
          overflow: "hidden",
          color: "#1C1917"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #78350F 0%, #451A03 100%)",
            borderBottom: "2px solid #F59E0B",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>📜</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "#FEF3C7" }}>
                {lang === "kn" ? "ವೈಯಕ್ತಿಕ ದೈವಿಕ ಸಂಕಲ್ಪಗಳ ನಿರ್ವಹಣೆ" :
                 lang === "hi" ? "व्यक्तिगत वैदिक संकल्प प्रबंधन" :
                 lang === "te" ? "వ్యక్తిగత వైదిక సంకల్పాల నిర్వహణ" :
                 lang === "ta" ? "தனிப்பட்ட வைதீக சங்கல்ப மேலாண்மை" :
                 "Manage Personal Vedic Sankalpas"}
              </h2>
              <p style={{ margin: 0, fontSize: 11.5, color: "#FDE68A", marginTop: 2 }}>
                {lang === "kn" ? "೩-೫ ನಿಮಿಷಗಳ ನಿತ್ಯ ಪೂಜೆಯಲ್ಲಿ ಈ ಸಂಕಲ್ಪಗಳು ನೇರವಾಗಿ ಮಂತ್ರದಲ್ಲಿ ಸೇರ್ಪಡೆಯಾಗುತ್ತವೆ" :
                 "These active prayers will be dynamically chanted in your 3-5 Min Daily Vedic Pooja"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(253, 230, 138, 0.4)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              color: "#FEF3C7",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div
            style={{
              background: "#065F46",
              color: "#ECFDF5",
              padding: "8px 16px",
              fontSize: 12.5,
              fontWeight: 800,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6
            }}
          >
            <span>✅</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Scrollable Body */}
        <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Summary / Stats Card */}
          <div
            style={{
              background: "#FFFBEB",
              border: "1.5px solid #FCD34D",
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12
            }}
          >
            <div>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "#92400E" }}>
                {lang === "kn" ? `ಒಟ್ಟು ಸಂಕಲ್ಪಗಳು: ${sankalpas.length} · ಇಂದಿನ ಪೂಜೆಯಲ್ಲಿ ಸಕ್ರಿಯ: ${activeCount}` :
                 `Total Sankalpas: ${sankalpas.length} · Active in Today's Pooja: ${activeCount}`}
              </span>
              <div style={{ fontSize: 11.5, color: "#B45309", marginTop: 2 }}>
                {lang === "kn" ? "✔️ ಗುರುತು ಹಾಕಲಾದ (Active) ಸಂಕಲ್ಪಗಳು ಮಾತ್ರ ಇಂದಿನ ಪೂಜಾ ಮಂತ್ರದಲ್ಲಿ ಪಠಣವಾಗುತ್ತವೆ." :
                 "Checked items will be recited by the priest in your daily morning Sankalpa."}
              </div>
            </div>
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(true);
                  setEditingId(null);
                  handleSelectPreset(SANKALPA_PRESETS[0]);
                }}
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  color: "#1C0A00",
                  border: "1.5px solid #FDE68A",
                  borderRadius: 12,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 900,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)"
                }}
              >
                <span>➕</span>
                <span>{lang === "kn" ? "ಹೊಸ ಸಂಕಲ್ಪ ಸೇರಿಸಿ" : "Add New Sankalpa"}</span>
              </button>
            )}
          </div>

          {/* Add / Edit Form */}
          {isAddingNew && (
            <form
              onSubmit={handleSave}
              style={{
                background: "#FEF3C7",
                border: "2px solid #F59E0B",
                borderRadius: 18,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                boxShadow: "0 4px 16px rgba(180, 83, 9, 0.15)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #FDE68A", paddingBottom: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 900, color: "#78350F" }}>
                  {editingId ? (lang === "kn" ? "✏️ ಸಂಕಲ್ಪ ತಿದ್ದುಪಡಿ (Edit Sankalpa)" : "✏️ Edit Sankalpa") :
                               (lang === "kn" ? "✨ ಹೊಸ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಸೇರಿಸಿ (Create Sankalpa)" : "✨ Add New Sankalpa")}
                </span>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  style={{ background: "none", border: "none", color: "#92400E", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                >
                  {lang === "kn" ? "ರದ್ದುಮಾಡಿ (Cancel)" : "Cancel"}
                </button>
              </div>

              {/* Presets Quick Picker */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#92400E", marginBottom: 6 }}>
                  {lang === "kn" ? "೧. ಶಾಸ್ತ್ರೋಕ್ತ ವರ್ಗವನ್ನು ಆರಿಸಿ (Quick Presets):" : "1. Choose Vedic Category:"}
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SANKALPA_PRESETS.map((preset) => {
                    const isSelected = selectedCategory === preset.category;
                    return (
                      <button
                        key={preset.category}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        style={{
                          background: isSelected ? "#78350F" : "#FFFDF7",
                          color: isSelected ? "#FEF3C7" : "#78350F",
                          border: isSelected ? "1.5px solid #F59E0B" : "1px solid #FCD34D",
                          borderRadius: 20,
                          padding: "5px 10px",
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span>{preset.icon}</span>
                        <span>{lang === "kn" ? preset.titleKn : preset.titleEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#92400E", marginBottom: 4 }}>
                  {lang === "kn" ? "೨. ಸಂಕಲ್ಪದ ಶೀರ್ಷಿಕೆ (Sankalpa Title):" : "2. Sankalpa Title:"}
                </label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder={lang === "kn" ? "ಉದಾ: ಕುಟುಂಬ ಆರೋಗ್ಯ & ಆಯುರ್ವೃದ್ಧಿ" : "e.g., Good Health & Long Life"}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: "#FFFFFF",
                    border: "1.5px solid #F59E0B",
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#1C1917",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Description Input */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#92400E", marginBottom: 4 }}>
                  {lang === "kn" ? "೩. ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪ್ರಾರ್ಥನಾ ವಿವರ (Devotional Prayer Details):" : "3. Devotional Prayer Details:"}
                </label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder={lang === "kn" ? "ನನ್ನ ಕುಟುಂಬದ ಸಮಸ್ತ ಸದಸ್ಯರಿಗೆ ಸಕಲ ಸುಖ-ಶಾಂತಿ, ಆರೋಗ್ಯ ಲಭಿಸಲಿ..." : "Detailed prayer intention..."}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#FFFFFF",
                    border: "1.5px solid #FCD34D",
                    borderRadius: 10,
                    fontSize: 12,
                    color: "#1C1917",
                    boxSizing: "border-box",
                    resize: "vertical"
                  }}
                />
              </div>

              {/* Sanskrit Phrasing Input */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#92400E", marginBottom: 4 }}>
                  {lang === "kn" ? "೪. ಮಂತ್ರದಲ್ಲಿ ಪಠಣವಾಗುವ ಸಂಸ್ಕೃತ ವಾಕ್ಯ (Sanskrit Phrasing for Mantra):" : "4. Sanskrit Mantra Phrasing:"}
                </label>
                <input
                  type="text"
                  value={sanskritInput}
                  onChange={(e) => setSanskritInput(e.target.value)}
                  placeholder="ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    background: "#FFFFFF",
                    border: "1.5px solid #FCD34D",
                    borderRadius: 10,
                    fontSize: 12,
                    fontStyle: "italic",
                    color: "#78350F",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Save Button */}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  style={{
                    background: "#E5E7EB",
                    color: "#374151",
                    border: "none",
                    borderRadius: 10,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer"
                  }}
                >
                  {lang === "kn" ? "ರದ್ದು" : "Cancel"}
                </button>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #D97706, #B45309)",
                    color: "#FFFFFF",
                    border: "1px solid #FCD34D",
                    borderRadius: 10,
                    padding: "8px 20px",
                    fontSize: 12.5,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(180, 83, 9, 0.3)"
                  }}
                >
                  {editingId ? (lang === "kn" ? "💾 ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ" : "Save Changes") :
                               (lang === "kn" ? "✨ ಸಂಕಲ್ಪವನ್ನು ಉಳಿಸಿ" : "Add to Daily Sankalpa")}
                </button>
              </div>
            </form>
          )}

          {/* List of Sankalpas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sankalpas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 16px", color: "#92400E", fontSize: 13 }}>
                {lang === "kn" ? "ಯಾವುದೇ ಸಂಕಲ್ಪಗಳು ಲಭ್ಯವಿಲ್ಲ. 'ಹೊಸ ಸಂಕಲ್ಪ ಸೇರಿಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ." : "No Sankalpas found. Click 'Add New Sankalpa' above."}
              </div>
            ) : (
              sankalpas.map((sankalpa, idx) => {
                const preset = SANKALPA_PRESETS.find((p) => p.category === sankalpa.category);
                return (
                  <div
                    key={sankalpa.id}
                    style={{
                      background: sankalpa.isActive ? "#FFFFFF" : "#F9FAFB",
                      border: sankalpa.isActive ? "1.5px solid #F59E0B" : "1px solid #E5E7EB",
                      borderRadius: 16,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      boxShadow: sankalpa.isActive ? "0 4px 12px rgba(245, 158, 11, 0.12)" : "none",
                      opacity: sankalpa.isActive ? 1 : 0.65,
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                          type="checkbox"
                          checked={sankalpa.isActive}
                          onChange={() => void toggleSankalpaActive(sankalpa.id)}
                          style={{
                            width: 18,
                            height: 18,
                            cursor: "pointer",
                            accentColor: "#D97706"
                          }}
                        />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 16 }}>{preset?.icon || "✨"}</span>
                            <span style={{ fontSize: 13.5, fontWeight: 900, color: "#78350F" }}>
                              {sankalpa.title}
                            </span>
                            {sankalpa.isActive ? (
                              <span
                                style={{
                                  background: "#DEF7EC",
                                  color: "#03543F",
                                  fontSize: 10,
                                  fontWeight: 800,
                                  padding: "2px 8px",
                                  borderRadius: 10,
                                  border: "1px solid #31C48D"
                                }}
                              >
                                {lang === "kn" ? "ಪೂಜೆಯಲ್ಲಿ ಸಕ್ರಿಯ" : "Active in Pooja"}
                              </span>
                            ) : (
                              <span
                                style={{
                                  background: "#F3F4F6",
                                  color: "#6B7280",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 10
                                }}
                              >
                                {lang === "kn" ? "ನಿಷ್ಕ್ರಿಯ" : "Inactive"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(sankalpa)}
                          style={{
                            background: "none",
                            border: "1px solid #FCD34D",
                            borderRadius: 8,
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#92400E",
                            cursor: "pointer"
                          }}
                        >
                          ✏️ {lang === "kn" ? "ತಿದ್ದು" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(lang === "kn" ? "ಈ ಸಂಕಲ್ಪವನ್ನು ಡಿಲೀಟ್ ಮಾಡಲು ನೀವು ಖಚಿತವೇ?" : "Are you sure you want to delete this Sankalpa?")) {
                              await deleteSankalpa(sankalpa.id);
                              showToast("ಸಂಕಲ್ಪ ಡಿಲೀಟ್ ಮಾಡಲಾಗಿದೆ");
                            }
                          }}
                          style={{
                            background: "none",
                            border: "1px solid #FCA5A5",
                            borderRadius: 8,
                            padding: "4px 8px",
                            fontSize: 11,
                            fontWeight: 800,
                            color: "#DC2626",
                            cursor: "pointer"
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {sankalpa.description && (
                      <p style={{ margin: 0, fontSize: 12, color: "#4B5563", lineHeight: 1.4, paddingLeft: 28 }}>
                        {sankalpa.description}
                      </p>
                    )}

                    {sankalpa.sanskritPhrasing && (
                      <div style={{ paddingLeft: 28, fontSize: 11.5, color: "#B45309", fontStyle: "italic" }}>
                        🕉️ <span style={{ fontWeight: 600 }}>ಮಂತ್ರ ಪಠಣ:</span> "{sankalpa.sanskritPhrasing}"
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            background: "#FFFBEB",
            borderTop: "1.5px solid #FCD34D",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#F3F4F6",
              color: "#374151",
              border: "1px solid #D1D5DB",
              borderRadius: 12,
              padding: "10px 18px",
              fontSize: 12.5,
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            {lang === "kn" ? "ಮುಚ್ಚಿ (Close)" : "Close"}
          </button>

          {onOpenPooja && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPooja();
              }}
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#1C0A00",
                border: "1.5px solid #FDE68A",
                borderRadius: 12,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)"
              }}
            >
              <span>🪔</span>
              <span>{lang === "kn" ? "೩-೫ ನಿಮಿಷಗಳ ಪೂಜೆ ಆರಂಭಿಸಿ" : "Start 3-5 Min Vedic Pooja"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
