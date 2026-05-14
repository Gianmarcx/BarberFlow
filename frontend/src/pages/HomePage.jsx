export default function HomePage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">Benvenuto in BarberFlow 💈</h1>

      <p className="text-gray-600 text-lg max-w-xl">
        Questa è la HomePage di test.  
        Usa questa pagina per verificare che la sidebar, il layout e la navigazione funzionino correttamente.
      </p>

      <div className="mt-8 p-4 bg-white shadow rounded-lg">
        <p className="text-gray-700">
          Prova a cliccare sulle voci della sidebar per navigare tra le pagine.
        </p>
      </div>
    </div>
  )
}
