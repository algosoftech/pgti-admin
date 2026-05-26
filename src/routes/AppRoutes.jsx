import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import LoginPage from "pages/auth/LoginPage/LoginPage";
import ResetPassword from "pages/auth/ResetPassword/ResetPassword";
import AdminSidebar from "components/layout/Sidebar/Sidebar";
import Dashboard from "pages/dashboard/Dashboard";

import SubAdminList from "pages/accounts/List";
import SubAdminAddEditData from "pages/accounts/AddEditData";
import ProfileSettings from "pages/profile/Settings";

import UsersList from "pages/users/List";
import AddEditUsers from "pages/users/AddEditData";
import ViewUser from "pages/users/ViewData";
import LoginActivity from "pages/users/LoginActivity";
import PlayersListingBanner from "pages/users/ListingBanner";
import PlayersHandbook from "pages/users/Handbook";

import BannerList from "pages/cms/banners/List";
import AddEditBanner from "pages/cms/banners/AddEditData";

import FaqList from "pages/cms/faqs/List";
import AddEditFaq from "pages/cms/faqs/AddEditData";

import HighlightVideoList from "pages/cms/highlight-videos/List";
import AddEditHighlightVideo from "pages/cms/highlight-videos/AddEditData";

import AboutUsList from "pages/cms/about-us/List";
import AboutUsAddEditData from "pages/cms/about-us/AddEditData";

import ArticleList from "pages/articles/List";
import AddEditArticle from "pages/articles/AddEditData";
import ArticlesListingBanner from "pages/articles/ListingBanner";

import EventList from "pages/events/List";
import AddEditEvent from "pages/events/AddEditData";
import AceImport from "pages/events/AceImport";
import EventsListingBanner from "pages/events/ListingBanner";
import LiveSyncMonitor from "pages/live-sync/Monitor";

import TourPartnersList from "pages/cms/tour-partners/List";
import TourPartnersAddEditData from "pages/cms/tour-partners/AddEditData";

import AntiDopingList from "pages/cms/anti-doping/List";
import AntiDopingAddEditData from "pages/cms/anti-doping/AddEditData";

import IndianGolfList from "pages/cms/indian-golf/List";
import IndianGolfAddEditData from "pages/cms/indian-golf/AddEditData";
import GrowthOfGolfList from "pages/cms/growth-of-golf/List";
import GrowthOfGolfAddEditData from "pages/cms/growth-of-golf/AddEditData";

import NewsList from "pages/cms/news/List";
import NewsAddEditData from "pages/cms/news/AddEditData";
import NewsListingBanner from "pages/cms/news/ListingBanner";
import ArticlePagesList from "pages/cms/article-pages/List";
import ArticlePagesAddEditData from "pages/cms/article-pages/AddEditData";
import ArticlePagesListingBanner from "pages/cms/article-pages/ListingBanner";

import GolfFactsList from "pages/cms/golf-facts/List";
import GolfFactsAddEditData from "pages/cms/golf-facts/AddEditData";

import TermsConditionsList from "pages/cms/terms-conditions/List";
import TermsConditionsAddEditData from "pages/cms/terms-conditions/AddEditData";

import PrivacyPolicyList from "pages/cms/privacy-policy/List";
import PrivacyPolicyAddEditData from "pages/cms/privacy-policy/AddEditData";
import CookiePolicyList from "pages/cms/cookie-policy/List";
import CookiePolicyAddEditData from "pages/cms/cookie-policy/AddEditData";

import DisclaimerList from "pages/cms/disclaimer/List";
import DisclaimerAddEditData from "pages/cms/disclaimer/AddEditData";

import ContactUsList from "pages/cms/contact-us/List";
import ContactUsAddEditData from "pages/cms/contact-us/AddEditData";
import ContactUsInquiriesList from "pages/inquiries/contact-us/List";

import FooterCmsList from "pages/cms/footer/List";
import FooterCmsAddEditData from "pages/cms/footer/AddEditData";

import HomepageSettingsList from "pages/cms/homepage/List";
import HomepageSettingsAddEdit from "pages/cms/homepage/AddEditData";
import GalleryList from "pages/cms/gallery/List";
import GalleryAddEditData from "pages/cms/gallery/AddEditData";
import GalleryListingBanner from "pages/cms/gallery/ListingBanner";
import PressReleaseList from "pages/cms/press-release/List";
import PressReleaseAddEditData from "pages/cms/press-release/AddEditData";
import PressReleaseListingBanner from "pages/cms/press-release/ListingBanner";

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
    <Route path="/admin/profile" element={<AdminLayout><ProfileSettings /></AdminLayout>} />

    {/* Admin – Users / Players */}
    <Route path="/admin/users/list" element={<AdminLayout><UsersList /></AdminLayout>} />
    <Route path="/admin/users/addeditdata" element={<AdminLayout><AddEditUsers /></AdminLayout>} />
    <Route path="/admin/users/viewdata" element={<AdminLayout><ViewUser /></AdminLayout>} />
    <Route path="/admin/users/login-activity" element={<AdminLayout><LoginActivity /></AdminLayout>} />
    <Route path="/admin/users/listing-banner" element={<AdminLayout><PlayersListingBanner /></AdminLayout>} />
    <Route path="/admin/users/handbook" element={<AdminLayout><PlayersHandbook /></AdminLayout>} />

    {/* Admin – CMS: Homepage Settings */}
    <Route path="/admin/cms/homepage/list" element={<AdminLayout><HomepageSettingsList /></AdminLayout>} />
    <Route path="/admin/cms/homepage/addeditdata" element={<AdminLayout><HomepageSettingsAddEdit /></AdminLayout>} />
    <Route path="/admin/cms/gallery/list" element={<AdminLayout><GalleryList /></AdminLayout>} />
    <Route path="/admin/cms/gallery/addeditdata" element={<AdminLayout><GalleryAddEditData /></AdminLayout>} />
    <Route path="/admin/cms/gallery/listing-banner" element={<AdminLayout><GalleryListingBanner /></AdminLayout>} />
    <Route path="/admin/cms/press-release/list" element={<AdminLayout><PressReleaseList /></AdminLayout>} />
    <Route path="/admin/cms/press-release/addeditdata" element={<AdminLayout><PressReleaseAddEditData /></AdminLayout>} />
    <Route path="/admin/cms/press-release/listing-banner" element={<AdminLayout><PressReleaseListingBanner /></AdminLayout>} />

    {/* Admin – CMS */}
    <Route path="/admin/cms/banners/list" element={<AdminLayout><BannerList /></AdminLayout>} />
    <Route path="/admin/cms/banners/addeditdata" element={<AdminLayout><AddEditBanner /></AdminLayout>} />

    <Route path="/admin/cms/faqs/list" element={<AdminLayout><FaqList /></AdminLayout>} />
    <Route path="/admin/cms/faqs/addeditdata" element={<AdminLayout><AddEditFaq /></AdminLayout>} />

    <Route path="/admin/cms/highlight-videos/list" element={<AdminLayout><HighlightVideoList /></AdminLayout>} />
    <Route path="/admin/cms/highlight-videos/addeditdata" element={<AdminLayout><AddEditHighlightVideo /></AdminLayout>} />

    <Route path="/admin/cms/about-us/list" element={<AdminLayout><AboutUsList /></AdminLayout>} />
    <Route path="/admin/cms/about-us/addeditdata" element={<AdminLayout><AboutUsAddEditData /></AdminLayout>} />

    {/* Admin – Articles */}
    <Route path="/admin/articles/list" element={<AdminLayout><ArticleList /></AdminLayout>} />
    <Route path="/admin/articles/addeditdata" element={<AdminLayout><AddEditArticle /></AdminLayout>} />
    <Route path="/admin/articles/listing-banner" element={<AdminLayout><ArticlesListingBanner /></AdminLayout>} />

    {/* Admin – Events */}
    <Route path="/admin/events/list" element={<AdminLayout><EventList /></AdminLayout>} />
    <Route path="/admin/events/addeditdata" element={<AdminLayout><AddEditEvent /></AdminLayout>} />
    <Route path="/admin/events/ace-import" element={<AdminLayout><AceImport /></AdminLayout>} />
    <Route path="/admin/live-sync" element={<AdminLayout><LiveSyncMonitor /></AdminLayout>} />
    <Route path="/admin/cms/events/list" element={<AdminLayout><EventList /></AdminLayout>} />
    <Route path="/admin/cms/events/addeditdata" element={<AdminLayout><AddEditEvent /></AdminLayout>} />
    <Route path="/admin/cms/events/listing-banner" element={<AdminLayout><EventsListingBanner /></AdminLayout>} />

    {/* Admin – CMS: Tour Partners */}
    <Route path="/admin/cms/tour-partners/list" element={<AdminLayout><TourPartnersList /></AdminLayout>} />
    <Route path="/admin/cms/tour-partners/addeditdata" element={<AdminLayout><TourPartnersAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Anti-Doping */}
    <Route path="/admin/cms/anti-doping/list" element={<AdminLayout><AntiDopingList /></AdminLayout>} />
    <Route path="/admin/cms/anti-doping/addeditdata" element={<AdminLayout><AntiDopingAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Indian Golf */}
    <Route path="/admin/cms/indian-golf/list" element={<AdminLayout><IndianGolfList /></AdminLayout>} />
    <Route path="/admin/cms/indian-golf/addeditdata" element={<AdminLayout><IndianGolfAddEditData /></AdminLayout>} />
    <Route path="/admin/cms/growth-of-golf/list" element={<AdminLayout><GrowthOfGolfList /></AdminLayout>} />
    <Route path="/admin/cms/growth-of-golf/addeditdata" element={<AdminLayout><GrowthOfGolfAddEditData /></AdminLayout>} />

    {/* Admin – CMS: News */}
    <Route path="/admin/cms/news/list" element={<AdminLayout><NewsList /></AdminLayout>} />
    <Route path="/admin/cms/news/addeditdata" element={<AdminLayout><NewsAddEditData /></AdminLayout>} />
    <Route path="/admin/cms/news/listing-banner" element={<AdminLayout><NewsListingBanner /></AdminLayout>} />
    <Route path="/admin/cms/article-pages/list" element={<AdminLayout><ArticlePagesList /></AdminLayout>} />
    <Route path="/admin/cms/article-pages/addeditdata" element={<AdminLayout><ArticlePagesAddEditData /></AdminLayout>} />
    <Route path="/admin/cms/article-pages/listing-banner" element={<AdminLayout><ArticlePagesListingBanner /></AdminLayout>} />

    {/* Admin – CMS: Golf Facts */}
    <Route path="/admin/cms/golf-facts/list" element={<AdminLayout><GolfFactsList /></AdminLayout>} />
    <Route path="/admin/cms/golf-facts/addeditdata" element={<AdminLayout><GolfFactsAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Terms & Conditions */}
    <Route path="/admin/cms/terms-conditions/list" element={<AdminLayout><TermsConditionsList /></AdminLayout>} />
    <Route path="/admin/cms/terms-conditions/addeditdata" element={<AdminLayout><TermsConditionsAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Privacy Policy */}
    <Route path="/admin/cms/privacy-policy/list" element={<AdminLayout><PrivacyPolicyList /></AdminLayout>} />
    <Route path="/admin/cms/privacy-policy/addeditdata" element={<AdminLayout><PrivacyPolicyAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Cookie Policy */}
    <Route path="/admin/cms/cookie-policy/list" element={<AdminLayout><CookiePolicyList /></AdminLayout>} />
    <Route path="/admin/cms/cookie-policy/addeditdata" element={<AdminLayout><CookiePolicyAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Disclaimer */}
    <Route path="/admin/cms/disclaimer/list" element={<AdminLayout><DisclaimerList /></AdminLayout>} />
    <Route path="/admin/cms/disclaimer/addeditdata" element={<AdminLayout><DisclaimerAddEditData /></AdminLayout>} />

    {/* Admin – CMS: Contact Us */}
    <Route path="/admin/cms/contact-us/list" element={<AdminLayout><ContactUsList /></AdminLayout>} />
    <Route path="/admin/cms/contact-us/addeditdata" element={<AdminLayout><ContactUsAddEditData /></AdminLayout>} />

    {/* Admin – Inquiries */}
    <Route path="/admin/inquiries/contact-us/list" element={<AdminLayout><ContactUsInquiriesList /></AdminLayout>} />

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
