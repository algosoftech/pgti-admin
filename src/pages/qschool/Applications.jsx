import React, {
  useEffect,
  useState,
} from "react";

import {
  Button,
  Checkbox,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  Upload,
  notification,
} from "antd";

import {
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import TopNavbar from "components/layout/TopNavbar";
import LoadingEffect from "components/ui/Loading/LoadingEffect";

import {
  deleteQSchoolApplication,
  getQSchoolApplication,
  listQSchoolApplications,
  updateQSchoolApplication,
  updateQSchoolEmailConfirmation,
  updateQSchoolPaymentStatus,
  downloadQSchoolExcel,
} from "services/qschool.service";

import "styles/admin-pages.css";

const {
  TextArea,
} = Input;

const initialFilters = {
  year: "",
  email_status: "",
  search: "",
};
const excludedEditFields = [
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
  "status",

  "certificate_path",
  "certificate_url",

  "payment_slip_path",
  "payment_slip_url",

  "preferred_locations",

  // Hide database fields because aliases are displayed
  "played_before",
  "exemption_key",
  "pan",
  "aadhar",
];

const labelMap = {
  application_number:
    "Application Number",

  membership_no:
    "Membership No",

  name:
    "Name",

  address:
    "Address",

  state:
    "State",

  country:
    "Country",

  mobile:
    "Mobile",

  email:
    "Email",

  nationality:
    "Nationality",

  dob:
    "Date of Birth",

  club_attachment:
    "Club Attachment",

  playing_status:
    "Playing Status",

  handicap:
    "Handicap",

  pga_association:
    "PGA Association",

  played_pgti:
    "Played PGTI",

  exemption:
    "Exemption",

  pan_number:
    "PAN Number",

  aadhar_number:
    "Aadhar Number",

  passport_number:
    "Passport Number",

  playing_status_final:
    "Playing Status Final",

  pref1:
    "Preferred Location 1",

  pref2:
    "Preferred Location 2",

  pref3:
    "Preferred Location 3",
};

const getFieldLabel = (key) =>
  labelMap[key] ||
  key
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );

const getPreferredLocations = (
  application
) => {
  if (
    Array.isArray(
      application?.preferred_locations
    )
  ) {
    return application.preferred_locations;
  }

  if (
    typeof application?.preferred_locations ===
    "string"
  ) {
    try {
      const parsed =
        JSON.parse(
          application.preferred_locations
        );

      if (
        Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {
      // Ignore invalid JSON.
    }
  }

  return [
    application?.pref1 || "",
    application?.pref2 || "",
    application?.pref3 || "",
  ];
};

const normalizeApplication = (
  data
) => {
  const locations =
    getPreferredLocations(
      data
    );

  return {
    ...data,

    application_number:
      data.application_number ||
      (data.year && data.id
        ? `PGT-${data.year}-${data.id}`
        : ""),

    pref1:
      locations[0] || "",

    pref2:
      locations[1] || "",

    pref3:
      locations[2] || "",

    payment_status:
      data.payment_status ===
        true ||
      data.payment_status ===
        1 ||
      data.payment_status ===
        "1" ||
      data.payment_status ===
        "true" ||
      data.payment_status ===
        "submitted",

    email_confirmed:
      data.email_confirmed ===
        true ||
      data.email_confirmed ===
        1 ||
      data.email_confirmed ===
        "1" ||
      data.email_confirmed ===
        "true",
  };
};

export default function QSchoolApplications() {
  const [rows, setRows] =
    useState([]);

  const [count, setCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [edit, setEdit] =
    useState(null);

  const [filters, setFilters] =
    useState(
      initialFilters
    );

  const [years, setYears] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const pageSize = 20;

  const load = async (
    currentPage = page
  ) => {
    try {
      setLoading(true);

      const res =
        await listQSchoolApplications({
          page: currentPage,
          limit: pageSize,
          year: filters.year,
          email_status:
            filters.email_status,
          search:
            filters.search,
        });

      if (res?.status) {

         console.log("Q-School Applications API Response:", res);
  console.log("Application Results:", res.result);

  console.log(
    "Document URLs:",
    Array.isArray(res.result)
      ? res.result.map((application) => ({
          id: application.id,
          name: application.name,
          certificate_url: application.certificate_url,
          payment_slip_url: application.payment_slip_url,
        }))
      : []
  );
        setRows(
          Array.isArray(
            res.result
          )
            ? res.result.map(
                normalizeApplication
              )
            : []
        );

        setCount(
          Number(
            res.count || 0
          )
        );

        if (
          Array.isArray(
            res.years
          )
        ) {
          setYears(
            res.years.map(
              (year) => ({
                value:
                  Number(year),
                label:
                  String(year),
              })
            )
          );
        }
      } else {
        notification.error({
          message:
            res?.message ||
            "Failed to load applications.",
        });
      }
    } catch (error) {
      notification.error({
        message:
          error?.message ||
          "Failed to load applications.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.year,
    filters.email_status,
  ]);

  const handleSearch = () => {
    setPage(1);
    load(1);
  };

  const open = async (
    id
  ) => {
    try {
      setLoading(true);

      const res =
        await getQSchoolApplication(
          id
        );

      if (
        res?.status &&
        res?.result
      ) {
        setEdit(
          normalizeApplication(
            res.result
          )
        );
      } else {
        notification.error({
          message:
            res?.message ||
            "Failed to fetch application.",
        });
      }
    } catch (error) {
      notification.error({
        message:
          error?.message ||
          "Failed to fetch application.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (
    key,
    value
  ) => {
    setEdit(
      (prev) => ({
        ...prev,
        [key]: value,
      })
    );
  };

  const handleFileChange = (
    key,
    file
  ) => {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      notification.error({
        message:
          "Only JPG, JPEG, PNG and PDF files are allowed.",
      });

      return false;
    }

    if (
      file.size >
      1024 * 1024
    ) {
      notification.error({
        message:
          "File size must not exceed 1 MB.",
      });

      return false;
    }

    setEdit(
      (prev) => ({
        ...prev,
        [key]: file,
      })
    );

    return false;
  };

  const save = async () => {
    if (!edit) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: edit.id,

        application_number:
          edit.application_number ||
          "",

        name:
          edit.name || "",

        membership_no:
          edit.membership_no ||
          "",

        address:
          edit.address || "",

        state:
          edit.state || "",

        country:
          edit.country || "",

        mobile:
          edit.mobile || "",

        email:
          edit.email || "",

        nationality:
          edit.nationality || "",

        dob: edit.dob
          ? String(
              edit.dob
            ).substring(0, 10)
          : "",

        club_attachment:
          edit.club_attachment ||
          "",

        playing_status:
          edit.playing_status ||
          "",

        pga_association:
          edit.pga_association ||
          "",

        played_pgti:
          edit.played_pgti ||
          "",

        exemption:
          edit.exemption ||
          "",

        pan_number:
          edit.pan_number ||
          "",

        aadhar_number:
          edit.aadhar_number ||
          "",

        passport_number:
          edit.passport_number ||
          "",

        playing_status_final:
          edit.playing_status_final ||
          "",

        preferred_location_1:
          edit.pref1 || "",

        preferred_location_2:
          edit.pref2 || "",

        preferred_location_3:
          edit.pref3 || "",

        payment_status:
          Boolean(
            edit.payment_status
          ),

        email_confirmed:
          Boolean(
            edit.email_confirmed
          ),

        email_confirmation_note:
          edit.email_confirmation_note ||
          "",
      };

      const res =
        await updateQSchoolApplication(
          edit.id,
          payload,
          {
            current_handicap:
              edit.current_handicap,

            payment_slip:
              edit.payment_slip,
          }
        );

      if (res?.status) {
        notification.success({
          message:
            "Application updated successfully.",
        });

        setEdit(null);

        load(page);
      } else {
        notification.error({
          message:
            res?.message ||
            "Failed to update application.",
        });
      }
    } catch (error) {
      notification.error({
        message:
          error?.message ||
          "Failed to update application.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete =
    async (id) => {
      try {
        setLoading(true);

        const res =
          await deleteQSchoolApplication(
            id
          );

        if (res?.status) {
          notification.success({
            message:
              "Application deleted successfully.",
          });

          load(page);
        } else {
          notification.error({
            message:
              res?.message ||
              "Failed to delete application.",
          });
        }
      } catch (error) {
        notification.error({
          message:
            error?.message ||
            "Failed to delete application.",
        });
      } finally {
        setLoading(false);
      }
    };

  const handlePaymentToggle =
    async (
      row,
      checked
    ) => {
      try {
        const res =
          await updateQSchoolPaymentStatus(
            row.id,
            checked
          );

        if (res?.status) {
          notification.success({
            message:
              "Payment status updated successfully.",
          });

          setRows(
            (prev) =>
              prev.map(
                (item) =>
                  item.id ===
                  row.id
                    ? {
                        ...item,
                        payment_status:
                          checked,
                      }
                    : item
              )
          );
        } else {
          notification.error({
            message:
              res?.message ||
              "Failed to update payment status.",
          });
        }
      } catch (error) {
        notification.error({
          message:
            error?.message ||
            "Failed to update payment status.",
        });
      }
    };

  const handleEmailToggle =
    async (
      row,
      checked
    ) => {
      const note =
        row.email_confirmation_note ||
        "";

      const res =
        await updateQSchoolEmailConfirmation(
          row.id,
          checked,
          note
        );

      if (res?.status) {
        notification.success({
          message:
            "Email confirmation updated successfully.",
        });

        setRows(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                row.id
                  ? {
                      ...item,
                      email_confirmed:
                        checked,
                    }
                  : item
            )
        );
      } else {
        notification.error({
          message:
            res?.message ||
            "Failed to update email confirmation.",
        });
      }
    };

  const handleEmailNoteSave =
    async (row) => {
      const res =
        await updateQSchoolEmailConfirmation(
          row.id,
          row.email_confirmed,
          row.email_confirmation_note ||
            ""
        );

      if (res?.status) {
        notification.success({
          message:
            "Email confirmation note updated.",
        });
      } else {
        notification.error({
          message:
            res?.message ||
            "Failed to update email note.",
        });
      }
    };

 const handleDownloadExcel = async () => {
  try {
    setLoading(true);

    const res = await downloadQSchoolExcel(filters.year);

    const blob = new Blob(
      [res?.data || res],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    if (!blob.size) {
      throw new Error("Empty Excel file received");
    }

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `qschool_applications_${filters.year}.xlsx`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    notification.success({
      message: "Excel downloaded successfully",
    });
  } catch (error) {
    console.error("Excel download error:", error);

    notification.error({
      message: "Failed to download Excel",
      description:
        error?.message || "Unable to download Excel file",
    });
  } finally {
    setLoading(false);
  }
};

  const columns = [
    {
      title:
        "Application No.",
      dataIndex:
        "application_number",
      width: 160,
      fixed: "left",
      render: (value, row) =>
        value ||
        (row.year &&
        row.id
          ? `PGT-${row.year}-${row.id}`
          : "-"),
    },

    {
      title: "Applicant",
      dataIndex: "name",
      width: 180,
    },

    {
      title: "Email",
      dataIndex: "email",
      width: 220,
    },

    {
      title: "Mobile",
      dataIndex: "mobile",
      width: 130,
    },

    {
      title:
        "Nationality",
      dataIndex:
        "nationality",
      width: 130,
    },

    {
      title:
        "Playing Status",
      dataIndex:
        "playing_status",
      width: 140,
    },

    {
      title: "Payment",
      dataIndex:
        "payment_status",
      width: 110,

      render: (_, row) => (
        <Checkbox
          checked={Boolean(
            row.payment_status
          )}
          onChange={(e) =>
            handlePaymentToggle(
              row,
              e.target.checked
            )
          }
        />
      ),
    },

    {
      title: "Email Sent",
      dataIndex:
        "email_confirmed",
      width: 120,

      render: (_, row) => (
        <Checkbox
          checked={Boolean(
            row.email_confirmed
          )}
          onChange={(e) =>
            handleEmailToggle(
              row,
              e.target.checked
            )
          }
        />
      ),
    },

    {
      title: "Applied",
      dataIndex:
        "created_at",
      width: 180,

      render: (value) =>
        value
          ? new Date(
              value
            ).toLocaleString()
          : "-",
    },

    {
      title: "Actions",
      fixed: "right",
      width: 190,

      render: (_, row) => (
        <div className="d-flex gap-2">
          <Button
            size="small"
            onClick={() =>
              open(row.id)
            }
          >
            View / Edit
          </Button>

          <Popconfirm
            title="Delete this application?"
            description="The application will be removed from the active list."
            okText="Delete"
            cancelText="Cancel"
            onConfirm={() =>
              handleDelete(
                row.id
              )
            }
          >
            <Button
              size="small"
              danger
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const renderEditField = (
    key,
    value
  ) => {
    if (key === "dob") {
      return (
        <input
          type="date"
          className="form-input"
          value={
            value
              ? String(
                  value
                ).substring(
                  0,
                  10
                )
              : ""
          }
          onChange={(e) =>
            handleEditChange(
              key,
              e.target.value
            )
          }
        />
      );
    }

    if (key === "address") {
      return (
        <TextArea
          rows={3}
          value={
            value || ""
          }
          onChange={(e) =>
            handleEditChange(
              key,
              e.target.value
            )
          }
        />
      );
    }

    return (
      <Input
        value={
          value || ""
        }
        onChange={(e) =>
          handleEditChange(
            key,
            e.target.value
          )
        }
      />
    );
  };

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1 className="page-title">
              Q-School Applications
            </h1>

            <p className="page-subtitle">
              {count} application(s)
              found.
            </p>
          </div>

          <Button
            type="primary"
            icon={
              <DownloadOutlined />
            }
            onClick={
              handleDownloadExcel
            }
          >
            Download Excel
          </Button>
        </div>
      </div>

      <div className="content-card mb-4">
        <div className="content-card-body">
          <div className="row align-items-end">
            <div className="col-md-3 mb-3">
              <label className="form-label">
                Year
              </label>

            <Select
  className="w-100"
  value={filters.year || "all"}
  onChange={(value) => {
    setFilters((prev) => ({
      ...prev,
      year: value === "all" ? "" : value,
    }));

    setPage(1);
  }}
  options={[
    {
      value: "all",
      label: "All",
    },
    ...years,
  ]}
/>
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label">
                Email Status
              </label>

              <Select
                className="w-100"
                value={
                  filters.email_status ||
                  "all"
                }
                onChange={(
                  value
                ) => {
                  setFilters(
                    (prev) => ({
                      ...prev,
                      email_status:
                        value ===
                        "all"
                          ? ""
                          : value,
                    })
                  );

                  setPage(1);
                }}
                options={[
                  {
                    value:
                      "all",
                    label:
                      "All",
                  },
                  {
                    value:
                      "not_sent",
                    label:
                      "Not Sent",
                  },
                  {
                    value:
                      "sent",
                    label:
                      "Sent",
                  },
                ]}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">
                Search
              </label>

              <Input
                placeholder="Name, email or mobile"
                value={
                  filters.search
                }
                onChange={(e) =>
                  setFilters(
                    (prev) => ({
                      ...prev,
                      search:
                        e.target
                          .value,
                    })
                  )
                }
                onPressEnter={
                  handleSearch
                }
              />
            </div>

            <div className="col-md-2 mb-3">
              <Button
                type="primary"
                block
                onClick={
                  handleSearch
                }
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Table
        rowKey="id"
        dataSource={rows}
        columns={columns}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: count,
          showSizeChanger:
            false,
          onChange: (
            nextPage
          ) => {
            setPage(
              nextPage
            );

            load(
              nextPage
            );
          },
        }}
        scroll={{
          x: 1600,
        }}
      />

      <Modal
        open={Boolean(edit)}
        title={
          edit
            ? `Q-School Application ${
                edit.application_number ||
                ""
              }`
            : "Q-School Application"
        }
        width={1000}
        onCancel={() =>
          setEdit(null)
        }
        onOk={save}
        okText={
          saving
            ? "Saving..."
            : "Save Changes"
        }
        confirmLoading={
          saving
        }
        destroyOnClose
      >
        {edit && (
          <div className="row">
            {Object.entries(
              edit
            )
              .filter(
                ([key]) =>
                  !excludedEditFields.includes(
                    key
                  )
              )
              .filter(
                ([key]) =>
                  ![
                    "payment_status",
                    "email_confirmed",
                    "email_confirmation_note",
                    "current_handicap",
                    "payment_slip",
                  ].includes(
                    key
                  )
              )
              .map(
                ([
                  key,
                  value,
                ]) => (
                  <div
                    className="col-12 col-md-6 mb-3"
                    key={key}
                  >
                    <label className="form-label">
                      {getFieldLabel(
                        key
                      )}
                    </label>

                    {renderEditField(
                      key,
                      value
                    )}
                  </div>
                )
              )}

            <div className="col-12">
              <div className="qschool-subsection">
                <h5>
                  Preferred Locations
                </h5>

                <div className="row">
                  {[1, 2, 3].map(
                    (
                      number
                    ) => (
                      <div
                        className="col-md-4 mb-3"
                        key={
                          number
                        }
                      >
                        <label className="form-label">
                          Preferred
                          Location{" "}
                          {
                            number
                          }
                        </label>

                        <Input
                          value={
                            edit[
                              `pref${number}`
                            ] ||
                            ""
                          }
                          onChange={(
                            e
                          ) =>
                            handleEditChange(
                              `pref${number}`,
                              e
                                .target
                                .value
                            )
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">
                Current Handicap
              </label>

              {edit.certificate_url && (
                <div className="mb-2">
                  <a
                    href={
                      edit.certificate_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Current
                    Handicap
                  </a>
                </div>
              )}

              <Upload
                beforeUpload={(
                  file
                ) =>
                  handleFileChange(
                    "current_handicap",
                    file
                  )
                }
                maxCount={1}
                showUploadList={Boolean(
                  edit.current_handicap
                )}
              >
                <Button
                  icon={
                    <UploadOutlined />
                  }
                >
                  Replace
                  Handicap
                </Button>
              </Upload>
            </div>

            <div className="col-12 col-md-6 mb-3">
              <label className="form-label">
                Payment Slip
              </label>

              {edit.payment_slip_url && (
                <div className="mb-2">
                  <a
                    href={
                      edit.payment_slip_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Payment
                    Slip
                  </a>
                </div>
              )}

              <Upload
                beforeUpload={(
                  file
                ) =>
                  handleFileChange(
                    "payment_slip",
                    file
                  )
                }
                maxCount={1}
                showUploadList={Boolean(
                  edit.payment_slip
                )}
              >
                <Button
                  icon={
                    <UploadOutlined />
                  }
                >
                  Replace
                  Payment Slip
                </Button>
              </Upload>
            </div>

            <div className="col-12 col-md-6 mb-3">
              <div className="qschool-subsection">
                <Checkbox
                  checked={Boolean(
                    edit.payment_status
                  )}
                  onChange={(e) =>
                    handleEditChange(
                      "payment_status",
                      e
                        .target
                        .checked
                    )
                  }
                >
                  Payment Received
                </Checkbox>
              </div>
            </div>

            <div className="col-12 col-md-6 mb-3">
              <div className="qschool-subsection">
                <Checkbox
                  checked={Boolean(
                    edit.email_confirmed
                  )}
                  onChange={(e) =>
                    handleEditChange(
                      "email_confirmed",
                      e
                        .target
                        .checked
                    )
                  }
                >
                  Email Sent
                </Checkbox>
              </div>
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">
                Email Confirmation
                Note
              </label>

              <TextArea
                rows={4}
                placeholder="Enter email confirmation note"
                value={
                  edit.email_confirmation_note ||
                  ""
                }
                onChange={(e) =>
                  handleEditChange(
                    "email_confirmation_note",
                    e
                      .target
                      .value
                  )
                }
              />
            </div>
          </div>
        )}
      </Modal>

      <LoadingEffect
        isLoading={
          loading && !edit
        }
        text="Please wait..."
      />
    </div>
  );
}