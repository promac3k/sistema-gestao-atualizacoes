import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  DevicePhoneMobileIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"; // Estilo de contorno (outline)

export default function Sidebar() {
  return (
    <div className="w-64 min-h-full bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <ul>
        <li className="mb-2 hover:bg-gray-700 p-2 rounded flex items-center gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 w-full h-full"
          >
            <HomeIcon className="w-5 h-5" />
            Início
          </Link>
        </li>
        <li className="mb-2 hover:bg-gray-700 p-2 rounded flex items-center gap-2">
          <Link
            to="/dispositivos"
            className="flex items-center gap-2 w-full h-full"
          >
            <DevicePhoneMobileIcon className="w-5 h-5" />
            Dispositivos
          </Link>
        </li>
        <li className="mb-2 hover:bg-gray-700 p-2 rounded flex items-center gap-2">
          <Link to="/update" className="flex items-center gap-2 w-full h-full">
            <ArrowPathIcon className="w-5 h-5" />
            Updates
          </Link>
        </li>
        <li className="mb-2 hover:bg-gray-700 p-2 rounded flex items-center gap-2">
          <Link to="/relatorio" className="flex items-center gap-2 w-full h-full">
            <ChartBarIcon className="w-5 h-5" />
            Relatórios
          </Link>
        </li>
      </ul>
    </div>
  );
}
