import ProductList from "@/components/custom/ProductList/ProductList";

const Kids = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Kids Products</h1>
      <ProductList selectedCategory={"kids"} />
    </div>
  );
};

export default Kids;
