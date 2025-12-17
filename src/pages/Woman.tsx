import ProductList from "@/components/custom/ProductList/ProductList";

const Woman = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Woman Products</h1>
      <ProductList selectedCategory={"woman"} />
    </div>
  );
};

export default Woman;
