"use client";

import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import RichTextEditor from "@/components/RichTextField";
import UploadBox from "@/components/UploadBox";
import { useState, useEffect } from "react";
import { loadGeo } from "@/lib/geo";
import PackageLimitModal from "@/components/recruiter/PackageLimitModal";
import BusinessListingGuidelinesSummary from "@/components/recruiter/BusinessListingGuidelinesSummary";
import {
  CompanyProfileEligibility,
  fetchCompanyProfileEligibility,
  fetchProductListingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits";
import { PlanGatedSection } from "@/components/recruiter/PlanGatedSection";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const GalleryItemSchema = Yup.object({
  image: Yup.string().url().required("Image URL is required"),
  name: Yup.string(),
  description: Yup.string(),
});

const DirectorySchema = Yup.object({
  name: Yup.string().min(3).required("Company name is required"),
  slug: Yup.string()
    .matches(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens")
    .required("Slug is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  email: Yup.string().email().required("Email is required"),
  description: Yup.string().min(20).required("Description is required"),
  website: Yup.string().url().nullable(),
  logoUrl: Yup.string().url().nullable(),
  coverImages: Yup.array().of(Yup.string().url()),
  tradeNames: Yup.array().of(Yup.string()).min(1),
  videoGallery: Yup.array().of(Yup.string().url()),
  productSupplies: Yup.array(),
  productGallery: Yup.array().of(GalleryItemSchema),
  companyGallery: Yup.array().of(GalleryItemSchema),
  factoryGallery: Yup.array().of(GalleryItemSchema),
  productCatalogues: Yup.array().of(Yup.string().url()),
  companyBrochure: Yup.array().of(Yup.string().url()),
  certifications: Yup.array().of(Yup.string().url()),
  brandsRepresented: Yup.array().of(Yup.string()),
  industriesServed: Yup.array().of(Yup.string()),
  exportMarkets: Yup.array().of(Yup.string()),
  manufacturingCapabilities: Yup.string(),
  manufacturingCapabilityImages: Yup.array().of(Yup.string().url()),
  manufacturingCapabilityVideos: Yup.array().of(Yup.string().url()),
  machineryList: Yup.string(),
  machineryImages: Yup.array().of(Yup.string().url()),
  qualityStandards: Yup.string(),
  enableInquiryForm: Yup.boolean(),
  googleMapUrl: Yup.string().url().nullable(),
  socialLinks: Yup.object({
    facebook: Yup.string().url().nullable(),
    linkedin: Yup.string().url().nullable(),
    twitter: Yup.string().url().nullable(),
    youtube: Yup.string().url().nullable(),
    whatsapp: Yup.string().nullable(),
  }),
  country: Yup.string().required("Country required"),
  state: Yup.string().required("State required"),
  city: Yup.string().required("City required"),
  address: Yup.string().min(10).required("Address required"),
  industryId: Yup.number().required("Industry required"),
  acceptedGuidelines: Yup.boolean().oneOf(
    [true],
    "Please agree to the Business Listing Guidelines."
  ),
});

export default function AddDirectoryPage() {
  const router = useRouter();

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingCatalogue, setUploadingCatalogue] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [listingEligibility, setListingEligibility] =
    useState<ContentLimitEligibility | null>(null);
  const [profileLimits, setProfileLimits] =
    useState<CompanyProfileEligibility | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setListingEligibility(await fetchProductListingEligibility(token));
      } catch (error) {
        console.error("Product listing eligibility error:", error);
      }
    }
    loadEligibility();
  }, []);

  const maxCoverImages = listingEligibility?.maxCoverImages ?? 0;
  const allowWhatsapp = listingEligibility?.allowWhatsapp ?? false;

  /* ================= INDUSTRY CASCADE ================= */
  const [industryLevels, setIndustryLevels] = useState<any[][]>([]);
  const [industrySelected, setIndustrySelected] = useState<number[]>([]);
  const [geo, setGeo] = useState<Awaited<ReturnType<typeof loadGeo>> | null>(null);

  // Helper: Check if a value is unlimited
  const isUnlimited = (value: any): boolean => {
    return value === null || value === "Unlimited" || value === Infinity;
  };

  // Helper: Get display limit
  const getDisplayLimit = (value: any): string | number => {
    if (isUnlimited(value)) return "Unlimited";
    return value;
  };

  // Helper: Check if feature is allowed (null = unlimited = allowed)
  const isFeatureAllowed = (value: any): boolean => {
    if (value === null || value === "Unlimited") return true;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    if (typeof value === "string") {
      return value.length > 0 && value !== "false" && value !== "0";
    }
    return !!value;
  };

  // Helper: Get numeric limit (null = unlimited)
  const getFeatureLimit = (value: any): number | null => {
    if (value === null || value === "Unlimited") return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseInt(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) return;
      setProfileLimits(await fetchCompanyProfileEligibility(token));
    }
    load();
  }, []);

  useEffect(() => {
    loadGeo().then(setGeo).catch(console.error);
  }, []);

  useEffect(() => {
    async function fetchIndustries() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/industries`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data ?? [];
        setIndustryLevels([list]);
      } catch (err) {
        console.error("Failed to fetch industries:", err);
      }
    }
    fetchIndustries();
  }, []);

  const handleIndustrySelect = async (levelIndex: number, id: number, setFieldValue: any) => {
    const newSelected = [...industrySelected.slice(0, levelIndex), id];
    const newLevels = industryLevels.slice(0, levelIndex + 1);

    setIndustrySelected(newSelected);
    setIndustryLevels(newLevels);
    setFieldValue("industryId", "");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/industries/${id}/children`
      );
      const children = await res.json();

      if (Array.isArray(children) && children.length > 0) {
        setIndustryLevels([...newLevels, children]);
      } else {
        // Leaf node reached — this is the ONLY place industryId gets set to a real value
        setFieldValue("industryId", id);
      }
    } catch (err) {
      console.error("Failed to fetch industry children:", err);
    }
  };

  const handleImageUpload = async (file: File, setFieldValue: any, fieldName: "logoUrl", type: "logo") => {
    setUploadingLogo(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      setFieldValue(fieldName, data.imageUrl);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverImageUpload = async (file: File, setFieldValue: any, values: any, index: number) => {
    setUploadingCover(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      const arr = [...values.coverImages];
      arr[index] = data.imageUrl;
      setFieldValue("coverImages", arr);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle gallery image upload with object structure
  const handleGalleryImageUpload = async (
    file: File,
    setFieldValue: any,
    values: any,
    field: string,
    index: number
  ) => {
    setUploadingGalleryImage(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      const arr = [...values[field]];
      arr[index] = { ...arr[index], image: data.imageUrl };
      setFieldValue(field, arr);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  const handleCatalogueUpload = async (file: File, setFieldValue: any, values: any, index: number) => {
    setUploadingCatalogue(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("document", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/document`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "File upload failed");
      }

      const data = await res.json();
      const arr = [...values.productCatalogues];
      arr[index] = data.documentUrl;
      setFieldValue("productCatalogues", arr);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadingCatalogue(false);
    }
  };

  async function submit(values: any, { setSubmitting, setStatus }: any) {
    console.log("=== SUBMIT CALLED ===", values);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No auth token found in localStorage — request will likely fail with 401");
      }

      const geoLib = geo ?? (await loadGeo());

      if (!geoLib || !geoLib.Country || !geoLib.State) {
        throw new Error("Location data failed to load. Please refresh the page and try again.");
      }

      const selectedCountry = geoLib.Country.getAllCountries().find(
        (c) => c.isoCode === values.country
      );
      const selectedState = geoLib.State.getStatesOfCountry(values.country).find(
        (s) => s.isoCode === values.state
      );

      const location = [values.city, selectedState?.name, selectedCountry?.name]
        .filter(Boolean)
        .join(", ");

      const cleanArray = (arr: any[]) =>
        (arr ?? []).filter((item: any) => typeof item === "string" ? item.trim().length > 0 : Boolean(item));

      // Clean gallery arrays - remove items without image
      const cleanGallery = (gallery: any[]) => {
        if (!Array.isArray(gallery)) return [];
        return gallery.filter(item => item.image && item.image.trim().length > 0);
      };

      const payload = {
        ...values,
        location,
        coverImageUrl: cleanArray(values.coverImages),
        tradeNames: cleanArray(values.tradeNames),
        videoGallery: cleanArray(values.videoGallery),
        productSupplies: cleanArray(values.productSupplies),
        productGallery: cleanGallery(values.productGallery),
        companyGallery: cleanGallery(values.companyGallery),
        factoryGallery: cleanGallery(values.factoryGallery),
        productCatalogues: cleanArray(values.productCatalogues),
        companyBrochure: cleanArray(values.companyBrochure),
        certifications: cleanArray(values.certifications),
        brandsRepresented: cleanArray(values.brandsRepresented),
        industriesServed: cleanArray(values.industriesServed),
        exportMarkets: cleanArray(values.exportMarkets),
        manufacturingCapabilityImages: cleanArray(values.manufacturingCapabilityImages || []),
        manufacturingCapabilityVideos: cleanArray(values.manufacturingCapabilityVideos || []),
        machineryImages: cleanArray(values.machineryImages || []),
      };

      console.log("=== PAYLOAD BEING SENT ===", payload);
      console.log("=== API URL ===", `${process.env.NEXT_PUBLIC_API_URL}/api/suppliers`);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("=== RESPONSE STATUS ===", res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.log("=== ERROR RESPONSE BODY ===", data);
        if (data.code === "PRODUCT_LISTING_LIMIT_REACHED") {
          setShowLimitModal(true);
          return;
        }
        throw new Error(data.error || `Failed to submit directory (status ${res.status})`);
      }

      console.log("=== SUBMIT SUCCESS — redirecting ===");
      router.push("/recruiter/dashboard");
    } catch (err: any) {
      console.error("=== SUBMIT CAUGHT ERROR ===", err);
      setStatus(err.message || "Failed to submit directory");
    } finally {
      setSubmitting(false);
    }
  }

  const countries = geo?.Country.getAllCountries() ?? [];

  if (!geo) {
    return (
      <div className="max-w-3xl mx-auto p-10">
        <p className="text-gray-600">Loading form...</p>
      </div>
    );
  }

  const effectiveLimit = listingEligibility?.effectiveLimit;
  const productListingsLimit = typeof effectiveLimit === "number" ? effectiveLimit : Infinity;
  const isProductLimitUnlimited = effectiveLimit === "Unlimited" || effectiveLimit === null;

  // Check if user is on Professional or Enterprise for unlimited features
  const isProfessional = profileLimits?.plan === "professional";
  const isEnterprise = profileLimits?.plan === "enterprise";
  const isProfessionalOrEnterprise = isProfessional || isEnterprise;

  return (
    <div className="max-w-3xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-2">Add Supplier Directory</h1>
      {listingEligibility && (
        <p className="text-sm text-gray-500 mb-6">
          {listingEligibility.isUnlimited
            ? "Your plan includes unlimited supplier directories."
            : `Directory slots: ${listingEligibility.activeListings ?? 0} of ${listingEligibility.effectiveLimit ?? 0} used · ${listingEligibility.remaining ?? 0} remaining`}
        </p>
      )}

      <Formik
        initialValues={{
          name: "",
          slug: "",
          phoneNumber: "",
          email: "",
          description: "",
          website: "",
          logoUrl: "",
          coverImages: [""],
          tradeNames: [""],
          videoGallery: [""],
          productSupplies: [""],
          productGallery: [{ image: "", name: "", description: "" }],
          companyGallery: [{ image: "", name: "", description: "" }],
          factoryGallery: [{ image: "", name: "", description: "" }],
          productCatalogues: [""],
          companyBrochure: [""],
          certifications: [""],
          brandsRepresented: [""],
          industriesServed: [""],
          exportMarkets: [""],
          manufacturingCapabilities: "",
          manufacturingCapabilityImages: [],
          manufacturingCapabilityVideos: [],
          machineryList: "",
          machineryImages: [""],
          qualityStandards: "",
          googleMapUrl: "",
          enableInquiryForm: true,
          socialLinks: {
            facebook: "",
            linkedin: "",
            twitter: "",
            youtube: "",
            whatsapp: "",
          },
          country: "",
          state: "",
          city: "",
          address: "",
          industryId: "",
          acceptedGuidelines: false,
        }}
        validationSchema={DirectorySchema}
        validateOnMount={false}
        onSubmit={submit}
      >
        {({ isSubmitting, setFieldValue, values, status, errors, submitCount }) => {
          const states = values.country ? geo.State.getStatesOfCountry(values.country) : [];
          const cities = values.state ? geo.City.getCitiesOfState(values.country, values.state) : [];

          if (submitCount > 0 && Object.keys(errors).length > 0) {
            console.log("=== VALIDATION ERRORS BLOCKING SUBMIT ===", errors);
          }

          return (
            <Form className="space-y-6 bg-white p-6 rounded-xl shadow">
              {/* ... (all existing form fields up to Product Gallery) ... */}

              {/* PRODUCT GALLERY - GATED BY PACKAGE */}
              <Section title="Product Gallery">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.productImages)}
                  upgradeMessage="Product Gallery is available on all plans. Free plan allows up to 10 images."
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {isUnlimited(profileLimits?.productImages)
                      ? "Unlimited product images on your plan."
                      : `Your plan allows up to ${getDisplayLimit(profileLimits?.productImages)} product images.`}
                  </p>
                  <FieldArray name="productGallery">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        {values.productGallery.map((item: any, i: number) => (
                          <div key={i} className="p-4 border rounded-lg space-y-3 bg-white">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium">Product Image {i + 1}</span>
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => remove(i)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Image</label>
                              <UploadBox
                                label="Upload Image"
                                value={item.image}
                                onUpload={(file) => handleGalleryImageUpload(file, setFieldValue, values, "productGallery", i)}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Product Name</label>
                              <Field
                                name={`productGallery.${i}.name`}
                                className="input w-full"
                                placeholder="Product name (optional)"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Description</label>
                              <Field
                                name={`productGallery.${i}.description`}
                                className="input w-full"
                                placeholder="Product description (optional)"
                                as="textarea"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => push({ image: "", name: "", description: "" })}
                          disabled={
                            !isUnlimited(profileLimits?.productImages) &&
                            values.productGallery.length >= (getFeatureLimit(profileLimits?.productImages) ?? 0)
                          }
                          className="disabled:opacity-40 disabled:cursor-not-allowed border px-4 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm font-medium"
                        >
                          + Add Product Image
                          {!isUnlimited(profileLimits?.productImages) &&
                            ` (${values.productGallery.length}/${getDisplayLimit(profileLimits?.productImages)})`}
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

              {/* COMPANY GALLERY - GATED BY PACKAGE */}
              <Section title="Company Gallery">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.galleryImages)}
                  upgradeMessage="Company Gallery is available on Basic plan and above."
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {isUnlimited(profileLimits?.galleryImages)
                      ? "Unlimited company images on your plan."
                      : `Your plan allows up to ${getDisplayLimit(profileLimits?.galleryImages)} company images.`}
                  </p>
                  <FieldArray name="companyGallery">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        {values.companyGallery.map((item: any, i: number) => (
                          <div key={i} className="p-4 border rounded-lg space-y-3 bg-white">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium">Company Image {i + 1}</span>
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => remove(i)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Image</label>
                              <UploadBox
                                label="Upload Image"
                                value={item.image}
                                onUpload={(file) => handleGalleryImageUpload(file, setFieldValue, values, "companyGallery", i)}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Image Name</label>
                              <Field
                                name={`companyGallery.${i}.name`}
                                className="input w-full"
                                placeholder="Image name (optional)"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Description</label>
                              <Field
                                name={`companyGallery.${i}.description`}
                                className="input w-full"
                                placeholder="Image description (optional)"
                                as="textarea"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => push({ image: "", name: "", description: "" })}
                          disabled={
                            !isUnlimited(profileLimits?.galleryImages) &&
                            values.companyGallery.length >= (getFeatureLimit(profileLimits?.galleryImages) ?? 0)
                          }
                          className="disabled:opacity-40 disabled:cursor-not-allowed border px-4 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm font-medium"
                        >
                          + Add Company Image
                          {!isUnlimited(profileLimits?.galleryImages) &&
                            ` (${values.companyGallery.length}/${getDisplayLimit(profileLimits?.galleryImages)})`}
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

              {/* FACTORY GALLERY - GATED BY PACKAGE */}
              <Section title="Factory Gallery">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.factoryImages)}
                  upgradeMessage="Factory Gallery is available on Basic plan and above."
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {isUnlimited(profileLimits?.factoryImages)
                      ? "Unlimited factory images on your plan."
                      : `Your plan allows up to ${getDisplayLimit(profileLimits?.factoryImages)} factory images.`}
                  </p>
                  <FieldArray name="factoryGallery">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        {values.factoryGallery.map((item: any, i: number) => (
                          <div key={i} className="p-4 border rounded-lg space-y-3 bg-white">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium">Factory Image {i + 1}</span>
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => remove(i)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕ Remove
                                </button>
                              )}
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Image</label>
                              <UploadBox
                                label="Upload Image"
                                value={item.image}
                                onUpload={(file) => handleGalleryImageUpload(file, setFieldValue, values, "factoryGallery", i)}
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Image Name</label>
                              <Field
                                name={`factoryGallery.${i}.name`}
                                className="input w-full"
                                placeholder="Image name (optional)"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-1">Description</label>
                              <Field
                                name={`factoryGallery.${i}.description`}
                                className="input w-full"
                                placeholder="Image description (optional)"
                                as="textarea"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => push({ image: "", name: "", description: "" })}
                          disabled={
                            !isUnlimited(profileLimits?.factoryImages) &&
                            values.factoryGallery.length >= (getFeatureLimit(profileLimits?.factoryImages) ?? 0)
                          }
                          className="disabled:opacity-40 disabled:cursor-not-allowed border px-4 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm font-medium"
                        >
                          + Add Factory Image
                          {!isUnlimited(profileLimits?.factoryImages) &&
                            ` (${values.factoryGallery.length}/${getDisplayLimit(profileLimits?.factoryImages)})`}
                        </button>
                      </div>
                    )}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

              {/* ... (rest of the form fields remain the same) ... */}
            </Form>
          );
        }}
      </Formik>

      <PackageLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Directory slot limit reached"
        eligibility={listingEligibility}
        usedLabel="Directories"
        usedValue={listingEligibility?.activeListings}
        limitValue={listingEligibility?.effectiveLimit}
      />
    </div>
  );
}

function FieldBlock({ label, name }: any) {
  return (
    <div>
      <label className="label">{label}</label>
      <Field name={name} className="input" />
      <ErrorMessage name={name} component="p" className="error" />
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}