import React, { useEffect, useState } from "react";

export default function Getdata() {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("https://device-info.mssonukr.workers.dev/");
      const data = await res.json();

      // Convert object to array with IP key
      const deviceArray = Object.entries(data).map(([ip, info]) => ({
        ip,
        ...info
      }));

      // Sort newest first
      deviceArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setDevices(deviceArray);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Device Battery Status</h1>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4">
        {devices.map((device, index) => {
          const locationLink = device.location ? (
            <a
              href={`https://www.google.com/maps?q=${device.location.latitude},${device.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Map
            </a>
          ) : (
            <span className="text-gray-400">No location</span>
          );

          return (
            <div
              key={device.ip + index}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">
                    Battery: {device.battery}
                  </p>
                  <p className="text-sm text-gray-600">
                    Charging:{" "}
                    <span
                      className={
                        device.charging
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {device.charging ? "Yes" : "No"}
                    </span>
                  </p>
                  <p className="text-sm">
                    IP: <span className="font-mono">{device.ip}</span>
                  </p>
                  <p className="text-sm">{locationLink}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(device.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
