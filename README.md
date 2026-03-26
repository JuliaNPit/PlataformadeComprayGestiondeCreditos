<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Créditos Académicos UPTC - Sogamoso</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-100 font-sans">

    <nav class="bg-emerald-700 text-white p-4 shadow-lg">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-xl font-bold">UPTC | Gestión de Créditos</h1>
            <i class="fas fa-user-circle text-2xl"></i>
        </div>
    </nav>

    <main class="container mx-auto p-6">
        
        <div class="bg-white rounded-xl p-6 shadow-md mb-6 border-l-4 border-emerald-500">
            <p class="text-gray-500 text-sm">Saldo Actual</p>
            <h2 class="text-3xl font-bold text-gray-800">$ 45,000 COP</h2>
            <p class="text-xs text-emerald-600 mt-2"><i class="fas fa-sync"></i> Actualizado hace 15s</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
            <button class="bg-white p-4 rounded-lg shadow sm hover:bg-emerald-50 transition flex flex-col items-center">
                <i class="fas fa-shopping-cart text-emerald-600 text-xl mb-2"></i>
                <span class="text-sm font-semibold">Comprar</span>
            </button>
            <button class="bg-white p-4 rounded-lg shadow sm hover:bg-emerald-50 transition flex flex-col items-center">
                <i class="fas fa-exchange-alt text-blue-600 text-xl mb-2"></i>
                <span class="text-sm font-semibold">Transferir</span>
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="p-4 bg-gray-50 border-b">
                <h3 class="font-bold text-gray-700">Últimos Movimientos</h3>
            </div>
            <div class="p-4 space-y-4">
                <div class="flex justify-between items-center border-b pb-2">
                    <div>
                        <p class="font-medium">Compra de Almuerzo</p>
                        <p class="text-xs text-gray-400">25 Marzo, 2026 - 12:30 PM</p>
                    </div>
                    <span class="text-red-500 font-bold">-$2,500</span>
                </div>
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-medium">Recarga PSE</p>
                        <p class="text-xs text-gray-400">24 Marzo, 2026 - 09:00 AM</p>
                    </div>
                    <span class="text-emerald-500 font-bold">+$50,000</span>
                </div>
            </div>
        </div>

    </main>

    <footer class="text-center mt-10 text-gray-400 text-xs pb-10">
        <p>Proyecto Ingeniería de Sistemas - UPTC Sogamoso</p>
        <p>Desarrollado por: Arias & León</p>
    </footer>

</body>
</html># PlataformadeComprayGestiondeCreditos
Repositorio donde se almacena la Plataforma de compra y gestión de créditos en la UPTC como proyecto de la asignatura Ingeniería del Software II
