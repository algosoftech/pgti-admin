import React from "react";

import ListingBannerForm from "components/cms/ListingBannerForm";
import {
  addEditPressReleaseListingBanner,
  getPressReleaseListingBanner,
} from "services/pressRelease.service";

export default function PressReleaseListingBanner() {
  return (
    <ListingBannerForm
      entityName="Press Release"
      backPath="/admin/cms/press-release/list"
      folder="cms/press-release"
      specKey="cms/press-release"
      loadBanner={getPressReleaseListingBanner}
      saveBanner={addEditPressReleaseListingBanner}
      uploadNote="This banner uploads into the existing Press Release media folder so it works with current server folder rules."
    />
  );
}
