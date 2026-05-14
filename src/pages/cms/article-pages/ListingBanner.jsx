import React from "react";

import ListingBannerForm from "components/cms/ListingBannerForm";
import {
  addEditArticlePagesListingBanner,
  getArticlePagesListingBanner,
} from "services/articlePages.service";

export default function ArticlePagesListingBanner() {
  return (
    <ListingBannerForm
      entityName="Article Pages"
      backPath="/admin/cms/article-pages/list"
      folder="articles"
      specKey="articles"
      loadBanner={getArticlePagesListingBanner}
      saveBanner={addEditArticlePagesListingBanner}
      uploadNote="This banner uploads into the existing Articles media folder so it works with current server folder rules."
    />
  );
}
