import { createDraftProperty } from "../../property-actions";

/** “Yeni” → create draft and open the full property editor. */
export default async function NewPropertyPage() {
  await createDraftProperty();
}
