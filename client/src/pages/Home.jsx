export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to RMS</h1>
      <p>
        Restaurant owners can request a plan, register their establishment, and
        manage their account from here. After signing up you'll receive a
        restaurant ID and password which can be updated later in settings.
      </p>
      <div className="mt-6 space-y-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Request Access
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          Select Plan
        </button>
      </div>
    </div>
  );
}
