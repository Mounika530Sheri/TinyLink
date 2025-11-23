import axios from "axios";
const API = import.meta.env.VITE_API_URL;

export default function LinkTable({ links, refresh }) {
  const del = async (code) => {
    try {
      await axios.delete(`${API}/api/links/${code}`);
      refresh();
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting link");
    }
  };

  return (
    <table className="w-full border border-gray-300 mt-4">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">Code</th>
          <th className="p-2 border">URL</th>
          <th className="p-2 border">Clicks</th>
          <th className="p-2 border">Last Clicked</th>
          <th className="p-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {links.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center p-4">
              No links yet
            </td>
          </tr>
        ) : (
          links.map((l) => (
            <tr key={l.code} className="hover:bg-gray-50">
              <td className="p-2 border font-mono">{l.code}</td>
              <td className="p-2 border truncate max-w-xs">
                <a
                  href={`${API}/${l.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTimeout(refresh, 500)}
                  className="text-blue-600 underline"
                >
                  {l.url}
                </a>
              </td>
              <td className="p-2 border text-center">{l.clicks}</td>
              <td className="p-2 border text-center">
                {l.last_clicked ? new Date(l.last_clicked).toLocaleString() : "-"}
              </td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => del(l.code)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
