import React from "react";

import ListingBannerForm from "components/cms/ListingBannerForm";
import { addEditArticleListingBanner, getArticleListingBanner } from "services/articles.service";

export default function ArticlesListingBanner() {
  return (
    <ListingBannerForm
      entityName="Articles"
      backPath="/admin/articles/list"
      folder="articles"
      specKey="articles"
      loadBanner={getArticleListingBanner}
      saveBanner={addEditArticleListingBanner}
      uploadNote="This banner uploads into the existing Articles media folder so it works with current server folder rules."
    />
  );
}
