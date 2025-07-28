import React from "react";

const OSDistributionChart = ({ stats }) => {
  const {
    windows11,
    windows10,
    windows8,
    windows7,
    windowsXP,
    windowsServer2022,
    windowsServer2019,
    windowsServer2016,
    windowsServer2012,
    windowsServer2008,
    outros,
  } = stats.estatisticasSO;

  const total =
    windows11 +
    windows10 +
    windows8 +
    windows7 +
    windowsXP +
    windowsServer2022 +
    windowsServer2019 +
    windowsServer2016 +
    windowsServer2012 +
    windowsServer2008 +
    outros;

  if (total === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum dado de SO disponível</p>
      </div>
    );
  }

  const osData = [
    {
      name: "Windows 11",
      count: windows11,
      color: "bg-blue-500",
      percentage: Math.round((windows11 / total) * 100),
    },
    {
      name: "Windows 10",
      count: windows10,
      color: "bg-green-500",
      percentage: Math.round((windows10 / total) * 100),
    },
    {
      name: "Windows 8",
      count: windows8,
      color: "bg-yellow-500",
      percentage: Math.round((windows8 / total) * 100),
    },
    {
      name: "Windows 7",
      count: windows7,
      color: "bg-orange-500",
      percentage: Math.round((windows7 / total) * 100),
    },
    {
      name: "Windows XP",
      count: windowsXP,
      color: "bg-red-500",
      percentage: Math.round((windowsXP / total) * 100),
    },
    {
      name: "Server 2022",
      count: windowsServer2022,
      color: "bg-purple-500",
      percentage: Math.round((windowsServer2022 / total) * 100),
    },
    {
      name: "Server 2019",
      count: windowsServer2019,
      color: "bg-indigo-500",
      percentage: Math.round((windowsServer2019 / total) * 100),
    },
    {
      name: "Server 2016",
      count: windowsServer2016,
      color: "bg-pink-500",
      percentage: Math.round((windowsServer2016 / total) * 100),
    },
    {
      name: "Server 2012",
      count: windowsServer2012,
      color: "bg-cyan-500",
      percentage: Math.round((windowsServer2012 / total) * 100),
    },
    {
      name: "Server 2008",
      count: windowsServer2008,
      color: "bg-amber-500",
      percentage: Math.round((windowsServer2008 / total) * 100),
    },
    {
      name: "Outros",
      count: outros,
      color: "bg-gray-500",
      percentage: Math.round((outros / total) * 100),
    },
  ].filter((item) => item.count > 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        Distribuição de Sistemas Windows
      </h3>

      {/* Gráfico de barras horizontal */}
      <div className="space-y-3">
        {osData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-4 h-4 rounded ${item.color}`}></div>
              <span className="text-sm font-medium truncate">{item.name}</span>
            </div>

            {/* Agrupamento separado da barra e dos números */}
            <div className="flex items-center gap-3 ml-4">
              {/* Barra com largura fixa */}
              <div className="w-25 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>

              {/* Texto com largura fixa e alinhamento à direita */}
              <div className="text-sm font-semibold text-right w-14">
                {item.count} ({item.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo total */}
      <div className="border-t pt-3 mt-4">
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-gray-600">Total de Dispositivos</span>
          <span className="text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default OSDistributionChart;
