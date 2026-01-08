export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Kindr</h1>
            <p className="text-amber-700">Find the perfect name together</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
