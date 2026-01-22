export default function ScrumNotesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notes Scrum</h1>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Nouvelle note
        </button>
      </div>
      <p className="mt-4 text-gray-600">
        Daily stand-up notes de l'équipe
      </p>
    </div>
  );
}
