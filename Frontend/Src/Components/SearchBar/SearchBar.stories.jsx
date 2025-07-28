import React, { useState } from "react";
import SearchBar from "./SearchBar";

export default {
  title: "Components/SearchBar",
  component: SearchBar,
};

export const Default = () => {
  const [value, setValue] = useState("");

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <SearchBar placeholder="Pesquisar..." onChange={setValue} />
      <p className="mt-4 text-sm text-gray-600">
        Texto inserido: <strong>{value}</strong>
      </p>
    </div>
  );
};