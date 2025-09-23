import React, { useState } from "react";
import Products from "./Products";
import Subpackages from "./Subpackages";

type Page = "CATEGORIES" | "SUBPACKAGE";

const Categories: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>("CATEGORIES");
  const [sharedData, setSharedData] = useState<any>(null); // can hold any JSON

  const handleSwitch = (page: Page, data?: any) => {
    if (data) setSharedData(data);
    setCurrentPage(page);
  };

  return (
    <div>
      {currentPage === "CATEGORIES" ? (
        <Products onSwitch={handleSwitch} />
      ) : (
        <Subpackages onSwitch={handleSwitch} productData={sharedData} />
      )}
    </div>
  );
};

export default Categories;
