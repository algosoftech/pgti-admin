import React from "react";

import ListingBannerForm from "components/cms/ListingBannerForm";
import { addEditPlayersListingBanner, getPlayersListingBanner } from "services/users.service";

export default function PlayersListingBanner() {
  return (
    <ListingBannerForm
      entityName="Players"
      backPath="/admin/users/list"
      folder="cms/listing-banners"
      specKey="cms/listing-banners"
      loadBanner={getPlayersListingBanner}
      saveBanner={addEditPlayersListingBanner}
      uploadNote="This banner uses the shared listing banners media folder for the public players listing page."
    />
  );
}
