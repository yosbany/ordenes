const puppeteer = require("puppeteer");

async function getStock(articleCode) {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        // Configuración de tiempo de espera
        await page.setDefaultNavigationTimeout(60000);
        await page.setDefaultTimeout(60000);

        // Navegar a la página de inicio de sesión
        await page.goto("https://go.zureo.com/", { 
            waitUntil: "networkidle2",
            timeout: 60000
        });

        // Llenar formulario de login
        await page.type('input[placeholder="Código de empresa..."]', "218871250018");
        await page.type('input[placeholder="Correo electrónico..."]', "ytejas.86@gmail.com");
        await page.type('input[placeholder="Contraseña..."]', "1qazxsw23edc");

        // Iniciar sesión
        await page.click('button[type="submit"]');

        // Manejar el mensaje de "Continuar" si aparece
        try {
            const continueButton = await page.waitForSelector('button.z-btn.btn-primary', { 
                timeout: 5000,
                visible: true 
            });
            if (continueButton) {
                await continueButton.click();
            }
        } catch (error) {
            // Si no aparece el botón, continuamos normalmente
        }

        // Esperar a que la navegación se complete
        await page.waitForNavigation({ 
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Ir a la página de stock
        await page.goto("https://go.zureo.com/#/informes/stockarticulo", { 
            waitUntil: "networkidle2",
            timeout: 60000
        });

        // Esperar y buscar el artículo
        const searchInput = await page.waitForSelector('input[placeholder="Buscar..."]', {
            visible: true,
            timeout: 60000
        });

        // Escribir el código y esperar resultados
        await searchInput.type(articleCode, { delay: 100 });
        
        // Esperar a que aparezca la lista de resultados
        const firstResult = await page.waitForSelector('li.uib-typeahead-match a', {
            visible: true,
            timeout: 60000
        });
        await firstResult.click();

        // Hacer clic en consultar
        const consultButton = await page.waitForSelector('#consultar', {
            visible: true,
            timeout: 60000
        });
        await consultButton.click();

        // Esperar y obtener el resultado
        const stockElement = await page.waitForSelector('h1.z-heading.m-n.ng-binding', {
            visible: true,
            timeout: 60000
        });

        // Extraer y procesar el stock
        const stockText = await stockElement.evaluate(el => el.textContent);
        const stockValue = stockText.trim();
        const stockNumber = parseFloat(stockValue.replace(',', '.'));
        const roundedStock = Math.round(stockNumber);

        return roundedStock;
    } catch (error) {
        console.error("Error al obtener el stock:", error.message);
        return null;
    } finally {
        await browser.close();
    }
}

// Obtener código de artículo de los argumentos
const articleCode = process.argv[2];
if (!articleCode) {
    console.error('Debe proporcionar un código de artículo');
    process.exit(1);
}

// Ejecutar la consulta
(async () => {
    const stock = await getStock(articleCode);
    if (stock !== null) {
        console.log(`El stock del artículo ${articleCode} es: ${stock}`);
    } else {
        console.log(`No se pudo obtener el stock del artículo ${articleCode}`);
    }
    process.exit(0);
})();