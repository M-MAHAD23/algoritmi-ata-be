const cron = require("node-cron");
const QuizController = require("../controllers/QuizController")


module.exports = initializeCronJobs = () => {
    cron.schedule("24 19 * * *", async () => {
        try {
            console.log("Cron job executing...");
            const result = await QuizController.deadLineCrossed();
            if (!result) throw new Error("No notification sent.");
        } catch (error) {
            console.error("Error in cron job:", error.message);
        }
    });
};