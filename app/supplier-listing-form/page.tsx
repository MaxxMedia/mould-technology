"use client";

import { useState } from "react";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla",
  "Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan",
  "The Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin",
  "Bermuda","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei",
  "Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde",
  "Cayman Islands","Central African Republic","Chad","Chile","China","Christmas Island",
  "Cocos (Keeling) Islands","Colombia","Comoros","Congo","Cook Islands","Costa Rica",
  "Cote d'Ivoire","Croatia","Cuba","Curaçao","Cyprus","Czech Republic",
  "Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia",
  "Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","Gabon",
  "The Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada",
  "Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti",
  "Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati",
  "North Korea","South Korea","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
  "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia",
  "Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
  "Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar",
  "Nagorno-Karabakh","Namibia","Nauru","Nepal","Netherlands","Netherlands Antilles",
  "New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island",
  "Turkish Republic of Northern Cyprus","Northern Mariana","Norway","Oman","Pakistan",
  "Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines",
  "Pitcairn Islands","Poland","Portugal","Puerto Rico","Qatar","Republic of the Congo",
  "Romania","Russia","Rwanda","Saint Barthelemy","Saint Helena","Saint Kitts and Nevis",
  "Saint Lucia","Saint Martin","Saint Pierre and Miquelon",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia",
  "Slovenia","Solomon Islands","Somalia","Somaliland","South Africa","South Ossetia",
  "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Svalbard","eSwatini","Sweden",
  "Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo",
  "Tokelau","Tonga","Transnistria Pridnestrovie","Trinidad and Tobago","Tristan da Cunha",
  "Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","British Virgin Islands",
  "Isle of Man","US Virgin Islands","Wallis and Futuna","Western Sahara","Yemen",
  "Zambia","Zimbabwe",
];

const BRANDS = [
  "Additive Manufacturing",
  "CompositesWorld",
  "Modern Machine Shop",
  "MoldMaking Technology",
  "Plastics Technology",
  "Products Finishing",
  "Production Machining",
];

const inputClass =
  "w-[310px] max-w-full box-border rounded border border-[#c3cad8]/75 px-3 py-2.5 text-base text-[#2C3345] bg-white font-['Open_Sans',sans-serif] focus:outline-none focus:border-[#2e69ff] focus:ring-2 focus:ring-[#c9d8fe]/25";

export default function SupplierListingForm() {
  const [formData, setFormData] = useState({
    requestType: "",
    brands: [] as string[],
    companyName: "",
    website: "",
    email: "",
    phone: "",
    addr1: "",
    addr2: "",
    city: "",
    state: "",
    postal: "",
    country: "",
    companyType: "",
    firstName: "",
    lastName: "",
    adminEmail: "",
    adminPhone: "",
    comments: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandToggle = (brand: string) => {
    setFormData((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    // TODO:
    // await fetch("/api/...", {
    //   method: "POST",
    //   body: JSON.stringify(formData),
    // });
  };

  return (
    <div className="bg-[#ECEDF3] px-4 py-10 font-['Open_Sans',sans-serif]">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-[752px] box-border bg-white text-[#2C3345] text-base px-10 py-8"
      >
        {/* Logo */}
         <div className="text-center mb-2">
          <img
            src="/images/maxx.png"
            alt="Company Logo"
            className="inline-block h-[82px] w-auto"
          />
        </div>

        {/* Header */}
        <h1 className="text-center text-[32px] font-bold text-[#2C3345] my-4 mb-6">
          Supplier Listing Form
        </h1>

        <p className="text-center mb-6 text-base">
          Please direct any questions to Vivianne Skavlem at vskavlem@gardnerweb.com.
        </p>

        {/* Request Type */}
        <Field label="Request Type" required>
          <RadioGroup
            name="requestType"
            value={formData.requestType}
            onChange={(v) => setFormData((p) => ({ ...p, requestType: v }))}
            options={["Change Current Listing", "Add to Supplier Showroom"]}
          />
        </Field>

        {/* Brands */}
        <Field label="Brand(s) Requested" required>
          <div className="flex flex-col gap-2">
            {BRANDS.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.brands.includes(brand)}
                  onChange={() => handleBrandToggle(brand)}
                  className="w-4 h-4 accent-[#2e69ff]"
                />
                {brand}
              </label>
            ))}
          </div>
        </Field>

        {/* Company Information */}
        <SectionHeader
          title="Company Information"
          subtitle="This information will appear in your supplier showroom"
        />

        <Field label="Company Name" required htmlFor="companyName">
          <input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Website" required htmlFor="website">
          <input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Email" required htmlFor="email" subLabel="sales@company.com">
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Phone Number" required htmlFor="phone">
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Company Mailing Address" required htmlFor="addr1">
          <div className="flex flex-col gap-1 max-w-[620px]">
            <div>
              <input
                id="addr1"
                name="addr1"
                value={formData.addr1}
                onChange={handleChange}
                className={`${inputClass} w-full`}
              />
              <SubLabel>Street Address</SubLabel>
            </div>
            <div>
              <input
                name="addr2"
                value={formData.addr2}
                onChange={handleChange}
                className={`${inputClass} w-full`}
              />
              <SubLabel>Street Address Line 2</SubLabel>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`${inputClass} w-full`}
                />
                <SubLabel>City</SubLabel>
              </div>
              <div className="flex-1">
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`${inputClass} w-full`}
                />
                <SubLabel>State / Province</SubLabel>
              </div>
            </div>
            <div className="max-w-[300px]">
              <input
                name="postal"
                value={formData.postal}
                onChange={handleChange}
                className={`${inputClass} w-full`}
              />
              <SubLabel>Postal / Zip Code</SubLabel>
            </div>
          </div>
        </Field>

        <Field label="Country" required htmlFor="country">
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Please Select</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Company Type" required>
          <RadioGroup
            name="companyType"
            value={formData.companyType}
            onChange={(v) => setFormData((p) => ({ ...p, companyType: v }))}
            options={["Builder", "Distributor/Mfg. Rep", "Supplier"]}
          />
        </Field>

        {/* Directory Admin Information */}
        <SectionHeader
          title="Directory Admin Information"
          subtitle="This information is used for internal directory contact purposes only. It is NOT displayed in your showroom."
        />

        <Field label="Name" required htmlFor="firstName">
          <div className="flex gap-4">
            <div>
              <input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${inputClass} !w-[175px]`}
              />
              <SubLabel>First Name</SubLabel>
            </div>
            <div>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`${inputClass} !w-[175px]`}
              />
              <SubLabel>Last Name</SubLabel>
            </div>
          </div>
        </Field>

        <Field
          label="Email Address"
          required
          htmlFor="adminEmail"
          subLabel="example@example.com"
        >
          <input
            id="adminEmail"
            name="adminEmail"
            type="email"
            value={formData.adminEmail}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field
          label="Phone Number"
          htmlFor="adminPhone"
          subLabel="Please enter a valid phone number."
        >
          <input
            id="adminPhone"
            name="adminPhone"
            placeholder="(000) 000-0000"
            value={formData.adminPhone}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Comments or Questions" htmlFor="comments">
          <textarea
            id="comments"
            name="comments"
            placeholder="Type here..."
            value={formData.comments}
            onChange={handleChange}
            rows={6}
            className={`${inputClass} w-full max-w-[648px] resize-y`}
          />
        </Field>

        {/* Submit */}
        <div className="mt-8">
          <button
            type="submit"
            className="w-full rounded bg-[#E8392A] py-3.5 text-lg font-semibold text-white hover:bg-[#CC2E20] transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Sub components ---------- */

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-t border-[#ECEDF3] mt-8 pt-6 mb-4">
      <h2 className="text-[22px] font-bold text-[#2C3345] mb-1">{title}</h2>
      <div className="text-sm text-[#2C3345]">{subtitle}</div>
    </div>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-[#464d5f] mt-0.5">{children}</div>;
}

function Field({
  label,
  required,
  htmlFor,
  subLabel,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  subLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-4 mb-[18px]">
      <label
        htmlFor={htmlFor}
        className="w-[230px] shrink-0 text-base text-[#2C3345] pt-2.5"
      >
        {label}
        {required && <span className="text-[#E8392A]"> *</span>}
      </label>
      <div className="flex-1 min-w-[260px]">
        {children}
        {subLabel && <SubLabel>{subLabel}</SubLabel>}
      </div>
    </div>
  );
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="w-4 h-4 accent-[#2e69ff]"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}