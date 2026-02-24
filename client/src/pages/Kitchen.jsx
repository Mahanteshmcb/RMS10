export default function Kitchen() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kitchen Display</h1>
      <p>This page is intended for cooks to view and manage active
      orders. It will eventually show pending items and allow marking them as
      ready.</p>
      <div className="mt-4">
        <label className="mr-2">Filter:</label>
        <select className="border p-1">
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="ready">Ready</option>
        </select>
      </div>
    </div>
  );
}
