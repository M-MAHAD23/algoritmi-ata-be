const cron = require("node-cron");
const { deadLineCrossed } = require("../controllers/QuizController")

const initializeCronJobs = () => {
    // Example cron job to run every second
    // cron.schedule("* * * * * *", async () => {
    //     try {
    //         console.log("Cron Job Running: ", new Date().toISOString());

    //         // Example of an async task (e.g., database query, API call, etc.)
    //         const result = await deadLineCrossed();
    //         console.log("Task completed successfully:", result);
    //     } catch (error) {
    //         console.error("Error in cron job:", error);
    //     }
    // });

    // Add more cron jobs here with similar async/await structure if needed
};

module.exports = initializeCronJobs;
