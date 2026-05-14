import React, { useEffect, useState } from "react";
import { notification, Select } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingEffect from 'components/ui/Loading/LoadingEffect';
import { addEditIngredients } from 'services/ingredients.service';
import { list as fetchArticles } from 'services/articles.service';
import { list as fetchProducts } from 'services/product.service';
import { list as fetchProductVariants } from 'services/productVariant.service';
import "styles/admin-pages.css";

const { Option } = Select;

const IngredientAddEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state;
  const [error, setError] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading, please wait...');
  const [articles, setArticles] = useState([]);
  const [products, setProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // For single edit mode
  const isEditMode = state?.id ? true : false;
  const [selectedArticleId, setSelectedArticleId] = useState(state?.article_id || "");
  
  // For multiple add/edit mode - array of ingredient objects
  const [ingredients, setIngredients] = useState(
    isEditMode && state?.id
      ? [{
          id: state.id,
          article_id: state.article_id || "",
          product_id: state.product_id || "",
          variant_id: state.variant_id || "",
          qty: state.qty || "",
        }]
      : state?.article_id
      ? [{
          id: null,
          article_id: state.article_id,
          product_id: "",
          variant_id: "",
          qty: "",
        }]
      : [{
          id: null,
          article_id: "",
          product_id: "",
          variant_id: "",
          qty: "",
        }]
  );

  // Fetch articles, products, and variants on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [articlesResult, productsResult, variantsResult] = await Promise.all([
          fetchArticles({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
          fetchProducts({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
          fetchProductVariants({
            type: "",
            condition: { status: "A" },
            skip: 0,
            limit: 1000,
          }),
        ]);

        if (articlesResult.status === true && articlesResult.result) {
          setArticles(articlesResult.result);
        }
        if (productsResult.status === true && productsResult.result) {
          setProducts(productsResult.result);
        }
        if (variantsResult.status === true && variantsResult.result) {
          setProductVariants(variantsResult.result);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        notification.open({
          message: "Oops!",
          description: "Failed to load data. Please refresh the page.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Get variants filtered by product
  const getFilteredVariants = (productId) => {
    if (!productId) return [];
    return productVariants.filter(variant => variant.product === productId);
  };

  // Add new ingredient row
  const handleAddRow = () => {
    setIngredients([
      ...ingredients,
      {
        id: null,
        article_id: selectedArticleId || "",
        product_id: "",
        variant_id: "",
        qty: "",
      },
    ]);
  };

  // Remove ingredient row
  const handleRemoveRow = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(newIngredients);
    } else {
      notification.open({
        message: "Oops!",
        description: "At least one ingredient row is required.",
        placement: "topRight",
        icon: <InfoCircleOutlined style={{ color: "red" }} />,
        duration: 2,
      });
    }
  };

  // Handle change for a specific ingredient row
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
      // Clear variant if product changes
      ...(field === "product_id" ? { variant_id: "" } : {}),
    };
    setIngredients(newIngredients);
    
    // Update selected article if article_id changes
    if (field === "article_id") {
      setSelectedArticleId(value);
      // Update article_id for all rows if not in edit mode
      if (!isEditMode) {
        newIngredients.forEach((ing, i) => {
          if (i !== index) {
            newIngredients[i].article_id = value;
          }
        });
      }
    }
    
    setError((pre) => ({
      ...pre,
      [`${field}_${index}`]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Validate all ingredients
      let hasError = false;
      const errors = {};

      ingredients.forEach((ingredient, index) => {
        if (!ingredient.article_id) {
          errors[`article_id_${index}`] = "Article is required";
          hasError = true;
        }
        if (!ingredient.product_id) {
          errors[`product_id_${index}`] = "Product is required";
          hasError = true;
        }
        if (!ingredient.qty || ingredient.qty <= 0) {
          errors[`qty_${index}`] = "Quantity must be greater than 0";
          hasError = true;
        }
      });

      if (hasError) {
        setError(errors);
        const firstError = Object.values(errors).find(Boolean);
        notification.open({
          message: "Oops!",
          description: firstError || "Please review the highlighted ingredient fields.",
          placement: "topRight",
          icon: <InfoCircleOutlined style={{ color: "red" }} />,
          duration: 2,
        });
        setIsLoading(false);
        return;
      }

      // Prepare data for API
      const ingredientsData = ingredients.map(ing => ({
        ...(ing.id && { editId: ing.id }),
        article_id: ing.article_id,
        product_id: ing.product_id,
        variant_id: ing.variant_id || null,
        qty: parseFloat(ing.qty),
      }));

      const param = {
        ingredients: ingredientsData,
      };

      const res = await addEditIngredients(param);
      if (res.status === true) {
        notification.open({
          message: "Success",
          description: isEditMode 
            ? `Ingredient updated successfully` 
            : `Ingredients added successfully`,
          placement: "topRight",
          icon: <CheckCircleOutlined style={{ color: "green" }} />,
          duration: 2,
        });
        navigate('/admin/articles/ingredients/list', { state: { article_id: selectedArticleId } });
      } else {
        notification.open({
          message: "Oops!",
          description: `${res?.message || 'Failed to save ingredients'}`,
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
    document.title = `PGTI || ${isEditMode ? "Edit" : "Add"} Ingredients`;
  }, [isEditMode]);

  return (
    <div className="admin-page-container">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">
              {isEditMode ? "Edit Ingredient" : "Add Ingredients"}
            </h1>
            <p className="page-subtitle">
              {isEditMode 
                ? "Update ingredient information" 
                : "Add multiple ingredients for an article. You can add multiple rows."}
            </p>
          </div>
          <Link to="/admin/articles/ingredients/list">
            <button className="action-button secondary">
              <ArrowLeftOutlined />
              Back to Ingredients
            </button>
          </Link>
        </div>
      </div>

      <div className="page-body">
      <div className="content-card">
        <div className="content-card-body">
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-section">
              <h3 className="form-section-title">
                <ShoppingCartOutlined />
                Ingredient Information
              </h3>

              {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-row" style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "20px",
                  backgroundColor: "#f9fafb"
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ margin: 0, color: "#374151" }}>
                      Ingredient {index + 1}
                    </h4>
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="action-button danger"
                        style={{ padding: "4px 12px" }}
                      >
                        <DeleteOutlined />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label required">
                          Article {index === 0 && !isEditMode ? "*" : ""}
                        </label>
                        <Select
                          placeholder="Select an article"
                          value={ingredient.article_id || undefined}
                          onChange={(value) => handleIngredientChange(index, "article_id", value)}
                          loading={loadingData}
                          style={{ width: "100%" }}
                          size="large"
                          disabled={isEditMode && index === 0}
                        >
                          {articles.map((article) => (
                            <Option key={article.id} value={article.id}>
                              {article.title}
                            </Option>
                          ))}
                        </Select>
                        {error[`article_id_${index}`] && (
                          <div className="form-error">{error[`article_id_${index}`]}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label required">
                          Product *
                        </label>
                        <Select
                          placeholder="Select a product"
                          value={ingredient.product_id || undefined}
                          onChange={(value) => handleIngredientChange(index, "product_id", value)}
                          loading={loadingData}
                          style={{ width: "100%" }}
                          size="large"
                        >
                          {products.map((product) => (
                            <Option key={product.id} value={product.id}>
                              {product.title}
                            </Option>
                          ))}
                        </Select>
                        {error[`product_id_${index}`] && (
                          <div className="form-error">{error[`product_id_${index}`]}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label">
                          Variant (Optional)
                        </label>
                        <Select
                          placeholder="Select a variant"
                          value={ingredient.variant_id || undefined}
                          onChange={(value) => handleIngredientChange(index, "variant_id", value)}
                          loading={loadingData}
                          style={{ width: "100%" }}
                          size="large"
                          disabled={!ingredient.product_id}
                        >
                          {getFilteredVariants(ingredient.product_id).map((variant) => (
                            <Option key={variant.id} value={variant.id}>
                              {variant.title || variant.unit || `Variant ${variant.id}`}
                            </Option>
                          ))}
                        </Select>
                        {!ingredient.product_id && (
                          <div className="form-help-text" style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                            Select a product first
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4 col-12 mb-3">
                      <div className="form-group">
                        <label className="form-label required">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          placeholder="Enter quantity"
                          className="form-input"
                          value={ingredient.qty || ""}
                          onChange={(e) => handleIngredientChange(index, "qty", e.target.value)}
                          min="0.01"
                          step="0.01"
                        />
                        {error[`qty_${index}`] && (
                          <div className="form-error">{error[`qty_${index}`]}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!isEditMode && (
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="action-button secondary"
                    style={{ width: "100%" }}
                  >
                    <PlusOutlined />
                    Add Another Ingredient
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={() => navigate("/admin/articles/ingredients/list")}
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
                    {isEditMode ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <SaveOutlined />
                    {isEditMode ? "Update Ingredient" : "Save Ingredients"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>

      <LoadingEffect isLoading={isLoading} text={loadingText} />
    </div>
  );
};

export default IngredientAddEditPage;
