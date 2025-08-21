"use client";

import { useState } from "react";

type PackageOption = {
  id: string;
  label: string;
  price: number;
  tier?: string;
};

type Category = {
  id: string;
  name: string;
  packages: PackageOption[];
};

const categories: Category[] = [
  {
    id: "full_reels",
    name: "Full‑Service Reels (Filming + Editing)",
    packages: [
      { id: "full_on_1", tier: "On‑Demand", label: "1 Reel", price: 250 },
      { id: "full_on_2", tier: "On‑Demand", label: "2 Reels", price: 500 },
      { id: "full_on_4", tier: "On‑Demand", label: "4 Reels", price: 600 },
      { id: "full_month_4", tier: "Monthly", label: "4 Reels / month", price: 600 },
      { id: "full_month_8", tier: "Monthly", label: "8 Reels / month", price: 1000 },
      { id: "full_month_12", tier: "Monthly", label: "12 Reels / month", price: 1500 },
    ],
  },
  {
    id: "edit_only",
    name: "Editing Only (No Filming)",
    packages: [
      { id: "edit_daily_1", tier: "Daily", label: "1 Reel", price: 150 },
      { id: "edit_daily_2", tier: "Daily", label: "2 Reels", price: 250 },
      { id: "edit_daily_4", tier: "Daily", label: "4 Reels", price: 400 },
      { id: "edit_month_4", tier: "Monthly", label: "Starter – 4 Reels / month", price: 500 },
      { id: "edit_month_8", tier: "Monthly", label: "Growth – 8 Reels / month", price: 800 },
      { id: "edit_month_12", tier: "Monthly", label: "Dominance – 12 Reels / month", price: 1000 },
    ],
  },
  {
    id: "wedding",
    name: "Wedding Packages",
    packages: [
      { id: "wedding_essentials", label: "Essentials Package", price: 1200 },
      { id: "wedding_signature", label: "Signature Package", price: 2200 },
      { id: "wedding_luxury", label: "Luxury Package", price: 3500 },
    ],
  },
  {
    id: "business",
    name: "Business / Branding Photography",
    packages: [
      { id: "business_headshot", label: "Headshot Package", price: 250 },
      { id: "business_professional", label: "Professional Package", price: 500 },
      { id: "business_executive", label: "Executive Branding Package", price: 1200 },
    ],
  },
  {
    id: "corporate",
    name: "Corporate Event Photography",
    packages: [
      { id: "corporate_essentials", label: "Corporate Essentials", price: 800 },
      { id: "corporate_premium", label: "Premium Corporate", price: 1500 },
      { id: "corporate_allin", label: "All‑In Branding Experience", price: 2500 },
    ],
  },
];

const addons = [
  { id: "extra_photographer", name: "Extra Photographer", price: 500 },
  { id: "videographer_half", name: "Videographer (half‑day)", price: 700 },
  { id: "videographer_full", name: "Videographer (full‑day)", price: 1200 },
  { id: "drone", name: "Drone Footage", price: 350 },
  { id: "photo_book", name: "Photo Book / Album", price: 400 },
  { id: "sneak_peek", name: "Same‑Day Sneak Peek Edits", price: 250 },
  { id: "captions", name: "Captions + Subtitles", price: 50 },
  { id: "motion_graphics", name: "Motion Graphics", price: 75 },
  { id: "story_cutdowns", name: "Branded Story Cutdowns", price: 100 },
  { id: "content_calendar", name: "Monthly Content Calendar", price: 200 },
  { id: "strategy", name: "Strategy Session (30 mins)", price: 100 },
];

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const totalPrice = (selectedPackage?.price || 0) + selectedAddons.reduce((sum, id) => {
    const add = addons.find((a) => a.id === id);
    return add ? sum + add.price : sum;
  }, 0);

  const handleAddonToggle = (id: string) => {
    setSelectedAddons((prev) => {
      if (prev.includes(id)) {
        return prev.filter((a) => a !== id);
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    const payload = {
      category: selectedCategory?.name,
      package: selectedPackage,
      addons: selectedAddons,
      details,
      total: totalPrice,
    };
    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSubmitted(true);
      setStep(5);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <img
            src="/brown-branding-logo.png"
            alt="Brown Branding logo"
            className="h-10 w-auto"
          />
          <span className="text-xl font-semibold">Booking</span>
        </div>
        {step > 0 && step < 5 && (
          <div className="text-sm text-gray-500">Step {step} of 4</div>
        )}
      </header>

      {step === 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Choose a Service Category</h2>
          <div className="grid gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="w-full p-4 border rounded-lg hover:bg-blue-50 text-left"
                onClick={() => {
                  setSelectedCategory(cat);
                  setStep(1);
                }}
              >
                <div className="font-medium">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && selectedCategory && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select a Package</h2>
          <p className="mb-2 text-gray-600">{selectedCategory.name}</p>
          <div className="grid gap-4">
            {selectedCategory.packages.map((pkg) => (
              <button
                key={pkg.id}
                className={`w-full p-4 border rounded-lg text-left ${
                  selectedPackage?.id === pkg.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-blue-50'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="font-medium">{pkg.label}</div>
                {pkg.tier && <div className="text-sm text-gray-500">{pkg.tier}</div>}
                <div className="mt-1 font-semibold">${pkg.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              className="px-4 py-2 text-sm rounded border"
              onClick={() => setStep(0)}
            >
              Back
            </button>
            <button
              disabled={!selectedPackage}
              className={`px-4 py-2 text-sm rounded ${
                selectedPackage ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Add‑On Options</h2>
          <p className="mb-2 text-gray-600">Select any extras you would like to include.</p>
          <div className="grid gap-4">
            {addons.map((addon) => (
              <label
                key={addon.id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
                  selectedAddons.includes(addon.id) ? 'bg-blue-50 border-blue-500' : 'hover:bg-blue-50'
                }`}
              >
                <span className="font-medium">{addon.name}</span>
                <span className="font-semibold">${addon.price.toFixed(2)}</span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedAddons.includes(addon.id)}
                  onChange={() => handleAddonToggle(addon.id)}
                />
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              className="px-4 py-2 text-sm rounded border"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white"
              onClick={() => setStep(3)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Tell Us About Your Project</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 w-full p-2 border rounded"
                value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 w-full p-2 border rounded"
                value={details.email}
                onChange={(e) => setDetails({ ...details, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                className="mt-1 w-full p-2 border rounded"
                value={details.phone}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Description</label>
              <textarea
                className="mt-1 w-full p-2 border rounded h-24"
                value={details.description}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button
              className="px-4 py-2 text-sm rounded border"
              onClick={() => setStep(2)}
            >
              Back
            </button>
            <button
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white"
              onClick={() => setStep(4)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 4 && selectedCategory && selectedPackage && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Review Your Booking</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-1">Category</h3>
              <p>{selectedCategory.name}</p>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-1">Package</h3>
              <p>{selectedPackage.label} {selectedPackage.tier ? `– ${selectedPackage.tier}` : ''}</p>
              <p className="font-semibold">${selectedPackage.price.toFixed(2)}</p>
            </div>
            {selectedAddons.length > 0 && (
              <div className="p-4 border rounded">
                <h3 className="font-medium mb-1">Add‑Ons</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedAddons.map((id) => {
                    const addon = addons.find((a) => a.id === id);
                    return addon ? (
                      <li key={id} className="flex justify-between">
                        <span>{addon.name}</span>
                        <span>${addon.price.toFixed(2)}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
            <div className="p-4 border rounded">
              <h3 className="font-medium mb-1">Your Details</h3>
              <p>Name: {details.name || '—'}</p>
              <p>Email: {details.email || '—'}</p>
              <p>Phone: {details.phone || '—'}</p>
              <p>Description: {details.description || '—'}</p>
            </div>
            <div className="p-4 border rounded bg-blue-50">
              <h3 className="font-medium mb-1">Total</h3>
              <p className="text-2xl font-bold">${totalPrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button
              className="px-4 py-2 text-sm rounded border"
              onClick={() => setStep(3)}
            >
              Back
            </button>
            <button
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white"
              onClick={handleSubmit}
            >
              Confirm & Submit
            </button>
          </div>
        </div>
      )}

      {step === 5 && submitted && (
        <div className="text-center py-10">
          <h2 className="text-3xl font-bold mb-4">Thank You!</h2>
          <p className="mb-4">Your booking has been received. We will contact you soon.</p>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={() => {
              setStep(0);
              setSelectedCategory(null);
              setSelectedPackage(null);
              setSelectedAddons([]);
              setDetails({ name: '', email: '', phone: '', description: '' });
              setSubmitted(false);
            }}
          >
            Book Another Service
          </button>
        </div>
      )}
    </div>
  );
}
