import React from "react";

import ListingBannerForm from "components/cms/ListingBannerForm";
import { addEditGalleryListingBanner, getGalleryListingBanner } from "services/gallery.service";

export default function GalleryListingBanner() {
  return (
    <ListingBannerForm
      entityName="Gallery"
      backPath="/admin/cms/gallery/list"
      folder="cms/gallery"
      specKey="cms/gallery"
      loadBanner={getGalleryListingBanner}
      saveBanner={addEditGalleryListingBanner}
      uploadNote="This banner uploads into the existing Gallery media folder so it works with current server folder rules."
    />
  );
}
