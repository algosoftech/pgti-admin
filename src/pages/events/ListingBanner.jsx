import React from "react";

import ListingBannerForm from "components/cms/ListingBannerForm";
import { addEditEventListingBanner, getEventListingBanner } from "services/events.service";

export default function EventsListingBanner() {
  return (
    <ListingBannerForm
      entityName="Events / Tournaments"
      backPath="/admin/cms/events/list"
      folder="events"
      specKey="events"
      loadBanner={getEventListingBanner}
      saveBanner={addEditEventListingBanner}
      uploadNote="This banner uploads into the existing Events media folder so it works with current server folder rules."
    />
  );
}
