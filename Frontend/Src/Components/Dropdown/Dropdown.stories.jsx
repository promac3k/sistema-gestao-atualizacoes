import React, { useState } from "react";
import Dropdown from "./Dropdown";

export default {
  title: "Components/Dropdown",
  component: Dropdown,
};

export const Default = () => {
  const [selected, setSelected] = useState("1");

  const options = [
    { label: "Opção 1", value: "1" },
    { label: "Opção 2", value: "2" },
    { label: "Opção 3", value: "3" },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Dropdown label="Escolha uma opção" options={options} value={selected} onChange={setSelected} />
      <p className="mt-4 text-sm text-gray-700">
        Selecionado: <strong>{selected}</strong>
      </p>
    </div>
  );
};
