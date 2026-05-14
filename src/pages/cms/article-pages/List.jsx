import React, { useEffect, useRef, useState } from "react";
import { Dropdown, Modal, notification } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlignLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  OrderedListOutlined,
  PictureOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEllipsis,
  faPlus,
  faRefresh,
  faThumbsDown,
  faThumbsUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";

import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { usePermissions } from "contexts/PermissionContext";
import {
  changeArticlePageStatus,
  deleteArticlePage,
  getArticlePagesListingBanner,
  listArticlePages,
} from "services/articlePages.service";
import "styles/admin-pages.css";
import ListingBannerPreviewModal from "components/cms/ListingBannerPreviewModal";

const ARTICLE_SECTION_LABELS = [
  {
    key: "articleBasics",
    label: "Article Basics",
    desc: "Title, slug, author name, sort order and status",
    icon: <FileTextOutlined />,
  },
  {
    key: "heroBanner",
    label: "Hero Banner",
    desc: "Hero banner image and title displayed at the top of the article",
    icon: <PictureOutlined />,
  },
  {
    key: "introContent",
    label: "Intro Content",
    desc: "Intro heading, intro body, highlight text and main content heading",
    icon: <AlignLeftOutlined />,
  },
  {
    key: "topicSections",
    label: "Topic Sections",
    desc: "Dynamic topic blocks with labels, headings and rich-text content",
    icon: <OrderedListOutlined />,
  },
  {
    key: "seo",
    label: "SEO",
    desc: "Meta title and meta description for search engine optimisation",
    icon: <SearchOutlined />,
  },
];

export default function ArticlePagesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetRef = useRef(null);
  const permission = usePermissions("articles");
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO") || "null");

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [count, setCount] = useState(0);
  const activeTab = "all";
  const [serverColumnFilters, setServerColumnFilters] = useState({
    title: "",
    slug: "",
    author_name: "",
  });

  const [sectionPicker, setSectionPicker] = useState({ open: false, item: null });
  const [listingBanner, setListingBanner] = useState(null);
  const [bannerPreviewOpen, setBannerPreviewOpen] = useState(false);

  const canEdit = user?.admin_type === "Super Admin" || permission?.add_edit === "Y" || permission?.fullAccess === "Y";
  const canStatus = user?.admin_type === "Super Admin" || permission?.change_status === "Y" || permission?.fullAccess === "Y";
  const canDelete = user?.admin_type === "Super Admin" || permission?.delete === "Y" || permission?.fullAccess === "Y";

  const notify = (description, success = false) => {
    notification.open({
      message: success ? "Success" : "Oops!",
      description,
      placement: "topRight",
      icon: success ? <CheckCircleOutlined style={{ color: "green" }} /> : <InfoCircleOutlined style={{ color: "red" }} />,
      duration: 3,
    });
  };

  const getList = async (page = currentPage, pageLimit = limit) => {
    setIsLoading(true);
    const res = await listArticlePages({
      skip: (page - 1) * pageLimit,
      limit: pageLimit,
      status: activeTab === "all" ? undefined : activeTab,
      search: serverColumnFilters.title || undefined,
    });

    if (res?.status) {
      let data = res.result || [];
      if (serverColumnFilters.slug) {
        data = data.filter((item) => item.slug?.toLowerCase().includes(serverColumnFilters.slug.toLowerCase()));
      }
      if (serverColumnFilters.author_name) {
        data = data.filter((item) =>
          item.author_name?.toLowerCase().includes(serverColumnFilters.author_name.toLowerCase())
        );
      }
      setRows(data);
      setCount(res.count || 0);
    } else {
      notify(res?.message || "Failed to load article pages.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getList();
    loadListingBanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, activeTab, serverColumnFilters]);

  useEffect(() => {
    document.title = "PGTI || Article Pages";
  }, []);

  /* ── auto-open section picker from sidebar editId param ── */
  useEffect(() => {
    const editId = new URLSearchParams(location.search).get("editId");
    if (!editId) return;

    const openFromRows = (data) => {
      const found = data.find((r) => String(r.id) === String(editId));
      if (found) {
        setSectionPicker({ open: true, item: found });
        return true;
      }
      return false;
    };

    if (rows.length && openFromRows(rows)) return;

    const fetchAndOpen = async () => {
      const res = await listArticlePages({ id: editId, skip: 0, limit: 1 });
      if (res?.status && res.result?.length) {
        setSectionPicker({ open: true, item: res.result[0] });
      }
    };

    fetchAndOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, rows]);

  const openSectionPicker = (item) => setSectionPicker({ open: true, item });
  const closeSectionPicker = () => setSectionPicker({ open: false, item: null });

  const loadListingBanner = async () => {
    const res = await getArticlePagesListingBanner();
    if (res?.status) {
      setListingBanner(res.result || null);
    }
  };

  const openListingBannerEditor = () => {
    navigate("/admin/cms/article-pages/listing-banner", { state: listingBanner || {} });
  };

  const handleListingBannerClick = () => {
    if (!listingBanner) {
      openListingBannerEditor();
      return;
    }
    setBannerPreviewOpen(true);
  };

  const confirmBannerEdit = () => {
    Modal.confirm({
      title: "Edit article pages listing banner?",
      icon: <ExclamationCircleOutlined />,
      content: "This will open the article pages listing banner editor. Do you want to continue?",
      okText: "Yes, Edit",
      cancelText: "Cancel",
      onOk: () => {
        setBannerPreviewOpen(false);
        openListingBannerEditor();
      },
    });
  };

  const handleSectionEdit = (sectionKey) => {
    if (!sectionPicker.item) return;
    navigate("/admin/cms/article-pages/addeditdata", {
      state: { ...sectionPicker.item, openSectionKey: sectionKey },
    });
  };

  const handleEditAll = () => {
    if (!sectionPicker.item) return;
    navigate("/admin/cms/article-pages/addeditdata", {
      state: sectionPicker.item,
    });
  };

  const handleChangeStatus = async (id, status) => {
    const res = await changeArticlePageStatus({ id, status });
    if (res?.status) {
      notify("Article page status updated successfully.", true);
      getList();
      return;
    }
    notify(res?.message || "Failed to update article page status.");
  };

  const handleDelete = (item) => {
    Modal.confirm({
      title: "Delete this article page?",
      icon: <ExclamationCircleOutlined />,
      content: item?.title || "This article page will be removed permanently.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const res = await deleteArticlePage({ id: item.id });
        if (res?.status) {
          notify("Article page deleted successfully.", true);
          getList();
        } else {
          notify(res?.message || "Failed to delete article page.");
        }
      },
    });
  };

  const dropdownMenu = (item) => (
    <div className="action-dropdown-menu">
      {canEdit && (
        <button className="action-dropdown-item" onClick={() => openSectionPicker(item)}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Edit Sections</span>
        </button>
      )}
      {canStatus &&
        (item?.status === "A" ? (
          <button className="action-dropdown-item danger" onClick={() => handleChangeStatus(item.id, "I")}>
            <FontAwesomeIcon icon={faThumbsDown} />
            <span>Deactivate</span>
          </button>
        ) : (
          <button className="action-dropdown-item" onClick={() => handleChangeStatus(item.id, "A")}>
            <FontAwesomeIcon icon={faThumbsUp} />
            <span>Activate</span>
          </button>
        ))}
      {canDelete && (
        <button className="action-dropdown-item danger" onClick={() => handleDelete(item)}>
          <FontAwesomeIcon icon={faTrash} />
          <span>Delete</span>
        </button>
      )}
    </div>
  );

  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <input type="checkbox" checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} style={{ cursor: "pointer" }} />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} style={{ cursor: "pointer" }} />
      ),
      size: 60,
      enableSorting: false,
      enableResizing: false,
      enableGlobalFilter: false,
    },
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => row.index + (currentPage - 1) * limit + 1,
      size: 70,
      enableSorting: true,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div
          style={{ cursor: canEdit ? "pointer" : "default" }}
          onClick={() => canEdit && openSectionPicker(row.original)}
        >
          <div className="font-weight-600" style={{ color: canEdit ? "#1d4ed8" : undefined }}>
            {row.original.title || "Untitled Article Page"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{row.original.hero_title || "No hero title"}</div>
        </div>
      ),
      size: 300,
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ getValue }) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13 }}>
          <LinkOutlined style={{ color: "#94a3b8" }} />
          {getValue() || "—"}
        </span>
      ),
      size: 220,
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "author_name",
      header: "Author",
      cell: ({ getValue }) => getValue() || "—",
      size: 170,
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "sections_count",
      header: "Sections",
      cell: ({ getValue }) => getValue() || 0,
      size: 110,
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ getValue }) => (
        <span style={{ color: "#64748b", fontSize: 13 }}>
          {getValue() ? moment(getValue()).format("DD MMM, YYYY hh:mm A") : "—"}
        </span>
      ),
      size: 180,
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`status-badge ${row.original.status === "A" ? "active" : "inactive"}`}>
          {row.original.status === "A" ? "Active" : "Inactive"}
        </span>
      ),
      size: 110,
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        canEdit || canDelete || canStatus ? (
          <div className="action-dropdown">
            <Dropdown overlay={() => dropdownMenu(row.original)} placement="bottomRight" trigger={["click"]}>
              <button className="action-dropdown-trigger">
                <FontAwesomeIcon icon={faEllipsis} />
              </button>
            </Dropdown>
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
      size: 100,
      enableSorting: false,
      enableResizing: false,
      enableGlobalFilter: false,
    },
  ];

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Article Pages</h1>
            <p className="page-subtitle">Create structured long-form article pages with hero, intro, and topic sections.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="action-button secondary" onClick={() => getList()}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </button>
            {canEdit && (
              <button className="action-button secondary" onClick={handleListingBannerClick}>
                {listingBanner ? <EyeOutlined /> : <PictureOutlined />}
                {listingBanner ? "Preview Listing Banner" : "Add Listing Banner"}
              </button>
            )}
            {canEdit && (
              <button className="action-button primary" onClick={() => navigate("/admin/cms/article-pages/addeditdata")}>
                <FontAwesomeIcon icon={faPlus} />
                Add Article Page
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="content-card">
          <div className="content-card-body">
            <EnhancedTable
              data={rows}
              columns={columns}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={Math.ceil((count || 0) / limit) || 1}
              limit={limit}
              skip={(currentPage - 1) * limit}
              count={count}
              onPageChange={setCurrentPage}
              onLimitChange={(value) => {
                setLimit(value);
                setCurrentPage(1);
              }}
              serverColumnFilters={serverColumnFilters}
              onServerColumnFiltersChange={setServerColumnFilters}
              onRefresh={() => getList()}
              permission={permission}
              emptyStateMessage="No article pages found"
              activeTab={activeTab}
              targetRef={targetRef}
              exportFileName="article-pages"
            />
          </div>
        </div>
      </div>

      {/* ── Section Picker Modal ──────────────────────────── */}
      <Modal
        open={sectionPicker.open}
        onCancel={closeSectionPicker}
        footer={null}
        width={520}
        centered
        destroyOnClose
      >
        {sectionPicker.item && (
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
              {sectionPicker.item.title || "Untitled Article"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
              Select a section to edit, or click "Edit All" to open the full form.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {ARTICLE_SECTION_LABELS.map(({ key, label, desc, icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSectionEdit(key)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "12px 14px", background: "#f8fafc",
                    borderRadius: 10, border: "1px solid #e2e8f0",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 1,
                    background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {React.cloneElement(icon, { style: { color: "#1d4ed8", fontSize: 14 } })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#1e3a5f" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
              <button type="button" className="action-button secondary" onClick={closeSectionPicker}>
                Cancel
              </button>
              <button type="button" className="action-button primary" onClick={handleEditAll}>
                <EditOutlined /> Edit All Sections
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ListingBannerPreviewModal
        open={bannerPreviewOpen}
        onCancel={() => setBannerPreviewOpen(false)}
        banner={listingBanner}
        title="Article Pages Listing Banner Preview"
        description="Review the current banner that will be sent in the front Article Pages listing API."
        onEdit={confirmBannerEdit}
      />
    </div>
  );
}
