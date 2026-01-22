export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Bienvenue sur Mini Jira - Votre outil de gestion de projet
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Tâches" value="0" />
        <StatCard title="Utilisateurs" value="0" />
        <StatCard title="Notes Scrum" value="0" />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
