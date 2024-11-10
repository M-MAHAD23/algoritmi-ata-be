// Controllers Snippet
const snippet = async (req, res) => {
    try {
        console.log("snippet")
        res.status(200).json({ message: "Successfull" });
    } catch (error) {
        console.log(`Internal Server Error: ${error.message}`);
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
}

module.exports = {
    snippet,
}