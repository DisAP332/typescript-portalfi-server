import { Schema, model } from "mongoose";

interface ISiteData {
  Events: object;
  Drinks: {
    cocktails: Array<object>;
    seltzers: Array<object>;
    drafts: Array<object>;
    beers: Array<object>;
  };
  Food: object;
}

const siteDataSchema = new Schema<ISiteData>({
  Events: {
    type: Object,
    required: true,
  },
  Drinks: {
    cocktails: {
      type: Array,
      required: true,
    },
    seltzers: {
      type: Array,
      required: true,
    },
    drafts: {
      type: Array,
      required: true,
    },
    beers: {
      type: Array,
      required: true,
    },
  },
  Food: {
    type: Object,
    required: false,
  },
});

siteDataSchema.virtual("url").get(function () {
  return `/site/${this._id}`;
});

const SiteData = model<ISiteData>("site_data", siteDataSchema);

export default SiteData;
