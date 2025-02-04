const puppeteer = require("puppeteer");

async function getStock(articleCode) {
    const browser = await puppeteer.launch({ headless: true }); // Modo oculto
    const page = await browser.newPage();

    try {
        // Establecer un timeout mayor para la navegación y recursos
        await page.setDefaultNavigationTimeout(60000); // 60 segundos
        await page.setDefaultTimeout(60000); // 60 segundos para otras acciones

        console.log("Navegador iniciado en modo oculto...");

        // Ir a la página de inicio de sesión
        console.log("Abriendo página de inicio de sesión...");
        await page.goto("https://go.zureo.com/", { waitUntil: "networkidle2" });

        // Completar los campos del formulario
        console.log("Llenando el formulario de inicio de sesión...");
        await page.type('input[placeholder="Código de empresa..."]', "218871250018");
        await page.type('input[placeholder="Correo electrónico..."]', "ytejas.86@gmail.com");
        await page.type('input[placeholder="Contraseña..."]', "1qazxsw23edc");

        // Hacer clic en el botón de Login
        console.log("Iniciando sesión...");
        await page.click('button[type="submit"]');

        // Verificar si aparece el mensaje con el botón "Continuar"
        console.log("Verificando si aparece el mensaje con el botón 'Continuar'...");
        try {
            // Esperar que el mensaje con el botón "Continuar" aparezca
            await page.waitForSelector('button.z-btn.btn-primary', { timeout: 5000 });
            console.log("El mensaje apareció. Presionando 'Continuar'...");
            await page.click('button.z-btn.btn-primary'); // Hacer clic en el botón "Continuar"
        } catch (error) {
            console.log("El mensaje no apareció. Continuando normalmente...");
        }

        // Esperar un elemento que confirme la carga de la página principal
        console.log("Esperando a que se cargue la página principal...");
        await page.waitForSelector('nav', { timeout: 60000 }); // Asegurarse de que el menú de navegación aparece

        // Ir directamente a la página de stock
        console.log("Navegando a la página de stock...");
        await page.goto("https://go.zureo.com/#/informes/stockarticulo", { waitUntil: "networkidle2" });

        // Esperar a que la página cargue el campo de búsqueda
        console.log("Esperando el campo de búsqueda de artículos...");
        await page.waitForSelector('input[placeholder="Buscar..."]');

        // Pegar el código del artículo directamente en el campo de búsqueda
        console.log(`Escribiendo el código del artículo: ${articleCode}`);
        await page.$eval('input[placeholder="Buscar..."]', (input, value) => {
            input.value = value; // Asignar el valor directamente al campo
            input.dispatchEvent(new Event('input', { bubbles: true })); // Simular el evento de entrada
        }, articleCode);

        // Esperar a que se despliegue la lista antes de seleccionar
        console.log("Esperando que aparezca la lista desplegable...");
        await page.waitForSelector('li.uib-typeahead-match a', { timeout: 60000 });

        // Seleccionar el primer elemento de la lista (el nodo <a>)
        console.log("Seleccionando el primer elemento de la lista...");
        await page.click('li.uib-typeahead-match a');

        // Hacer clic en el botón "Consultar"
        console.log("Presionando el botón 'Consultar'...");
        await page.click('#consultar');

        // Esperar a que se cargue la información del stock
        console.log("Esperando el resultado del stock...");
        await page.waitForSelector('h1.z-heading.m-n.ng-binding', { timeout: 60000 });

        // Extraer el stock redondeado
        console.log("Extrayendo el stock del artículo...");
        const stock = await page.evaluate(() => {
            const stockElement = document.querySelector('h1.z-heading.m-n.ng-binding');
            if (stockElement) {
                const stockValue = stockElement.innerText.trim(); // Solo recortar espacios
                const stockNumber = parseFloat(stockValue.replace(',', '.')); // Convertir a número flotante
                return Math.round(stockNumber); // Redondear el valor
            }
            return "No se encontró el stock.";
        });

        console.log(`Stock del artículo ${articleCode} (redondeado): ${stock}`);
        return stock; // Devolver el stock
    } catch (error) {
        console.error("Error al obtener el stock:", error.message);
        return null;
    } finally {
        console.log("Cerrando el navegador...");
        await browser.close();
    }
}

// Get article code from command line arguments
const articleCode = process.argv[2];
if (!articleCode) {
    console.error('Debe proporcionar un código de artículo');
    process.exit(1);
}

// Execute stock check
(async () => {
    console.log(`Buscando el artículo: ${articleCode}`);
    const stock = await getStock(articleCode);
    if (stock !== null) {
        console.log(`El stock del artículo ${articleCode} es: ${stock}`);
    } else {
        console.log(`No se pudo obtener el stock del artículo ${articleCode}`);
    }
    process.exit(0);
})();