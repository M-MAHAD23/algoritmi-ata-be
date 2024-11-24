const cron = require("node-cron");
const QuizController = require("../controllers/QuizController")


module.exports = initializeCronJobs = () => {
    console.log("Cron jobs initialized");
    console.log("Current time:", new Date().toLocaleString());
    cron.schedule("51 21 * * *", async () => {
        try {
            console.log("Cron job executing...");
            const result = await QuizController.deadLineCrossed();
            if (!result) throw new Error("No notification sent.");
        } catch (error) {
            console.error("Error in cron job:", error.message);
        }
    });
};