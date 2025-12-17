import React, { useState } from "react";
import { db, storage } from "@/Database/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [colors, setColors] = useState([]);
  const [discount, setDiscount] = useState("");
  const [features, setFeatures] = useState("");
  const [imageFiles, setImageFiles] = useState({});
  const [sizes, setSizes] = useState("");
  const [defaultImage, setDefaultImage] = useState(null);

  const handleAddColor = () => {
    if (colorInput && !colors.includes(colorInput)) {
      setColors((prevColors) => [...prevColors, colorInput]);
      setImageFiles((prev) => ({ ...prev, [colorInput]: [] }));
      setColorInput("");
    }
  };

  const handleFileChange = (color, files) => {
    setImageFiles((prev) => ({ ...prev, [color]: Array.from(files) }));
  };

  const handleDefaultImageChange = (e) => {
    setDefaultImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoriesArray = categories.split(",").map((item) => item.trim());
    const featuresArray = features.split(",").map((item) => item.trim());
    const sizesArray = sizes.split(",").map((item) => item.trim());

    const imageUrlsArray = {};
    let defaultImageUrl = "";

    if (defaultImage) {
      const defaultImageRef = ref(
        storage,
        `shoes/${name}/default/${defaultImage.name}`
      );
      await uploadBytes(defaultImageRef, defaultImage);
      defaultImageUrl = await getDownloadURL(defaultImageRef);
    }

    for (let color of colors) {
      if (imageFiles[color]) {
        imageUrlsArray[color] = [];
        for (let file of imageFiles[color]) {
          const imageRef = ref(storage, `shoes/${name}/${color}/${file.name}`);
          await uploadBytes(imageRef, file);
          const downloadURL = await getDownloadURL(imageRef);
          imageUrlsArray[color].push(downloadURL);
        }
      }
    }

    try {
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        categories: categoriesArray,
        colors,
        discount,
        features: featuresArray,
        imageUrls: imageUrlsArray,
        defaultImage: defaultImageUrl,
        sizes: sizesArray,
      });
      alert("Product added successfully");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Categories (comma separated)
          </label>
          <input
            type="text"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Add Color</label>
          <div className="flex items-center">
            <input
              type="text"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              type="button"
              onClick={handleAddColor}
              className="ml-2 px-4 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-800"
            >
              Add Color
            </button>
          </div>
        </div>
        {colors.map((color) => (
          <div key={color}>
            <label className="block text-gray-700 font-semibold">
              Upload Images for {color}
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(color, e.target.files)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        ))}
        <div>
          <label className="block text-gray-700 font-semibold">
            Default Image
          </label>
          <input
            type="file"
            onChange={handleDefaultImageChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Discount</label>
          <input
            type="text"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Features (comma separated)
          </label>
          <input
            type="text"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">
            Sizes (comma separated)
          </label>
          <input
            type="text"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-black text-white font-bold rounded-md hover:bg-blue-600"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
