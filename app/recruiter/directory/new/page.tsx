"use client";

import Link from "next/link";
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

// Counts how many gallery entries actually have an image set (i.e. would
// survive the cleanGallery() filter below). Used for validation/limit
// messaging around productGallery / companyGallery / factoryGallery.
// NOTE: this was previously called from submit() without being defined
// anywhere in the file, which threw "countGalleryItems is not defined"
// and made every submission fail. Defining it here fixes that crash.
function countGalleryItems(gallery: any[]): number {
  if (!Array.isArray(gallery)) return 0;
  return gallery.filter(
    (item) => item && typeof item.image === "string" && item.image.trim().length > 0
  ).length;
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
  const [uploadingArrayFile, setUploadingArrayFile] = useState(false);
  const [uploadingManufacturingImage, setUploadingManufacturingImage] = useState(false);
  const [uploadingMachineryImage, setUploadingMachineryImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [listingEligibility, setListingEligibility] =
    useState<ContentLimitEligibility | null>(null);
  const [profileLimits, setProfileLimits] =
    useState<CompanyProfileEligibility | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [eligibilityLoaded, setEligibilityLoaded] = useState(false);

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setListingEligibility(await fetchProductListingEligibility(token));
      } catch (error) {
        console.error("Product listing eligibility error:", error);
      } finally {
        setEligibilityLoaded(true);
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

  // Generic handler for plain string-array file/image uploads
  const handleArrayFileUpload = async (
    file: File,
    setFieldValue: any,
    values: any,
    field: string,
    index: number,
    setLoading?: (v: boolean) => void
  ) => {
    setLoading?.(true);
    setUploadingArrayFile(true);
    setUploadError("");

    try {
      const formData = new FormData();

      // Determine if this is a document or image based on field name
      const documentFields = ["companyBrochure", "certifications"];
      const isDocument = documentFields.includes(field);

      if (isDocument) {
        formData.append("document", file);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/document`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Document upload failed");
        }

        const data = await res.json();
        const arr = [...(values[field] || [])];
        arr[index] = data.documentUrl;
        setFieldValue(field, arr);
      } else {
        formData.append("image", file);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");

        const data = await res.json();
        const arr = [...(values[field] || [])];
        arr[index] = data.imageUrl;
        setFieldValue(field, arr);
      }
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setLoading?.(false);
      setUploadingArrayFile(false);
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

      // Sanity-check gallery counts against the plan limits before submitting,
      // so we fail fast with a clear message instead of relying purely on the
      // server's error response.
      const galleryLimitChecks: Array<{ field: string; label: string; limit: number | null }> = [
        { field: "productGallery", label: "Product Gallery", limit: getFeatureLimit(profileLimits?.productImages) },
        { field: "companyGallery", label: "Company Gallery", limit: getFeatureLimit(profileLimits?.galleryImages) },
        { field: "factoryGallery", label: "Factory Gallery", limit: getFeatureLimit(profileLimits?.factoryImages) },
      ];

      for (const check of galleryLimitChecks) {
        const count = countGalleryItems(values[check.field]);
        if (check.limit !== null && count > check.limit) {
          throw new Error(
            `${check.label} has ${count} images, but your plan allows up to ${check.limit}. Please remove some images before submitting.`
          );
        }
      }

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

  const directoryLimitReached = listingEligibility?.canAdd === false;

  if (!geo || !eligibilityLoaded) {
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

  // Enforce the directory allowance returned for the active subscription.
  if (directoryLimitReached) {
    return (
      <div className="max-w-3xl mx-auto p-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Supplier Directory</h1>
          <p className="mt-3 text-sm text-gray-700">
            Your plan has no directory slots remaining. Please upgrade your plan to create another directory.
          </p>
          <Link
            href="/recruiter/directories"
            className="mt-4 inline-block rounded bg-black px-5 py-2 text-sm text-white"
          >
            Back to My Directories
          </Link>
        </div>
      </div>
    );
  }

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

          const wordLimit = getFeatureLimit(profileLimits?.descriptionLimit);
          const wordCount = values.description
            ? values.description.trim().split(/\s+/).filter(Boolean).length
            : 0;
          const atDescriptionLimit = wordLimit !== null && wordCount >= wordLimit;

          return (
            <Form className="space-y-6 bg-white p-6 rounded-xl shadow">
              {status && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p>{status}</p>
                </div>
              )}

              {/* NAME + SLUG */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company Name</label>
                  <Field
                    name="name"
                    className="input"
                    onChange={(e: any) => {
                      const val = e.target.value;
                      setFieldValue("name", val);
                      setFieldValue("slug", slugify(val));
                    }}
                  />
                  <ErrorMessage name="name" component="p" className="error" />
                </div>
                <div>
                  <label className="label">Slug</label>
                  <Field name="slug" className="input" />
                  <ErrorMessage name="slug" component="p" className="error" />
                </div>
              </div>

              {/* PHONE + EMAIL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone Number</label>
                  <Field name="phoneNumber" className="input" />
                  <ErrorMessage name="phoneNumber" component="p" className="error" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <Field name="email" className="input" />
                  <ErrorMessage name="email" component="p" className="error" />
                </div>
              </div>

              {/* COUNTRY + STATE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Country</label>
                  <Field
                    as="select"
                    name="country"
                    className="input"
                    onChange={(e: any) => {
                      setFieldValue("country", e.target.value);
                      setFieldValue("state", "");
                      setFieldValue("city", "");
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="country" component="p" className="error" />
                </div>
                <div>
                  <label className="label">State</label>
                  <Field
                    as="select"
                    name="state"
                    className="input"
                    onChange={(e: any) => {
                      setFieldValue("state", e.target.value);
                      setFieldValue("city", "");
                    }}
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="state" component="p" className="error" />
                </div>
              </div>

              {/* CITY + ADDRESS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <Field as="select" name="city" className="input">
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="city" component="p" className="error" />
                </div>
                <div>
                  <label className="label">Full Address</label>
                  <Field name="address" className="input" />
                  <ErrorMessage name="address" component="p" className="error" />
                </div>
              </div>

              {/* GOOGLE MAP - GATED BY PACKAGE */}
              <Section title="Google Map">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.googleMap)}
                  upgradeMessage="Google Map is available on Basic plan and above."
                >
                  <div>
                    <label className="label">Google Maps Embed/Share URL</label>
                    <Field name="googleMapUrl" className="input" placeholder="https://www.google.com/maps/embed?..." />
                    <p className="text-xs text-gray-400 mt-1">
                      Paste the "Share" link from Google Maps for your business location.
                    </p>
                  </div>
                </PlanGatedSection>
              </Section>

              {/* INDUSTRY + WEBSITE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Industry</label>
                  {industryLevels.map((levelOptions, levelIndex) => (
                    <select
                      key={levelIndex}
                      className="input mb-2"
                      value={industrySelected[levelIndex] ?? ""}
                      onChange={(e) =>
                        handleIndustrySelect(levelIndex, Number(e.target.value), setFieldValue)
                      }
                    >
                      <option value="">Select Industry</option>
                      {levelOptions.map((industry: any) => (
                        <option key={industry.id} value={industry.id}>
                          {industry.name}
                        </option>
                      ))}
                    </select>
                  ))}
                  <ErrorMessage name="industryId" component="p" className="error" />
                </div>
                <div>
                  <label className="label">Website</label>
                  <Field name="website" className="input" />
                  <ErrorMessage name="website" component="p" className="error" />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="label" htmlFor="description">Description</label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={4}
                  onChange={(e: any) => {
                    const raw = e.target.value;
                    if (wordLimit !== null) {
                      const words = raw.trimStart().split(/\s+/);
                      if (words.filter(Boolean).length > wordLimit) {
                        setFieldValue("description", words.slice(0, wordLimit).join(" "));
                        return;
                      }
                    }
                    setFieldValue("description", raw);
                  }}
                  className={`w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-1 ${atDescriptionLimit
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    }`}
                  placeholder="Enter your description..."
                />
                <div className="flex items-center justify-between mt-1">
                  {wordLimit !== null ? (
                    <p className={`text-xs ml-auto ${atDescriptionLimit ? "text-red-500 font-medium" : "text-gray-400"}`}>
                      {wordCount} / {wordLimit} words{atDescriptionLimit ? " — limit reached" : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 ml-auto">
                      {wordCount} word{wordCount !== 1 ? "s" : ""} · Unlimited on your plan
                    </p>
                  )}
                </div>
                <ErrorMessage name="description" component="p" className="error" />
              </div>

              {/* LOGO */}
              <div className="grid grid-cols-2 gap-6">
                <UploadBox
                  label="Company Logo"
                  value={values.logoUrl}
                  onUpload={(file) => handleImageUpload(file, setFieldValue, "logoUrl", "logo")}
                />
              </div>
              {uploadError && <p className="error">{uploadError}</p>}

              {/* COVER IMAGES */}
              <Section title="Cover Images">
                <PlanGatedSection
                  allowed={isFeatureAllowed(maxCoverImages)}
                  upgradeMessage="Cover images are available on the Basic plan and above. Upgrade your plan to add a cover banner to your showroom page."
                >
                  <p className="text-xs text-gray-400 mb-2">
                    Your plan allows up to {getDisplayLimit(maxCoverImages)} cover image
                    {typeof maxCoverImages === "number" && maxCoverImages !== 1 ? "s" : ""}.
                    {isUnlimited(maxCoverImages) ? "" : maxCoverImages > 1 ? " Multiple images will display as a carousel." : ""}
                  </p>
                  <FieldArray name="coverImages">
                    {({ push, remove }) => {
                      const limit = getFeatureLimit(maxCoverImages);
                      const atLimit = !isUnlimited(maxCoverImages) && values.coverImages.length >= (limit ?? 0);
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {values.coverImages.map((item: string, i: number) => (
                            <div key={i} className="space-y-1">
                              <UploadBox
                                label={`Cover Image ${i + 1}`}
                                value={item}
                                onUpload={(file) => handleCoverImageUpload(file, setFieldValue, values, i)}
                              />
                              <button type="button" onClick={() => remove(i)}>
                                ✕ Remove
                              </button>
                            </div>
                          ))}
                          <div className="col-span-2">
                            <button
                              type="button"
                              onClick={() => push("")}
                              disabled={atLimit}
                              className="disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              + Add cover image
                              {!isUnlimited(maxCoverImages) && ` (${values.coverImages.length}/${getDisplayLimit(maxCoverImages)})`}
                            </button>
                          </div>
                        </div>
                      );
                    }}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

              {/* PRODUCT SUPPLIES */}
              <Section title="Product Supplies">
                {listingEligibility && (
                  <p className="text-sm text-gray-500 mb-3">
                    Products inside your directory do not count toward your directory slot limit.
                    Your plan allows {getDisplayLimit(listingEligibility.effectiveLimit)} product supplies.
                  </p>
                )}
                <FieldArray name="productSupplies">
                  {({ push, remove }) => (
                    <>
                      {values.productSupplies.map((item: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <Field name={`productSupplies.${i}`} className="input flex-1" />
                          {i > 0 && (
                            <button type="button" onClick={() => remove(i)}>✕</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => push("")}>
                        + Add product
                      </button>
                    </>
                  )}
                </FieldArray>
              </Section>

              {/* PRODUCT CATALOGUES - GATED BY PACKAGE */}
              <Section title="Product Catalogues">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.productCatalogues)}
                  upgradeMessage="Product Catalogues are available on Basic plan and above."
                >
                  <p className="text-sm text-gray-500 mb-3">
                    Upload your product catalogues (PDFs, brochures, etc.).
                    {!isUnlimited(profileLimits?.productCatalogues) &&
                      ` Your plan allows up to ${getDisplayLimit(profileLimits?.productCatalogues)} catalogues.`}
                    {isUnlimited(profileLimits?.productCatalogues) && ` Unlimited catalogues on your plan.`}
                  </p>
                  <FieldArray name="productCatalogues">
                    {({ push, remove }) => {
                      const limit = getFeatureLimit(profileLimits?.productCatalogues);
                      const atLimit = !isUnlimited(profileLimits?.productCatalogues) &&
                        values.productCatalogues.length >= (limit ?? 0);
                      return (
                        <div className="grid grid-cols-2 gap-4">
                          {values.productCatalogues.map((url: string, i: number) => (
                            <div key={i} className="space-y-1">
                              <UploadBox
                                label={`Product Catalogue ${i + 1}`}
                                value={url}
                                onUpload={(file) => handleCatalogueUpload(file, setFieldValue, values, i)}
                                uploadType="document"
                                accept=".pdf,.doc,.docx"
                              />
                              <button type="button" onClick={() => remove(i)}>
                                ✕ Remove
                              </button>
                            </div>
                          ))}
                          <div className="col-span-2">
                            <button
                              type="button"
                              onClick={() => push("")}
                              disabled={atLimit}
                              className="disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              + Add product catalogue
                              {!isUnlimited(profileLimits?.productCatalogues) &&
                                ` (${values.productCatalogues.length}/${getDisplayLimit(profileLimits?.productCatalogues)})`}
                            </button>
                          </div>
                        </div>
                      );
                    }}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

              {/* SOCIAL LINKS - WhatsApp gated */}
              <Section title="Social Media">
                <div className="grid grid-cols-2 gap-4">
                  {["facebook", "linkedin", "twitter", "youtube"].map((key) => (
                    <div key={key}>
                      <label className="label capitalize">{key}</label>
                      <Field name={`socialLinks.${key}`} className="input" placeholder={key} />
                    </div>
                  ))}
                  {allowWhatsapp ? (
                    <div>
                      <label className="label">WhatsApp</label>
                      <Field name="socialLinks.whatsapp" className="input" placeholder="WhatsApp number" />
                    </div>
                  ) : (
                    <div>
                      <label className="label">WhatsApp</label>
                      <div className="rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-500">
                        Available on Basic plan and above.
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* TRADE NAMES */}
              <Section title="Trade Names">
                <FieldArray name="tradeNames">
                  {({ push, remove }) => (
                    <>
                      {values.tradeNames.map((item: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <Field name={`tradeNames.${i}`} className="input flex-1" />
                          {i > 0 && <button type="button" onClick={() => remove(i)}>✕</button>}
                        </div>
                      ))}
                      <button type="button" onClick={() => push("")}>
                        + Add trade name
                      </button>
                    </>
                  )}
                </FieldArray>
                <ErrorMessage name="tradeNames" component="p" className="error" />
              </Section>

              {/* VIDEO GALLERY - GATED BY PACKAGE */}
              <Section title="Product YouTube Video Links">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.productVideos)}
                  upgradeMessage="Product Videos are available on Basic plan and above."
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {isUnlimited(profileLimits?.productVideos)
                      ? "Unlimited videos on your plan."
                      : `Your plan allows up to ${getDisplayLimit(profileLimits?.productVideos)} videos.`}
                  </p>
                  <FieldArray name="videoGallery">
                    {({ push, remove }) => {
                      const limit = getFeatureLimit(profileLimits?.productVideos);
                      const atLimit = !isUnlimited(profileLimits?.productVideos) &&
                        values.videoGallery.length >= (limit ?? 0);
                      return (
                        <>
                          {values.videoGallery.map((item: string, i: number) => (
                            <div key={i} className="flex gap-2">
                              <Field name={`videoGallery.${i}`} className="input flex-1" placeholder="YouTube URL" />
                              {i > 0 && <button type="button" onClick={() => remove(i)}>✕</button>}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => push("")}
                            disabled={atLimit}
                            className="disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            + Add video
                            {!isUnlimited(profileLimits?.productVideos) &&
                              ` (${values.videoGallery.length}/${getDisplayLimit(profileLimits?.productVideos)})`}
                          </button>
                        </>
                      );
                    }}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

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

              {/* COMPANY BROCHURE - GATED BY PACKAGE */}
              <Section title="Company Brochure">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.brochures)}
                  upgradeMessage="Company Brochure is available on Basic plan and above."
                >
                  <FieldArray name="companyBrochure">
                    {({ push, remove }) => (
                      <div className="grid grid-cols-2 gap-4">
                        {values.companyBrochure.map((item: string, i: number) => (
                          <div key={i} className="space-y-1">
                            <UploadBox
                              label={`Brochure File ${i + 1}`}
                              value={item}
                              onUpload={(file) =>
                                handleArrayFileUpload(file, setFieldValue, values, "companyBrochure", i)
                              }
                              uploadType="document"
                              accept=".pdf,.doc,.docx"
                            />
                            {i > 0 && (
                              <button type="button" onClick={() => remove(i)}>
                                ✕ Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="col-span-2">
                          <button type="button" onClick={() => push("")}>
                            + Add brochure file
                          </button>
                        </div>
                      </div>
                    )}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

              {/* CERTIFICATIONS - GATED BY PACKAGE */}
              <Section title="Certifications">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.certifications)}
                  upgradeMessage="Certifications are available on Basic plan and above."
                >
                  <FieldArray name="certifications">
                    {({ push, remove }) => (
                      <div className="grid grid-cols-2 gap-4">
                        {values.certifications.map((item: string, i: number) => (
                          <div key={i} className="space-y-1">
                            <UploadBox
                              label={`Certification File ${i + 1}`}
                              value={item}
                              onUpload={(file) =>
                                handleArrayFileUpload(file, setFieldValue, values, "certifications", i)
                              }
                              uploadType="document"
                              accept=".pdf,.doc,.docx"
                            />
                            {i > 0 && (
                              <button type="button" onClick={() => remove(i)}>
                                ✕ Remove
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="col-span-2">
                          <button type="button" onClick={() => push("")}>
                            + Add certification file
                          </button>
                        </div>
                      </div>
                    )}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

              {/* BRANDS REPRESENTED */}
              <Section title="Brands Represented">
                {(() => {
                  const isUnlimitedBrands = isUnlimited(profileLimits?.brandsRepresented);
                  const limit = getFeatureLimit(profileLimits?.brandsRepresented);

                  if (!isFeatureAllowed(profileLimits?.brandsRepresented)) {
                    return (
                      <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                        Brands Represented are available on Basic plan and above.
                        {isProfessionalOrEnterprise && " Your plan includes unlimited brands."}
                      </div>
                    );
                  }

                  return (
                    <>
                      <p className="text-xs text-gray-400 mb-2">
                        {isUnlimitedBrands
                          ? "✅ Unlimited brands on your Professional/Enterprise plan."
                          : `Your plan allows up to ${limit} brands.`}
                      </p>
                      <FieldArray name="brandsRepresented">
                        {({ push, remove }) => (
                          <>
                            {values.brandsRepresented.map((item: string, i: number) => (
                              <div key={i} className="flex gap-2">
                                <Field
                                  name={`brandsRepresented.${i}`}
                                  className="input flex-1"
                                  placeholder="Brand name"
                                />
                                {i > 0 && (
                                  <button type="button" onClick={() => remove(i)}>
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push("")}
                              disabled={!isUnlimitedBrands && values.brandsRepresented.length >= (limit ?? 0)}
                              className="disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              + Add Brand
                              {!isUnlimitedBrands && limit !== null &&
                                ` (${values.brandsRepresented.length}/${limit})`}
                              {isUnlimitedBrands && " (Unlimited)"}
                            </button>
                          </>
                        )}
                      </FieldArray>
                    </>
                  );
                })()}
              </Section>

              {/* INDUSTRIES SERVED */}
              <Section title="Industries Served">
                {(() => {
                  const isUnlimitedIndustries = isUnlimited(profileLimits?.industriesServed);
                  const limit = getFeatureLimit(profileLimits?.industriesServed);

                  if (!isFeatureAllowed(profileLimits?.industriesServed)) {
                    return (
                      <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                        Industries Served are available on Free plan (limited to 5) and above.
                      </div>
                    );
                  }

                  return (
                    <>
                      <p className="text-xs text-gray-400 mb-2">
                        {isUnlimitedIndustries
                          ? "✅ Unlimited industries on your Professional/Enterprise plan."
                          : `Your plan allows up to ${limit} industries.`}
                      </p>
                      <FieldArray name="industriesServed">
                        {({ push, remove }) => (
                          <>
                            {values.industriesServed.map((item: string, i: number) => (
                              <div key={i} className="flex gap-2">
                                <Field
                                  name={`industriesServed.${i}`}
                                  className="input flex-1"
                                  placeholder="Industry name"
                                />
                                {i > 0 && (
                                  <button type="button" onClick={() => remove(i)}>
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push("")}
                              disabled={!isUnlimitedIndustries && values.industriesServed.length >= (limit ?? 0)}
                              className="disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              + Add Industry
                              {!isUnlimitedIndustries && limit !== null &&
                                ` (${values.industriesServed.length}/${limit})`}
                              {isUnlimitedIndustries && " (Unlimited)"}
                            </button>
                          </>
                        )}
                      </FieldArray>
                    </>
                  );
                })()}
              </Section>

              {/* EXPORT MARKETS - GATED BY PACKAGE */}
              <Section title="Export Markets">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.exportMarkets)}
                  upgradeMessage="Export Markets are available on Basic plan and above."
                >
                  <FieldArray name="exportMarkets">
                    {({ push, remove }) => (
                      <>
                        {values.exportMarkets.map((item: string, i: number) => (
                          <div key={i} className="flex gap-2">
                            <Field name={`exportMarkets.${i}`} className="input flex-1" placeholder="Country name" />
                            {i > 0 && (
                              <button type="button" onClick={() => remove(i)}>
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => push("")}>
                          + Add Country
                        </button>
                      </>
                    )}
                  </FieldArray>
                </PlanGatedSection>
              </Section>

              {/* ============================================================================
                  MANUFACTURING CAPABILITIES - WITH ENTERPRISE MEDIA SUPPORT
                  ============================================================================ */}
              <Section title="Manufacturing Capabilities">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.manufacturingCapabilities)}
                  upgradeMessage="Manufacturing Capabilities are available on Basic plan and above."
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {typeof profileLimits?.manufacturingCapabilities === "string" && profileLimits.manufacturingCapabilities}
                    {isEnterprise && " — Enterprise plan: Complete text + Photos + Videos."}
                    {isProfessional && profileLimits?.manufacturingCapabilities === "Complete" && " — Professional plan: Complete text description."}
                    {!isProfessional && !isEnterprise && profileLimits?.manufacturingCapabilities === "Basic" && " — Basic plan: Basic text description."}
                  </p>

                  {(isProfessional || isEnterprise) ? (
                    <RichTextEditor
                      value={values.manufacturingCapabilities || ""}
                      onChange={(val: string) => setFieldValue("manufacturingCapabilities", val)}
                    />
                  ) : (
                    <Field
                      as="textarea"
                      name="manufacturingCapabilities"
                      rows={5}
                      className="input w-full"
                      placeholder="Describe your manufacturing capabilities..."
                    />
                  )}

                  {isEnterprise && (
                    <div className="mt-4">
                      <label className="font-medium text-sm block mb-1">Manufacturing Photos</label>
                      <p className="text-xs text-gray-400 mb-2">
                        Upload photos of your manufacturing capabilities (Unlimited on Enterprise)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FieldArray name="manufacturingCapabilityImages">
                          {({ push, remove }) => (
                            <>
                              {values.manufacturingCapabilityImages?.map((url: string, i: number) => (
                                <div key={i} className="relative space-y-1">
                                  <UploadBox
                                    label={`Photo ${i + 1}`}
                                    value={url}
                                    onUpload={(file) =>
                                      handleArrayFileUpload(
                                        file,
                                        setFieldValue,
                                        values,
                                        "manufacturingCapabilityImages",
                                        i,
                                        setUploadingManufacturingImage
                                      )
                                    }
                                    uploadType="image"
                                    accept="image/*"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => remove(i)}
                                    className="text-red-500 text-sm hover:text-red-700"
                                  >
                                    ✕ Remove
                                  </button>
                                </div>
                              ))}
                              <div className="col-span-full">
                                <button
                                  type="button"
                                  onClick={() => push("")}
                                  className="border px-4 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm font-medium"
                                >
                                  + Add Photo
                                </button>
                              </div>
                            </>
                          )}
                        </FieldArray>
                      </div>
                    </div>
                  )}

                  {isEnterprise && (
                    <div className="mt-4">
                      <label className="font-medium text-sm block mb-1">Manufacturing Videos</label>
                      <p className="text-xs text-gray-400 mb-2">
                        Add YouTube or Vimeo video URLs (Unlimited on Enterprise)
                      </p>
                      <FieldArray name="manufacturingCapabilityVideos">
                        {({ push, remove }) => (
                          <>
                            {values.manufacturingCapabilityVideos?.map((url: string, i: number) => (
                              <div key={i} className="flex gap-2 mb-2">
                                <Field
                                  name={`manufacturingCapabilityVideos.${i}`}
                                  className="input flex-1"
                                  placeholder="YouTube or Vimeo URL"
                                />
                                <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700">
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push("")}
                              className="border px-4 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm font-medium"
                            >
                              + Add Video
                            </button>
                          </>
                        )}
                      </FieldArray>
                    </div>
                  )}

                  {isEnterprise && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Enterprise Feature:</strong> You can upload unlimited photos and videos
                        to showcase your manufacturing capabilities.
                      </p>
                    </div>
                  )}
                </PlanGatedSection>
              </Section>

              {/* ============================================================================
                  MACHINERY LIST - WITH ENTERPRISE MEDIA SUPPORT
                  ============================================================================ */}
              <Section title="Machinery List">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.machineryList)}
                  upgradeMessage="Machinery List is available on Basic plan and above."
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {typeof profileLimits?.machineryList === "string" && profileLimits.machineryList}
                    {isEnterprise && " — Enterprise plan: Detailed text + Machinery Images."}
                    {isProfessional && profileLimits?.machineryList === "Detailed" && " — Professional plan: Detailed text list."}
                    {!isProfessional && !isEnterprise && profileLimits?.machineryList === "Basic" && " — Basic plan: Basic text list."}
                  </p>

                  {(isProfessional || isEnterprise) ? (
                    <RichTextEditor
                      value={values.machineryList || ""}
                      onChange={(val: string) => setFieldValue("machineryList", val)}
                    />
                  ) : (
                    <Field
                      as="textarea"
                      name="machineryList"
                      rows={5}
                      className="input w-full"
                      placeholder="List your machinery..."
                    />
                  )}

                  {isEnterprise && (
                    <div className="mt-4">
                      <label className="font-medium text-sm block mb-1">Machinery Images</label>
                      <p className="text-xs text-gray-400 mb-2">
                        Upload images of your machinery (Unlimited on Enterprise)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FieldArray name="machineryImages">
                          {({ push, remove }) => (
                            <>
                              {values.machineryImages?.map((url: string, i: number) => (
                                <div key={i} className="relative space-y-1">
                                  <UploadBox
                                    label={`Machine Image ${i + 1}`}
                                    value={url}
                                    onUpload={(file) =>
                                      handleArrayFileUpload(
                                        file,
                                        setFieldValue,
                                        values,
                                        "machineryImages",
                                        i,
                                        setUploadingMachineryImage
                                      )
                                    }
                                    uploadType="image"
                                    accept="image/*"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => remove(i)}
                                    className="text-red-500 text-sm hover:text-red-700"
                                  >
                                    ✕ Remove
                                  </button>
                                </div>
                              ))}
                              <div className="col-span-full">
                                <button
                                  type="button"
                                  onClick={() => push("")}
                                  className="border px-4 py-2 rounded bg-gray-50 hover:bg-gray-100 text-sm font-medium"
                                >
                                  + Add Machine Image
                                </button>
                              </div>
                            </>
                          )}
                        </FieldArray>
                      </div>
                    </div>
                  )}

                  {isEnterprise && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Enterprise Feature:</strong> You can upload unlimited machinery images
                        alongside your text descriptions.
                      </p>
                    </div>
                  )}
                </PlanGatedSection>
              </Section>

              {/* QUALITY STANDARDS - GATED BY PACKAGE */}
              <Section title="Quality Standards">
                <PlanGatedSection
                  allowed={isFeatureAllowed(profileLimits?.qualityStandards)}
                  upgradeMessage="Quality Standards are available on Basic plan and above."
                >
                  <RichTextEditor
                    value={values.qualityStandards}
                    onChange={(val: string) => setFieldValue("qualityStandards", val)}
                  />
                </PlanGatedSection>
              </Section>

              {/* INQUIRY FORM */}
              <Section title="Inquiry Form">
                <label className="flex items-center gap-2">
                  <Field type="checkbox" name="enableInquiryForm" />
                  <span>Enable inquiry form on public showroom page</span>
                </label>
              </Section>

              {/* GUIDELINES */}
              <Section title="Business Listing Guidelines">
                <BusinessListingGuidelinesSummary />
                <label className="flex items-start gap-2 mt-3">
                  <Field type="checkbox" name="acceptedGuidelines" className="mt-1" />
                  <span className="text-sm">
                    I have read and agree to the Business Listing Guidelines.
                  </span>
                </label>
                <ErrorMessage name="acceptedGuidelines" component="p" className="error" />
              </Section>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  uploadingLogo ||
                  uploadingCover ||
                  uploadingCatalogue ||
                  uploadingGalleryImage ||
                  uploadingArrayFile ||
                  uploadingManufacturingImage ||
                  uploadingMachineryImage
                }
                className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Directory"}
              </button>
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