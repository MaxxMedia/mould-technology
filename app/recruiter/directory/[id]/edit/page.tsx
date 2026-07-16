"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import RichTextEditor from "@/components/RichTextField"
import UploadBox from "@/components/UploadBox"
import { loadGeo } from "@/lib/geo"
import {
  fetchProductListingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits"

/* ---------------- SHARED FILE UPLOAD HELPER ---------------- */
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append("image", file)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  })
  const data = await res.json()
  return data.imageUrl
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
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [directory, setDirectory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [uploadingCatalogue, setUploadingCatalogue] = useState(false)
  const [listingEligibility, setListingEligibility] =
    useState<ContentLimitEligibility | null>(null)
  const [geo, setGeo] = useState<Awaited<ReturnType<typeof loadGeo>> | null>(null)

  const [industryLevels, setIndustryLevels] = useState<any[][]>([])
  const [industrySelected, setIndustrySelected] = useState<number[]>([])

  const maxCoverImages = listingEligibility?.maxCoverImages ?? 0
  const allowWhatsapp = listingEligibility?.allowWhatsapp ?? false
  const plan = (listingEligibility?.plan || "free").toLowerCase()
  const limits = {
    companyGallery: PLAN_LIMITS.companyGallery[plan] ?? 0,
    factoryGallery: PLAN_LIMITS.factoryGallery[plan] ?? 0,
    productSupplies: PLAN_LIMITS.productSupplies[plan] ?? 5,
    productGallery: PLAN_LIMITS.productGallery[plan] ?? 10,
    videoGallery: PLAN_LIMITS.videoGallery[plan] ?? 0,
    productCatalogues: PLAN_LIMITS.productCatalogues[plan] ?? 0,
    companyBrochure: PLAN_LIMITS.companyBrochure[plan] ?? 0,
    certifications: PLAN_LIMITS.certifications[plan] ?? 0,
    brandsRepresented: PLAN_LIMITS.brandsRepresented[plan] ?? 0,
    industriesServed: PLAN_LIMITS.industriesServed[plan] ?? 5,
    exportMarkets: PLAN_LIMITS.exportMarkets[plan] ?? 0,
  }

  useEffect(() => {
    loadGeo().then(setGeo).catch(console.error)
  }, [])

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        setListingEligibility(await fetchProductListingEligibility(token))
      } catch (error) {
        console.error("Product listing eligibility error:", error)
      }
    }
    loadEligibility()
  }, [])

  useEffect(() => {
    async function fetchIndustries() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/industries`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.data ?? []
      setIndustryLevels([list])
    }
    fetchIndustries()
  }, [])

  useEffect(() => {
    async function loadDirectory() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/recruiter/directories/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()

        let coverImages = []
        if (Array.isArray(data.coverImageUrl)) {
          coverImages = data.coverImageUrl
        } else if (typeof data.coverImageUrl === 'string' && data.coverImageUrl) {
          coverImages = [data.coverImageUrl]
        } else {
          coverImages = [""]
        }

        setDirectory({
          ...data,
          tradeNames: data.tradeNames || [""],
          videoGallery: data.videoGallery || [""],
          productSupplies: data.productSupplies || [""],
          socialLinks: data.socialLinks || {},
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          address: data.address || "",
          industryId: data.industryId || "",

          coverImages: coverImages,

          productGallery: data.productGallery || [""],
          companyGallery: data.companyGallery || [""],
          factoryGallery: data.factoryGallery || [""],

          productCatalogues: data.productCatalogues || [""],

          companyBrochure: data.companyBrochure || [""],
          certifications: data.certifications || [""],

          brandsRepresented: data.brandsRepresented || [""],
          industriesServed: data.industriesServed || [""],
          exportMarkets: data.exportMarkets || [""],

          manufacturingCapabilities: data.manufacturingCapabilities || "",
          machineryList: data.machineryList || "",
          qualityStandards: data.qualityStandards || "",

          enableInquiryForm: data.enableInquiryForm ?? true,
        })
      } catch {
        alert("Unable to load directory")
      } finally {
        setLoading(false)
      }
    }
    loadDirectory()
  }, [id])

  const handleIndustrySelect = async (levelIndex: number, id: number) => {
    const newSelected = [...industrySelected.slice(0, levelIndex), id]
    const newLevels = industryLevels.slice(0, levelIndex + 1)
    setIndustrySelected(newSelected)
    setIndustryLevels(newLevels)
    setDirectory((prev: any) => ({ ...prev, industryId: "" }))

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/industries/${id}/children`)
    const children = await res.json()

    if (children.length > 0) {
      setIndustryLevels([...newLevels, children])
    } else {
      setDirectory((prev: any) => ({ ...prev, industryId: id }))
    }
  }

  const updateArrayItem = (field: string, index: number, value: string) => {
    setDirectory((prev: any) => {
      const arr = [...(prev[field] || [])]
      arr[index] = value
      return { ...prev, [field]: arr }
    })
  }

  const addArrayItem = (field: string) => {
    setDirectory((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setDirectory((prev: any) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_: any, idx: number) => idx !== index),
    }))
  }

  const handleGalleryUpload = async (field: string, index: number, file: File) => {
    const url = await uploadFile(file)
    updateArrayItem(field, index, url)
  }

  /* ================= PRODUCT CATALOGUE UPLOAD ================= */
  // ✅ Handle catalogue upload specifically
  const handleCatalogueUpload = async (field: string, index: number, file: File) => {
    setUploadingCatalogue(true)
    try {
      const formData = new FormData()
      formData.append("document", file) // ✅ Use "document" field name

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/document`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "File upload failed")
      }

      const data = await res.json()
      const url = data.documentUrl // ✅ Use documentUrl
      updateArrayItem(field, index, url)
    } catch (error: any) {
      setSaveError(error.message || "Failed to upload document")
    } finally {
      setUploadingCatalogue(false)
    }
  }

  async function saveChanges() {
    if (!directory?.isLiveEditable) {
      alert("Directory is not approved yet")
      return
    }

    const validationChecks = [
      { key: "companyGallery", name: "company gallery images", limit: limits.companyGallery },
      { key: "factoryGallery", name: "factory gallery images", limit: limits.factoryGallery },
      { key: "productSupplies", name: "product supplies", limit: limits.productSupplies },
      { key: "productGallery", name: "product gallery images", limit: limits.productGallery },
      { key: "videoGallery", name: "video gallery links", limit: limits.videoGallery },
      { key: "productCatalogues", name: "product catalogues", limit: limits.productCatalogues },
      { key: "companyBrochure", name: "company brochures", limit: limits.companyBrochure },
      { key: "certifications", name: "certifications", limit: limits.certifications },
      { key: "brandsRepresented", name: "brands represented", limit: limits.brandsRepresented },
      { key: "industriesServed", name: "industries served", limit: limits.industriesServed },
      { key: "exportMarkets", name: "export markets", limit: limits.exportMarkets },
    ]

    for (const check of validationChecks) {
      const count = (directory[check.key] || []).filter(Boolean).length
      if (count > check.limit) {
        alert(`Your plan allows a maximum of ${check.limit === Infinity ? "unlimited" : check.limit} ${check.name}. Please remove some.`)
        return
      }
    }

    try {
      setSaving(true)
      setSaveError("")
      const token = localStorage.getItem("token")
      const geoLib = geo ?? (await loadGeo())

      const selectedCountry = geoLib.Country.getAllCountries().find(c => c.isoCode === directory.country)
      const selectedState = geoLib.State.getStatesOfCountry(directory.country).find(s => s.isoCode === directory.state)
      const location = [directory.city, selectedState?.name, selectedCountry?.name].filter(Boolean).join(", ")

      const payload = {
        ...directory,
        location,
        coverImageUrl: directory.coverImages
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/suppliers/${directory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveError(data.error || "Failed to save changes")
        return
      }

      router.push("/recruiter/dashboard")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !geo) return <div className="p-10">Loading directory...</div>
  if (!directory) return <div className="p-10">Directory not found</div>

  const states = directory.country ? geo.State.getStatesOfCountry(directory.country) : []
  const cities = directory.state ? geo.City.getCitiesOfState(directory.country, directory.state) : []
  const countries = geo.Country.getAllCountries()

  return (
    <div className="max-w-4xl mx-auto p-10 space-y-6">
      <h1 className="text-2xl font-bold">Edit Supplier Directory</h1>

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
            onChange={(e) => setDirectory({ ...directory, country: e.target.value, state: "", city: "" })}
          >
            <option value="">Select Country</option>
            {countries.map(c => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
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
            {states.map(s => (
              <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
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
            {cities.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
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
                <option key={industry.id} value={industry.id}>{industry.name}</option>
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
        <label className="label">Description</label>
        <RichTextEditor
          value={directory.description}
          onChange={(val: string) => setDirectory({ ...directory, description: val })}
        />
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
              Your plan allows up to {maxCoverImages} cover image{maxCoverImages > 1 ? "s" : ""}.
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
        {limits.productSupplies === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Product supplies are available on the Basic plan and above. Upgrade your plan to add products.
          </div>
        ) : (
          <>
            {limits.productSupplies !== Infinity && (
              <p className="text-xs text-gray-400 mb-2">
                Your plan allows up to {limits.productSupplies} product supplies.
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
              disabled={directory.productSupplies.length >= limits.productSupplies}
              onClick={() =>
                setDirectory({
                  ...directory,
                  productSupplies: [...directory.productSupplies, ""],
                })
              }
              className="disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-2 border px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 font-medium"
            >
              + Add product ({directory.productSupplies.length}/{limits.productSupplies === Infinity ? "Unlimited" : limits.productSupplies})
            </button>
          </>
        )}
      </Section>

      {/* PRODUCT CATALOGUES - WITH FILE UPLOAD */}
      <Section title="Product Catalogues">
        {limits.productCatalogues === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Product catalogues are available on the Basic plan and above. Upgrade your plan to add catalogues.
          </div>
        ) : (
          <>
            {limits.productCatalogues !== Infinity && (
              <p className="text-xs text-gray-400 mb-2">
                Your plan allows up to {limits.productCatalogues} product catalogues.
              </p>
            )}
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
                  disabled={directory.productCatalogues.length >= limits.productCatalogues}
                  className="disabled:opacity-40 disabled:cursor-not-allowed text-sm border px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 font-medium"
                >
                  + Add product catalogue ({directory.productCatalogues.length}/{limits.productCatalogues === Infinity ? "Unlimited" : limits.productCatalogues})
                </button>
              </div>
            </div>
          </>
        )}
      </Section>

      {/* SOCIAL LINKS */}
      <Section title="Social Media">
        <div className="grid grid-cols-2 gap-4">
          {[
            "facebook",
            "linkedin",
            "twitter",
            "youtube",
            ...(allowWhatsapp ? ["whatsapp"] : []),
          ].map((key) => (
            <div key={key}>
              <label className="label capitalize">{key}</label>
              <input
                className="input"
                placeholder={key}
                value={directory.socialLinks?.[key] || ""}
                onChange={(e) =>
                  setDirectory({ ...directory, socialLinks: { ...directory.socialLinks, [key]: e.target.value } })
                }
              />
            </div>
          ))}
        </div>
        {!allowWhatsapp && (
          <p className="text-xs text-gray-400">
            WhatsApp is available on the Basic plan and above.
          </p>
        )}
      </Section>

      {/* TRADE NAMES */}
      <Section title="Trade Names">
        {directory.tradeNames.map((item: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={item}
              onChange={(e) => {
                const arr = [...directory.tradeNames]
                arr[i] = e.target.value
                setDirectory({ ...directory, tradeNames: arr })
              }}
            />
            {i > 0 && (
              <button type="button" onClick={() => {
                const arr = directory.tradeNames.filter((_: any, idx: number) => idx !== i)
                setDirectory({ ...directory, tradeNames: arr })
              }}>✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setDirectory({ ...directory, tradeNames: [...directory.tradeNames, ""] })}>
          + Add trade name
        </button>
      </Section>

      {/* VIDEO GALLERY */}
      <Section title="YouTube Video Links">
        {limits.videoGallery === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            YouTube videos are available on the Basic plan and above. Upgrade your plan to add videos.
          </div>
        ) : (
          <>
            {limits.videoGallery !== Infinity && (
              <p className="text-xs text-gray-400 mb-2">
                Your plan allows up to {limits.videoGallery} videos.
              </p>
            )}
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
            <button
              type="button"
              disabled={directory.videoGallery.length >= limits.videoGallery}
              onClick={() => setDirectory({ ...directory, videoGallery: [...directory.videoGallery, ""] })}
              className="disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-2 border px-3 py-1 rounded bg-gray-50 hover:bg-gray-100 font-medium"
            >
              + Add video ({directory.videoGallery.length}/{limits.videoGallery === Infinity ? "Unlimited" : limits.videoGallery})
            </button>
          </>
        )}
      </Section>

      {/* IMAGE GALLERIES */}
      <Section title="Product Gallery">
        {limits.productGallery === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Product gallery images are available on the Basic plan and above. Upgrade your plan to add images.
          </div>
        ) : (
          <GallerySection
            field="productGallery"
            items={directory.productGallery}
            onUpload={handleGalleryUpload}
            onAdd={addArrayItem}
            onRemove={removeArrayItem}
            addLabel="+ Add product image"
            max={limits.productGallery === Infinity ? undefined : limits.productGallery}
          />
        )}
      </Section>

      <Section title="Company Gallery">
        {limits.companyGallery === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Company gallery images are available on the Basic plan and above. Upgrade your
            plan to add company gallery images.
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">
              Your plan allows up to {limits.companyGallery === Infinity ? "unlimited" : limits.companyGallery} company gallery image{limits.companyGallery > 1 ? "s" : ""}.
            </p>
            <GallerySection
              field="companyGallery"
              items={directory.companyGallery}
              onUpload={handleGalleryUpload}
              onAdd={addArrayItem}
              onRemove={removeArrayItem}
              addLabel="+ Add company image"
              max={limits.companyGallery === Infinity ? undefined : limits.companyGallery}
            />
          </>
        )}
      </Section>

      <Section title="Factory Gallery">
        {limits.factoryGallery === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Factory gallery images are available on the Basic plan and above. Upgrade your plan to add factory images.
          </div>
        ) : (
          <GallerySection
            field="factoryGallery"
            items={directory.factoryGallery}
            onUpload={handleGalleryUpload}
            onAdd={addArrayItem}
            onRemove={removeArrayItem}
            addLabel="+ Add factory image"
            max={limits.factoryGallery === Infinity ? undefined : limits.factoryGallery}
          />
        )}
      </Section>

      {/* DOCUMENTS */}
      <Section title="Company Brochure">
        {limits.companyBrochure === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Company brochures are available on the Basic plan and above. Upgrade your plan to add brochures.
          </div>
        ) : (
          <GallerySection
            field="companyBrochure"
            items={directory.companyBrochure}
            onUpload={handleGalleryUpload}
            onAdd={addArrayItem}
            onRemove={removeArrayItem}
            addLabel="+ Add brochure file"
            uploadLabel="Brochure File"
            max={limits.companyBrochure === Infinity ? undefined : limits.companyBrochure}
          />
        )}
      </Section>

      <Section title="Certifications">
        {limits.certifications === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Certifications are available on the Basic plan and above. Upgrade your plan to add certifications.
          </div>
        ) : (
          <GallerySection
            field="certifications"
            items={directory.certifications}
            onUpload={handleGalleryUpload}
            onAdd={addArrayItem}
            onRemove={removeArrayItem}
            addLabel="+ Add certification file"
            uploadLabel="Certification File"
            max={limits.certifications === Infinity ? undefined : limits.certifications}
          />
        )}
      </Section>

      {/* LIST FIELDS */}
      <Section title="Brands Represented">
        {limits.brandsRepresented === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Brands represented are available on the Basic plan and above. Upgrade your plan to add brands.
          </div>
        ) : (
          <DynamicListField
            field="brandsRepresented"
            items={directory.brandsRepresented}
            onChange={updateArrayItem}
            onAdd={addArrayItem}
            onRemove={removeArrayItem}
            addLabel="+ Add brand"
            max={limits.brandsRepresented === Infinity ? undefined : limits.brandsRepresented}
          />
        )}
      </Section>

      <Section title="Industries Served">
        {limits.industriesServed === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Industries served are available on the Basic plan and above. Upgrade your plan to add industries.
          </div>
        ) : (
          <DynamicListField
            field="industriesServed"
            items={directory.industriesServed}
            onChange={updateArrayItem}
            onAdd={addArrayItem}
            onRemove={removeArrayItem}
            addLabel="+ Add industry served"
            max={limits.industriesServed === Infinity ? undefined : limits.industriesServed}
          />
        )}
      </Section>

      <Section title="Export Markets">
        {limits.exportMarkets === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Export markets are available on the Basic plan and above. Upgrade your plan to add markets.
          </div>
        ) : (
          <DynamicListField
            field="exportMarkets"
            items={directory.exportMarkets}
            onChange={updateArrayItem}
            onAdd={addArrayItem}
            onRemove={removeArrayItem}
            addLabel="+ Add export market"
            max={limits.exportMarkets === Infinity ? undefined : limits.exportMarkets}
          />
        )}
      </Section>

      {/* LONG TEXT SECTIONS */}
      <Section title="Manufacturing Capabilities">
        <RichTextEditor
          value={directory.manufacturingCapabilities}
          onChange={(val: string) => setDirectory({ ...directory, manufacturingCapabilities: val })}
        />
      </Section>

      <Section title="Machinery List">
        <RichTextEditor
          value={directory.machineryList}
          onChange={(val: string) => setDirectory({ ...directory, machineryList: val })}
        />
      </Section>

      <Section title="Quality Standards">
        <RichTextEditor
          value={directory.qualityStandards}
          onChange={(val: string) => setDirectory({ ...directory, qualityStandards: val })}
        />
      </Section>

      {/* BOOLEAN TOGGLE */}
      <Section title="Inquiry Form">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={directory.enableInquiryForm ?? true}
            onChange={(e) => setDirectory({ ...directory, enableInquiryForm: e.target.checked })}
          />
          <span>Enable inquiry form on public showroom page</span>
        </label>
      </Section>

      {saveError && <p className="text-red-600 text-sm">{saveError}</p>}

      <button
        onClick={saveChanges}
        disabled={saving || uploadingCatalogue}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}

/* ---------------- LOGO UPLOAD ---------------- */
async function handleImageUpload(file: File, directory: any, setDirectory: any, field: "logoUrl") {
  const url = await uploadFile(file)
  setDirectory({ ...directory, [field]: url })
}

/* ---------------- SECTION ---------------- */
function Section({ title, children }: any) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  )
}

/* ---------------- REUSABLE: DYNAMIC STRING LIST ---------------- */
function DynamicListField({
  field,
  items,
  onChange,
  onAdd,
  onRemove,
  addLabel,
  placeholder,
  max,
}: {
  field: string
  items: string[]
  onChange: (field: string, index: number, value: string) => void
  onAdd: (field: string) => void
  onRemove: (field: string, index: number) => void
  addLabel: string
  placeholder?: string
  max?: number
}) {
  const atLimit = typeof max === "number" && items.length >= max

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
            <button type="button" onClick={() => onRemove(field, i)}>✕</button>
          )}
        </div>
      ))}
      {typeof max === "number" && (
        <p className="text-xs text-gray-400 mt-1 mb-2">{items.length} of {max} used</p>
      )}
      <button
        type="button"
        onClick={() => onAdd(field)}
        disabled={atLimit}
        className="disabled:opacity-40 disabled:cursor-not-allowed mt-1"
      >
        {addLabel}
      </button>
    </>
  )
}

/* ---------------- REUSABLE: GALLERY / DOCUMENT UPLOAD ---------------- */
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
  field: string
  items: string[]
  onUpload: (field: string, index: number, file: File) => void | Promise<void>
  onAdd: (field: string) => void
  onRemove: (field: string, index: number) => void
  addLabel: string
  uploadLabel?: string
  max?: number
  allowRemoveFirst?: boolean
}) {
  const atLimit = typeof max === "number" && items.length >= max

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
        {typeof max === "number" && (
          <p className="text-xs text-gray-400 mb-2">{items.length} of {max} used</p>
        )}
        <button
          type="button"
          onClick={() => onAdd(field)}
          disabled={atLimit}
          className="disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {addLabel}
        </button>
      </div>
    </div>
  )
}

function setUploadError(message: any) {
  throw new Error("Function not implemented.")
}
