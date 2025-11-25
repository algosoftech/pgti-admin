import React, { useEffect } from "react";
import "./App.css";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import LoginPage from "./pages/Admin/LoginPage/LoginPage.jsx";
import ResetPassword from "./pages/Admin/LoginPage/ResetPassword.jsx";
import AdminSidebar from "./pages/Admin/components/SideBar/Sidebar.jsx";
import Dashboard from "./pages/Admin/components/Dashboard.jsx";

import SubAdminList from './pages/Admin/Accounts/List.jsx'
import SubAdminAddEditData from './pages/Admin/Accounts/AddEditData.jsx'

import UsersList from "./pages/Admin/users/List.jsx";
import AddEditUsers from "./pages/Admin/users/AddEditData.jsx";

import CategoryList from "./pages/Admin/categories/List.jsx";
import AddEditCategory from "./pages/Admin/categories/AddEditData.jsx";

import SubCategoryList from "./pages/Admin/subCategories/List.jsx";
import AddEditSubCategory from "./pages/Admin/subCategories/AddEditData.jsx";

import ProductList from "./pages/Admin/products/List.jsx";
import AddEditProduct from "./pages/Admin/products/AddEditData.jsx";

import ProductVariantList from "./pages/Admin/productVariants/List.jsx";
import AddEditProductVariant from "./pages/Admin/productVariants/AddEditData.jsx";

import BannerList from "./pages/Admin/cms/banners/List.jsx";
import AddEditBanner from "./pages/Admin/cms/banners/AddEditData.jsx";

import FaqList from "./pages/Admin/cms/faqs/List.jsx";
import AddEditFaq from "./pages/Admin/cms/faqs/AddEditData.jsx";

import ContactShopList from "./pages/Admin/cms/contactShops/List.jsx";
import AddEditContactShop from "./pages/Admin/cms/contactShops/AddEditData.jsx";

import PromocodeList from "./pages/Admin/promocodes/List.jsx";
import AddEditPromocode from "./pages/Admin/promocodes/AddEditData.jsx";

import OrdersList from "./pages/Admin/orders/List.jsx";
import AddEditOrder from "./pages/Admin/orders/AddEditData.jsx";

import ArticleList from "./pages/Admin/articles/List.jsx";
import AddEditArticle from "./pages/Admin/articles/AddEditData.jsx";

import IngredientList from "./pages/Admin/articles/ingredients/List.jsx";
import AddEditIngredient from "./pages/Admin/articles/ingredients/AddEditData.jsx";

import EventList from "./pages/Admin/events/List.jsx";
import AddEditEvent from "./pages/Admin/events/AddEditData.jsx";

// Frontend Routes
// import FrontSideBar from "./components/FrontSideBar/Sidebar.jsx";
import LandingPage from "./pages/LandingPage.jsx";
// import FrontLogin from "./pages/Front/LoginPage/LoginPage.js";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const checkAuthentication = async () => {
    const adminToken = sessionStorage.getItem("TOKEN");
    const frontToken = sessionStorage.getItem("USER-TOKEN");

    const path = location?.pathname;

    // Public routes (no auth required)
    const publicRoutes = ["/", "/site-admin", "/login", "/reset-password", "/landing"];

    // Check if the current route is public
    if (publicRoutes.includes(path)) return;

    // Admin routes
    const isAdminRoute =
      path.startsWith("/dashboard") ||
      path.startsWith("/admin") ||
      path.startsWith("/sub-admin");

    // Front user routes
    const isFrontRoute =
    path.startsWith("/profile") ||
    path.startsWith("/front") 
    
    if (isAdminRoute && !adminToken) {
      // Redirect to admin login if no admin token
      navigate("/");
      return;
    }

    if (isFrontRoute && !frontToken) {
      // Redirect to front login if no front token
      navigate("/login");
      return;
    }

    // Optional: if route doesn’t match either
    if (!isAdminRoute && !isFrontRoute && !publicRoutes.includes(path)) {
      navigate("/");
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, [location]);
  const user = JSON.parse(sessionStorage.getItem("ADMIN-INFO"));
  return (
    <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Admin Panel Routes */}
          <Route path="/site-admin" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/dashboard" element={ <AdminSidebar> <Dashboard /> </AdminSidebar> } />
          <Route path="/sub-admin/list" element={ <AdminSidebar> <SubAdminList /> </AdminSidebar> } />
          <Route path="/sub-admin/addeditdata" element={ <AdminSidebar> <SubAdminAddEditData /> </AdminSidebar> } />
          

          <Route path="/admin/users/list" element={ <AdminSidebar> <UsersList /> </AdminSidebar> } />
          <Route path="/admin/users/addeditdata" element={ <AdminSidebar> <AddEditUsers /> </AdminSidebar> } />

          <Route path="/admin/categories/list" element={ <AdminSidebar> <CategoryList /> </AdminSidebar> } />
          <Route path="/admin/categories/addeditdata" element={ <AdminSidebar> <AddEditCategory /> </AdminSidebar> } />

          <Route path="/admin/sub-categories/list" element={ <AdminSidebar> <SubCategoryList /> </AdminSidebar> } />
          <Route path="/admin/sub-categories/addeditdata" element={ <AdminSidebar> <AddEditSubCategory /> </AdminSidebar> } />

          <Route path="/admin/products/list" element={ <AdminSidebar> <ProductList /> </AdminSidebar> } />
          <Route path="/admin/products/addeditdata" element={ <AdminSidebar> <AddEditProduct /> </AdminSidebar> } />

          <Route path="/admin/product-variants/list" element={ <AdminSidebar> <ProductVariantList /> </AdminSidebar> } />
          <Route path="/admin/product-variants/addeditdata" element={ <AdminSidebar> <AddEditProductVariant /> </AdminSidebar> } />

          <Route path="/admin/cms/banners/list" element={ <AdminSidebar> <BannerList /> </AdminSidebar> } />
          <Route path="/admin/cms/banners/addeditdata" element={ <AdminSidebar> <AddEditBanner /> </AdminSidebar> } />

          <Route path="/admin/cms/faqs/list" element={ <AdminSidebar> <FaqList /> </AdminSidebar> } />
          <Route path="/admin/cms/faqs/addeditdata" element={ <AdminSidebar> <AddEditFaq /> </AdminSidebar> } />

          <Route path="/admin/cms/contact-shops/list" element={ <AdminSidebar> <ContactShopList /> </AdminSidebar> } />
          <Route path="/admin/cms/contact-shops/addeditdata" element={ <AdminSidebar> <AddEditContactShop /> </AdminSidebar> } />

          <Route path="/admin/promocodes/list" element={ <AdminSidebar> <PromocodeList /> </AdminSidebar> } />
          <Route path="/admin/promocodes/addeditdata" element={ <AdminSidebar> <AddEditPromocode /> </AdminSidebar> } />

          <Route path="/admin/orders/list" element={ <AdminSidebar> <OrdersList /> </AdminSidebar> } />
          <Route path="/admin/orders/addeditdata" element={ <AdminSidebar> <AddEditOrder /> </AdminSidebar> } />

          <Route path="/admin/articles/list" element={ <AdminSidebar> <ArticleList /> </AdminSidebar> } />
          <Route path="/admin/articles/addeditdata" element={ <AdminSidebar> <AddEditArticle /> </AdminSidebar> } />

          <Route path="/admin/articles/ingredients/list" element={ <AdminSidebar> <IngredientList /> </AdminSidebar> } />
          <Route path="/admin/articles/ingredients/addeditdata" element={ <AdminSidebar> <AddEditIngredient /> </AdminSidebar> } />

          <Route path="/admin/events/list" element={ <AdminSidebar> <EventList /> </AdminSidebar> } />
          <Route path="/admin/events/addeditdata" element={ <AdminSidebar> <AddEditEvent /> </AdminSidebar> } />

          {/* END */}
          {/* Front */}
            {/* <Route path="/login" element={<FrontLogin />} />
            <Route path="/profile" element={<FrontSideBar> </FrontSideBar>} /> */}
          {/* END */}
        </Routes>
      
    </div>
  );
};

export default App;
