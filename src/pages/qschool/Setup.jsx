import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Switch,
  notification,
} from "antd";

import TopNavbar from "components/layout/TopNavbar";
import ImageUploadField from "components/ui/ImageUploadField";
import LoadingEffect from "components/ui/Loading/LoadingEffect";

import {
  getQSchoolSetup,
  saveQSchoolSetup,
} from "services/qschool.service";

import "styles/admin-pages.css";

const emptyScheduleCard = {
  tour_name: "",
  venue: "",
  practice_round: {
    date: "",
  },
  main_rounds: {
    from_date: "",
    end_date: "",
  },
};

const emptyExemption = {
  title: "",
  description: "",
};

const emptyContactPerson = {
  name: "",
  number: "",
};

const emptyForm = {
  page_enabled: false,

  banner_desktop_image: "",
  banner_mobile_image: "",
  banner_title: "",

  final_qualifying_school_main_venue: "",
  final_qualifying_school_detailed_venue: "",

  schedule_cards: [],

  final_qualifying_school: {
    venue: "",
    practice_round: "",
    main_rounds: {
      start_date: "",
      end_date: "",
    },
  },

  entry_closes: {
    day: "",
    date: "",
    time: "",
  },

  closed_contact: {
    email: "",
    phones: [],
  },

  exemptions: [],

  payment_details: {
    entry_fees: "",
    last_date_for_entry_fees: "",
    late_entry_fees: "",
    last_date_for_late_entry_fees: "",
    last_time_for_late_entry_fees: "",
    account_name: "",
    account_number: "",
    bank: "",
    branch: "",
    ifsc_code: "",
    swift_code: "",
  },

  withdrawal_after_close_refund: "",
  double_entry_fee_withdrawal_refund: "",

  contact_email: "",
};

const parseJsonField = (value, fallback) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeSetup = (raw = {}) => {
  const scheduleCards = parseJsonField(
    raw.schedule_cards,
    []
  );

  const exemptions = parseJsonField(
    raw.exemptions,
    []
  );

  const finalQualifyingSchool = parseJsonField(
    raw.final_qualifying_school,
    {}
  );

  const entryCloses = parseJsonField(
    raw.entry_closes,
    {}
  );

  const closedContact = parseJsonField(
    raw.closed_contact,
    {}
  );

  const paymentDetails = parseJsonField(
    raw.payment_details,
    {}
  );

  return {
    ...emptyForm,

    page_enabled:
      raw.page_enabled === true ||
      raw.page_enabled === 1 ||
      raw.page_enabled === "1",

    banner_desktop_image:
      raw.banner_desktop_image || "",

    banner_mobile_image:
      raw.banner_mobile_image || "",

    banner_title:
      raw.banner_title || "",

    final_qualifying_school_main_venue:
      raw.final_qualifying_school_main_venue || "",

    final_qualifying_school_detailed_venue:
      raw.final_qualifying_school_detailed_venue || "",

    schedule_cards: Array.isArray(scheduleCards)
      ? scheduleCards.map((card) => ({
          ...emptyScheduleCard,
          ...card,

          practice_round: {
            ...emptyScheduleCard.practice_round,
            ...(card?.practice_round || {}),
          },

          main_rounds: {
            ...emptyScheduleCard.main_rounds,
            ...(card?.main_rounds || {}),
          },
        }))
      : [],

    final_qualifying_school: {
      ...emptyForm.final_qualifying_school,
      ...(finalQualifyingSchool || {}),

      main_rounds: {
        ...emptyForm.final_qualifying_school.main_rounds,
        ...(finalQualifyingSchool?.main_rounds || {}),
      },
    },

    entry_closes: {
      ...emptyForm.entry_closes,
      ...(entryCloses || {}),
    },

    closed_contact: {
      ...emptyForm.closed_contact,
      ...(closedContact || {}),
      phones: Array.isArray(
        closedContact?.phones
      )
        ? closedContact.phones.map((person) => ({
            ...emptyContactPerson,
            ...person,
          }))
        : [],
    },

    exemptions: Array.isArray(exemptions)
      ? exemptions.map((item) => ({
          ...emptyExemption,
          ...item,
        }))
      : [],

    payment_details: {
      ...emptyForm.payment_details,
      ...(paymentDetails || {}),
    },

    withdrawal_after_close_refund:
      raw.withdrawal_after_close_refund ?? "",

    double_entry_fee_withdrawal_refund:
      raw.double_entry_fee_withdrawal_refund ?? "",

    contact_email:
      raw.contact_email || "",
  };
};

export default function QSchoolSetup() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSetup = async () => {
      try {
        setLoading(true);

        const res = await getQSchoolSetup();

        console.log("Q SCHOOL GET RESPONSE:", res);

        if (res.status) {
          console.log(
            "Q SCHOOL SETUP RESULT:",
            res.result
          );

          setForm(
            normalizeSetup(res.result || {})
          );
        } else if (!res?.status) {
          notification.error({
            message: "Fetch Error",
            description:
              res?.message ||
              "Failed to load Q-School setup.",
          });
        }
      } catch (error) {
        notification.error({
          message: "Fetch Error",
          description:
            error?.message ||
            "Failed to load Q-School setup.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSetup();
  }, []);

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedChange = (
    section,
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }));
  };

  const handleClosedContactChange = (
    key,
    value,
    index
  ) => {
    setForm((prev) => {
      const contact = {
        ...(prev.closed_contact || {}),
      };

      if (index === undefined) {
        contact[key] = value;
      } else {
        const phones = [
          ...(contact.phones || []),
        ];

        phones[index] = {
          ...(phones[index] || {}),
          [key]: value,
        };

        contact.phones = phones;
      }

      return {
        ...prev,
        closed_contact: contact,
      };
    });
  };

  const addClosedContact = () => {
    setForm((prev) => ({
      ...prev,
      closed_contact: {
        ...(prev.closed_contact || {}),
        phones: [
          ...(prev.closed_contact?.phones || []),
          {
            ...emptyContactPerson,
          },
        ],
      },
    }));
  };

  const removeClosedContact = (index) => {
    setForm((prev) => ({
      ...prev,
      closed_contact: {
        ...(prev.closed_contact || {}),
        phones: (
          prev.closed_contact?.phones || []
        ).filter((_, i) => i !== index),
      },
    }));
  };

  const addScheduleCard = () => {
    setForm((prev) => ({
      ...prev,
      schedule_cards: [
        ...prev.schedule_cards,
        {
          ...emptyScheduleCard,
          practice_round: {
            ...emptyScheduleCard.practice_round,
          },
          main_rounds: {
            ...emptyScheduleCard.main_rounds,
          },
        },
      ],
    }));
  };

  const updateScheduleCard = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const updated = [...prev.schedule_cards];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        schedule_cards: updated,
      };
    });
  };

  const updateScheduleCardNested = (
    index,
    section,
    field,
    value
  ) => {
    setForm((prev) => {
      const updated = [...prev.schedule_cards];

      updated[index] = {
        ...updated[index],
        [section]: {
          ...(updated[index][section] || {}),
          [field]: value,
        },
      };

      return {
        ...prev,
        schedule_cards: updated,
      };
    });
  };

  const removeScheduleCard = (index) => {
    setForm((prev) => ({
      ...prev,
      schedule_cards:
        prev.schedule_cards.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const addExemption = () => {
    setForm((prev) => ({
      ...prev,
      exemptions: [
        ...prev.exemptions,
        {
          ...emptyExemption,
        },
      ],
    }));
  };

  const updateExemption = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const updated = [...prev.exemptions];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        exemptions: updated,
      };
    });
  };

  const removeExemption = (index) => {
    setForm((prev) => ({
      ...prev,
      exemptions:
        prev.exemptions.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const save = async () => {
    try {
      const regularCloseDate =
        form.entry_closes?.date;

      const lateCloseDate =
        form.payment_details
          ?.last_date_for_late_entry_fees;

      if (
        regularCloseDate &&
        lateCloseDate &&
        lateCloseDate < regularCloseDate
      ) {
        notification.error({
          message: "Invalid Closing Dates",
          description:
            "Late entry closing date cannot be earlier than the regular entry closing date.",
        });

        return;
      }

      setSaving(true);

      const payload = {
        page_enabled: Boolean(
          form.page_enabled
        ),

        banner_desktop_image:
          form.banner_desktop_image || null,

        banner_mobile_image:
          form.banner_mobile_image || null,

        banner_title:
          form.banner_title || null,

        final_qualifying_school_main_venue:
          form.final_qualifying_school_main_venue ||
          null,

        final_qualifying_school_detailed_venue:
          form.final_qualifying_school_detailed_venue ||
          null,

        schedule_cards:
          form.schedule_cards.map((card) => ({
            tour_name:
              card.tour_name || "",

            venue:
              card.venue || "",

            practice_round: {
              date:
                card.practice_round?.date ||
                "",
            },

            main_rounds: {
              from_date:
                card.main_rounds?.from_date ||
                "",

              end_date:
                card.main_rounds?.end_date ||
                "",
            },
          })),

        final_qualifying_school: {
          venue:
            form.final_qualifying_school
              ?.venue || "",

          practice_round:
            form.final_qualifying_school
              ?.practice_round || "",

          main_rounds: {
            start_date:
              form.final_qualifying_school
                ?.main_rounds?.start_date ||
              "",

            end_date:
              form.final_qualifying_school
                ?.main_rounds?.end_date ||
              "",
          },
        },

        entry_closes: {
          day:
            form.entry_closes?.day || "",

          date:
            form.entry_closes?.date || "",

          time:
            form.entry_closes?.time || "",
        },

        closed_contact: {
          email:
            form.closed_contact?.email || "",

          phones: (
            form.closed_contact?.phones || []
          ).map((person) => ({
            name: person?.name || "",
            number: person?.number || "",
          })),
        },

        exemptions:
          form.exemptions.map((item) => ({
            title:
              item.title || "",

            description:
              item.description || "",
          })),

        payment_details: {
          entry_fees:
            form.payment_details
              ?.entry_fees || 0,

          last_date_for_entry_fees:
            form.payment_details
              ?.last_date_for_entry_fees ||
            "",

          late_entry_fees:
            form.payment_details
              ?.late_entry_fees || 0,

          last_date_for_late_entry_fees:
            form.payment_details
              ?.last_date_for_late_entry_fees ||
            "",

          last_time_for_late_entry_fees:
            form.payment_details
              ?.last_time_for_late_entry_fees ||
            "",

          account_name:
            form.payment_details
              ?.account_name || "",

          account_number:
            form.payment_details
              ?.account_number || "",

          bank:
            form.payment_details?.bank ||
            "",

          branch:
            form.payment_details?.branch ||
            "",

          ifsc_code:
            form.payment_details
              ?.ifsc_code || "",

          swift_code:
            form.payment_details
              ?.swift_code || "",
        },

        withdrawal_after_close_refund:
          form.withdrawal_after_close_refund ||
          0,

        double_entry_fee_withdrawal_refund:
          form.double_entry_fee_withdrawal_refund ||
          0,

        contact_email:
          form.contact_email || null,
      };

      const res =
        await saveQSchoolSetup(payload);

      if (res?.status) {
        notification.success({
          message: "Success",
          description:
            "Q-School setup saved successfully.",
        });
      } else {
        notification.error({
          message: "Unable to save",
          description:
            res?.message ||
            "Something went wrong while saving setup.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Save Error",
        description:
          error?.message ||
          "Failed to save Q-School setup.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="qschool-setup-page">
      <TopNavbar title="Q-School Page Setup" />

      <div className="admin-page-container">
        <div className="page-header">
          <h1 className="page-title">
            Q-School Page Setup
          </h1>

          <p className="page-subtitle">
            Manage the Q-School page, banner,
            venues, schedule, exemptions,
            payment details and contact
            information.
          </p>
        </div>

        <div className="page-body qschool-form">

          {/* General & Banner */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <div className="qschool-section-header">
                <div>
                  <h3 className="qschool-section-title">
                    General & Banner
                  </h3>

                  <p className="qschool-section-description">
                    Manage the global page
                    status and banner content.
                  </p>
                </div>

                <div className="qschool-status-control">
                  <span className="qschool-status-label">
                    {form.page_enabled
                      ? "Page Enabled"
                      : "Page Disabled"}
                  </span>

                  <Switch
                    checked={
                      form.page_enabled
                    }
                    onChange={(checked) =>
                      handleFieldChange(
                        "page_enabled",
                        checked
                      )
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">
                    Banner Title
                  </label>

                  <input
                    type="text"
                    className="form-input"
                    value={
                      form.banner_title
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "banner_title",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <ImageUploadField
                    label="Desktop Banner Image"
                    value={
                      form.banner_desktop_image
                    }
                    onChange={(value) =>
                      handleFieldChange(
                        "banner_desktop_image",
                        value
                      )
                    }
                    folder="banners"
                  />
                </div>

                <div className="col-12 col-md-6 mb-3">
                  <ImageUploadField
                    label="Mobile Banner Image"
                    value={
                      form.banner_mobile_image
                    }
                    onChange={(value) =>
                      handleFieldChange(
                        "banner_mobile_image",
                        value
                      )
                    }
                    folder="banners"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Final Venue */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <h3 className="qschool-section-title">
                Final Qualifying School Venue
              </h3>

              <p className="qschool-section-description">
                Manage the final qualifying
                school venue information.
              </p>

              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">
                    Main Venue
                  </label>

                  <input
                    type="text"
                    className="form-input"
                    value={
                      form.final_qualifying_school_main_venue
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "final_qualifying_school_main_venue",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">
                    Detailed Venue
                  </label>

                  <textarea
                    className="form-input"
                    rows={4}
                    value={
                      form.final_qualifying_school_detailed_venue
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "final_qualifying_school_detailed_venue",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <div className="qschool-section-header">
                <div>
                  <h3 className="qschool-section-title">
                    Schedule for Qualifying School
                    Season 2026-27
                  </h3>

                  <p className="qschool-section-description">
                    Manage all qualifying school
                    stages.
                  </p>
                </div>

                <Button
                  type="primary"
                  onClick={addScheduleCard}
                >
                  + Add Schedule
                </Button>
              </div>

              {form.schedule_cards.length ===
              0 ? (
                <div className="qschool-empty-state">
                  No schedule cards added yet.
                </div>
              ) : (
                form.schedule_cards.map(
                  (card, index) => (
                    <Card
                      key={index}
                      className="qschool-dynamic-card"
                      size="small"
                    >
                      <div className="qschool-card-header">
                        <h4>
                          Schedule {index + 1}
                        </h4>

                        <Button
                          danger
                          type="link"
                          onClick={() =>
                            removeScheduleCard(
                              index
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="row">
                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">
                            Tour / Stage Name
                          </label>

                          <input
                            type="text"
                            className="form-input"
                            value={
                              card.tour_name ||
                              ""
                            }
                            onChange={(e) =>
                              updateScheduleCard(
                                index,
                                "tour_name",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                          <label className="form-label">
                            Venue
                          </label>

                          <input
                            type="text"
                            className="form-input"
                            value={
                              card.venue || ""
                            }
                            onChange={(e) =>
                              updateScheduleCard(
                                index,
                                "venue",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="col-12">
                          <div className="qschool-subsection">
                            <h5>
                              Practice Round
                            </h5>

                            <input
                              type="date"
                              className="form-input"
                              value={
                                card
                                  .practice_round
                                  ?.date || ""
                              }
                              onChange={(e) =>
                                updateScheduleCardNested(
                                  index,
                                  "practice_round",
                                  "date",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="qschool-subsection">
                            <h5>
                              Main Rounds
                            </h5>

                            <div className="row">
                              <div className="col-md-6 mb-3">
                                <label className="form-label">
                                  From Date
                                </label>

                                <input
                                  type="date"
                                  className="form-input"
                                  value={
                                    card
                                      .main_rounds
                                      ?.from_date ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    updateScheduleCardNested(
                                      index,
                                      "main_rounds",
                                      "from_date",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="col-md-6 mb-3">
                                <label className="form-label">
                                  End Date
                                </label>

                                <input
                                  type="date"
                                  className="form-input"
                                  value={
                                    card
                                      .main_rounds
                                      ?.end_date ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    updateScheduleCardNested(
                                      index,
                                      "main_rounds",
                                      "end_date",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                )
              )}
            </div>
          </div>

          {/* Final Qualifying School */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <h3 className="qschool-section-title">
                Final Qualifying School
              </h3>

              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">
                    Venue
                  </label>

                  <input
                    type="text"
                    className="form-input"
                    value={
                      form.final_qualifying_school?.venue ||
                      ""
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "final_qualifying_school",
                        "venue",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">
                    Practice Round
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={
                      form.final_qualifying_school
                        ?.practice_round || ""
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "final_qualifying_school",
                        "practice_round",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">
                    Main Rounds
                  </label>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Start Date
                      </label>

                      <input
                        type="date"
                        className="form-input"
                        value={
                          form.final_qualifying_school
                            ?.main_rounds?.start_date ||
                          ""
                        }
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            final_qualifying_school: {
                              ...prev.final_qualifying_school,
                              main_rounds: {
                                ...prev
                                  .final_qualifying_school
                                  ?.main_rounds,
                                start_date:
                                  e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        End Date
                      </label>

                      <input
                        type="date"
                        className="form-input"
                        value={
                          form.final_qualifying_school
                            ?.main_rounds?.end_date ||
                          ""
                        }
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            final_qualifying_school: {
                              ...prev.final_qualifying_school,
                              main_rounds: {
                                ...prev
                                  .final_qualifying_school
                                  ?.main_rounds,
                                end_date:
                                  e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Entry Closing */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <h3 className="qschool-section-title">
                Entry Closes
              </h3>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Day
                  </label>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Saturday"
                    value={
                      form.entry_closes.day
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "entry_closes",
                        "day",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Date
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={
                      form.entry_closes.date
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "entry_closes",
                        "date",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">
                    Time
                  </label>

                  <input
                    type="time"
                    className="form-input"
                    value={
                      form.entry_closes.time
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "entry_closes",
                        "time",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Closed Entry Contact Details */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <div className="qschool-section-header">
                <div>
                  <h3 className="qschool-section-title">
                    Closed Entry Contact Details
                  </h3>

                  <p className="qschool-section-description">
                    Manage contact details to be
                    displayed when Q-School entries
                    are closed.
                  </p>
                </div>

                <Button
                  type="primary"
                  onClick={addClosedContact}
                >
                  + Add Contact
                </Button>
              </div>

              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">
                    Contact Email
                  </label>

                  <input
                    type="email"
                    className="form-input"
                    value={
                      form.closed_contact
                        ?.email || ""
                    }
                    onChange={(e) =>
                      handleClosedContactChange(
                        "email",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {(
                form.closed_contact?.phones ||
                []
              ).length === 0 ? (
                <div className="qschool-empty-state">
                  No contact persons added yet.
                </div>
              ) : (
                (
                  form.closed_contact?.phones ||
                  []
                ).map((person, index) => (
                  <Card
                    key={index}
                    className="qschool-dynamic-card"
                    size="small"
                  >
                    <div className="qschool-card-header">
                      <h4>
                        Contact Person {index + 1}
                      </h4>

                      <Button
                        danger
                        type="link"
                        onClick={() =>
                          removeClosedContact(
                            index
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="row">
                      <div className="col-12 col-md-6 mb-3">
                        <label className="form-label">
                          Person Name
                        </label>

                        <input
                          type="text"
                          className="form-input"
                          value={
                            person?.name || ""
                          }
                          onChange={(e) =>
                            handleClosedContactChange(
                              "name",
                              e.target.value,
                              index
                            )
                          }
                        />
                      </div>

                      <div className="col-12 col-md-6 mb-3">
                        <label className="form-label">
                          Phone Number
                        </label>

                        <input
                          type="tel"
                          className="form-input"
                          value={
                            person?.number || ""
                          }
                          onChange={(e) =>
                            handleClosedContactChange(
                              "number",
                              e.target.value,
                              index
                            )
                          }
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Exemptions */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <div className="qschool-section-header">
                <div>
                  <h3 className="qschool-section-title">
                    Exemptions
                  </h3>

                  <p className="qschool-section-description">
                    Manage Q-School exemption
                    options.
                  </p>
                </div>

                <Button
                  type="primary"
                  onClick={addExemption}
                >
                  + Add Exemption
                </Button>
              </div>

              {form.exemptions.length ===
              0 ? (
                <div className="qschool-empty-state">
                  No exemption options added
                  yet.
                </div>
              ) : (
                form.exemptions.map(
                  (exemption, index) => (
                    <Card
                      key={index}
                      className="qschool-dynamic-card"
                      size="small"
                    >
                      <div className="qschool-card-header">
                        <h4>
                          Exemption {index + 1}
                        </h4>

                        <Button
                          danger
                          type="link"
                          onClick={() =>
                            removeExemption(
                              index
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Title
                        </label>

                        <input
                          type="text"
                          className="form-input"
                          value={
                            exemption.title ||
                            ""
                          }
                          onChange={(e) =>
                            updateExemption(
                              index,
                              "title",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="form-label">
                          Description
                        </label>

                        <textarea
                          className="form-input"
                          rows={4}
                          value={
                            exemption.description ||
                            ""
                          }
                          onChange={(e) =>
                            updateExemption(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </Card>
                  )
                )
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <h3 className="qschool-section-title">
                Payment Details
              </h3>

              <div className="row">
                {[
                  [
                    "entry_fees",
                    "Entry Fees",
                    "number",
                  ],
                  [
                    "last_date_for_entry_fees",
                    "Last Date for Entry Fees",
                    "date",
                  ],
                  [
                    "late_entry_fees",
                    "Late Entry Fees",
                    "number",
                  ],
                  [
                    "last_date_for_late_entry_fees",
                    "Last Date for Late Entry Fees",
                    "date",
                  ],
                  [
                    "last_time_for_late_entry_fees",
                    "Last Time for Late Entry Fees",
                    "time",
                  ],
                  [
                    "account_name",
                    "Account Name",
                    "text",
                  ],
                  [
                    "account_number",
                    "Account Number",
                    "text",
                  ],
                  ["bank", "Bank", "text"],
                  ["branch", "Branch", "text"],
                  [
                    "ifsc_code",
                    "IFSC Code",
                    "text",
                  ],
                  [
                    "swift_code",
                    "SWIFT Code",
                    "text",
                  ],
                ].map(
                  ([key, label, type]) => (
                    <div
                      className="col-12 col-md-6 mb-3"
                      key={key}
                    >
                      <label className="form-label">
                        {label}
                      </label>

                      <input
                        type={type}
                        min={
                          key ===
                          "last_date_for_late_entry_fees"
                            ? form.entry_closes
                                ?.date || undefined
                            : type === "number"
                            ? "0"
                            : undefined
                        }
                        className="form-input"
                        value={
                          form.payment_details[
                            key
                          ] || ""
                        }
                        onChange={(e) =>
                          handleNestedChange(
                            "payment_details",
                            key,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal & Refund */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <h3 className="qschool-section-title">
                Withdrawal & Refund
              </h3>

              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">
                    Withdrawal After Close Refund
                  </label>

                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={
                      form.withdrawal_after_close_refund
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "withdrawal_after_close_refund",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="col-12 col-md-6 mb-3">
                  <label className="form-label">
                    Double Entry Fee Withdrawal Refund
                  </label>

                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={
                      form.double_entry_fee_withdrawal_refund
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "double_entry_fee_withdrawal_refund",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="content-card mb-4">
            <div className="content-card-body">
              <h3 className="qschool-section-title">
                Contact Us
              </h3>

              <div className="col-md-6 mb-3 px-0">
                <label className="form-label">
                  Email
                </label>

                <input
                  type="email"
                  className="form-input"
                  value={
                    form.contact_email
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      "contact_email",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="qschool-form-actions">
            <button
              type="button"
              className="action-button primary"
              onClick={save}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Q-School Setup"}
            </button>
          </div>
        </div>
      </div>

      <LoadingEffect
        isLoading={loading}
        text="Loading Q-School setup..."
      />
    </div>
  );
}