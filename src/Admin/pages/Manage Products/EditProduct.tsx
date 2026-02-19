import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db, storage } from "@/Database/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { Product } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const EditProduct: React.FC = () => {
  const { toast } = useToast();
  const { productId } = useParams<{ productId: string }>();
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [categories, setCategories] = useState<string>("");
  const [colorInput, setColorInput] = useState<string>("");
  const [colors, setColors] = useState<string[]>([]);
  const [discount, setDiscount] = useState<string>("");
  const [features, setFeatures] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<Record<string, File[]>>({});
  const [sizes, setSizes] = useState<string>("");
  const [defaultImageFiles, setDefaultImageFiles] = useState<File[]>([]);
  const [defaultImageUrls, setDefaultImageUrls] = useState<string[]>([]);
  const [defaultColorName, setDefaultColorName] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<Record<string, string[]>>({});
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const productDoc = await getDoc(doc(db, "products", productId));
        if (productDoc.exists()) {
          const productData = productDoc.data() as Product;
          setName(productData.name);
          setPrice(productData.price ? productData.price.toString() : "");
          setCategories(Array.isArray(productData.categories) ? productData.categories.join(", ") : "");
          setColors(productData.colors || []);
          setDiscount(productData.discount || "");
          setFeatures(Array.isArray(productData.features) ? productData.features.join(", ") : "");
          setSizes(Array.isArray(productData.sizes) ? productData.sizes.join(", ") : "");
          setDetails(productData.details || "");
          setDefaultColorName(productData.defaultColorName || "");
          let defImgs: string[] = [];
          if (Array.isArray(productData.defaultImage)) {
            defImgs = productData.defaultImage;
            if (productData.imageUrls && productData.imageUrls["default"]) {
              const set = new Set([...defImgs, ...productData.imageUrls["default"]]);
              defImgs = Array.from(set);
            }
          } else if (typeof productData.defaultImage === "string" && productData.defaultImage) {
            defImgs = [productData.defaultImage];
          } else if (productData.imageUrls && productData.imageUrls["default"]) {
            defImgs = productData.imageUrls["default"];
          }
          setDefaultImageUrls(defImgs);
          setImageUrls(productData.imageUrls || {});
          setProductReviews(productData.reviews || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddColor = () => {
    const trimmedColor = colorInput.trim();
    if (trimmedColor && !colors.includes(trimmedColor)) {
      setColors((prevColors) => [...prevColors, trimmedColor]);
      setImageFiles((prev) => ({ ...prev, [trimmedColor]: [] }));
      setColorInput("");
    }
  };

  const handleFileChange = (color: string, files: FileList) => {
    setImageFiles((prev) => ({ ...prev, [color]: Array.from(files) }));
  };

  const handleDefaultImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDefaultImageFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDeleteImage = async (color: string, imageUrl: string) => {
    if (!confirm("Permanently delete this visual asset?")) return;
    const imageRef = ref(storage, imageUrl);
    try {
      await deleteObject(imageRef);
      setImageUrls((prev) => ({
        ...prev,
        [color]: prev[color].filter((url) => url !== imageUrl),
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const categoriesArray = categories.split(",").map((item) => item.trim().toLowerCase()).filter(item => item !== "");
      const featuresArray = features.split(",").map((item) => item.trim()).filter(item => item !== "");
      const sizesArray = sizes.split(",").map((item) => item.trim()).filter(item => item !== "");
      const newImageUrls = { ...imageUrls };

      const uploadedDefaultUrls: string[] = [];
      if (defaultImageFiles.length > 0) {
        for (const file of defaultImageFiles) {
          const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "_");
          const sanitizedFileName = file.name.replace(/\s+/g, "_");
          const timestamp = Date.now();
          const defaultImageRef = ref(storage, `shoes/${sanitizedName}/default/${timestamp}_${sanitizedFileName}`);
          await uploadBytes(defaultImageRef, file);
          const url = await getDownloadURL(defaultImageRef);
          uploadedDefaultUrls.push(url);
        }
      }

      const finalDefaultUrls = [...defaultImageUrls, ...uploadedDefaultUrls];
      newImageUrls["default"] = finalDefaultUrls;
      const primaryDefaultImage = finalDefaultUrls.length > 0 ? finalDefaultUrls[0] : "";

      for (const color of colors) {
        if (imageFiles[color] && imageFiles[color].length > 0) {
          newImageUrls[color] = newImageUrls[color] || [];
          for (const file of imageFiles[color]) {
            const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "_");
            const sanitizedColor = color.replace(/[^a-zA-Z0-9]/g, "_");
            const sanitizedFileName = file.name.replace(/\s+/g, "_");
            const timestamp = Date.now();
            const imageRef = ref(storage, `shoes/${sanitizedName}/${sanitizedColor}/${timestamp}_${sanitizedFileName}`);
            await uploadBytes(imageRef, file);
            const downloadURL = await getDownloadURL(imageRef);
            newImageUrls[color].push(downloadURL);
          }
        }
      }

      if (!productId) return;
      await updateDoc(doc(db, "products", productId), {
        name,
        price: parseFloat(price),
        categories: categoriesArray,
        colors,
        discount,
        features: featuresArray,
        imageUrls: newImageUrls,
        defaultImage: primaryDefaultImage,
        sizes: sizesArray,
        details: details,
        defaultColorName: defaultColorName,
      });
      toast({
        variant: "success",
        title: "Asset Synchronized",
        description: "Registry modifications have been successfully archived.",
      });
      setImageFiles({});
      setDefaultImageFiles([]);
      setDefaultImageUrls(finalDefaultUrls);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Synchronization Failed",
        description: "Encountered a protocol error during data persistence.",
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
        <h2 className="text-5xl font-black tracking-tighter text-slate-900">Modify Registry Asset</h2>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">Asset Hash: {productId?.slice(0, 12)}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex items-center gap-3 mb-10 pb-5 border-b border-slate-50">
            <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase tracking-[0.1em]">Core Integrity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={labelClass}>Asset Designation</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Market Value (INR)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Category Spectrum (CSV)</label>
              <input type="text" value={categories} onChange={(e) => setCategories(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Active Discount (%)</label>
              <input type="text" value={discount} onChange={(e) => setDiscount(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex items-center justify-between mb-10 pb-5 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase tracking-[0.1em]">Visual Assets</h3>
            </div>
            <div className="flex gap-2">
              <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-blue-500" placeholder="New Variant Name" />
              <button type="button" onClick={handleAddColor} className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] hover:scale-105 active:scale-95 transition-all">Add Bundle</button>
            </div>
          </div>

          <div className="space-y-12">
            <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className={labelClass}>Master Color Designation</label>
                  <input type="text" value={defaultColorName} onChange={(e) => setDefaultColorName(e.target.value)} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Inject Master Angles</label>
                  <input type="file" multiple onChange={handleDefaultImageChange} className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer" />
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {defaultImageUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img src={url} className="w-full h-full object-cover rounded-2xl border border-slate-200" />
                    <button type="button" onClick={() => setDefaultImageUrls(prev => prev.filter(u => u !== url))} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">×</button>
                  </div>
                ))}
              </div>
            </div>

            {colors.map((color) => (
              <div key={color} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-4 py-1.5 bg-slate-100 rounded-full">{color} Spectrum</p>
                  <button type="button" onClick={() => setColors(prev => prev.filter(c => c !== color))} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-600">Delete Variant</button>
                </div>
                <input type="file" multiple onChange={(e) => handleFileChange(color, e.target.files!)} className="mb-6 block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer" />
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                  {imageUrls[color]?.map((url) => (
                    <div key={url} className="relative group aspect-square">
                      <img src={url} className="w-full h-full object-cover rounded-2xl border border-slate-200" />
                      <button type="button" onClick={() => handleDeleteImage(color, url)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm">×</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex items-center gap-3 mb-10 pb-5 border-b border-slate-50">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase tracking-[0.1em]">Metric Data</h3>
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClass}>Technical Features (CSV)</label>
                <input type="text" value={features} onChange={(e) => setFeatures(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Scaling Matrix (CSV)</label>
                <input type="text" value={sizes} onChange={(e) => setSizes(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Logistical Narrative</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} className={`${inputClass} min-h-[150px] resize-none`} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-sm transition-all shadow-xl active:scale-95 ${loading ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-black shadow-slate-200 hover:-translate-y-1"}`}>
          {loading ? "Synchronizing Asset..." : "Sync Modifications"}
        </button>
      </form>

      <div className="mt-20 space-y-8">
        <div className="flex items-center gap-3 ml-2">
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
          <h2 className="text-xl font-black uppercase tracking-[0.1em] text-slate-800">Consumer Feedback Archive</h2>
        </div>

        {productReviews.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Zero verification records in database</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productReviews.map((review, index) => (
              <div key={index} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-slate-50">
                    <img src={review.reviewerPhoto || `https://ui-avatars.com/api/?name=${review.reviewerName}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">{review.reviewerName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{review.date}</p>
                  </div>
                  <div className="ml-auto bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="text-[10px] font-black text-amber-600">{review.rating}</span>
                    <span className="text-xs">⭐</span>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">"{review.reviewText}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProduct;
