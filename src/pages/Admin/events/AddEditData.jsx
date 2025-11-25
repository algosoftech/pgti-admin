import React, { useEffect, useState } from "react";
import { notification, Select, DatePicker, Radio } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from "moment";
import LoadingEffect from "../../../components/Loading/LoadingEffect";
import { addEditEvent } from "../../../controllers/V1/eventController";
import { list as fetchArticles } from "../../../controllers/V1/articleController";
import "../admin-pages.css";

const { Option } = Select;

const EventAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  // Fetch articles on component mount
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoadingArticles(true);
        const result = await fetchArticles({
          type: "",
          condition: { status: "A" },
          skip: 0,
          limit: 1000,
        });
        if (result.status === true && result.result) {
          setArticles(result.result);
        }
      } catch (error) {
        console.error("Error loading articles:", error);
        notification.open({
          message: "Oops!",
          description: "Failed to load articles. Please refresh the page.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      } finally {
        setLoadingArticles(false);
      }
    };
    loadArticles();
  }, []);

  /*********************************************************
   *  This function is use to handle input change
   *********************************************************/
  const handleChange = (e) => {
    setAddEditData((pre) => ({
      ...pre,
      [e.target.name]: e.target.value,
    }));
    setError((pre) => ({
      ...pre,
      [e.target.name]: "",
    }));
  };

  /*********************************************************
   *  This function is use to handle article change
   *********************************************************/
  const handleArticleChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      article_id: value,
    }));
    setError((pre) => ({
      ...pre,
      article_id: "",
    }));
  };

  /*********************************************************
   *  This function is use to handle is_paid change
   *********************************************************/
  const handleIsPaidChange = (e) => {
    const value = e.target.value;
    setAddEditData((pre) => ({
      ...pre,
      is_paid: value,
      ...(value === "N" ? { event_fee: "" } : {}),
    }));
    setError((pre) => ({
      ...pre,
      is_paid: "",
      event_fee: "",
    }));
  };

  /*********************************************************
   *  This function is use to handle date change
   *********************************************************/
  const handleStartDateChange = (date, dateString) => {
    const formattedDate = date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : null;
    setAddEditData((pre) => ({
      ...pre,
      event_start: formattedDate,
    }));
    setError((pre) => ({
      ...pre,
      event_start: "",
    }));
  };

  const handleEndDateChange = (date, dateString) => {
    const formattedDate = date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : null;
    setAddEditData((pre) => ({
      ...pre,
      event_end: formattedDate,
    }));
    setError((pre) => ({
      ...pre,
      event_end: "",
    }));
  };

  /*********************************************************
   *  This function is use to handle Quill editor change
   *********************************************************/
  const handleTermsConditionChange = (value) => {
    setAddEditData((pre) => ({
      ...pre,
      terms_condition: value,
    }));
    setError((pre) => ({
      ...pre,
      terms_condition: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.target);
      
      if (!ADDEDITDATA?.article_id) {
        notification.open({
          message: "Oops!",
          description: `Article is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.terms_condition || !ADDEDITDATA?.terms_condition.trim()) {
        notification.open({
          message: "Oops!",
          description: `Terms & Conditions is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.event_start) {
        notification.open({
          message: "Oops!",
          description: `Event start date is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!ADDEDITDATA?.event_end) {
        notification.open({
          message: "Oops!",
          description: `Event end date is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (moment(ADDEDITDATA?.event_end).isBefore(moment(ADDEDITDATA?.event_start))) {
        notification.open({
          message: "Oops!",
          description: `Event end date must be after start date.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!formData.get('capacity') || parseInt(formData.get('capacity')) <= 0) {
        notification.open({
          message: "Oops!",
          description: `Capacity must be greater than 0.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (ADDEDITDATA?.is_paid === "Y" && (!formData.get('event_fee') || parseFloat(formData.get('event_fee')) <= 0)) {
        notification.open({
          message: "Oops!",
          description: `Event fee is required for paid events.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        article_id: ADDEDITDATA?.article_id,
        terms_condition: ADDEDITDATA?.terms_condition || "",
        event_start: ADDEDITDATA?.event_start,
        event_end: ADDEDITDATA?.event_end,
        capacity: parseInt(formData.get('capacity')),
        is_paid: ADDEDITDATA?.is_paid || "N",
        ...(ADDEDITDATA?.is_paid === "Y" && { event_fee: parseFloat(formData.get('event_fee')) }),
      };

      const res = await addEditEvent(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `Event updated successfully` : `Event added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/events/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save event'}`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      }
    } catch (error) {
      console.log('error : ', error);
      notification.open({
        message: "Oops!",
        description: `An error occurred. Please try again.`,
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = `Farmer Store || ${ADDEDITDATA?.id ? "Edit" : "Add"} Event`;
  }, [ADDEDITDATA?.id]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit Event" : "Add New Event"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update event information" 
                : "Create a new event with article, dates, capacity, and pricing"}
            </p>
          </div>
          <Link to="/admin/events/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Events
            </button>
          </Link>
        </div>
      </div>

      <div className="content-card">
        <div className="content-card-body">
          <form onSubmit={handleSubmit} className="modern-form">
            <input type="hidden" name="editId" id="editId" value={ADDEDITDATA?.id} />
            
            <div className="form-section">
              <h3 className="form-section-title">
                <CalendarOutlined />
                Event Information
              </h3>
              <div className="row">
                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="article_id" className="form-label required">
                      Article
                    </label>
                    <Select
                      name="article_id"
                      id="article_id"
                      placeholder="Select an article"
                      className="form-select"
                      value={ADDEDITDATA?.article_id}
                      onChange={handleArticleChange}
                      loading={loadingArticles}
                      style={{ width: "100%" }}
                      size="large"
                    >
                      {articles.map((article) => (
                        <Option key={article.id} value={article.id}>
                          {article.title}
                        </Option>
                      ))}
                    </Select>
                    {error.article_id && (
                      <div className="form-error">{error.article_id}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="event_start" className="form-label required">
                      Event Start Date & Time
                    </label>
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="Select start date and time"
                      value={ADDEDITDATA?.event_start ? moment(ADDEDITDATA.event_start) : null}
                      onChange={handleStartDateChange}
                      style={{ width: "100%" }}
                      size="large"
                    />
                    {error.event_start && (
                      <div className="form-error">{error.event_start}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="event_end" className="form-label required">
                      Event End Date & Time
                    </label>
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="Select end date and time"
                      value={ADDEDITDATA?.event_end ? moment(ADDEDITDATA.event_end) : null}
                      onChange={handleEndDateChange}
                      style={{ width: "100%" }}
                      size="large"
                      disabledDate={(current) => {
                        if (ADDEDITDATA?.event_start) {
                          return current && current < moment(ADDEDITDATA.event_start).startOf('day');
                        }
                        return false;
                      }}
                    />
                    {error.event_end && (
                      <div className="form-error">{error.event_end}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="capacity" className="form-label required">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      id="capacity"
                      placeholder="Enter event capacity"
                      className="form-input"
                      value={ADDEDITDATA?.capacity || ""}
                      onChange={handleChange}
                      min="1"
                      required
                    />
                    {error.capacity && (
                      <div className="form-error">{error.capacity}</div>
                    )}
                  </div>
                </div>

                <div className="col-md-6 col-12 mb-3">
                  <div className="form-group">
                    <label className="form-label required">
                      Is Paid Event?
                    </label>
                    <Radio.Group
                      value={ADDEDITDATA?.is_paid || "N"}
                      onChange={handleIsPaidChange}
                      style={{ width: "100%" }}
                    >
                      <Radio value="N">Free</Radio>
                      <Radio value="Y">Paid</Radio>
                    </Radio.Group>
                    {error.is_paid && (
                      <div className="form-error">{error.is_paid}</div>
                    )}
                  </div>
                </div>

                {ADDEDITDATA?.is_paid === "Y" && (
                  <div className="col-md-6 col-12 mb-3">
                    <div className="form-group">
                      <label htmlFor="event_fee" className="form-label required">
                        Event Fee (₹)
                      </label>
                      <input
                        type="number"
                        name="event_fee"
                        id="event_fee"
                        placeholder="Enter event fee"
                        className="form-input"
                        value={ADDEDITDATA?.event_fee || ""}
                        onChange={handleChange}
                        min="0.01"
                        step="0.01"
                        required
                      />
                      {error.event_fee && (
                        <div className="form-error">{error.event_fee}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="col-md-12 col-12 mb-3">
                  <div className="form-group">
                    <label htmlFor="terms_condition" className="form-label required">
                      Terms & Conditions
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={ADDEDITDATA?.terms_condition || ""}
                      onChange={handleTermsConditionChange}
                      placeholder="Enter terms and conditions"
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'align': [] }],
                          ['link'],
                          ['clean']
                        ],
                      }}
                    />
                    <input
                      type="hidden"
                      name="terms_condition"
                      value={ADDEDITDATA?.terms_condition || ""}
                    />
                    {error.terms_condition && (
                      <div className="form-error">{error.terms_condition}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/events/list")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-button primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    {ADDEDITDATA?.id ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <SaveOutlined />
                    {ADDEDITDATA?.id ? "Update Event" : "Create Event"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <LoadingEffect isLoading={isLoading} text={loadingText} />
    </div>
  );
};

export default EventAddEditPage;

