import React, { useState } from "react";
import { db, storage } from "@/Database/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/components/ui/use-toast";

const AddProduct = () => {
  const { toast } = useToast();
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [categories, setCategories] = useState<string>("");
  const [colors, setColors] = useState<string[]>([]);
  const [discount, setDiscount] = useState<string>("");
  const [defaultColorName, setDefaultColorName] = useState<string>("");
  const [features, setFeatures] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<Record<string, File[]>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string[]>>({});
  const [sizes, setSizes] = useState<string>("");
  const [defaultImageFiles, setDefaultImageFiles] = useState<File[]>([]);
  const [defaultImagePreviews, setDefaultImagePreviews] = useState<string[]>([]);
  const [details, setDetails] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddColor = () => {
    const rawInput = prompt("Enter color name:");
    if (rawInput) {
      const colorInput = rawInput.trim();
      if (colorInput && !colors.includes(colorInput)) {
        setColors((prevColors) => [...prevColors, colorInput]);
        setImageFiles((prev) => ({ ...prev, [colorInput]: [] }));
        setImagePreviews((prev) => ({ ...prev, [colorInput]: [] }));
      }
    }
  };

  const handleFileChange = (color: string, files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => ({
        ...prev,
        [color]: [...(prev[color] || []), ...newFiles]
      }));
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews((prev) => ({
        ...prev,
        [color]: [...(prev[color] || []), ...newPreviewUrls]
      }));
    }
  };

  const handleRemoveImage = (color: string, index: number) => {
    setImageFiles((prev) => {
      const updated = [...(prev[color] || [])];
      updated.splice(index, 1);
      return { ...prev, [color]: updated };
    });
    setImagePreviews((prev) => {
      const updated = [...(prev[color] || [])];
      URL.revokeObjectURL(updated[index]);
      updated.splice(index, 1);
      return { ...prev, [color]: updated };
    });
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setColors((prev) => prev.filter((c) => c !== colorToRemove));
    setImageFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[colorToRemove];
      return newFiles;
    });
    setImagePreviews((prev) => {
      const newPreviews = { ...prev };
      if (newPreviews[colorToRemove]) {
        newPreviews[colorToRemove].forEach((url) => URL.revokeObjectURL(url));
      }
      delete newPreviews[colorToRemove];
      return newPreviews;
    });
  };

  const handleDefaultImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDefaultImageFiles((prev) => [...prev, ...newFiles]);
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setDefaultImagePreviews((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemoveDefaultImage = (index: number) => {
    setDefaultImageFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    setDefaultImagePreviews((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index]);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const categoriesArray = categories.split(",").map((item) => item.trim().toLowerCase()).filter(item => item !== "");
      const featuresArray = features.split(",").map((item) => item.trim()).filter(item => item !== "");
      const sizesArray = sizes.split(",").map((item) => item.trim()).filter(item => item !== "");
      const imageUrlsArray: Record<string, string[]> = {};
      let primaryDefaultImageUrl = "";

      if (defaultImageFiles.length > 0) {
        const defaultImageUrls: string[] = [];
        for (const file of defaultImageFiles) {
          const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "_");
          const sanitizedFileName = file.name.replace(/\s+/g, "_");
          const timestamp = Date.now();
          const defaultImageRef = ref(storage, `shoes/${sanitizedName}/default/${timestamp}_${sanitizedFileName}`);
          await uploadBytes(defaultImageRef, file);
          const url = await getDownloadURL(defaultImageRef);
          defaultImageUrls.push(url);
        }
        if (defaultImageUrls.length > 0) {
          primaryDefaultImageUrl = defaultImageUrls[0];
          imageUrlsArray["default"] = defaultImageUrls;
        }
      }

      for (const color of colors) {
        if (imageFiles[color] && imageFiles[color].length > 0) {
          const uploadedUrls: string[] = [];
          for (const file of imageFiles[color]) {
            const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "_");
            const sanitizedColor = color.replace(/[^a-zA-Z0-9]/g, "_");
            const sanitizedFileName = file.name.replace(/\s+/g, "_");
            const timestamp = Date.now();
            const imageRef = ref(storage, `shoes/${sanitizedName}/${sanitizedColor}/${timestamp}_${sanitizedFileName}`);
            await uploadBytes(imageRef, file);
            const url = await getDownloadURL(imageRef);
            uploadedUrls.push(url);
          }
          imageUrlsArray[color] = uploadedUrls;
        } else {
          imageUrlsArray[color] = [];
        }
      }

      if (!primaryDefaultImageUrl) {
        for (const color of colors) {
          if (imageUrlsArray[color] && imageUrlsArray[color].length > 0) {
            primaryDefaultImageUrl = imageUrlsArray[color][0];
            break;
          }
        }
      }

      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        categories: categoriesArray,
        colors,
        discount,
        defaultColorName: defaultColorName,
        features: featuresArray,
        imageUrls: imageUrlsArray,
        defaultImage: primaryDefaultImageUrl,
        sizes: sizesArray,
        details: details,
        rating: {},
        reviews: [],
        createdAt: new Date().toISOString(),
      });

      toast({
        variant: "success",
        title: "Asset Deployed",
        description: `${name} has been successfully registered.`,
      });

      setName("");
      setPrice("");
      setCategories("");
      setColors([]);
      setDiscount("");
      setFeatures("");
      setImageFiles({});
      setImagePreviews({});
      setSizes("");
      setDetails("");
      setDefaultColorName("");
      setDefaultImageFiles([]);
      setDefaultImagePreviews([]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Deployment Failed",
        description: "Encountered a critical error during registration.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all placeholder:text-slate-300 placeholder:font-medium";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2";

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 font-satoshi">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-5xl font-black tracking-tighter text-slate-900">Deploy New Asset</h2>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">Registration Terminal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Core Identity Section */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex items-center gap-3 mb-10 pb-5 border-b border-slate-50">
            <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800">Asset Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelClass}>Product Designation</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Air Force 1 '07 Premium" required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Market Value (INR)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} placeholder="e.g. 9999" required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Category Tags (CSV)</label>
              <input type="text" value={categories} onChange={(e) => setCategories(e.target.value)} className={inputClass} placeholder="e.g. Lifestyle, Basketball, Men" />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Market Rebate (%)</label>
              <input type="text" value={discount} onChange={(e) => setDiscount(e.target.value)} className={inputClass} placeholder="e.g. 15% OFF" />
            </div>
          </div>
        </div>

        {/* Visual Assets Section */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex items-center justify-between mb-10 pb-5 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800">Visual Repository</h3>
            </div>
            <button type="button" onClick={handleAddColor} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] hover:bg-black active:scale-95 transition-all shadow-xl shadow-slate-100">
              Establish Bundle
            </button>
          </div>

          <div className="space-y-12">
            {/* Primary / Default Bundle */}
            <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <div className="flex-1">
                  <label className={labelClass}>Primary Color Name</label>
                  <input type="text" value={defaultColorName} onChange={(e) => setDefaultColorName(e.target.value)} className={inputClass} placeholder="e.g. Triple White" />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Upload Master Angles</label>
                  <div className="relative overflow-hidden group">
                    <input type="file" multiple onChange={handleDefaultImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500 transition-all text-center">
                      Drop assets or click to browse
                    </div>
                  </div>
                </div>
              </div>

              {defaultImagePreviews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                  {defaultImagePreviews.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={url} className="w-full h-full object-cover rounded-2xl border border-slate-200 shadow-sm" />
                      <button type="button" onClick={() => handleRemoveDefaultImage(index)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Color Bundles */}
            {colors.map((color) => (
              <div key={color} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-widest px-4 py-2 bg-slate-100 rounded-full">Variant: {color}</p>
                  <button type="button" onClick={() => handleRemoveColor(color)} className="text-[10px] font-black uppercase text-rose-500 hover:underline">Decommission Bundle</button>
                </div>

                <div className="relative overflow-hidden group mb-8">
                  <input type="file" multiple onChange={(e) => handleFileChange(color, e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] px-6 py-10 text-sm font-bold text-slate-400 group-hover:border-slate-400 group-hover:text-slate-600 transition-all text-center flex flex-col items-center gap-2">
                    <span className="text-2xl">📸</span>
                    Upload images for {color} variant
                  </div>
                </div>

                {imagePreviews[color] && imagePreviews[color].length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {imagePreviews[color].map((url, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img src={url} className="w-full h-full object-cover rounded-2xl border border-slate-200" />
                        <button type="button" onClick={() => handleRemoveImage(color, index)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specs Section */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex items-center gap-3 mb-10 pb-5 border-b border-slate-50">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-800">Technical Specs</h3>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClass}>Core Features (CSV)</label>
                <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} className={inputClass} placeholder="e.g. Leather Upper, Air Cushioning" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Available Size Matrix (CSV)</label>
                <input type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} className={inputClass} placeholder="e.g. 7, 8, 9, 10, 11" />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Asset Description & Logistical Notes</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} className={`${inputClass} min-h-[150px] resize-none`} placeholder="Detailed product narrative..." />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-sm transition-all shadow-xl active:scale-95 ${loading ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-green-600 text-white hover:bg-slate-900 shadow-green-100 hover:shadow-slate-200 hover:-translate-y-1"}`}
        >
          {loading ? "Establishing Connection..." : "Finalize Deployment"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
