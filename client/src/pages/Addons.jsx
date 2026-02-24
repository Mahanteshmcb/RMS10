export default function Addons() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Addons</h1>
      <p>Install or configure additional modules and plugins for your
      restaurant (e.g. loyalty program, delivery integration, etc).</p>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search addons..."
          className="border p-1 w-64"
        />
      </div>
    </div>
  );
}
