import ProductList from "@/components/custom/ProductList/ProductList";

const Sale = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Sale Products</h1>
      <ProductList selectedCategory={"sale"} />
    </div>
  );
};

export default Sale;
