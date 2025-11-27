import React, { useEffect, useState, useRef, useMemo } from "react";
import { Dropdown, notification, Modal, Checkbox } from "antd";
import {
  faEye,
  faRefresh,
  faSort,
  faSortUp,
  faSortDown,
  faGripVertical,
  faSearch,
  faTimes,
  faFilterCircleXmark,
  faEyeSlash,
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
  faThumbtack,
  faExpand,
  faCompress,
  faList,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CheckCircleOutlined } from "@ant-design/icons";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import "../../pages/Admin/admin-pages.css";

/**
 * EnhancedTable - Reusable TanStack Table Component
 *
 * Features:
 * - Column Sorting (client-side)
 * - Column Resizing
 * - Column Reordering
 * - Row Selection
 * - Virtual Scrolling
 * - Global Filtering (client-side instant)
 * - Column Filtering (server-side)
 * - Toggle Column Filters
 * - Server-Side Pagination
 * - Column Pinning
 * - Fullscreen Mode
 * - Data Export (CSV)
 */
export default function EnhancedTable({
  // Data props
  data = [],
  columns = [],
  isLoading = false,

  // Pagination props
  currentPage = 1,
  totalPages = 1,
  limit = 10,
  skip = 0,
  count = 0,
  onPageChange,
  onLimitChange,

  // Server-side filter props
  serverColumnFilters = {},
  onServerColumnFiltersChange,

  // Callbacks
  onRefresh,

  // Permissions
  permission = {},

  // Custom actions dropdown
  renderActions,

  // Empty state
  emptyStateMessage = "No data found",
  activeTab = "all",

  // Additional props
  targetRef,
  showDataComponent = true,

  // Export props
  enableExport = true,
  exportFileName = "export",
  exportOnlySelected = false,
}) {
  // TanStack Table state management
  const [sorting, setSorting] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnSizing, setColumnSizing] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnPinning, setColumnPinning] = useState({
    left: ["select"],
    right: ["actions"],
  });
  const tableContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);

  // Filter state
  const [globalFilter, setGlobalFilter] = useState("");
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showColumnVisibilityModal, setShowColumnVisibilityModal] =
    useState(false);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({});

  // Column reordering
  const [draggedColumn, setDraggedColumn] = useState(null);

  const handleDragStart = (columnId) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId) => {
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      return;
    }

    const currentOrder = table.getAllLeafColumns().map((col) => col.id);
    const draggedIndex = currentOrder.indexOf(draggedColumn);
    const targetIndex = currentOrder.indexOf(targetColumnId);

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  // Fullscreen handlers
  const toggleFullScreen = () => {
    if (!tableWrapperRef.current) return;

    if (!isFullScreen) {
      if (tableWrapperRef.current.requestFullscreen) {
        tableWrapperRef.current.requestFullscreen();
      } else if (tableWrapperRef.current.webkitRequestFullscreen) {
        tableWrapperRef.current.webkitRequestFullscreen();
      } else if (tableWrapperRef.current.msRequestFullscreen) {
        tableWrapperRef.current.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("msfullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullScreenChange
      );
    };
  }, []);

  // Reset row selection when data changes
  useEffect(() => {
    setRowSelection({});
  }, [data]);

  // Initialize table instance
  const table = useReactTable({
    data: data || [],
    columns,
    pageCount: totalPages,
    state: {
      sorting,
      columnOrder,
      columnSizing,
      rowSelection,
      globalFilter,
      columnPinning,
      columnVisibility,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: limit,
      },
    },
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater({
          pageIndex: currentPage - 1,
          pageSize: limit,
        });
        if (newPagination.pageIndex !== currentPage - 1 && onPageChange) {
          onPageChange(newPagination.pageIndex + 1);
        }
        if (newPagination.pageSize !== limit && onLimitChange) {
          onLimitChange(newPagination.pageSize);
        }
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    enableSorting: true,
    enableGlobalFilter: true,
    globalFilterFn: "includesString",
    enableColumnPinning: true,
    enableHiding: true,
    manualPagination: true,
  });

  // Virtual scrolling setup
  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const selectedCount = Object.keys(rowSelection).length;

  // Export to CSV function
  const handleExport = () => {
    try {
      // Get visible columns (excluding select and actions)
      const visibleColumns = table
        .getAllLeafColumns()
        .filter(
          (col) =>
            col.getIsVisible() && col.id !== "select" && col.id !== "actions"
        );

      if (visibleColumns.length === 0) {
        notification.open({
          message: "Export Failed",
          description: "No visible columns to export.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "orange" }} />,
          duration: 2,
        });
        return;
      }

      // Get data to export
      let dataToExport;
      if (exportOnlySelected && selectedCount > 0) {
        // Export only selected rows
        dataToExport = table
          .getSelectedRowModel()
          .rows.map((row) => row.original);
      } else {
        // Export filtered rows (respects global filter and column filters)
        dataToExport = table
          .getFilteredRowModel()
          .rows.map((row) => row.original);
      }

      if (dataToExport.length === 0) {
        notification.open({
          message: "Export Failed",
          description: exportOnlySelected
            ? "No rows selected to export."
            : "No data available to export.",
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "orange" }} />,
          duration: 2,
        });
        return;
      }

      // Get column headers
      const headers = visibleColumns.map((col) => {
        // Get header text
        const header = col.columnDef.header;
        if (typeof header === "string") {
          return header;
        }
        // For function headers, try to get a readable name
        return (
          col.id.charAt(0).toUpperCase() + col.id.slice(1).replace(/_/g, " ")
        );
      });

      // Convert data to CSV rows
      const csvRows = dataToExport.map((row) => {
        return visibleColumns.map((col) => {
          let value = "";

          // Get the cell value
          if (col.columnDef.accessorFn) {
            value = col.columnDef.accessorFn(row);
          } else if (col.columnDef.accessorKey) {
            value = row[col.columnDef.accessorKey];
          } else {
            // For custom cells, try to get a value
            value = row[col.id] || "";
          }

          // Format the value
          if (value === null || value === undefined) {
            value = "";
          } else if (typeof value === "object") {
            // For objects, convert to string
            value = JSON.stringify(value);
          } else {
            value = String(value);
          }

          // Escape CSV special characters
          // If value contains comma, quote, or newline, wrap in quotes and escape quotes
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            value = `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        });
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      // Add BOM for Excel compatibility
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      // Create download link
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `${exportFileName}_${timestamp}.csv`;
      link.setAttribute("download", filename);

      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notification.open({
        message: "Export Successful",
        description: `Exported ${dataToExport.length} row${
          dataToExport.length !== 1 ? "s" : ""
        } to ${filename}`,
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "green" }} />,
        duration: 2,
      });
    } catch (error) {
      console.error("Export error:", error);
      notification.open({
        message: "Export Failed",
        description:
          "An error occurred while exporting data. Please try again.",
        placement: "topRight",
        icon: <CheckCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    }
  };

  return (
    <div ref={tableWrapperRef}>
      {/* Global Search Bar */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: "1",
            minWidth: "300px",
            maxWidth: "500px",
          }}
        >
          <FontAwesomeIcon
            icon={faSearch}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns (instant)..."
            style={{
              width: "100%",
              padding: "10px 40px 10px 40px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
              title="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        {(globalFilter ||
          Object.values(serverColumnFilters || {}).some((v) => v)) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "#eff6ff",
              borderRadius: "6px",
              fontSize: "13px",
              color: "#3b82f6",
              fontWeight: 500,
            }}
          >
            <FontAwesomeIcon icon={faFilterCircleXmark} />
            <span>
              {table.getFilteredRowModel().rows.length} of {data?.length} result
              {data?.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
          {(sorting.length > 0 ||
            Object.keys(columnSizing).length > 0 ||
            columnOrder.length > 0 ||
            globalFilter ||
            Object.values(serverColumnFilters || {}).some((v) => v) ||
            columnPinning.left?.length > 1 ||
            columnPinning.right?.length > 1 ||
            Object.keys(columnVisibility).length > 0) && (
            <button
              className="action-button secondary"
              onClick={() => {
                setSorting([]);
                setColumnSizing({});
                setColumnOrder([]);
                setGlobalFilter("");
                setColumnVisibility({});
                if (onServerColumnFiltersChange) {
                  onServerColumnFiltersChange({});
                }
                setColumnPinning({
                  left: ["select"],
                  right: ["actions"],
                });
                notification.open({
                  message: "Table Reset",
                  description:
                    "Table customization, filters, and column visibility have been reset.",
                  placement: "topRight",
                  icon: <CheckCircleOutlined style={{ color: "green" }} />,
                  duration: 2,
                });
              }}
              title="Reset sorting, sizing, column order, filters, and pinning"
            >
              <FontAwesomeIcon icon={faRefresh} />
              Reset Table
            </button>
          )}

          <button
            className={`action-button ${
              showColumnFilters ? "primary" : "secondary"
            }`}
            onClick={() => setShowColumnFilters(!showColumnFilters)}
            title={
              showColumnFilters ? "Hide column filters" : "Show column filters"
            }
          >
            <FontAwesomeIcon icon={showColumnFilters ? faEye : faEyeSlash} />
            Column Filters
          </button>

          <button
            className="action-button secondary"
            onClick={() => setShowColumnVisibilityModal(true)}
            title="Show/Hide columns"
          >
            <FontAwesomeIcon icon={faList} />
            Columns
          </button>

          <button
            className="action-button secondary"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit fullscreen (ESC)" : "Enter fullscreen"}
          >
            <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
            {isFullScreen ? "Exit" : "Fullscreen"}
          </button>

          {enableExport && (
            <button
              className="action-button secondary"
              onClick={handleExport}
              title={
                exportOnlySelected && selectedCount > 0
                  ? `Export ${selectedCount} selected row${
                      selectedCount > 1 ? "s" : ""
                    } to CSV`
                  : `Export ${
                      table.getFilteredRowModel().rows.length
                    } filtered row${
                      table.getFilteredRowModel().rows.length !== 1 ? "s" : ""
                    } to CSV`
              }
              disabled={data?.length === 0}
            >
              <FontAwesomeIcon icon={faDownload} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Selected rows banner */}
      {selectedCount > 0 && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => setRowSelection({})}
            style={{
              background: "white",
              color: "#3b82f6",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="modern-table-container">
        {isLoading ? (
          <div className="loading-container" style={{ padding: "60px 0" }}>
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading...</div>
          </div>
        ) : (
          <div
            ref={tableContainerRef}
            style={{
              overflow: "auto",
              height: "calc(100vh - 400px)",
              position: "relative",
            }}
          >
            <table
              className="modern-table"
              style={{
                width: "100%",
                tableLayout: "fixed",
                position: "relative",
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "white",
                }}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <React.Fragment key={headerGroup.id}>
                    {/* Header Row */}
                    <tr style={{ display: "flex", width: "100%" }}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          draggable={
                            header.id !== "select" && header.id !== "actions"
                          }
                          onDragStart={() => handleDragStart(header.id)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(header.id)}
                          style={{
                            width: `${header.getSize()}px`,
                            minWidth: `${header.getSize()}px`,
                            maxWidth: `${header.getSize()}px`,
                            position: header.column.getIsPinned()
                              ? "sticky"
                              : "relative",
                            left:
                              header.column.getIsPinned() === "left"
                                ? `${header.column.getStart("left")}px`
                                : undefined,
                            right:
                              header.column.getIsPinned() === "right"
                                ? `${header.column.getAfter("right")}px`
                                : undefined,
                            cursor: header.column.getCanSort()
                              ? "pointer"
                              : "default",
                            userSelect: "none",
                            backgroundColor:
                              draggedColumn === header.id
                                ? "#e0e7ff"
                                : header.column.getIsPinned()
                                ? "#f0f9ff"
                                : "white",
                            opacity: draggedColumn === header.id ? 0.5 : 1,
                            transition: "background-color 0.2s",
                            zIndex: header.column.getIsPinned() ? 20 : 10,
                            boxShadow: header.column.getIsPinned()
                              ? "2px 0 4px rgba(0,0,0,0.1)"
                              : "none",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: "8px",
                              width: "100%",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                flex: 1,
                              }}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {header.id !== "select" &&
                                header.id !== "actions" && (
                                  <FontAwesomeIcon
                                    icon={faGripVertical}
                                    style={{
                                      opacity: 0.5,
                                      fontSize: "12px",
                                      cursor: "grab",
                                    }}
                                    title="Drag to reorder"
                                  />
                                )}
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {header.column.getCanPin() &&
                                header.id !== "select" &&
                                header.id !== "actions" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const isPinned =
                                        header.column.getIsPinned();
                                      header.column.pin(
                                        isPinned ? false : "left"
                                      );
                                    }}
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      header.column.pin(
                                        header.column.getIsPinned()
                                          ? false
                                          : "right"
                                      );
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      padding: "4px",
                                      display: "flex",
                                      alignItems: "center",
                                      color: header.column.getIsPinned()
                                        ? "#3b82f6"
                                        : "#9ca3af",
                                      opacity: header.column.getIsPinned()
                                        ? 1
                                        : 0.5,
                                    }}
                                    title={
                                      header.column.getIsPinned()
                                        ? `Pinned to ${header.column.getIsPinned()} (click to unpin)`
                                        : "Click to pin left, right-click to pin right"
                                    }
                                  >
                                    <FontAwesomeIcon
                                      icon={faThumbtack}
                                      style={{
                                        fontSize: "12px",
                                        transform: header.column.getIsPinned()
                                          ? "rotate(0deg)"
                                          : "rotate(45deg)",
                                        transition: "transform 0.2s",
                                      }}
                                    />
                                  </button>
                                )}
                              {header.column.getCanSort() && (
                                <FontAwesomeIcon
                                  icon={
                                    header.column.getIsSorted() === "asc"
                                      ? faSortUp
                                      : header.column.getIsSorted() === "desc"
                                      ? faSortDown
                                      : faSort
                                  }
                                  style={{
                                    fontSize: "14px",
                                    opacity: header.column.getIsSorted()
                                      ? 1
                                      : 0.3,
                                    cursor: "pointer",
                                  }}
                                  onClick={header.column.getToggleSortingHandler()}
                                />
                              )}
                            </div>
                          </div>
                          {header.column.getCanResize() && (
                            <div
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={`resizer ${
                                header.column.getIsResizing()
                                  ? "isResizing"
                                  : ""
                              }`}
                              style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                height: "100%",
                                width: "5px",
                                background: header.column.getIsResizing()
                                  ? "#3b82f6"
                                  : "transparent",
                                cursor: "col-resize",
                                userSelect: "none",
                                touchAction: "none",
                              }}
                            />
                          )}
                        </th>
                      ))}
                    </tr>

                    {/* Filter Row */}
                    {showColumnFilters && (
                      <tr
                        style={{
                          backgroundColor: "#f9fafb",
                          display: "flex",
                          width: "100%",
                        }}
                      >
                        {headerGroup.headers.map((header) => {
                          const columnId = header.column.id;
                          const canFilter = header.column.getCanFilter();
                          const filterValue =
                            canFilter && serverColumnFilters[columnId]
                              ? serverColumnFilters[columnId]
                              : "";

                          return (
                            <th
                              key={`${header.id}-filter`}
                              style={{
                                width: `${header.getSize()}px`,
                                minWidth: `${header.getSize()}px`,
                                maxWidth: `${header.getSize()}px`,
                                padding: "8px",
                                borderTop: "1px solid #e5e7eb",
                                position: header.column.getIsPinned()
                                  ? "sticky"
                                  : "relative",
                                left:
                                  header.column.getIsPinned() === "left"
                                    ? `${header.column.getStart("left")}px`
                                    : undefined,
                                right:
                                  header.column.getIsPinned() === "right"
                                    ? `${header.column.getAfter("right")}px`
                                    : undefined,
                                backgroundColor: header.column.getIsPinned()
                                  ? "#f0f9ff"
                                  : "#f9fafb",
                                zIndex: header.column.getIsPinned() ? 20 : 10,
                                boxShadow: header.column.getIsPinned()
                                  ? "2px 0 4px rgba(0,0,0,0.1)"
                                  : "none",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {canFilter &&
                              header.id !== "select" &&
                              header.id !== "actions" &&
                              header.id !== "index" ? (
                                <div
                                  style={{
                                    position: "relative",
                                    width: "100%",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={filterValue}
                                    onChange={(e) => {
                                      if (onServerColumnFiltersChange) {
                                        onServerColumnFiltersChange({
                                          ...serverColumnFilters,
                                          [columnId]: e.target.value,
                                        });
                                      }
                                    }}
                                    placeholder={`Filter...`}
                                    style={{
                                      width: "100%",
                                      padding: "6px 24px 6px 8px",
                                      border: "1px solid #e5e7eb",
                                      borderRadius: "4px",
                                      fontSize: "12px",
                                      outline: "none",
                                      backgroundColor: "white",
                                    }}
                                    onFocus={(e) =>
                                      (e.target.style.borderColor = "#3b82f6")
                                    }
                                    onBlur={(e) =>
                                      (e.target.style.borderColor = "#e5e7eb")
                                    }
                                  />
                                  {filterValue && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (onServerColumnFiltersChange) {
                                          onServerColumnFiltersChange({
                                            ...serverColumnFilters,
                                            [columnId]: "",
                                          });
                                        }
                                      }}
                                      style={{
                                        position: "absolute",
                                        right: "6px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#9ca3af",
                                        padding: "2px",
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "10px",
                                      }}
                                      title="Clear filter"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  )}
                                </div>
                              ) : null}
                            </th>
                          );
                        })}
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </thead>

              <tbody
                style={{
                  height:
                    data?.length === 0
                      ? "auto"
                      : `${rowVirtualizer.getTotalSize()}px`,
                  position: "relative",
                }}
              >
                {data?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getAllColumns().length}
                      style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        position: "relative",
                      }}
                    >
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <FontAwesomeIcon
                            icon={faEye}
                            style={{ fontSize: "48px", color: "#cbd5e1" }}
                          />
                        </div>
                        <h3
                          className="empty-state-title"
                          style={{
                            margin: "16px 0 8px",
                            fontSize: "18px",
                            color: "#1f2937",
                          }}
                        >
                          {emptyStateMessage}
                        </h3>
                        <p
                          className="empty-state-description"
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "#6b7280",
                          }}
                        >
                          {globalFilter ||
                          Object.values(serverColumnFilters || {}).some(
                            (v) => v
                          )
                            ? "Try adjusting your filters or search terms"
                            : activeTab === "all"
                            ? "No data has been created yet."
                            : `No ${activeTab} data found.`}
                        </p>
                        {(globalFilter ||
                          Object.values(serverColumnFilters || {}).some(
                            (v) => v
                          )) && (
                          <button
                            onClick={() => {
                              setGlobalFilter("");
                              if (onServerColumnFiltersChange) {
                                onServerColumnFiltersChange({});
                              }
                            }}
                            style={{
                              marginTop: "16px",
                              padding: "8px 16px",
                              backgroundColor: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: 500,
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faTimes}
                              style={{ marginRight: "8px" }}
                            />
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                      <tr
                        key={row.id}
                        style={{
                          position: "absolute",
                          transform: `translateY(${virtualRow.start}px)`,
                          width: "100%",
                          display: "flex",
                        }}
                        >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{
                              width: `${cell.column.getSize()}px`,
                              minWidth: `${cell.column.getSize()}px`,
                              maxWidth: `${cell.column.getSize()}px`,
                              position: cell.column.getIsPinned()
                              ? "sticky"
                                : "relative",
                              left:
                                cell.column.getIsPinned() === "left"
                                  ? `${cell.column.getStart("left")}px`
                                  : undefined,
                              right:
                                cell.column.getIsPinned() === "right"
                                  ? `${cell.column.getAfter("right")}px`
                                  : undefined,
                              backgroundColor: cell.column.getIsPinned()
                                ? "#f0f9ff"
                                : "white",
                              zIndex: cell.column.getIsPinned() ? 15 : 1,
                              boxShadow: cell.column.getIsPinned()
                                ? "2px 0 4px rgba(0,0,0,0.08)"
                                : "none",
                              display: "flex",
                              alignItems: "center",
                              borderTop: "1px solid #000",
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="modern-pagination">
          <div className="pagination-info">
            Showing {skip + 1} to {Math.min(skip + limit, count)} of {count}{" "}
            items
            {globalFilter && (
              <span
                style={{
                  marginLeft: "8px",
                  color: "#3b82f6",
                  fontSize: "13px",
                }}
              >
                ({table.getFilteredRowModel().rows.length} filtered)
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="tanstack-pagination">
              <button
                onClick={() => onPageChange && onPageChange(1)}
                disabled={!table.getCanPreviousPage()}
                className="pagination-button"
                title="First page"
              >
                <FontAwesomeIcon icon={faAnglesLeft} />
              </button>

              <button
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={!table.getCanPreviousPage()}
                className="pagination-button"
                title="Previous page"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              <div className="pagination-pages">
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let start = Math.max(
                    1,
                    currentPage - Math.floor(maxVisible / 2)
                  );
                  let end = Math.min(totalPages, start + maxVisible - 1);

                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => onPageChange && onPageChange(1)}
                        className="pagination-button"
                      >
                        1
                      </button>
                    );
                    if (start > 2) {
                      pages.push(
                        <span
                          key="ellipsis-start"
                          className="pagination-ellipsis"
                        >
                          ...
                        </span>
                      );
                    }
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => onPageChange && onPageChange(i)}
                        className={`pagination-button ${
                          i === currentPage ? "active" : ""
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push(
                        <span
                          key="ellipsis-end"
                          className="pagination-ellipsis"
                        >
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => onPageChange && onPageChange(totalPages)}
                        className="pagination-button"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              <button
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={!table.getCanNextPage()}
                className="pagination-button"
                title="Next page"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>

              <button
                onClick={() => onPageChange && onPageChange(totalPages)}
                disabled={!table.getCanNextPage()}
                className="pagination-button"
                title="Last page"
              >
                <FontAwesomeIcon icon={faAnglesRight} />
              </button>

              <select
                value={limit}
                onChange={(e) => onLimitChange && onLimitChange(e.target.value)}
                className="pagination-select"
              >
                {[10, 20, 30, 50, 100, 200, 300, 500, 1000].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize} / page
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Column Visibility Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FontAwesomeIcon icon={faList} />
            <span>Show/Hide Columns</span>
          </div>
        }
        open={showColumnVisibilityModal}
        onCancel={() => setShowColumnVisibilityModal(false)}
        getContainer={() => tableWrapperRef.current || document.body}
        zIndex={isFullScreen ? 9999 : 1000}
        footer={[
          <button
            key="select-all"
            className="action-button secondary"
            onClick={() => {
              const allColumns = table.getAllLeafColumns();
              const newVisibility = {};
              allColumns.forEach((col) => {
                if (col.id !== "select" && col.id !== "actions") {
                  newVisibility[col.id] = true;
                }
              });
              setColumnVisibility(newVisibility);
            }}
            style={{ marginRight: "auto" }}
          >
            Show All
          </button>,
          <button
            key="hide-all"
            className="action-button secondary"
            onClick={() => {
              const allColumns = table.getAllLeafColumns();
              const newVisibility = {};
              allColumns.forEach((col) => {
                if (col.id !== "select" && col.id !== "actions") {
                  newVisibility[col.id] = false;
                }
              });
              setColumnVisibility(newVisibility);
            }}
            style={{ marginRight: "8px" }}
          >
            Hide All
          </button>,
          <button
            key="close"
            className="action-button primary"
            onClick={() => setShowColumnVisibilityModal(false)}
          >
            Done
          </button>,
        ]}
        width={400}
      >
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {table
            .getAllLeafColumns()
            .filter(
              (column) => column.id !== "select" && column.id !== "actions"
            )
            .map((column) => {
              const isVisible = column.getIsVisible();
              return (
                <div
                  key={column.id}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                  onClick={() => {
                    column.toggleVisibility(!isVisible);
                  }}
                >
                  <Checkbox
                    checked={isVisible}
                    onChange={(e) => {
                      column.toggleVisibility(e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginRight: "12px" }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "14px",
                      fontWeight: isVisible ? 500 : 400,
                      color: isVisible ? "#1f2937" : "#9ca3af",
                    }}
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id.charAt(0).toUpperCase() +
                        column.id.slice(1).replace(/_/g, " ")}
                  </span>
                  {column.getIsPinned() && (
                    <FontAwesomeIcon
                      icon={faThumbtack}
                      style={{
                        fontSize: "12px",
                        color: "#3b82f6",
                        marginLeft: "8px",
                      }}
                      title={`Pinned to ${column.getIsPinned()}`}
                    />
                  )}
                </div>
              );
            })}
        </div>
      </Modal>
    </div>
  );
}
