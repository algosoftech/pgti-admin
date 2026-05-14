import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { InfoCircleOutlined } from "@ant-design/icons";
import moment from "moment";

import Top_navbar from "components/layout/TopNavbar";
import EnhancedTable from "components/table/EnhancedTable/EnhancedTable";
import { listContactUsInquiries } from "services/inquiries.service";
import "styles/admin-pages.css";

const PAGE_SIZE = 20;

export default function ContactUsInquiriesList() {
  const targetRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [serverColumnFilters, setServerColumnFilters] = useState({ search: "" });
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const skip = (currentPage - 1) * PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  const getList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listContactUsInquiries({
        skip,
        limit: PAGE_SIZE,
        condition: {
          ...(serverColumnFilters.search ? { search: serverColumnFilters.search } : {}),
        },
      });

      if (res?.status) {
        setRows(res.result || []);
        setCount(res.count || 0);
      } else {
        notification.open({
          message: "Oops!",
          description: res?.message || "Failed to load contact inquiries.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [serverColumnFilters.search, skip]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else getList();
    }, 350);
    return () => clearTimeout(timer);
  }, [serverColumnFilters.search]);

  useEffect(() => {
    getList();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "PGTI || Contact Us Inquiries";
  }, [currentPage, getList]);

  const columns = useMemo(() => [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => <span style={{ color: "#94a3b8", fontSize: 13 }}>{row.index + skip + 1}</span>,
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: "display_name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a5f" }}>{row.original.display_name || "Unknown"}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {(row.original.first_name || "") && (row.original.last_name || "")
              ? `${row.original.first_name} ${row.original.last_name}`.trim()
              : row.original.name || "Legacy record"}
          </div>
        </div>
      ),
      size: 180,
      enableColumnFilter: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ getValue }) => <span style={{ fontSize: 13, color: "#334155" }}>{getValue() || "—"}</span>,
      size: 220,
      enableColumnFilter: false,
    },
    {
      accessorKey: "mobile",
      header: "Mobile",
      cell: ({ row }) => <span style={{ fontSize: 13, color: "#334155" }}>{row.original.mobile || row.original.phone || "—"}</span>,
      size: 140,
      enableColumnFilter: false,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.original.message || "";
        const preview = message.length > 120 ? `${message.slice(0, 120)}...` : message || "—";
        return (
          <button
            type="button"
            onClick={() => setSelectedInquiry(row.original)}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              textAlign: "left",
              color: "#475569",
              fontSize: 12,
              cursor: "pointer",
              maxWidth: "100%",
            }}
          >
            {preview}
          </button>
        );
      },
      size: 360,
      enableColumnFilter: false,
    },
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ getValue }) => (
        <div>
          <div style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>
            {getValue() ? moment(getValue()).format("DD MMM YYYY, hh:mm A") : "—"}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {getValue() ? moment(getValue()).fromNow() : ""}
          </div>
        </div>
      ),
      size: 170,
      enableSorting: true,
    },
  ], [skip]);

  return (
    <div className="admin-page-container" ref={targetRef}>
      <Top_navbar title="Contact Us Inquiries" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ flex: "1 1 180px", background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "14px 18px" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1d4ed8" }}>{count}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Total Inquiries</div>
        </div>
      </div>

      <div className="content-card">
        <div className="tabs-header">
          <div className="tabs-container">
            <button className="tab-item active">All Inquiries</button>
          </div>
          <div className="tabs-actions">
            <button className="action-button secondary" onClick={getList}>
              <FontAwesomeIcon icon={faRefresh} /> Refresh
            </button>
          </div>
        </div>

        <div className="content-card-body">
          <EnhancedTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            limit={PAGE_SIZE}
            skip={skip}
            count={count}
            onPageChange={(page) => {
              setCurrentPage(page);
              targetRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onLimitChange={() => {}}
            serverColumnFilters={serverColumnFilters}
            onServerColumnFiltersChange={setServerColumnFilters}
            onRefresh={getList}
            emptyStateMessage="No contact inquiries found"
            targetRef={targetRef}
            exportFileName="contact-us-inquiries"
          />

          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13 }}>
            <FontAwesomeIcon icon={faEnvelope} />
            <span>These are the inquiry messages submitted from the public Contact Us page form.</span>
          </div>
        </div>
      </div>

      <Modal
        open={!!selectedInquiry}
        onCancel={() => setSelectedInquiry(null)}
        footer={null}
        width={640}
        centered
        destroyOnClose
      >
        {selectedInquiry && (
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>
              {selectedInquiry.display_name || "Inquiry Detail"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>Email</div>
                <div style={{ fontSize: 13, color: "#334155" }}>{selectedInquiry.email || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>Mobile</div>
                <div style={{ fontSize: 13, color: "#334155" }}>{selectedInquiry.mobile || selectedInquiry.phone || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>Submitted</div>
                <div style={{ fontSize: 13, color: "#334155" }}>
                  {selectedInquiry.created_at ? moment(selectedInquiry.created_at).format("DD MMM YYYY, hh:mm A") : "—"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 3 }}>Source</div>
                <div style={{ fontSize: 13, color: "#334155" }}>{selectedInquiry.source || "contact_us"}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Message</div>
            <div style={{ whiteSpace: "pre-wrap", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, fontSize: 13, color: "#334155", lineHeight: 1.7 }}>
              {selectedInquiry.message || "—"}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
