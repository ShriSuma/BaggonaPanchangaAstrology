import React, { useState, useEffect } from "react";
import type { SevaLang } from "../../features/seva/sevaLocale";
import {
  useSankalpaStore,
  SANKALPA_PRESETS,
  type SankalpaPreset,
  getPresetTitle,
  getPresetDescription,
  getPresetSanskritPhrasing
} from "../../features/sankalpa/sankalpaStore";
import type { SankalpaCategory, UserSankalpaRecord } from "../../db/indexedDb";

interface ManageModalTexts {
  title: string;
  subtitle: string;
  statsSummary: (total: number, active: number) => string;
  statsHint: string;
  addNewBtn: string;
  editTitle: string;
  createTitle: string;
  cancelBtn: string;
  categoryLabel: string;
  titleLabel: string;
  titlePlaceholder: string;
  descLabel: string;
  descPlaceholder: string;
  sanskritLabel: string;
  sanskritPlaceholder: string;
  saveBtn: string;
  saveChangesBtn: string;
  emptyState: string;
  activeBadge: string;
  inactiveBadge: string;
  editBtn: string;
  deleteConfirm: string;
  chantingLabel: string;
  closeBtn: string;
  startPoojaBtn: string;
  toasts: {
    titleRequired: string;
    updated: string;
    created: string;
    deleted: string;
  };
}

const MANAGE_MODAL_I18N: Record<SevaLang, ManageModalTexts> = {
  kn: {
    title: "ವೈಯಕ್ತಿಕ ದೈವಿಕ ಸಂಕಲ್ಪಗಳ ನಿರ್ವಹಣೆ",
    subtitle: "೩-೫ ನಿಮಿಷಗಳ ನಿತ್ಯ ಪೂಜೆಯಲ್ಲಿ ಈ ಸಂಕಲ್ಪಗಳು ನೇರವಾಗಿ ಮಂತ್ರದಲ್ಲಿ ಸೇರ್ಪಡೆಯಾಗುತ್ತವೆ",
    statsSummary: (total, active) => `ಒಟ್ಟು ಸಂಕಲ್ಪಗಳು: ${total} · ಇಂದಿನ ಪೂಜೆಯಲ್ಲಿ ಸಕ್ರಿಯ: ${active}`,
    statsHint: "✔️ ಗುರುತು ಹಾಕಲಾದ (Active) ಸಂಕಲ್ಪಗಳು ಮಾತ್ರ ಇಂದಿನ ಪೂಜಾ ಮಂತ್ರದಲ್ಲಿ ಪಠಣವಾಗುತ್ತವೆ.",
    addNewBtn: "ಹೊಸ ಸಂಕಲ್ಪ ಸೇರಿಸಿ",
    editTitle: "✏️ ಸಂಕಲ್ಪ ತಿದ್ದುಪಡಿ",
    createTitle: "✨ ಹೊಸ ಪವಿತ್ರ ಸಂಕಲ್ಪ ಸೇರಿಸಿ",
    cancelBtn: "ರದ್ದು",
    categoryLabel: "೧. ಶಾಸ್ತ್ರೋಕ್ತ ವರ್ಗವನ್ನು ಆರಿಸಿ (Quick Presets):",
    titleLabel: "೨. ಸಂಕಲ್ಪದ ಶೀರ್ಷಿಕೆ (Sankalpa Title):",
    titlePlaceholder: "ಉದಾ: ಕುಟುಂಬ ಆರೋಗ್ಯ & ಆಯುರ್ವೃದ್ಧಿ",
    descLabel: "೩. ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಪ್ರಾರ್ಥನಾ ವಿವರ (Devotional Prayer Details):",
    descPlaceholder: "ನನ್ನ ಕುಟುಂಬದ ಸಮಸ್ತ ಸದಸ್ಯರಿಗೆ ಸಕಲ ಸುಖ-ಶಾಂತಿ, ಆರೋಗ್ಯ ಲಭಿಸಲಿ...",
    sanskritLabel: "೪. ಮಂತ್ರದಲ್ಲಿ ಪಠಣವಾಗುವ ಸಂಸ್ಕೃತ ವಾಕ್ಯ (Sanskrit Phrasing):",
    sanskritPlaceholder: "ಮಮ ಕುಟುಂಬಸ್ಯ ಸರ್ವೇಷಾಂ ಆಯುರಾರೋಗ್ಯ ಐಶ್ವರ್ಯಾಭಿವೃದ್ಧಿ ಸಿದ್ಧ್ಯರ್ಥಂ",
    saveBtn: "✨ ಸಂಕಲ್ಪವನ್ನು ಉಳಿಸಿ",
    saveChangesBtn: "💾 ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
    emptyState: "ಯಾವುದೇ ಸಂಕಲ್ಪಗಳು ಲಭ್ಯವಿಲ್ಲ. 'ಹೊಸ ಸಂಕಲ್ಪ ಸೇರಿಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    activeBadge: "ಪೂಜೆಯಲ್ಲಿ ಸಕ್ರಿಯ",
    inactiveBadge: "ನಿಷ್ಕ್ರಿಯ",
    editBtn: "ತಿದ್ದು",
    deleteConfirm: "ಈ ಸಂಕಲ್ಪವನ್ನು ಡಿಲೀಟ್ ಮಾಡಲು ನೀವು ಖಚಿತವೇ?",
    chantingLabel: "ಮಂತ್ರ ಪಠಣ:",
    closeBtn: "ಮುಚ್ಚಿ",
    startPoojaBtn: "೩-೫ ನಿಮಿಷಗಳ ಪೂಜೆ ಆರಂಭಿಸಿ",
    toasts: {
      titleRequired: "ದಯವಿಟ್ಟು ಸಂಕಲ್ಪದ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ",
      updated: "ಸಂಕಲ್ಪ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!",
      created: "ಹೊಸ ಸಂಕಲ್ಪ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!",
      deleted: "ಸಂಕಲ್ಪ ಡಿಲೀಟ್ ಮಾಡಲಾಗಿದೆ"
    }
  },
  hi: {
    title: "व्यक्तिगत वैदिक संकल्प प्रबंधन",
    subtitle: "३-५ मिनट की नित्य पूजा में ये संकल्प सीधे मंत्र में सम्मिलित होंगे",
    statsSummary: (total, active) => `कुल संकल्प: ${total} · आज की पूजा में सक्रिय: ${active}`,
    statsHint: "✔️ चिह्नित (सक्रिय) संकल्प ही आज के पूजा मंत्र में पढ़े जाएंगे।",
    addNewBtn: "नया संकल्प जोड़ें",
    editTitle: "✏️ संकल्प संपादित करें",
    createTitle: "✨ नया पवित्र संकल्प जोड़ें",
    cancelBtn: "रद्द करें",
    categoryLabel: "१. वैदिक श्रेणी चुनें (त्वरित विकल्प):",
    titleLabel: "२. संकल्प का शीर्षक:",
    titlePlaceholder: "उदा: परिवार का उत्तम स्वास्थ्य एवं दीर्घायु",
    descLabel: "३. व्यक्तिगत प्रार्थना का विवरण:",
    descPlaceholder: "परिवार के सभी सदस्यों को सुख-शांति एवं उत्तम स्वास्थ्य मिले...",
    sanskritLabel: "४. मंत्र में उच्चारित होने वाला संस्कृत वाक्य:",
    sanskritPlaceholder: "मम कुटुम्बस्य सर्वेषां आयुरारोग्य ऐश्वर्याभिवृद्धि सिद्ध्यर्थं",
    saveBtn: "✨ संकल्प सुरक्षित करें",
    saveChangesBtn: "💾 परिवर्तन सुरक्षित करें",
    emptyState: "कोई संकल्प उपलब्ध नहीं है। ऊपर 'नया संकल्प जोड़ें' पर क्लिक करें।",
    activeBadge: "पूजा में सक्रिय",
    inactiveBadge: "निष्क्रिय",
    editBtn: "संपादित करें",
    deleteConfirm: "क्या आप इस संकल्प को हटाना चाहते हैं?",
    chantingLabel: "मंत्र पाठ:",
    closeBtn: "बंद करें",
    startPoojaBtn: "३-५ मिनट की वैदिक पूजा प्रारंभ करें",
    toasts: {
      titleRequired: "कृपया संकल्प का शीर्षक दर्ज करें",
      updated: "संकल्प सफलतापूर्वक अद्यतन किया गया!",
      created: "नया संकल्प सफलतापूर्वक जोड़ा गया!",
      deleted: "संकल्प हटा दिया गया है"
    }
  },
  te: {
    title: "వ్యక్తిగత వైదిక సంకల్పాల నిర్వహణ",
    subtitle: "3-5 నిమిషాల నిత్య పూజలో ఈ సంకల్పాలు నేరుగా మంత్రంలో చేరుతాయి",
    statsSummary: (total, active) => `మొత్తం సంకల్పాలు: ${total} · నేటి పూజలో సక్రియం: ${active}`,
    statsHint: "✔️ ఎంపిక చేసిన (సక్రియ) సంకల్పాలు మాత్రమే నేటి పూజా మంత్రంలో పఠించబడతాయి.",
    addNewBtn: "కొత్త సంకల్పం జోడించండి",
    editTitle: "✏️ సంకల్పం సవరించండి",
    createTitle: "✨ కొత్త పవిత్ర సంకల్పం చేర్చండి",
    cancelBtn: "రద్దు",
    categoryLabel: "1. వైదిక వర్గాన్ని ఎంచుకోండి:",
    titleLabel: "2. సంకల్పం శీర్షిక:",
    titlePlaceholder: "ఉదా: కుటుంబ ఆరోగ్యం & దీర్ఘాయుష్షు",
    descLabel: "3. వ్యక్తిగత ప్రార్థన వివరాలు:",
    descPlaceholder: "కుటుంబ సభ్యులందరికీ సుఖశాంతులు, ఆరోగ్యం లభించాలి...",
    sanskritLabel: "4. మంత్రంలో పఠించబడే సంస్కృత వాక్యం:",
    sanskritPlaceholder: "మమ కుటుంబస్య సర్వేషాం ఆయురారోగ్య ఐశ్వర్యాభివృద్ధి సిద్ధ్యర్థం",
    saveBtn: "✨ సంకల్పం సేవ్ చేయండి",
    saveChangesBtn: "💾 మార్పులను సేవ్ చేయండి",
    emptyState: "సంకల్పాలు ఏవీ లేవు. పైన 'కొత్త సంకల్పం జోడించండి' క్లిక్ చేయండి.",
    activeBadge: "పూజలో సక్రియం",
    inactiveBadge: "నిష్క్రియం",
    editBtn: "సవరించండి",
    deleteConfirm: "మీరు ఖచ్చితంగా ఈ సంకల్పాన్ని తొలగించాలనుకుంటున్నారా?",
    chantingLabel: "మంత్ర పఠనం:",
    closeBtn: "మూసివేయి",
    startPoojaBtn: "3-5 నిమిషాల వైదిక పూజ ప్రారంభించండి",
    toasts: {
      titleRequired: "దయచేసి సంకల్పం శీర్షికను నమోదు చేయండి",
      updated: "సంకల్పం విజయవంతంగా నవీకరించబడింది!",
      created: "కొత్త సంకల్పం విజయవంతంగా చేర్చబడింది!",
      deleted: "సంకల్పం తొలగించబడింది"
    }
  },
  ta: {
    title: "தனிப்பட்ட வைதீக சங்கல்ப மேலாண்மை",
    subtitle: "3-5 நிமிட தினசரி பூஜையில் இந்த சங்கல்பங்கள் நேரடியாக மந்திரத்தில் இணைக்கப்படும்",
    statsSummary: (total, active) => `மொத்த சங்கல்பங்கள்: ${total} · இன்றைய பூஜையில் பயன்பாட்டில்: ${active}`,
    statsHint: "✔️ தேர்வு செய்யப்பட்ட (Active) சங்கல்பங்கள் மட்டுமே இன்றைய பூஜை மந்திரத்தில் ஓதப்படும்.",
    addNewBtn: "புதிய சங்கல்பம் சேர்க்க",
    editTitle: "✏️ சங்கல்பம் திருத்த",
    createTitle: "✨ புதிய புனித சங்கல்பம் சேர்க்க",
    cancelBtn: "ரத்து",
    categoryLabel: "1. வைதீக வகையைத் தேர்ந்தெடுக்கவும்:",
    titleLabel: "2. சங்கல்ப தலைப்பு:",
    titlePlaceholder: "உதா: குடும்ப ஆரோக்கியம் & நீண்ட ஆயுள்",
    descLabel: "3. தனிப்பட்ட பிரார்த்தனை விவரம்:",
    descPlaceholder: "குடும்பத்தினர் அனைவருக்கும் சுக அமைதி, நல்வாழ்வு கிடைக்கட்டும்...",
    sanskritLabel: "4. மந்திரத்தில் ஓதப்படும் சமஸ்கிருத வாக்கியம்:",
    sanskritPlaceholder: "மம குடும்பஸ்ய சர்வேஷாம் ஆயுராரோக்ய ஐஸ்வர்யாபிவிருத்தி சித்யர்த்தம்",
    saveBtn: "✨ சங்கல்பத்தை சேமிக்க",
    saveChangesBtn: "💾 மாற்றங்களைச் சேமிக்க",
    emptyState: "சங்கல்பங்கள் எதுவும் இல்லை. மேலே 'புதிய சங்கல்பம் சேர்க்க' என்பதை அழுத்தவும்.",
    activeBadge: "பூஜையில் பயன்பாட்டில்",
    inactiveBadge: "செயலற்றது",
    editBtn: "திருத்த",
    deleteConfirm: "இந்த சங்கல்பத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?",
    chantingLabel: "மந்திர பாராயணம்:",
    closeBtn: "மூடுக",
    startPoojaBtn: "3-5 நிமிட வைதீக பூஜையைத் தொடங்கவும்",
    toasts: {
      titleRequired: "தயவுசெய்து சங்கல்பத்தின் தலைப்பை உள்ளிடவும்",
      updated: "சங்கல்பம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
      created: "புதிய சங்கல்பம் வெற்றிகரமாக சேர்க்கப்பட்டது!",
      deleted: "சங்கல்பம் நீக்கப்பட்டது"
    }
  },
  en: {
    title: "Manage Personal Vedic Sankalpas",
    subtitle: "These active prayers will be dynamically chanted in your 3-5 Min Daily Vedic Pooja",
    statsSummary: (total, active) => `Total Sankalpas: ${total} · Active in Today's Pooja: ${active}`,
    statsHint: "Checked items will be recited by the priest in your daily morning Sankalpa.",
    addNewBtn: "Add New Sankalpa",
    editTitle: "✏️ Edit Sankalpa",
    createTitle: "✨ Add New Sacred Sankalpa",
    cancelBtn: "Cancel",
    categoryLabel: "1. Choose Vedic Category:",
    titleLabel: "2. Sankalpa Title:",
    titlePlaceholder: "e.g., Family Health & Longevity",
    descLabel: "3. Devotional Prayer Details:",
    descPlaceholder: "Detailed prayer intention for peace, health and success...",
    sanskritLabel: "4. Sanskrit Mantra Phrasing:",
    sanskritPlaceholder: "Mama kuṭumbasya sarveṣāṁ āyurārogya aiśvaryābhivṛddhi siddhyarthaṁ",
    saveBtn: "Add to Daily Sankalpa",
    saveChangesBtn: "Save Changes",
    emptyState: "No Sankalpas found. Click 'Add New Sankalpa' above.",
    activeBadge: "Active in Pooja",
    inactiveBadge: "Inactive",
    editBtn: "Edit",
    deleteConfirm: "Are you sure you want to delete this Sankalpa?",
    chantingLabel: "Mantra Phrasing:",
    closeBtn: "Close",
    startPoojaBtn: "Start 3-5 Min Vedic Pooja",
    toasts: {
      titleRequired: "Please enter a Sankalpa title",
      updated: "Sankalpa successfully updated!",
      created: "New Sankalpa created successfully!",
      deleted: "Sankalpa deleted"
    }
  }
};

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

  const t = MANAGE_MODAL_I18N[lang] || MANAGE_MODAL_I18N.kn;

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
      void loadSankalpas(userId, devoteeName, lang);
    }
  }, [isOpen, userId, devoteeName, lang]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPreset = (preset: SankalpaPreset) => {
    setSelectedCategory(preset.category);
    setTitleInput(getPresetTitle(preset, lang));
    setDescInput(getPresetDescription(preset, lang));
    setSanskritInput(getPresetSanskritPhrasing(preset, lang));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      showToast(t.toasts.titleRequired);
      return;
    }

    if (editingId) {
      await updateSankalpa(editingId, {
        category: selectedCategory,
        title: titleInput.trim(),
        description: descInput.trim(),
        sanskritPhrasing: sanskritInput.trim() || t.sanskritPlaceholder
      });
      showToast(t.toasts.updated);
      setEditingId(null);
    } else {
      await createSankalpa(userId, {
        category: selectedCategory,
        title: titleInput.trim(),
        description: descInput.trim(),
        sanskritPhrasing: sanskritInput.trim() || t.sanskritPlaceholder,
        isActive: true,
        devoteeName
      });
      showToast(t.toasts.created);
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
                {t.title}
              </h2>
              <p style={{ margin: 0, fontSize: 11.5, color: "#FDE68A", marginTop: 2 }}>
                {t.subtitle}
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
                {t.statsSummary(sankalpas.length, activeCount)}
              </span>
              <div style={{ fontSize: 11.5, color: "#B45309", marginTop: 2 }}>
                {t.statsHint}
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
                <span>{t.addNewBtn}</span>
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
                  {editingId ? t.editTitle : t.createTitle}
                </span>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  style={{ background: "none", border: "none", color: "#92400E", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                >
                  {t.cancelBtn}
                </button>
              </div>

              {/* Presets Quick Picker */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#92400E", marginBottom: 6 }}>
                  {t.categoryLabel}
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
                        <span>{getPresetTitle(preset, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 800, color: "#92400E", marginBottom: 4 }}>
                  {t.titleLabel}
                </label>
                <input
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder={t.titlePlaceholder}
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
                  {t.descLabel}
                </label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder={t.descPlaceholder}
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
                  {t.sanskritLabel}
                </label>
                <input
                  type="text"
                  value={sanskritInput}
                  onChange={(e) => setSanskritInput(e.target.value)}
                  placeholder={t.sanskritPlaceholder}
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
                  {t.cancelBtn}
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
                  {editingId ? t.saveChangesBtn : t.saveBtn}
                </button>
              </div>
            </form>
          )}

          {/* List of Sankalpas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sankalpas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 16px", color: "#92400E", fontSize: 13 }}>
                {t.emptyState}
              </div>
            ) : (
              sankalpas.map((sankalpa) => {
                const preset = SANKALPA_PRESETS.find(
                  (p) =>
                    p.category === sankalpa.category ||
                    p.titleKn === sankalpa.title ||
                    p.titleEn === sankalpa.title ||
                    p.titleHi === sankalpa.title ||
                    p.titleTe === sankalpa.title ||
                    p.titleTa === sankalpa.title
                );
                const displayTitle = preset ? getPresetTitle(preset, lang) : sankalpa.title;
                const displayDesc = preset ? getPresetDescription(preset, lang) : sankalpa.description;
                const displaySanskrit = preset ? getPresetSanskritPhrasing(preset, lang) : sankalpa.sanskritPhrasing;
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
                              {displayTitle}
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
                                {t.activeBadge}
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
                                {t.inactiveBadge}
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
                          ✏️ {t.editBtn}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(t.deleteConfirm)) {
                              await deleteSankalpa(sankalpa.id);
                              showToast(t.toasts.deleted);
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

                    {displayDesc && (
                      <p style={{ margin: 0, fontSize: 12, color: "#4B5563", lineHeight: 1.4, paddingLeft: 28 }}>
                        {displayDesc}
                      </p>
                    )}

                    {displaySanskrit && (
                      <div style={{ paddingLeft: 28, fontSize: 11.5, color: "#B45309", fontStyle: "italic" }}>
                        🕉️ <span style={{ fontWeight: 600 }}>{t.chantingLabel}</span> "{displaySanskrit}"
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
            {t.closeBtn}
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
              <span>{t.startPoojaBtn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
