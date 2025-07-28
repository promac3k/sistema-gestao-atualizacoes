import React from "react";

export default function Table({ columns, data, maxHeight, onRowClick }) {
    return (
        <div className="overflow-auto" style={{ maxHeight }}>
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col}
                                className={`px-4 py-2 whitespace-nowrap ${
                                    col === "Updates Necessários" || 
                                    col === "Não Instalados" || 
                                    col === "Com Falhas" 
                                        ? "text-center" 
                                        : ""
                                }`}
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={i}
                            className={`border-t hover:bg-gray-50 ${
                                onRowClick ? "cursor-pointer" : ""
                            }`}
                            onClick={() => onRowClick && onRowClick(row, i)}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col}
                                    className={`px-4 py-2 whitespace-nowrap ${
                                        col === "Updates Necessários" || 
                                        col === "Não Instalados" || 
                                        col === "Com Falhas" 
                                            ? "text-center" 
                                            : ""
                                    }`}
                                >
                                    {row[col]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
