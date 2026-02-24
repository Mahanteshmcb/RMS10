export default function Menu() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Menu</h1>
      <p>Accessible by all visitors; lists categories and menu items.</p>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search menu..."
          className="border p-1 w-64"
        />
      </div>
    </div>
  );
}
