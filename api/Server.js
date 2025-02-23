const express = require("express");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());

const databaseProducts = [
    "Kinder Bueno Donut", "Ferrero Rocher", "Creme Brule Donut", "Can't Get Knafeh Of It", "Tiramisu", "Pistachio Stuffed Donut",
    "The holiday eclair", "Lotus Overdose Donut", "Pistachio Kunafa Strawberry", "Chocolate Hazelnut Spread Donut", "Chocolate Crunch Donut",
    "Nutella Pancake Donut", "Classic Glazed Twisted Donut", "Custard Stuffed Donut", "Cinnamon Roll Donut", "Fati's Olympic Chocolate Muffin",
    "Original Chocolate Chip", "Red Velvet Cookie", "The Matilda Donut", "Classic Glazed Donut", "Banana Pudding", "Spanish Latte",
    "Cinnamon Sugar Cruller", "Almond Croissant Cruller", "Almond Croissant Coookie", "Cairo Cream", "Banoffee", "Hot Salted Caramel",
    "Iced Salted Caramel", "Hot Gingerbread Latte", "Iced Gingerbread Latte", "Hot PNK Spanish Latte", "Iced PNK Spanish Latte",
    "Hot White Mocha", "Iced White Mocha", "Hot Pistachio Latte", "Iced Pistachio Latte", "Hot Cookie Butter Latte", "Iced Cookie Butter Latte",
    "Iced Tiramisu Latte", "Blended Gingerbread Latte", "Blended Salted Caramel Latte", "Blended Cookie Butterlatte", "Blended Pistachio Latte",
    "Blended Spanish Latte", "Blended White Mocha", "Espresso", "Americano", "Macchiato", "Cortado", "Flat White", "Cuppuccino", "Latte",
    "Porto Bella Pack", "Porto Bella Mitts", "Porto Bella Apron", "Hot Girls Bake Oven Mitt", "Hot Girls Bake Oven Apron", "Hot Girls Bake Oven Pack",
    "Heart Of Silcily Pack", "Heart Of Silcily Mitt", "Heart Of Silcily Apron", "Fati's Spirit Oven Mitt", "Fati's Spirit Apron", "Fati's Spirit Pack"
];

const parseExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    
    const timeGroups = [
        { range: "10-1", start: 10, end: 13 },
        { range: "2-4", start: 14, end: 16 },
        { range: "5-8", start: 17, end: 20 },
        { range: "9-12", start: 21, end: 24 }
    ];
    
    const salesReport = {};
    
    for (let i = 6; i < data.length; i++) { // Start from row 7 (index 6 in zero-based array)
        const row = data[i];
        const productName = row[0]; // Column A
        const saleHour = parseInt(row[2], 10); // Column C
        const grossSales = parseFloat(row[3]) || 0; // Column D
        const netQuantity = parseInt(row[11], 10) || 0; // Column L
        
        if (productName && !isNaN(saleHour)) {
            if (!salesReport[productName]) {
                salesReport[productName] = {};
            }
            
            for (let group of timeGroups) {
                if (saleHour >= group.start && saleHour <= group.end) {
                    if (!salesReport[productName][group.range]) {
                        salesReport[productName][group.range] = { grossSales: 0, netQuantity: 0 };
                    }
                    salesReport[productName][group.range].grossSales += grossSales;
                    salesReport[productName][group.range].netQuantity += netQuantity;
                }
            }
        }
    }
    
    // Ensure all database products exist in the report with 0 values if missing
    databaseProducts.forEach(product => {
        if (!salesReport[product]) {
            salesReport[product] = {};
            timeGroups.forEach(group => {
                salesReport[product][group.range] = { grossSales: 0, netQuantity: 0 };
            });
        }
    });
    
    return { salesReport };
};

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    
    const result = parseExcel(req.file.path);
    fs.unlinkSync(req.file.path); // Remove uploaded file after processing
    res.json(result);
});

app.listen(5000, () => console.log("Server running on port 5000"));
