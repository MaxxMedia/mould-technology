"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextField";
import UploadBox from "@/components/UploadBox";
import { loadGeo } from "@/lib/geo";
import {
  fetchProductListingEligibility,
  fetchCompanyProfileEligibility,
  type ContentLimitEligibility,
  type CompanyProfileEligibility,
} from "@/lib/packageLimits";
import { PlanGatedSection } from "@/components/recruiter/PlanGatedSection";

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  return data.imageUrl;
}

const PLAN_LIMITS: Record<string, Record<string, number>> = {
  companyGallery: { free: 0, basic: 10, professional: 15, enterprise: Infinity },
  factoryGallery: { free: 0, basic: 10, professional: 30, enterprise: Infinity },
  productSupplies: { free: 5, basic: 25, professional: 100, enterprise: Infinity },
  productGallery: { free: 10, basic: 50, professional: 100, enterprise: Infinity },
  videoGallery: { free: 0, basic: 5, professional: 20, enterprise: Infinity },
  productCatalogues: { free: 0, basic: 2, professional: 10, enterprise: Infinity },
  companyBrochure: { free: 0, basic: 5, professional: 10, enterprise: Infinity },
  certifications: { free: 0, basic: 5, professional: 10, enterprise: Infinity },
  brandsRepresented: { free: 0, basic: 10, professional: Infinity, enterprise: Infinity },
  industriesServed: { free: 5, basic: 20, professional: Infinity, enterprise: Infinity },
  exportMarkets: { free: 0, basic: 5, professional: 10, enterprise: Infinity },
}

export default function EditDirectoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [directory, setDirectory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingCatalogue, setUploadingCatalogue] = useState(false);
  const [listingEligibility, setListingEligibility] =
    useState<ContentLimitEligibility | null>(null);
  const [profileLimits, setProfileLimits] = useState<CompanyProfileEligibility | null>(null);
  const [geo, setGeo] = useState<Awaited<ReturnType<typeof loadGeo>> | null>(null);

  const [industryLevels, setIndustryLevels] = useState<any[][]>([]);
  const [industrySelected, setIndustrySelected] = useState<number[]>([]);

  const maxCoverImages = listingEligibility?.maxCoverImages ?? 0
  const allowWhatsapp = listingEligibility?.allowWhatsapp ?? false

  useEffect(() => {
    loadGeo().then(setGeo).catch(console.error);
  }, []);

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        setListingEligibility(await fetchProductListingEligibility(token));
        setProfileLimits(await fetchCompanyProfileEligibility(token));
      } catch (error) {
        console.error("Eligibility error:", error);
      }
    }
    loadEligibility();
  }, []);

  useEffect(() => {
    async function fetchIndustries() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/industries`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data ?? [];
      setIndustryLevels([list]);
    }
    fetchIndustries();
  }, []);

  useEffect(() => {
    async function loadDirectory() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/recruiter/directories/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();

        // Ensure coverImageUrl is an array
        let coverImages = [];
        if (Array.isArray(data.coverImageUrl)) {
          coverImages = data.coverImageUrl;
        } else if (typeof data.coverImageUrl === "string" && data.coverImageUrl) {
          coverImages = [data.coverImageUrl];
        } else {
          coverImages = [""];
        }

        // Ensure all fields exist with proper defaults
        setDirectory({
          id: data.id,
          name: data.name || "",
          slug: data.slug || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          description: data.description || "",
          website: data.website || "",
          logoUrl: data.logoUrl || "",
          googleMapUrl: data.googleMapUrl || "",
          tradeNames: Array.isArray(data.tradeNames) ? data.tradeNames : [""],
          videoGallery: Array.isArray(data.videoGallery) ? data.videoGallery : [""],
          productSupplies: Array.isArray(data.productSupplies) ? data.productSupplies : [""],
          socialLinks: data.socialLinks || {},
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          address: data.address || "",
          industryId: data.industryId || "",
          coverImages: coverImages,
          productGallery: Array.isArray(data.productGallery) ? data.productGallery : [""],
          companyGallery: Array.isArray(data.companyGallery) ? data.companyGallery : [""],
          factoryGallery: Array.isArray(data.factoryGallery) ? data.factoryGallery : [""],
          productCatalogues: Array.isArray(data.productCatalogues) ? data.productCatalogues : [""],
          companyBrochure: Array.isArray(data.companyBrochure) ? data.companyBrochure : [""],
          certifications: Array.isArray(data.certifications) ? data.certifications : [""],
          brandsRepresented: Array.isArray(data.brandsRepresented) ? data.brandsRepresented : [""],
          industriesServed: Array.isArray(data.industriesServed) ? data.industriesServed : [""],
          exportMarkets: Array.isArray(data.exportMarkets) ? data.exportMarkets : [""],
          manufacturingCapabilities: data.manufacturingCapabilities || "",
          machineryList: data.machineryList || "",
          qualityStandards: data.qualityStandards || "",
          enableInquiryForm: data.enableInquiryForm ?? true,
          isLiveEditable: data.isLiveEditable ?? false,
        });
      } catch (error) {
        console.error("Load directory error:", error);
        alert("Unable to load directory");
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, [id]);

  const handleIndustrySelect = async (levelIndex: number, id: number) => {
    const newSelected = [...industrySelected.slice(0, levelIndex), id];
    const newLevels = industryLevels.slice(0, levelIndex + 1);
    setIndustrySelected(newSelected);
    setIndustryLevels(newLevels);
    setDirectory((prev: any) => ({ ...prev, industryId: "" }));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/industries/${id}/children`);
    const children = await res.json();

    if (children.length > 0) {
      setIndustryLevels([...newLevels, children]);
    } else {
      setDirectory((prev: any) => ({ ...prev, industryId: id }));
    }
  };

  const updateArrayItem = (field: string, index: number, value: string) => {
    setDirectory((prev: any) => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field: string) => {
    setDirectory((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setDirectory((prev: any) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleGalleryUpload = async (field: string, index: number, file: File) => {
    const url = await uploadFile(file)
    updateArrayItem(field, index, url)
  }

 /* ================= PRODUCT CATALOGUE UPLOAD ================= */
  // ✅ Handle catalogue upload specifically
  const handleCatalogueUpload = async (field: string, index: number, file: File) => {
    setUploadingCatalogue(true);
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
      const url = data.documentUrl;
      updateArrayItem(field, index, url);
    } catch (error: any) {
      setSaveError(error.message || "Failed to upload document");
    } finally {
      setUploadingCatalogue(false);
    }
  };

  async function saveChanges() {
    if (!directory?.isLiveEditable) {
      setSaveError("This directory is pending approval and cannot be edited yet.");
      return;
    }

    // Client-side validation
    const validationErrors: string[] = [];
    if (!directory.name?.trim()) validationErrors.push("Company name is required.");
    if (!directory.phoneNumber?.trim()) validationErrors.push("Phone number is required.");
    if (!directory.email?.trim()) validationErrors.push("Email is required.");
    if (directory.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(directory.email))
      validationErrors.push("Please enter a valid email address.");
    if (!directory.description?.trim() || directory.description.trim().length < 20)
      validationErrors.push("Description must be at least 20 characters.");
    if (!directory.country) validationErrors.push("Country is required.");
    if (!directory.state) validationErrors.push("State is required.");
    if (!directory.city) validationErrors.push("City is required.");
    if (!directory.address?.trim() || directory.address.trim().length < 10)
      validationErrors.push("Full address must be at least 10 characters.");
    if (!directory.industryId) validationErrors.push("Industry is required.");

    if (validationErrors.length > 0) {
      setSaveError(validationErrors.join(" "));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try {
      setSaving(true);
      setSaveError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setSaveError("Not authenticated");
        return;
      }

      const geoLib = geo ?? (await loadGeo());

      const selectedCountry = geoLib.Country.getAllCountries().find(
        (c) => c.isoCode === directory.country
      );
      const selectedState = geoLib.State.getStatesOfCountry(directory.country).find(
        (s) => s.isoCode === directory.state
      );
      const location = [directory.city, selectedState?.name, selectedCountry?.name]
        .filter(Boolean)
        .join(", ");

      // Filter out empty strings from arrays
      const cleanArray = (arr: any[]) => arr.filter((item) => item && item.trim().length > 0);

      // Prepare clean payload
      const payload = {
        name: directory.name,
        slug: directory.slug,
        description: directory.description,
        website: directory.website || null,
        logoUrl: directory.logoUrl || null,
        coverImageUrl: cleanArray(directory.coverImages),
        phoneNumber: directory.phoneNumber || null,
        email: directory.email || null,
        googleMapUrl: directory.googleMapUrl || null,
        tradeNames: cleanArray(directory.tradeNames),
        socialLinks: directory.socialLinks || {},
        videoGallery: cleanArray(directory.videoGallery),
        productSupplies: cleanArray(directory.productSupplies),
        productGallery: cleanArray(directory.productGallery),
        companyGallery: cleanArray(directory.companyGallery),
        factoryGallery: cleanArray(directory.factoryGallery),
        productCatalogues: cleanArray(directory.productCatalogues),
        companyBrochure: cleanArray(directory.companyBrochure),
        certifications: cleanArray(directory.certifications),
        brandsRepresented: cleanArray(directory.brandsRepresented),
        industriesServed: cleanArray(directory.industriesServed),
        exportMarkets: cleanArray(directory.exportMarkets),
        manufacturingCapabilities: directory.manufacturingCapabilities || null,
        machineryList: directory.machineryList || null,
        qualityStandards: directory.qualityStandards || null,
        enableInquiryForm: directory.enableInquiryForm ?? true,
        location,
        address: directory.address,
        industryId: Number(directory.industryId),
      };

      console.log("Saving payload:", payload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/${directory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Save error response:", errorData);
        setSaveError(errorData.error || "Failed to save changes");
        return;
      }

      const data = await res.json();
      console.log("Save successful:", data);
      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/recruiter/dashboard");
      }, 1800);
    } catch (error: any) {
      console.error("Save error:", error);
      setSaveError(error.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !geo) return <div className="p-10">Loading directory...</div>;
  if (!directory) return <div className="p-10">Directory not found</div>;

  const states = directory.country ? geo.State.getStatesOfCountry(directory.country) : [];
  const cities = directory.state ? geo.City.getCitiesOfState(directory.country, directory.state) : [];
  const countries = geo.Country.getAllCountries();

  // Safe helper functions for profile limits
  const getLimitNumber = (key: keyof CompanyProfileEligibility): number | null => {
    const val = profileLimits?.[key];
    if (typeof val === "number") return val;
    if (val === null) return null;
    return null;
  };

  const getLimitBoolean = (key: keyof CompanyProfileEligibility): boolean => {
    return !!profileLimits?.[key];
  };

  const hasLimit = (key: keyof CompanyProfileEligibility): boolean => {
    const val = profileLimits?.[key];
    return val !== null && val !== undefined && val !== false && val !== 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-10 space-y-6">
      <h1 className="text-2xl font-bold">Edit Supplier Directory</h1>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Changes saved successfully! Redirecting to dashboard...</span>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-1">Please fix the following:</p>
          <p>{saveError}</p>
        </div>
      )}

      {/* NAME + SLUG */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Company Name</label>
          <input
            className="input"
            value={directory.name}
            onChange={(e) => setDirectory({ ...directory, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Slug (read only)</label>
          <input className="input bg-gray-100" value={directory.slug} disabled />
        </div>
      </div>

      {/* PHONE + EMAIL */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Phone Number</label>
          <input
            className="input"
            value={directory.phoneNumber || ""}
            onChange={(e) => setDirectory({ ...directory, phoneNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            value={directory.email || ""}
            onChange={(e) => setDirectory({ ...directory, email: e.target.value })}
          />
        </div>
      </div>

      {/* COUNTRY + STATE */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Country</label>
          <select
            className="input"
            value={directory.country}
            onChange={(e) =>
              setDirectory({ ...directory, country: e.target.value, state: "", city: "" })
            }
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">State</label>
          <select
            className="input"
            value={directory.state}
            onChange={(e) => setDirectory({ ...directory, state: e.target.value, city: "" })}
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CITY + ADDRESS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">City</label>
          <select
            className="input"
            value={directory.city}
            onChange={(e) => setDirectory({ ...directory, city: e.target.value })}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Full Address</label>
          <input
            className="input"
            value={directory.address || ""}
            onChange={(e) => setDirectory({ ...directory, address: e.target.value })}
          />
        </div>
      </div>

      {/* GOOGLE MAP - GATED BY PACKAGE */}
      <Section title="Google Map">
        <PlanGatedSection
          allowed={getLimitBoolean("googleMap")}
          upgradeMessage="Google Map is available on Basic plan and above."
        >
          <div>
            <label className="label">Google Maps Embed/Share URL</label>
            <input
              className="input"
              value={directory.googleMapUrl || ""}
              onChange={(e) => setDirectory({ ...directory, googleMapUrl: e.target.value })}
              placeholder="https://www.google.com/maps/embed?..."
            />
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
              onChange={(e) => handleIndustrySelect(levelIndex, Number(e.target.value))}
            >
              <option value="">Select Industry</option>
              {levelOptions.map((industry: any) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          ))}
        </div>
        <div>
          <label className="label">Website</label>
          <input
            className="input"
            value={directory.website || ""}
            onChange={(e) => setDirectory({ ...directory, website: e.target.value })}
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={directory.description || ""}
          onChange={(e) => setDirectory({ ...directory, description: e.target.value })}
          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your description..."
        />
        {profileLimits?.descriptionLimit !== null && profileLimits?.descriptionLimit !== undefined && (
          <p className="text-xs text-gray-400 mt-1">
            {profileLimits.descriptionLimit === null 
              ? "Unlimited words on your plan." 
              : `Maximum ${profileLimits.descriptionLimit} words on your plan.`}
          </p>
        )}
      </div>


      {/* LOGO */}
      <div className="grid grid-cols-2 gap-6">
        <UploadBox
          label="Company Logo"
          value={directory.logoUrl}
          onUpload={(file) => handleImageUpload(file, directory, setDirectory, "logoUrl")}
        />
      </div>

      {/* COVER IMAGES */}
      <Section title="Cover Images">
        {maxCoverImages === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Cover images are available on the Basic plan and above. Upgrade your
            plan to add a cover banner to your showroom page.
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">
              Your plan allows up to {maxCoverImages} cover image
              {maxCoverImages > 1 ? "s" : ""}.
              {maxCoverImages > 1 ? " Multiple images will display as a carousel." : ""}
            </p>
            <GallerySection
              field="coverImages"
              items={directory.coverImages}
              onUpload={handleGalleryUpload}
              onAdd={addArrayItem}
              onRemove={removeArrayItem}
              addLabel="+ Add cover image"
              uploadLabel="Cover Image"
              max={maxCoverImages}
              allowRemoveFirst
            />
          </>
        )}
      </Section>

      {/* PRODUCT SUPPLIES */}
      <Section title="Product Supplies">
        {listingEligibility && (
          <p className="text-sm text-gray-500 mb-3">
            Products inside your directory do not count toward your directory slot limit.
          </p>
        )}
        {directory.productSupplies.map((item: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={item}
              onChange={(e) => {
                const arr = [...directory.productSupplies]
                arr[i] = e.target.value
                setDirectory({ ...directory, productSupplies: arr })
              }}
            />
            {i > 0 && (
              <button type="button" onClick={() => {
                const arr = directory.productSupplies.filter((_: any, idx: number) => idx !== i)
                setDirectory({ ...directory, productSupplies: arr })
              }}>✕</button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setDirectory({
              ...directory,
              productSupplies: [...directory.productSupplies, ""],
            })
          }
        >
          + Add product
        </button>
      </Section>

      {/* PRODUCT CATALOGUES - GATED BY PACKAGE */}
      <Section title="Product Catalogues">
        <p className="text-sm text-gray-500 mb-3">
          Upload your product catalogues (PDFs, brochures, etc.).
        </p>
        <div className="grid grid-cols-2 gap-4">
          {directory.productCatalogues.map((url: string, i: number) => (
            <div key={i} className="space-y-1">
              <UploadBox
                label={`Product Catalogue ${i + 1}`}
                value={url}
                onUpload={(file) => handleCatalogueUpload("productCatalogues", i, file)}
              />
              <button type="button" onClick={() => removeArrayItem("productCatalogues", i)}>
                ✕ Remove
              </button>
            </div>
          ))}
          <div className="col-span-2">
            <button
              type="button"
              onClick={() => addArrayItem("productCatalogues")}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Add product catalogue
            </button>
          </div>
        </div>
      </Section>

      {/* SOCIAL LINKS - WhatsApp gated */}
      <Section title="Social Media">
        <div className="grid grid-cols-2 gap-4">
          {["facebook", "linkedin", "twitter", "youtube"].map((key) => (
            <div key={key}>
              <label className="label capitalize">{key}</label>
              <input
                className="input"
                placeholder={key}
                value={directory.socialLinks?.[key] || ""}
                onChange={(e) =>
                  setDirectory({
                    ...directory,
                    socialLinks: { ...directory.socialLinks, [key]: e.target.value },
                  })
                }
              />
            </div>
          ))}
          {allowWhatsapp ? (
            <div>
              <label className="label">WhatsApp</label>
              <input
                className="input"
                placeholder="WhatsApp number"
                value={directory.socialLinks?.whatsapp || ""}
                onChange={(e) =>
                  setDirectory({
                    ...directory,
                    socialLinks: { ...directory.socialLinks, whatsapp: e.target.value },
                  })
                }
              />
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
        {directory.tradeNames.map((item: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={item}
              onChange={(e) => {
                const arr = [...directory.tradeNames];
                arr[i] = e.target.value;
                setDirectory({ ...directory, tradeNames: arr });
              }}
            />
            {i > 0 && (
              <button
                type="button"
                onClick={() => {
                  const arr = directory.tradeNames.filter(
                    (_: any, idx: number) => idx !== i
                  );
                  setDirectory({ ...directory, tradeNames: arr });
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setDirectory({ ...directory, tradeNames: [...directory.tradeNames, ""] })
          }
        >
          + Add trade name
        </button>
      </Section>

      {/* VIDEO GALLERY - GATED BY PACKAGE */}
      <Section title="YouTube Video Links">
        {directory.videoGallery.map((item: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={item}
              onChange={(e) => {
                const arr = [...directory.videoGallery]
                arr[i] = e.target.value
                setDirectory({ ...directory, videoGallery: arr })
              }}
            />
            {i > 0 && (
              <button type="button" onClick={() => {
                const arr = directory.videoGallery.filter((_: any, idx: number) => idx !== i)
                setDirectory({ ...directory, videoGallery: arr })
              }}>✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setDirectory({ ...directory, videoGallery: [...directory.videoGallery, ""] })}>
          + Add video
        </button>
      </Section>

      {/* PRODUCT GALLERY - GATED BY PACKAGE */}
      <Section title="Product Gallery">
        <GallerySection
          field="productGallery"
          items={directory.productGallery}
          onUpload={handleGalleryUpload}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          addLabel="+ Add product image"
        />
      </Section>

      {/* COMPANY GALLERY - GATED BY PACKAGE */}
      <Section title="Company Gallery">
        <GallerySection
          field="companyGallery"
          items={directory.companyGallery}
          onUpload={handleGalleryUpload}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          addLabel="+ Add company image"
        />
      </Section>

      {/* FACTORY GALLERY - GATED BY PACKAGE */}
      <Section title="Factory Gallery">
        <GallerySection
          field="factoryGallery"
          items={directory.factoryGallery}
          onUpload={handleGalleryUpload}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          addLabel="+ Add factory image"
        />
      </Section>

      {/* COMPANY BROCHURE - GATED BY PACKAGE */}
      <Section title="Company Brochure">
        <GallerySection
          field="companyBrochure"
          items={directory.companyBrochure}
          onUpload={handleGalleryUpload}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          addLabel="+ Add brochure file"
          uploadLabel="Brochure File"
        />
      </Section>

      {/* CERTIFICATIONS - GATED BY PACKAGE */}
      <Section title="Certifications">
        <GallerySection
          field="certifications"
          items={directory.certifications}
          onUpload={handleGalleryUpload}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          addLabel="+ Add certification file"
          uploadLabel="Certification File"
        />
      </Section>

      {/* BRANDS REPRESENTED - GATED BY PACKAGE */}
      <Section title="Brands Represented">
        <DynamicListField
          field="brandsRepresented"
          items={directory.brandsRepresented}
          onChange={updateArrayItem}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          addLabel="+ Add brand"
        />
      </Section>

      {/* INDUSTRIES SERVED - GATED BY PACKAGE */}
      <Section title="Industries Served">
        <DynamicListField
          field="industriesServed"
          items={directory.industriesServed}
          onChange={updateArrayItem}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          addLabel="+ Add industry served"
        />
      </Section>

      {/* EXPORT MARKETS - GATED BY PACKAGE */}
      <Section title="Export Markets">
        <DynamicListField
          field="exportMarkets"
          items={directory.exportMarkets}
          onChange={updateArrayItem}
          onAdd={addArrayItem}
          onRemove={removeArrayItem}
          addLabel="+ Add export market"
        />
      </Section>

      {/* MANUFACTURING CAPABILITIES - GATED BY PACKAGE */}
      <Section title="Manufacturing Capabilities">
        <PlanGatedSection
          allowed={!!profileLimits?.manufacturingCapabilities}
          upgradeMessage="Manufacturing Capabilities are available on Basic plan and above."
        >
          <p className="text-xs text-gray-400 mb-2">
            {profileLimits?.manufacturingCapabilities === "Basic" &&
              "Basic plan: Standard text description."}
            {profileLimits?.manufacturingCapabilities === "Complete" &&
              "Professional plan: Complete text description."}
            {profileLimits?.manufacturingCapabilities === "Complete + Photos + Video" &&
              "Enterprise plan: Complete text + Photos + Videos."}
          </p>
          <RichTextEditor
            value={directory.manufacturingCapabilities}
            onChange={(val: string) =>
              setDirectory({ ...directory, manufacturingCapabilities: val })
            }
          />
        </PlanGatedSection>
      </Section>

      {/* MACHINERY LIST - GATED BY PACKAGE */}
      <Section title="Machinery List">
        <PlanGatedSection
          allowed={!!profileLimits?.machineryList}
          upgradeMessage="Machinery List is available on Basic plan and above."
        >
          <p className="text-xs text-gray-400 mb-2">
            {profileLimits?.machineryList === "Basic" &&
              "Basic plan: Basic text list."}
            {profileLimits?.machineryList === "Detailed" &&
              "Professional plan: Detailed text list."}
            {profileLimits?.machineryList === "Detailed with Images" &&
              "Enterprise plan: Detailed text + Machinery Images."}
          </p>
          <RichTextEditor
            value={directory.machineryList}
            onChange={(val: string) => setDirectory({ ...directory, machineryList: val })}
          />
        </PlanGatedSection>
      </Section>

      {/* QUALITY STANDARDS - GATED BY PACKAGE */}
      <Section title="Quality Standards">
        <PlanGatedSection
          allowed={getLimitBoolean("qualityStandards")}
          upgradeMessage="Quality Standards are available on Basic plan and above."
        >
          <RichTextEditor
            value={directory.qualityStandards}
            onChange={(val: string) => setDirectory({ ...directory, qualityStandards: val })}
          />
        </PlanGatedSection>
      </Section>

      {/* INQUIRY FORM */}
      <Section title="Inquiry Form">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={directory.enableInquiryForm ?? true}
            onChange={(e) =>
              setDirectory({ ...directory, enableInquiryForm: e.target.checked })
            }
          />
          <span>Enable inquiry form on public showroom page</span>
        </label>
      </Section>

      <button
        onClick={saveChanges}
        disabled={saving || uploadingCatalogue}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

async function handleImageUpload(file: File, directory: any, setDirectory: any, field: "logoUrl") {
  const url = await uploadFile(file);
  setDirectory({ ...directory, [field]: url });
}

function Section({ title, children }: any) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function DynamicListField({
  field,
  items,
  onChange,
  onAdd,
  onRemove,
  addLabel,
  placeholder,
  
}: {
  field: string
  items: string[]
  onChange: (field: string, index: number, value: string) => void
  onAdd: (field: string) => void
  onRemove: (field: string, index: number) => void
  addLabel: string
  placeholder?: string
}) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder={placeholder}
            value={item}
            onChange={(e) => onChange(field, i, e.target.value)}
          />
          {i > 0 && (
            <button type="button" onClick={() => onRemove(field, i)}>
              ✕
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => onAdd(field)}>{addLabel}</button>
    </>
  );
}

function GallerySection({
  field,
  items,
  onUpload,
  onAdd,
  onRemove,
  addLabel,
  uploadLabel = "File",
  max,
  allowRemoveFirst = false,
}: {
  field: string;
  items: string[];
  onUpload: (field: string, index: number, file: File) => void | Promise<void>;
  onAdd: (field: string) => void;
  onRemove: (field: string, index: number) => void;
  addLabel: string;
  uploadLabel?: string;
  max?: number | null;
  allowRemoveFirst?: boolean;
}) {
  const atLimit = typeof max === "number" && items.length >= max;

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item, i) => (
        <div key={i} className="space-y-1">
          <UploadBox
            label={`${uploadLabel} ${i + 1}`}
            value={item}
            onUpload={(file) => onUpload(field, i, file)}
          />
          {(i > 0 || allowRemoveFirst) && (
            <button type="button" onClick={() => onRemove(field, i)}>
              ✕ Remove
            </button>
          )}
        </div>
      ))}
      <div className="col-span-2">
        <button
          type="button"
          onClick={() => onAdd(field)}
          disabled={atLimit}
          className="disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {addLabel}
          {typeof max === "number" && ` (${items.length}/${max})`}
        </button>
      </div>
    </div>
  );
}