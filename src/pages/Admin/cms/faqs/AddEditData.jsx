import React, { useEffect, useState } from "react";
import { notification } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from "../../../../components/Loading/LoadingEffect";
import { addEditFaq } from "../../../../controllers/V1/faqController";
import "../../admin-pages.css";

const FaqAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [ADDEDITDATA, setAddEditData] = useState(state || {});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.target);
      
      if (!formData.get('question') || formData.get('question').trim() === '') {
        notification.open({
          message: "Oops!",
          description: `Question is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      if (!formData.get('answer') || formData.get('answer').trim() === '') {
        notification.open({
          message: "Oops!",
          description: `Answer is required.`,
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      const param = {
        ...(ADDEDITDATA?.id && { editId: ADDEDITDATA?.id }),
        question: formData.get('question'),
        answer: formData.get('answer'),
        ...(formData.get('tag') && { tag: formData.get('tag') }),
      };

      const res = await addEditFaq(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: ADDEDITDATA?.id ? `FAQ updated successfully` : `FAQ added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/cms/faqs/list');
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save FAQ'}`,
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
    document.title = `Farmer Store || ${ADDEDITDATA?.id ? "Edit" : "Add"} FAQ`;
  }, [ADDEDITDATA?.id]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {ADDEDITDATA?.id ? "Edit FAQ" : "Add New FAQ"}
            </h1>
            <p className="page-subtitle">
              {ADDEDITDATA?.id 
                ? "Update FAQ information" 
                : "Create a new FAQ with question, answer, and tag"}
            </p>
          </div>
          <Link to="/admin/cms/faqs/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to FAQs
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
                <QuestionCircleOutlined />
                FAQ Information
              </h3>
              
              <div className="form-group">
                <label htmlFor="question" className="form-label required">
                  Question
                  <span className="required-mark">*</span>
                </label>
                <textarea
                  name="question"
                  id="question"
                  placeholder="Enter the question"
                  className="form-input"
                  rows="3"
                  value={ADDEDITDATA?.question || ""}
                  onChange={handleChange}
                  required
                />
                {error.question && (
                  <div className="form-error">{error.question}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="answer" className="form-label required">
                  Answer
                  <span className="required-mark">*</span>
                </label>
                <textarea
                  name="answer"
                  id="answer"
                  placeholder="Enter the answer"
                  className="form-input"
                  rows="5"
                  value={ADDEDITDATA?.answer || ""}
                  onChange={handleChange}
                  required
                />
                {error.answer && (
                  <div className="form-error">{error.answer}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="tag" className="form-label">
                  Tag
                </label>
                <input
                  type="text"
                  name="tag"
                  id="tag"
                  placeholder="Enter tag (e.g., general, shipping, payment)"
                  className="form-input"
                  value={ADDEDITDATA?.tag || ""}
                  onChange={handleChange}
                />
                {error.tag && (
                  <div className="form-error">{error.tag}</div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/cms/faqs/list")}
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
                    {ADDEDITDATA?.id ? "Update FAQ" : "Create FAQ"}
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

export default FaqAddEditPage;

