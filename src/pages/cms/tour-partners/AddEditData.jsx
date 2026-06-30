import React, { useEffect, useMemo, useState } from "react";
import { Modal, notification } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { addEditTourPartners, listTourPartners } from "services/tourPartners.service";
import LoadingEffect from "components/ui/Loading/LoadingEffect";
import ImageUploadField from "components/ui/ImageUploadField";
import CmsSetupTopActions from "components/cms/CmsSetupTopActions";
import { CharCounter, FieldHint, ImageHint } from "components/ui/FieldHint";
import { IMAGE_SPECS, LIMITS } from "utils/fieldValidation";
import { TOUR_TYPE_OPTIONS, shouldUseExistingTourTypeRecord } from "utils/tourType";
import "styles/admin-pages.css";

const ensureArray = (value, fallbackFactory) =>
  Array.isArray(value) && value.length ? value : [fallbackFactory()];

const parseContent = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return typeof raw === "object" ? raw : null;
};

const emptyHero = () => ({ bg_image: "", mobile_bg_image: "", title: "", subtitle: "" });
const emptyPartnerDetail = () => ({
  title: "",
  image: "",
  overlay_logo: "",
  logo_2: "",
  descriptions: [""],
  link_url: "",
});
const emptyTourSection = () => ({
  heading: "Tour Partners",
  description: "",
  partners: [emptyPartnerDetail()],
});
const emptyPgtiSection = () => ({
  heading: "PGTI Partners",
  description: "",
  partners: [emptyPartnerDetail()],
});
const toggleOpen = (map, index) => ({ ...map, [index]: !map[index] });

const cleanParagraphs = (descriptions = []) =>
  descriptions.map((item) => (item || "").trim()).filter(Boolean);

const cleanPartnerDetails = (partners = []) =>
  partners
    .map((partner) => ({
      title: (partner.title || partner.partner_name || "").trim(),
      image: (partner.image || "").trim(),
      overlay_logo: (partner.overlay_logo || "").trim(),
      logo_2: (partner.logo_2 || "").trim(),
      descriptions: cleanParagraphs(partner.descriptions || []),
      link_url: (partner.link_url || "").trim(),
    }))
    .filter((partner) => partner.title || partner.image || partner.overlay_logo || partner.logo_2 || partner.descriptions.length || partner.link_url);

const SectionCard = ({ number, title, subtitle, children }) => (
  <div className="content-card" style={{ marginBottom: 24 }}>
    <div className="content-card-body">
      <div className="form-section">
        <h3 className="form-section-title">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#0369a1",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              marginRight: 10,
              flexShrink: 0,
            }}
          >
            {number}
          </span>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: 13, color: "#64748b", marginTop: -4, marginBottom: 16 }}>{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  </div>
);

const AddBtn = ({ onClick, label }) => (
  <button type="button" className="action-button secondary" style={{ marginTop: 8, fontSize: 12 }} onClick={onClick}>
    <PlusOutlined /> {label}
  </button>
);

const RemoveBtn = ({ onClick, label = "Remove" }) => (
  <button
    type="button"
    className="action-button secondary"
    style={{ marginTop: 8, padding: "4px 10px", fontSize: 12 }}
    onClick={onClick}
  >
    <MinusCircleOutlined /> {label}
  </button>
);

const CollapseRow = ({ title, description, isOpen, onToggle, children }) => (
  <div
    style={{
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      overflow: "hidden",
      background: "#fff",
      marginBottom: 14,
    }}
  >
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 16px",
        background: "#f8fafc",
        border: "none",
        borderBottom: isOpen ? "1px solid #e2e8f0" : "none",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{title}</div>
        {description && <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{description}</div>}
      </div>
      <span style={{ color: "#0369a1", fontSize: 12 }}>{isOpen ? <ArrowDownOutlined /> : <ArrowRightOutlined />}</span>
    </button>
    {isOpen && <div style={{ padding: "16px 18px" }}>{children}</div>}
  </div>
);

export default function TourPartnersAddEditData() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};
  const isEdit = Boolean(state?.id);

  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState(state?.id ?? state?.result?.id ?? "");
  const [status, setStatus] = useState(state?.status || "A");
  const [tourType, setTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const [savedTourType, setSavedTourType] = useState(state?.tour_type ?? state?.result?.tour_type ?? "M");
  const [hero, setHero] = useState(emptyHero());
  const [tourSection, setTourSection] = useState(emptyTourSection());
  const [pgtiSection, setPgtiSection] = useState(emptyPgtiSection());
  const [legacyContent, setLegacyContent] = useState({});
  const [tourOpen, setTourOpen] = useState({});
  const [pgtiOpen, setPgtiOpen] = useState({});

  const bannerSpec = IMAGE_SPECS.banners || { recommended: "1920x600 px", maxMB: 2, note: "Wide hero banner image." };
  const logoSpec = IMAGE_SPECS["cms/tour-partners"] || {
    recommended: "200x80 px (logo)",
    maxMB: 0.5,
    note: "Transparent PNG preferred for logos.",
  };
  const detailImageSpec = IMAGE_SPECS["cms/about-us"] || {
    recommended: "1200x800 px",
    maxMB: 2,
    note: "Use a clean landscape image for the partner card.",
  };

  useEffect(() => {
    const content = parseContent(state?.content);
    if (content) {
      const heroBanner = { ...emptyHero(), ...(content.heroBanner || {}) };
      const legacyTourSection = content.tourPartnersSection || {};
      const legacyTourPartners = cleanPartnerDetails(
        legacyTourSection.partners ||
          content.partnerCarousel?.map((slide) => ({
            title: slide.partner_name || slide.title || "",
            image: slide.image || "",
            overlay_logo: slide.overlay_logo || "",
            logo_2: slide.logo_2 || "",
            descriptions: ensureArray(slide.descriptions, () => ""),
            link_url: slide.link_url || "",
          })) ||
          []
      );
      const legacyPgtiSection = content.pgtiPartnersSection || {};

      setHero(heroBanner);
      setTourSection({
        heading: legacyTourSection.heading || "Tour Partners",
        description: legacyTourSection.description || "",
        partners: ensureArray(legacyTourPartners.length ? legacyTourPartners : legacyTourSection.partners, emptyPartnerDetail).map((partner) => ({
          ...emptyPartnerDetail(),
          ...partner,
          descriptions: ensureArray(partner.descriptions, () => ""),
        })),
      });
      setPgtiSection({
        heading: legacyPgtiSection.heading || "PGTI Partners",
        description: legacyPgtiSection.description || "",
        partners: ensureArray(legacyPgtiSection.partners, emptyPartnerDetail).map((partner) => ({
          ...emptyPartnerDetail(),
          ...partner,
          descriptions: ensureArray(partner.descriptions, () => ""),
        })),
      });
      const { heroBanner: _hero, tourPartnersSection: _tour, partnerCarousel: _carousel, pgtiPartnersSection: _pgtiSection, pgtiPartners: _pgtiStrip, ...rest } = content;
      setLegacyContent(rest);
    }

    document.title = `PGTI || ${isEdit ? "Edit" : "Setup"} Tour Partners Page`;
  }, [isEdit, state?.content]);

  useEffect(() => {
    let active = true;

    const hydrate = (record = {}) => {
      const content = parseContent(record?.content);
      if (!content) return;

      const heroBanner = { ...emptyHero(), ...(content.heroBanner || {}) };
      const legacyTourSection = content.tourPartnersSection || {};
      const legacyTourPartners = cleanPartnerDetails(
        legacyTourSection.partners ||
          content.partnerCarousel?.map((slide) => ({
            title: slide.partner_name || slide.title || "",
            image: slide.image || "",
            overlay_logo: slide.overlay_logo || "",
            logo_2: slide.logo_2 || "",
            descriptions: ensureArray(slide.descriptions, () => ""),
            link_url: slide.link_url || "",
          })) ||
          []
      );
      const legacyPgtiSection = content.pgtiPartnersSection || {};

      setHero(heroBanner);
      setTourSection({
        heading: legacyTourSection.heading || "Tour Partners",
        description: legacyTourSection.description || "",
        partners: ensureArray(legacyTourPartners.length ? legacyTourPartners : legacyTourSection.partners, emptyPartnerDetail).map((partner) => ({
          ...emptyPartnerDetail(),
          ...partner,
          descriptions: ensureArray(partner.descriptions, () => ""),
        })),
      });
      setPgtiSection({
        heading: legacyPgtiSection.heading || "PGTI Partners",
        description: legacyPgtiSection.description || "",
        partners: ensureArray(legacyPgtiSection.partners, emptyPartnerDetail).map((partner) => ({
          ...emptyPartnerDetail(),
          ...partner,
          descriptions: ensureArray(partner.descriptions, () => ""),
        })),
      });
      const {
        heroBanner: _hero,
        tourPartnersSection: _tour,
        partnerCarousel: _carousel,
        pgtiPartnersSection: _pgtiSection,
        pgtiPartners: _pgtiStrip,
        ...rest
      } = content;
      setLegacyContent(rest);
      if (record?.id) setId(record.id);
      if (record?.status) setStatus(record.status);
      if (record?.tour_type) {
        setTourType(record.tour_type);
        setSavedTourType(record.tour_type);
      }
    };

    const load = async () => {
      if (state?.content) return;
      const res = await listTourPartners({ tour_type: tourType });
      if (active && res?.status && res?.result?.id) hydrate(res.result);
    };

    load();
    return () => {
      active = false;
    };
  }, [state?.content, tourType]);

  useEffect(() => {
    setTourOpen((prev) => tourSection.partners.reduce((acc, _item, index) => ({ ...acc, [index]: prev[index] ?? index === 0 }), {}));
  }, [tourSection.partners]);

  useEffect(() => {
    setPgtiOpen((prev) => pgtiSection.partners.reduce((acc, _item, index) => ({ ...acc, [index]: prev[index] ?? index === 0 }), {}));
  }, [pgtiSection.partners]);

  const tourPartnerCount = useMemo(() => cleanPartnerDetails(tourSection.partners).length, [tourSection.partners]);
  const pgtiPartnerCount = useMemo(() => cleanPartnerDetails(pgtiSection.partners).length, [pgtiSection.partners]);
  const tourLogoCount = useMemo(
    () => cleanPartnerDetails(tourSection.partners).filter((partner) => partner.overlay_logo).length,
    [tourSection.partners]
  );
  const pgtiLogoCount = useMemo(
    () => cleanPartnerDetails(pgtiSection.partners).filter((partner) => partner.overlay_logo).length,
    [pgtiSection.partners]
  );

  const notifyError = (message) => {
    notification.open({
      message: "Oops!",
      description: message,
      placement: "topRight",
      duration: 3,
      icon: <InfoCircleOutlined style={{ color: "red" }} />,
    });
  };

  const setTourSectionField = (field, value) => setTourSection((prev) => ({ ...prev, [field]: value }));
  const setPgtiSectionField = (field, value) => setPgtiSection((prev) => ({ ...prev, [field]: value }));

  const updateTourPartner = (index, field, value) =>
    setTourSection((prev) => ({
      ...prev,
      partners: prev.partners.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));

  const updateTourParagraph = (index, paragraphIndex, value) =>
    setTourSection((prev) => ({
      ...prev,
      partners: prev.partners.map((item, i) =>
        i === index
          ? { ...item, descriptions: item.descriptions.map((paragraph, pIndex) => (pIndex === paragraphIndex ? value : paragraph)) }
          : item
      ),
    }));

  const addTourParagraph = (index) =>
    setTourSection((prev) => ({
      ...prev,
      partners: prev.partners.map((item, i) => (i === index ? { ...item, descriptions: [...item.descriptions, ""] } : item)),
    }));

  const removeTourParagraph = (index, paragraphIndex) =>
    setTourSection((prev) => ({
      ...prev,
      partners: prev.partners.map((item, i) =>
        i === index
          ? {
              ...item,
              descriptions: item.descriptions.length > 1 ? item.descriptions.filter((_paragraph, pIndex) => pIndex !== paragraphIndex) : item.descriptions,
            }
          : item
      ),
    }));

  const addTourPartner = () => setTourSection((prev) => ({ ...prev, partners: [...prev.partners, emptyPartnerDetail()] }));
  const removeTourPartner = (index) =>
    setTourSection((prev) => ({
      ...prev,
      partners: prev.partners.length > 1 ? prev.partners.filter((_item, i) => i !== index) : prev.partners,
    }));

  const updatePgtiPartner = (index, field, value) =>
    setPgtiSection((prev) => ({
      ...prev,
      partners: prev.partners.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));

  const updatePgtiParagraph = (index, paragraphIndex, value) =>
    setPgtiSection((prev) => ({
      ...prev,
      partners: prev.partners.map((item, i) =>
        i === index
          ? { ...item, descriptions: item.descriptions.map((paragraph, pIndex) => (pIndex === paragraphIndex ? value : paragraph)) }
          : item
      ),
    }));

  const addPgtiParagraph = (index) =>
    setPgtiSection((prev) => ({
      ...prev,
      partners: prev.partners.map((item, i) => (i === index ? { ...item, descriptions: [...item.descriptions, ""] } : item)),
    }));

  const removePgtiParagraph = (index, paragraphIndex) =>
    setPgtiSection((prev) => ({
      ...prev,
      partners: prev.partners.map((item, i) =>
        i === index
          ? {
              ...item,
              descriptions: item.descriptions.length > 1 ? item.descriptions.filter((_paragraph, pIndex) => pIndex !== paragraphIndex) : item.descriptions,
            }
          : item
      ),
    }));

  const addPgtiPartner = () => setPgtiSection((prev) => ({ ...prev, partners: [...prev.partners, emptyPartnerDetail()] }));
  const removePgtiPartner = (index) =>
    setPgtiSection((prev) => ({
      ...prev,
      partners: prev.partners.length > 1 ? prev.partners.filter((_item, i) => i !== index) : prev.partners,
    }));

  const buildContent = () => {
    const cleanedTourPartners = cleanPartnerDetails(tourSection.partners);
    const cleanedPgtiPartners = cleanPartnerDetails(pgtiSection.partners);
    const cleanedTourLogos = cleanedTourPartners
      .filter((partner) => partner.overlay_logo)
      .map((partner) => ({
        logo_image: partner.overlay_logo,
        partner_name: partner.title,
        link_url: partner.link_url,
      }));
    const cleanedPgtiLogos = cleanedPgtiPartners
      .filter((partner) => partner.overlay_logo)
      .map((partner) => ({
        logo_image: partner.overlay_logo,
        partner_name: partner.title,
        link_url: partner.link_url,
      }));

    return {
      ...legacyContent,
      heroBanner: {
        bg_image: hero.bg_image.trim(),
        mobile_bg_image: (hero.mobile_bg_image || "").trim(),
        title: hero.title.trim(),
        subtitle: hero.subtitle.trim(),
      },
      tourPartnersSection: {
        heading: tourSection.heading.trim(),
        description: tourSection.description.trim(),
        partners: cleanedTourPartners,
        logos: cleanedTourLogos,
      },
      partnerCarousel: cleanedTourPartners.map((partner) => ({
        image: partner.image,
        overlay_logo: partner.overlay_logo,
        logo_2: partner.logo_2,
        partner_name: partner.title,
        descriptions: partner.descriptions,
        link_url: partner.link_url,
      })),
      pgtiPartnersSection: {
        heading: pgtiSection.heading.trim(),
        description: pgtiSection.description.trim(),
        partners: cleanedPgtiPartners,
      },
      pgtiPartners: {
        title: pgtiSection.heading.trim() || "PGTI Partners",
        logos: cleanedPgtiLogos,
      },
    };
  };

  const validatePartnerSection = (sectionLabel, items, requireAtLeastOne = true) => {
    const cleanedItems = cleanPartnerDetails(items);
    if (requireAtLeastOne && cleanedItems.length === 0) return `${sectionLabel}: add at least one partner row.`;

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const hasAnyValue =
        (item.title || "").trim() ||
        (item.image || "").trim() ||
        (item.overlay_logo || "").trim() ||
        (item.logo_2 || "").trim() ||
        cleanParagraphs(item.descriptions || []).length ||
        (item.link_url || "").trim();

      if (!hasAnyValue) continue;
      if (!(item.title || "").trim()) return `${sectionLabel}: partner row ${index + 1} is missing the partner title.`;
      if (!(item.image || "").trim()) return `${sectionLabel}: partner row ${index + 1} is missing the main image.`;
      if (cleanParagraphs(item.descriptions || []).length === 0) return `${sectionLabel}: partner row ${index + 1} needs at least one description paragraph.`;
    }

    return "";
  };

  const copyFromMainTour = async () => {
    try {
      setIsLoading(true);
      const res = await listTourPartners({ tour_type: "M" });
      if (!res?.status || !res?.result?.id) {
        notification.warning({
          message: "Main Tour data not found",
          description: "Please save the Main Tour Tour Partners page first.",
          placement: "topRight",
          duration: 3,
        });
        return;
      }

      const content = parseContent(res.result?.content);
      if (!content) {
        notifyError("Main Tour Tour Partners content is not available to copy.");
        return;
      }

      const heroBanner = { ...emptyHero(), ...(content.heroBanner || {}) };
      const legacyTourSection = content.tourPartnersSection || {};
      const legacyTourPartners = cleanPartnerDetails(
        legacyTourSection.partners ||
          content.partnerCarousel?.map((slide) => ({
            title: slide.partner_name || slide.title || "",
            image: slide.image || "",
            overlay_logo: slide.overlay_logo || "",
            logo_2: slide.logo_2 || "",
            descriptions: ensureArray(slide.descriptions, () => ""),
            link_url: slide.link_url || "",
          })) ||
          []
      );
      const legacyPgtiSection = content.pgtiPartnersSection || {};

      setHero(heroBanner);
      setTourSection({
        heading: legacyTourSection.heading || "Tour Partners",
        description: legacyTourSection.description || "",
        partners: ensureArray(legacyTourPartners.length ? legacyTourPartners : legacyTourSection.partners, emptyPartnerDetail).map((partner) => ({
          ...emptyPartnerDetail(),
          ...partner,
          descriptions: ensureArray(partner.descriptions, () => ""),
        })),
      });
      setPgtiSection({
        heading: legacyPgtiSection.heading || "PGTI Partners",
        description: legacyPgtiSection.description || "",
        partners: ensureArray(legacyPgtiSection.partners, emptyPartnerDetail).map((partner) => ({
          ...emptyPartnerDetail(),
          ...partner,
          descriptions: ensureArray(partner.descriptions, () => ""),
        })),
      });
      const {
        heroBanner: _hero,
        tourPartnersSection: _tour,
        partnerCarousel: _carousel,
        pgtiPartnersSection: _pgtiSection,
        pgtiPartners: _pgtiStrip,
        ...rest
      } = content;
      setLegacyContent(rest);
      setStatus(res.result?.status || "A");
      setId("");
      setTourType("F");
      setSavedTourType("F");
      notification.success({
        message: "Copied from Main Tour",
        description: "Edit the copied NextGen draft and save to create a separate record.",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hero.title.trim()) return notifyError("Hero banner title is required.");
    if (!hero.bg_image.trim()) return notifyError("Hero banner background image is required.");

    const tourValidation = validatePartnerSection("Tour Partners list", tourSection.partners, true);
    if (tourValidation) return notifyError(tourValidation);

    const pgtiValidation = validatePartnerSection("PGTI Partners list", pgtiSection.partners, false);
    if (pgtiValidation) return notifyError(pgtiValidation);

    try {
      setIsLoading(true);
      const isExistingRecord = shouldUseExistingTourTypeRecord(id, savedTourType, tourType);
      const response = await addEditTourPartners({
        ...(isExistingRecord && { editId: id }),
        status,
        tour_type: tourType,
        content: JSON.stringify(buildContent()),
      });

      if (response?.status === true) {
        if (response?.result?.id) setId(response.result.id);
        setSavedTourType(tourType);
        notification.open({
          message: "Success",
          description: isExistingRecord ? "Tour Partners page updated successfully." : "Tour Partners page created successfully.",
          placement: "topRight",
          duration: 2,
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
        });
        navigate("/admin/cms/tour-partners/list");
        return;
      }

      notifyError(response?.message || "Failed to save Tour Partners page.");
    } catch (error) {
      notifyError(error?.message || "An unexpected error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">{isEdit ? "Edit Tour Partners Page" : "Setup Tour Partners Page"}</h1>
            <p className="page-subtitle">Manage the updated Tour Partners page: hero, partner cards, and the PGTI/Tour partner logo strips.</p>
          </div>
          <Link to="/admin/cms/tour-partners/list">
            <button type="button" className="action-button secondary">
              <ArrowLeftOutlined /> Back
            </button>
          </Link>
        </div>
      </div>

      <CmsSetupTopActions
        tourType={tourType}
        onCopyFromMain={copyFromMainTour}
        onSaveAll={() =>
          Modal.confirm({
            title: "Save all changes?",
            content: "Please confirm to save the full Tour Partners page.",
            okText: "Yes, Save All",
            cancelText: "Cancel",
            onOk: () => document.getElementById("tour-partners-save-submit")?.click(),
          })
        }
        saveAllDisabled={false}
        isWorking={isLoading}
      />

      <div className="page-body">
        <form onSubmit={handleSubmit}>
          <SectionCard number="1" title="Hero Banner" subtitle="This is the top banner with the golf background, page title, and subtitle.">
            <div className="form-group">
              <label className="form-label">Page Title <span className="required-mark">*</span></label>
              <input type="text" className="form-input" value={hero.title} onChange={(event) => setHero((prev) => ({ ...prev, title: event.target.value }))} placeholder='e.g. "Official Tour Partners"' />
              <CharCounter value={hero.title} max={LIMITS.title.max} />
            </div>
            <div className="form-group">
              <label className="form-label">Subtitle / Description</label>
              <textarea className="form-input" rows={3} value={hero.subtitle} onChange={(event) => setHero((prev) => ({ ...prev, subtitle: event.target.value }))} placeholder="Our valued partners play a vital role in supporting tournaments, players, and the continued development of professional golf nationwide." />
              <CharCounter value={hero.subtitle} max={LIMITS.short_description.max} />
            </div>
            <ImageUploadField label="Background Image" required value={hero.bg_image} onChange={(url) => setHero((prev) => ({ ...prev, bg_image: url }))} folder="tour-partners" previewH={180} spec={bannerSpec} />
            <ImageHint recommended={bannerSpec.recommended} maxSize={`${bannerSpec.maxMB}MB`} note="Use a full-width background image similar to the updated partner-page hero." />
            <div style={{ marginTop: 16 }}>
              <ImageUploadField label="Mobile Banner Image" value={hero.mobile_bg_image} onChange={(url) => setHero((prev) => ({ ...prev, mobile_bg_image: url }))} folder="tour-partners" previewH={160} spec={IMAGE_SPECS.hero_banner_mobile} />
              <ImageHint recommended={IMAGE_SPECS.hero_banner_mobile.recommended} maxSize={`${IMAGE_SPECS.hero_banner_mobile.maxMB}MB`} note={IMAGE_SPECS.hero_banner_mobile.note} />
            </div>
          </SectionCard>

          <SectionCard number="2" title="Tour Partners Content Section" subtitle="This section controls the main Tour Partners heading, supporting text, and the detailed partner cards shown on the page.">
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Section Heading</label>
                  <input type="text" className="form-input" value={tourSection.heading} onChange={(event) => setTourSectionField("heading", event.target.value)} placeholder="Tour Partners" />
                  <CharCounter value={tourSection.heading} max={LIMITS.title.max} />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Section Description</label>
                  <textarea className="form-input" rows={2} value={tourSection.description} onChange={(event) => setTourSectionField("description", event.target.value)} placeholder="Short introduction shown below the Tour Partners heading." />
                  <CharCounter value={tourSection.description} max={LIMITS.short_description.max} />
                </div>
              </div>
            </div>

            <label className="form-label" style={{ marginBottom: 10 }}>Tour Partner Cards</label>
            <FieldHint text="Each row becomes one large partner card on the page. The layout can alternate automatically on the frontend by row order." />
            {tourSection.partners.map((partner, index) => (
              <CollapseRow
                key={`tour-partner-${index}`}
                title={partner.title?.trim() || `Tour Partner ${index + 1}`}
                description={`${cleanParagraphs(partner.descriptions).length} paragraph(s) | ${partner.image ? "Image added" : "Image missing"}`}
                isOpen={Boolean(tourOpen[index])}
                onToggle={() => setTourOpen((prev) => toggleOpen(prev, index))}
              >
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Partner Title <span className="required-mark">*</span></label>
                      <input type="text" className="form-input" value={partner.title} onChange={(event) => updateTourPartner(index, "title", event.target.value)} placeholder="e.g. DP World" />
                      <CharCounter value={partner.title} max={LIMITS.title.max} />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Optional Link URL</label>
                      <input type="url" className="form-input" value={partner.link_url} onChange={(event) => updateTourPartner(index, "link_url", event.target.value)} placeholder="https://partner.com" />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <ImageUploadField label="Main Image" value={partner.image} onChange={(url) => updateTourPartner(index, "image", url)} folder="tour-partners" previewH={180} spec={detailImageSpec} />
                    <ImageHint recommended={detailImageSpec.recommended} maxSize={`${detailImageSpec.maxMB}MB`} note="This image appears as the large card visual." />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <ImageUploadField label="Overlay Logo" value={partner.overlay_logo} onChange={(url) => updateTourPartner(index, "overlay_logo", url)} folder="tour-partners" previewH={100} spec={logoSpec} />
                    <ImageHint recommended={logoSpec.recommended} maxSize={`${logoSpec.maxMB}MB`} note="Shown as the white/coloured label overlay on top of the partner image." />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <ImageUploadField label="Logo 2" value={partner.logo_2} onChange={(url) => updateTourPartner(index, "logo_2", url)} folder="tour-partners" previewH={100} spec={logoSpec} />
                    <ImageHint recommended={logoSpec.recommended} maxSize={`${logoSpec.maxMB}MB`} note="Optional second logo with the same recommendations as the overlay logo." />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description Paragraphs <span className="required-mark">*</span></label>
                  {partner.descriptions.map((paragraph, paragraphIndex) => (
                    <div key={`tour-desc-${index}-${paragraphIndex}`} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <textarea className="form-input" rows={3} value={paragraph} onChange={(event) => updateTourParagraph(index, paragraphIndex, event.target.value)} placeholder={`Paragraph ${paragraphIndex + 1}`} style={{ flex: 1 }} />
                        {partner.descriptions.length > 1 && (
                          <button type="button" className="action-button secondary" style={{ alignSelf: "flex-start", padding: "6px 10px" }} onClick={() => removeTourParagraph(index, paragraphIndex)}>
                            <MinusCircleOutlined />
                          </button>
                        )}
                      </div>
                      <CharCounter value={paragraph} max={LIMITS.description.max} />
                    </div>
                  ))}
                  <AddBtn onClick={() => addTourParagraph(index)} label="Add Paragraph" />
                </div>

                {tourSection.partners.length > 1 && <RemoveBtn onClick={() => removeTourPartner(index)} label="Remove Partner Row" />}
              </CollapseRow>
            ))}
            <AddBtn onClick={addTourPartner} label="Add Tour Partner Row" />
          </SectionCard>

          <SectionCard number="3" title="PGTI Partners Content Section" subtitle="Use this if you also want to maintain a detailed PGTI partner list in the same card-style format.">
            <div className="row">
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Section Heading</label>
                  <input type="text" className="form-input" value={pgtiSection.heading} onChange={(event) => setPgtiSectionField("heading", event.target.value)} placeholder="PGTI Partners" />
                  <CharCounter value={pgtiSection.heading} max={LIMITS.title.max} />
                </div>
              </div>
              <div className="col-md-6 col-12 mb-3">
                <div className="form-group">
                  <label className="form-label">Section Description</label>
                  <textarea className="form-input" rows={2} value={pgtiSection.description} onChange={(event) => setPgtiSectionField("description", event.target.value)} placeholder="Optional introduction for the PGTI partner list." />
                  <CharCounter value={pgtiSection.description} max={LIMITS.short_description.max} />
                </div>
              </div>
            </div>

            <label className="form-label" style={{ marginBottom: 10 }}>PGTI Partner Cards</label>
            <FieldHint text="This list uses the same structure as Tour Partners. Leave all rows blank if you do not want detailed PGTI partner cards yet." />
            {pgtiSection.partners.map((partner, index) => (
              <CollapseRow
                key={`pgti-partner-${index}`}
                title={partner.title?.trim() || `PGTI Partner ${index + 1}`}
                description={`${cleanParagraphs(partner.descriptions).length} paragraph(s) | ${partner.image ? "Image added" : "Image missing"}`}
                isOpen={Boolean(pgtiOpen[index])}
                onToggle={() => setPgtiOpen((prev) => toggleOpen(prev, index))}
              >
                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Partner Title</label>
                      <input type="text" className="form-input" value={partner.title} onChange={(event) => updatePgtiPartner(index, "title", event.target.value)} placeholder="e.g. GolfPlus Monthly" />
                      <CharCounter value={partner.title} max={LIMITS.title.max} />
                    </div>
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Optional Link URL</label>
                      <input type="url" className="form-input" value={partner.link_url} onChange={(event) => updatePgtiPartner(index, "link_url", event.target.value)} placeholder="https://partner.com" />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 col-12 mb-3">
                    <ImageUploadField label="Main Image" value={partner.image} onChange={(url) => updatePgtiPartner(index, "image", url)} folder="tour-partners" previewH={180} spec={detailImageSpec} />
                    <ImageHint recommended={detailImageSpec.recommended} maxSize={`${detailImageSpec.maxMB}MB`} note="This image appears as the large card visual." />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <ImageUploadField label="Overlay Logo" value={partner.overlay_logo} onChange={(url) => updatePgtiPartner(index, "overlay_logo", url)} folder="tour-partners" previewH={100} spec={logoSpec} />
                    <ImageHint recommended={logoSpec.recommended} maxSize={`${logoSpec.maxMB}MB`} note="Shown as the logo overlay on top of the partner image." />
                  </div>
                  <div className="col-md-6 col-12 mb-3">
                    <ImageUploadField label="Logo 2" value={partner.logo_2} onChange={(url) => updatePgtiPartner(index, "logo_2", url)} folder="tour-partners" previewH={100} spec={logoSpec} />
                    <ImageHint recommended={logoSpec.recommended} maxSize={`${logoSpec.maxMB}MB`} note="Optional second logo with the same recommendations as the overlay logo." />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description Paragraphs</label>
                  {partner.descriptions.map((paragraph, paragraphIndex) => (
                    <div key={`pgti-desc-${index}-${paragraphIndex}`} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <textarea className="form-input" rows={3} value={paragraph} onChange={(event) => updatePgtiParagraph(index, paragraphIndex, event.target.value)} placeholder={`Paragraph ${paragraphIndex + 1}`} style={{ flex: 1 }} />
                        {partner.descriptions.length > 1 && (
                          <button type="button" className="action-button secondary" style={{ alignSelf: "flex-start", padding: "6px 10px" }} onClick={() => removePgtiParagraph(index, paragraphIndex)}>
                            <MinusCircleOutlined />
                          </button>
                        )}
                      </div>
                      <CharCounter value={paragraph} max={LIMITS.description.max} />
                    </div>
                  ))}
                  <AddBtn onClick={() => addPgtiParagraph(index)} label="Add Paragraph" />
                </div>

                {pgtiSection.partners.length > 1 && <RemoveBtn onClick={() => removePgtiPartner(index)} label="Remove Partner Row" />}
              </CollapseRow>
            ))}
            <AddBtn onClick={addPgtiPartner} label="Add PGTI Partner Row" />
          </SectionCard>

          <SectionCard number="4" title="Bottom Partner Strips" subtitle="The two bottom logo strips will use the overlay logos from the Tour Partners and PGTI Partners rows above.">
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
              }}
            >
              <InfoCircleOutlined style={{ color: "#0369a1", marginTop: 2 }} />
              <div style={{ fontSize: 13, color: "#334155" }}>
                The footer strips are auto-generated from the <strong>Overlay Logo</strong> field in each partner row.
                To change the strip logos, update the partner rows above. 
              </div>
            </div>
          </SectionCard>

          <div className="content-card">
            <div className="content-card-body">
              <div className="form-section">
                <h3 className="form-section-title">Settings</h3>
                <div className="row">
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Tour Type</label>
                      <select className="form-input" value={tourType} onChange={(event) => setTourType(event.target.value)}>
                        {TOUR_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {tourType === "F" && (
                        <button
                          type="button"
                          className="action-button secondary"
                          onClick={copyFromMainTour}
                          disabled={isLoading}
                          style={{ marginTop: 12 }}
                        >
                          Copy from Main Tour
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <div className="form-group">
                      <label className="form-label">Page Status</label>
                      <select className="form-input" value={status} onChange={(event) => setStatus(event.target.value)}>
                        <option value="A">Active</option>
                        <option value="I">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4 col-12 mb-3">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginTop: 28 }}>
                      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#334155" }}>Tour partner cards: <strong>{tourPartnerCount}</strong></div>
                      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#334155" }}>PGTI partner cards: <strong>{pgtiPartnerCount}</strong></div>
                      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#334155" }}>Auto Tour strip logos: <strong>{tourLogoCount}</strong></div>
                      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#334155" }}>Auto PGTI strip logos: <strong>{pgtiLogoCount}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="action-button secondary" onClick={() => navigate("/admin/cms/tour-partners/list")}>Cancel</button>
                  <button id="tour-partners-save-submit" type="submit" className="action-button primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="loading-spinner small"></div>
                        {isEdit ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <SaveOutlined /> {isEdit ? "Update Tour Partners Page" : "Save Tour Partners Page"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <LoadingEffect isLoading={isLoading} text="Saving, please wait..." />
    </div>
  );
}
