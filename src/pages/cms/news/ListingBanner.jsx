import React from "react";

import ListingBannerForm from "components/cms/ListingBannerForm";
import { addEditNewsListingBanner, getNewsListingBanner } from "services/news.service";

export default function NewsListingBanner() {
  return (
    <ListingBannerForm
      entityName="News"
      backPath="/admin/cms/news/list"
      folder="cms/news"
      specKey="news"
      loadBanner={getNewsListingBanner}
      saveBanner={addEditNewsListingBanner}
      uploadNote="This banner uploads into the existing News media folder so it works with current server folder rules."
    />
  );
}
