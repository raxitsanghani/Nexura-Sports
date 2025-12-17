import ProductList from "@/components/custom/ProductList/ProductList";

const Man = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Man's Products</h1>
      <ProductList selectedCategory={"man"} />
    </div>
  );
};

export default Man;
