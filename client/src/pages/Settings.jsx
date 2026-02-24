export default function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p>Change restaurant information, password, module configuration, and
      other preferences here.</p>
      <div className="mt-4">
        <button className="px-3 py-1 bg-gray-200 rounded">Edit Profile</button>
        <button className="px-3 py-1 bg-gray-200 rounded ml-2">Manage Users</button>
      </div>
    </div>
  );
}
