import ProductList from "@/components/custom/ProductList/ProductList";

const Sports = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Sports Products</h1>
      <ProductList selectedCategory={"sport"} />
    </div>
  );
};

export default Sports;
