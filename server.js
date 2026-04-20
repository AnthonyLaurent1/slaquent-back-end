import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Ma page d'accueil");
});

app.get("/chat", (req, res) => {
    res.send("Page du chat");
});

app.get("/rooms", (req, res) => {
    res.send("Liste des salons");
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
