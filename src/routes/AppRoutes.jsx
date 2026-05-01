import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import LoginPage from "pages/auth/LoginPage/LoginPage";
import ResetPassword from "pages/auth/ResetPassword/ResetPassword";
import AdminSidebar from "components/layout/Sidebar/Sidebar";
import Dashboard from "pages/dashboard/Dashboard";

import SubAdminList from "pages/accounts/List";
import SubAdminAddEditData from "pages/accounts/AddEditData";

import UsersList from "pages/users/List";
import AddEditUsers from "pages/users/AddEditData";
import ViewUser from "pages/users/ViewData";
import UserRegistrations from "pages/users/Registrations";
import LoginActivity from "pages/users/LoginActivity";

import CategoryList from "pages/categories/List";
import AddEditCategory from "pages/categories/AddEditData";

import SubCategoryList from "pages/sub-categories/List";
import AddEditSubCategory from "pages/sub-categories/AddEditData";

import ProductList from "pages/products/List";
import AddEditProduct from "pages/products/AddEditData";

import ProductVariantList from "pages/product-variants/List";
import AddEditProductVariant from "pages/product-variants/AddEditData";

import BannerList from "pages/cms/banners/List";
import AddEditBanner from "pages/cms/banners/AddEditData";

import FaqList from "pages/cms/faqs/List";
import AddEditFaq from "pages/cms/faqs/AddEditData";

import ContactShopList from "pages/cms/contact-shops/List";
import AddEditContactShop from "pages/cms/contact-shops/AddEditData";

import HighlightVideoList from "pages/cms/highlight-videos/List";
import AddEditHighlightVideo from "pages/cms/highlight-videos/AddEditData";

import AboutUsList from "pages/cms/about-us/List";
import AboutUsAddEditData from "pages/cms/about-us/AddEditData";

import PromocodeList from "pages/promocodes/List";
import AddEditPromocode from "pages/promocodes/AddEditData";

import OrdersList from "pages/orders/List";
import AddEditOrder from "pages/orders/AddEditData";

import ArticleList from "pages/articles/List";
import AddEditArticle from "pages/articles/AddEditData";

import IngredientList from "pages/articles/ingredients/List";
import AddEditIngredient from "pages/articles/ingredients/AddEditData";

import EventList from "pages/events/List";
import AddEditEvent from "pages/events/AddEditData";

import TourPartnersList from "pages/cms/tour-partners/List";
import TourPartnersAddEditData from "pages/cms/tour-partners/AddEditData";

import AntiDopingList from "pages/cms/anti-doping/List";
import AntiDopingAddEditData from "pages/cms/anti-doping/AddEditData";

import IndianGolfList from "pages/cms/indian-golf/List";
import IndianGolfAddEditData from "pages/cms/indian-golf/AddEditData";

import NewsList from "pages/cms/news/List";
import NewsAddEditData from "pages/cms/news/AddEditData";

import GolfFactsList from "pages/cms/golf-facts/List";
import GolfFactsAddEditData from "pages/cms/golf-facts/AddEditData";

import TermsConditionsList from "pages/cms/terms-conditions/List";
import TermsConditionsAddEditData from "pages/cms/terms-conditions/AddEditData";

import PrivacyPolicyList from "pages/cms/privacy-policy/List";
import PrivacyPolicyAddEditData from "pages/cms/privacy-policy/AddEditData";

import DisclaimerList from "pages/cms/disclaimer/List";
import DisclaimerAddEditData from "pages/cms/disclaimer/AddEditData";

import ContactUsList from "pages/cms/contact-us/List";
import ContactUsAddEditData from "pages/cms/contact-us/AddEditData";

import FooterCmsList from "pages/cms/footer/List";
import FooterCmsAddEditData from "pages/cms/footer/AddEditData";

import HomepageSettingsList from "pages/cms/homepage/List";
import HomepageSettingsAddEdit from "pages/cms/homepage/AddEditData";
import GalleryList from "pages/cms/gallery/List";
import GalleryAddEditData from "pages/cms/gallery/AddEditData";

import EmailTemplatesList from "pages/templates/email-templates/List";
import EmailTemplatesAddEditData from "pages/templates/email-templates/AddEditData";

import TournamentResultList from "pages/tournament-results/List";
import AddEditTournamentResult from "pages/tournament-results/AddEditData";

const AdminLayout = ({ children }) => (
  <AdminSidebar>{children}</AdminSidebar>
);

const AppRoutes = () => (
  <Routes>
    {/* Root → redirect to login */}
    <Route path="/" element={<Navigate to="/login" replace />} />

    {/* Auth */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/reset-password" element={<ResetPassword />} />

    {/* Admin – Dashboard */}
    <Route path="/admin/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} />

    {/* Admin – Accounts (Sub-Admin) */}
    <Route path="/admin/accounts/list" element={<AdminLayout><SubAdminList /></AdminLayout>} />
    <Route path="/admin/accounts/addeditdata" element={<AdminLayout><SubAdminAddEditData /></AdminLayout>} />

    {/* Admin – Users / Players */}
    <Route path="/admin/users/list" element={<AdminLayout><UsersList /></AdminLayout>} />
    <Route path="/admin/users/addeditdata" element={<AdminLayout><AddEditUsers /></AdminLayout>} />
    <Route path="/admin/users/viewdata" element={<AdminLayout><ViewUser /></AdminLayout>} />
    <Route path="/admin/users/registrations" element={<AdminLayout><UserRegistrations /></AdminLayout>} />
    <Route path="/admin/users/login-activity" element={<AdminLayout><LoginActivity /></AdminLayout>} />

    {/* Admin – Categories */}
    <Route path="/admin/categories/list" element={<AdminLayout><CategoryList /></AdminLayout>} />
    <Route path="/admin/categories/addeditdata" element={<AdminLayout><AddEditCategory /></AdminLayout>} />

    {/* Admin – Sub-Categories */}
    <Route path="/admin/sub-categories/list" element={<AdminLayout><SubCategoryList /></AdminLayout>} />
    <Route path="/admin/sub-categories/addeditdata" element={<AdminLayout><AddEditSubCategory /></AdminLayout>} />

    {/* Admin – Products */}
    <Route path="/admin/products/list" element={<AdminLayout><ProductList /></AdminLayout>} />
    <Route path="/admin/products/addeditdata" element={<AdminLayout><AddEditProduct /></AdminLayout>} />

    {/* Admin – Product Variants */}
    <Route path="/admin/product-variants/list" element={<AdminLayout><ProductVariantList /></AdminLayout>} />
    <Route path="/admin/product-variants/addeditdata" element={<AdminLayout><AddEditProductVariant /></AdminLayout>} />

    {/* Admin – CMS: Homepage Settings */}
    <Route path="/admin/cms/homepage/list" element={<AdminLayout><HomepageSettingsList /></AdminLayout>} />
    <Route path="/admin/cms/homepage/addeditdata" element={<AdminLayout><HomepageSettingsAddEdit /></AdminLayout>} />
    <Route path="/admin/cms/gallery/list" element={<AdminLayout><GalleryList /></AdminLayout>} />
    <Route path="/admin/cms/gallery/addeditdata" element={<AdminLayout><GalleryAddEditData /></AdminLayout>} />

    {/* Admin – CMS */}
    <Route path="/admin/cms/banners/list" element={<AdminLayout><BannerList /></AdminLayout>} />
    <Route path="/admin/cms/banners/addeditdata" element={<AdminLayout><AddEditBanner /></AdminLayout>} />

    <Route path="/admin/cms/faqs/list" element={<AdminLayout><FaqList /></AdminLayout>} />
    <Route path="/admin/cms/faqs/addeditdata" element={<AdminLayout><AddEditFaq /></AdminLayout>} />

    <Route path="/admin/cms/contact-shops/list" element={<AdminLayout><ContactShopList /></AdminLayout>} />
    <Route path="/admin/cms/contact-shops/addeditdata" element={<AdminLayout><AddEditContactShop /></AdminLayout>} />

    <Route path="/admin/cms/highlight-videos/list" element={<AdminLayout><HighlightVideoList /></AdminLayout>} />
    <Route path="/admin/cms/highlight-videos/addeditdata" element={<AdminLayout><AddEditHighlightVideo /></AdminLayout>} />

    <Route path="/admin/cms/about-us/list" element={<AdminLayout><AboutUsList /></AdminLayout>} />
    <Route path="/admin/cms/about-us/addeditdata" element={<AdminLayout><AboutUsAddEditData /></AdminLayout>} />

    {/* Admin – Promocodes */}
    <Route path="/admin/promocodes/list" element={<AdminLayout><PromocodeList /></AdminLayout>} />
    <Route path="/admin/promocodes/addeditdata" element={<AdminLayout><AddEditPromocode /></AdminLayout>} />

    {/* Admin – Orders */}
    <Route path="/admin/orders/list" element={<AdminLayout><OrdersList /></AdminLayout>} />
    <Route path="/admin/orders/addeditdata" element={<AdminLayout><AddEditOrder /></AdminLayout>} />

    {/* Admin – Articles */}
    <Route path="/admin/articles/list" element={<AdminLayout><ArticleList /></AdminLayout>} />
    <Route path="/admin/articles/addeditdata" element={<AdminLayout><AddEditArticle /></AdminLayout>} />

    <Route path="/admin/articles/ingredients/list" element={<AdminLayout><IngredientList /></AdminLayout>} />
    <Route path="/admin/articles/ingredients/addeditdata" element={<AdminLayout><AddEditIngredient /></AdminLayout>} />

    {/* Admin – Events */}
    <Route path="/admin/events/list" element={<AdminLayout><EventList /></AdminLayout>} />
    <Route path="/admin/events/addeditdata" element={<AdminLayout><AddEditEvent /></AdminLayout>} />
    <Route path="/admin/cms/events/list" element={<AdminLayout><EventList /></AdminLayout>} />
    <Route path="/admin/cms/events/addeditdata" element={<AdminLayout><AddEditEvent /></AdminLayout>} />

    {/* Admin – CMS: Tour Partners */}
    <Route path="/admin/cms/tour-partners/list" element={<AdminLayout><TourPartnersList /></AdminLayout>} />
    <Route path="/admin/cms/tour-partners/addeditdata" element={<AdminLayout><TourPartnersAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Anti-Doping */}
    <Route path="/admin/cms/anti-doping/list" element={<AdminLayout><AntiDopingList /></AdminLayout>} />
    <Route path="/admin/cms/anti-doping/addeditdata" element={<AdminLayout><AntiDopingAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Indian Golf */}
    <Route path="/admin/cms/indian-golf/list" element={<AdminLayout><IndianGolfList /></AdminLayout>} />
    <Route path="/admin/cms/indian-golf/addeditdata" element={<AdminLayout><IndianGolfAddEditData /></AdminLayout>} />

    {/* Admin – CMS: News */}
    <Route path="/admin/cms/news/list" element={<AdminLayout><NewsList /></AdminLayout>} />
    <Route path="/admin/cms/news/addeditdata" element={<AdminLayout><NewsAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Golf Facts */}
    <Route path="/admin/cms/golf-facts/list" element={<AdminLayout><GolfFactsList /></AdminLayout>} />
    <Route path="/admin/cms/golf-facts/addeditdata" element={<AdminLayout><GolfFactsAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Terms & Conditions */}
    <Route path="/admin/cms/terms-conditions/list" element={<AdminLayout><TermsConditionsList /></AdminLayout>} />
    <Route path="/admin/cms/terms-conditions/addeditdata" element={<AdminLayout><TermsConditionsAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Privacy Policy */}
    <Route path="/admin/cms/privacy-policy/list" element={<AdminLayout><PrivacyPolicyList /></AdminLayout>} />
    <Route path="/admin/cms/privacy-policy/addeditdata" element={<AdminLayout><PrivacyPolicyAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Disclaimer */}
    <Route path="/admin/cms/disclaimer/list" element={<AdminLayout><DisclaimerList /></AdminLayout>} />
    <Route path="/admin/cms/disclaimer/addeditdata" element={<AdminLayout><DisclaimerAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Contact Us */}
    <Route path="/admin/cms/contact-us/list" element={<AdminLayout><ContactUsList /></AdminLayout>} />
    <Route path="/admin/cms/contact-us/addeditdata" element={<AdminLayout><ContactUsAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Footer */}
    <Route path="/admin/cms/footer/list" element={<AdminLayout><FooterCmsList /></AdminLayout>} />
    <Route path="/admin/cms/footer/addeditdata" element={<AdminLayout><FooterCmsAddEditData /></AdminLayout>} />

    {/* Admin – Templates: Email Templates */}
    <Route path="/admin/templates/email-templates/list" element={<AdminLayout><EmailTemplatesList /></AdminLayout>} />
    <Route path="/admin/templates/email-templates/addeditdata" element={<AdminLayout><EmailTemplatesAddEditData /></AdminLayout>} />

    {/* Admin – Tournament Results */}
    <Route path="/admin/tournament-results/list" element={<AdminLayout><TournamentResultList /></AdminLayout>} />
    <Route path="/admin/tournament-results/addeditdata" element={<AdminLayout><AddEditTournamentResult /></AdminLayout>} />

    {/* Catch-all → login */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;
